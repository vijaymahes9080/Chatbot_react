import hashlib
from typing import List, Dict, Any, Optional
from app.services.vector_db import VectorDBManager
from app.config import settings
from app.utils.logger import logger

class RAGPipeline:
    def __init__(self, collection_name: str = "research-base"):
        self.collection_name = collection_name
        self.db_manager = VectorDBManager()
        self.db_manager.create_collection(name=self.collection_name)

    def get_embedding(self, text: str) -> List[float]:
        """
        Generates a dense vector embedding. 
        Uses premium API keys if configured, otherwise falls back to a deterministic 1536-dimensional hash-vector.
        """
        # 1. OpenAI Embeddings Fallback
        if settings.OPENAI_API_KEY:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=settings.OPENAI_API_KEY)
                resp = client.embeddings.create(input=text, model="text-embedding-3-large")
                # Truncate or return base embedding list
                return resp.data[0].embedding[:1536]
            except Exception as e:
                logger.warning(f"Failed to fetch OpenAI Embeddings: {e}")

        # 2. Google Gemini Embeddings Fallback
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                resp = genai.embed_content(model="models/embedding-001", content=text)
                vector = resp["embedding"]
                # Zero-pad to 1536 if the model dimension is smaller
                if len(vector) < 1536:
                    vector += [0.0] * (1536 - len(vector))
                return vector[:1536]
            except Exception as e:
                logger.warning(f"Failed to fetch Gemini Embeddings: {e}")

        # 3. Sentence Transformers Local Package Fallback
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer("all-MiniLM-L6-v2")
            vector = model.encode(text).tolist()
            if len(vector) < 1536:
                vector += [0.0] * (1536 - len(vector))
            return vector[:1536]
        except Exception:
            pass

        # 4. Zero-Dependency Deterministic TF-IDF / Hash Dense Vectorizer
        # Splitting text into 1536 virtual token slots to create a dense vector without downloads
        vector = [0.0] * 1536
        words = text.lower().split()
        if not words:
            return vector
            
        for word in words:
            # Hash word to a position slot in 1536 dimensions
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            slot = h % 1536
            vector[slot] += 1.0
            
        # Normalize the vector to unit length
        mag = sum(x*x for x in vector) ** 0.5
        if mag > 0:
            vector = [x / mag for x in vector]
            
        return vector

    def perform_parent_child_chunking(self, text: str, doc_name: str) -> List[Dict[str, Any]]:
        """
        Implements Hierarchical Chunking (Parent-Child):
        - Parent Chunk: ~1024 characters.
        - Child Chunk: ~256 characters with 20% overlap.
        - Child chunks are vector indexed, storing references back to parent contexts.
        """
        parent_size = 1024
        child_size = 256
        overlap = int(child_size * 0.20)
        
        chunks_to_upsert = []
        doc_hash = hashlib.md5(doc_name.encode("utf-8")).hexdigest()[:8]
        
        # Split into parent blocks
        parents = [text[i : i + parent_size] for i in range(0, len(text), parent_size)]
        
        chunk_idx = 0
        for p_idx, parent_content in enumerate(parents):
            parent_id = f"parent-{doc_hash}-{p_idx}"
            
            # Split parent block into overlapping child blocks
            start = 0
            while start < len(parent_content):
                child_content = parent_content[start : start + child_size]
                child_id = f"child-{doc_hash}-{chunk_idx}"
                
                # Generate embedding for child chunk
                embedding = self.get_embedding(child_content)
                
                chunks_to_upsert.append({
                    "id": child_id,
                    "values": embedding,
                    "metadata": {
                        "parent_id": parent_id,
                        "parent_text": parent_content,
                        "text": child_content,
                        "source": f"{doc_name} [Section {p_idx+1}]"
                    }
                })
                
                chunk_idx += 1
                start += (child_size - overlap)
                
        return chunks_to_upsert

    def ingest_document(self, doc_id: str, doc_name: str, content: str) -> int:
        """
        Parses text, runs the Parent-Child chunking, and upserts dense embeddings.
        Returns the number of child chunks indexed.
        """
        logger.info(f"[RAG] Ingesting document '{doc_name}' ({doc_id}) into collection '{self.collection_name}'")
        chunks = self.perform_parent_child_chunking(content, doc_name)
        
        if chunks:
            success = self.db_manager.upsert_vectors(self.collection_name, chunks)
            if success:
                logger.info(f"[RAG] Successfully indexed {len(chunks)} chunks for document: {doc_name}")
                return len(chunks)
        return 0

    def query_rag(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Queries the vector index for matching child chunks, extracts parent contexts,
        and ranks matches to provide a clean citation list.
        """
        logger.info(f"[RAG] Searching RAG base for query: '{query}'")
        query_vector = self.get_embedding(query)
        matches = self.db_manager.query_similarity(self.collection_name, query_vector, top_k=top_k)
        
        results = []
        seen_parents = set()
        
        for m in matches:
            meta = m.get("metadata", {})
            parent_id = meta.get("parent_id")
            
            # Avoid duplicate context retrieval by grouping by parent block
            if parent_id and parent_id not in seen_parents:
                seen_parents.add(parent_id)
                results.append({
                    "id": m["id"],
                    "text": meta.get("parent_text", meta.get("text", "")),
                    "score": m["score"],
                    "source": meta.get("source", "Unknown Source")
                })
                
        # Return results sorted by similarity score
        results.sort(key=lambda x: x["score"], reverse=True)
        return results
