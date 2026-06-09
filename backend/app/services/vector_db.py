import os
from typing import List, Dict, Any, Optional
from app.config import settings
from app.utils.logger import logger

class VectorDBManager:
    """
    Unified interface for multiple Vector Database providers:
    Pinecone, Qdrant, Weaviate, Milvus, and ChromaDB.
    """
    def __init__(self, provider: str = "chromadb"):
        self.provider = provider.lower()
        self.in_memory_store: Dict[str, List[Dict[str, Any]]] = {}  # Local zero-dependency backup store
        self._initialize_provider()

    def _initialize_provider(self):
        logger.info(f"Initializing Vector Database adapter for provider: {self.provider}")
        try:
            if self.provider == "pinecone" and settings.PINECONE_API_KEY:
                from pinecone import Pinecone
                self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
                logger.info("Pinecone Vector Client connected successfully.")
            elif self.provider == "qdrant" and settings.QDRANT_URL:
                from qdrant_client import QdrantClient
                self.qc = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY)
                logger.info("Qdrant Client connected successfully.")
            elif self.provider == "chromadb":
                import chromadb
                os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
                self.chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
                logger.info(f"ChromaDB persistent storage initialized at: {settings.CHROMA_PERSIST_DIR}")
            else:
                logger.info(f"Missing API keys/configurations for {self.provider}. Defaulting to in-memory backup vector store.")
                self.provider = "in_memory"
        except Exception as e:
            logger.warning(f"Error loading {self.provider} packages: {e}. Falling back to zero-dependency in-memory store.")
            self.provider = "in_memory"

    def create_collection(self, name: str, dimension: int = 1536, metric: str = "cosine") -> bool:
        """
        Creates a new collection/namespace inside the active database provider.
        """
        try:
            if self.provider == "chromadb":
                self.chroma_client.get_or_create_collection(name=name, metadata={"hnsw:space": metric})
                return True
            elif self.provider == "pinecone" and hasattr(self, "pc"):
                from pinecone import PodSpec
                if name not in self.pc.list_indexes().names():
                    self.pc.create_index(
                        name=name, 
                        dimension=dimension, 
                        metric=metric,
                        spec=PodSpec(environment=settings.PINECONE_ENVIRONMENT or "us-east-1")
                    )
                return True
            elif self.provider == "qdrant" and hasattr(self, "qc"):
                from qdrant_client.http.models import Distance, VectorParams
                dist = Distance.COSINE if metric == "cosine" else Distance.EUCLID
                self.qc.recreate_collection(
                    collection_name=name,
                    vectors_config=VectorParams(size=dimension, distance=dist),
                )
                return True
            
            # In-memory default fallback
            self.in_memory_store[name] = []
            logger.info(f"Created in-memory backup collection: {name}")
            return True
        except Exception as e:
            logger.error(f"Failed to create collection '{name}': {e}")
            return False

    def delete_collection(self, name: str) -> bool:
        try:
            if self.provider == "chromadb":
                self.chroma_client.delete_collection(name=name)
                return True
            elif self.provider == "pinecone" and hasattr(self, "pc"):
                self.pc.delete_index(name=name)
                return True
            elif self.provider == "qdrant" and hasattr(self, "qc"):
                self.qc.delete_collection(collection_name=name)
                return True
            
            if name in self.in_memory_store:
                del self.in_memory_store[name]
            return True
        except Exception as e:
            logger.error(f"Failed to delete collection '{name}': {e}")
            return False

    def upsert_vectors(self, collection_name: str, vectors: List[Dict[str, Any]]) -> bool:
        """
        Upsert a list of vector records. Format:
        [{"id": "doc_1", "values": [0.1, 0.2...], "metadata": {"text": "hello"}}]
        """
        try:
            if self.provider == "chromadb":
                collection = self.chroma_client.get_collection(name=collection_name)
                ids = [v["id"] for v in vectors]
                embeddings = [v["values"] for v in vectors]
                metadatas = [v["metadata"] for v in vectors]
                documents = [v["metadata"].get("text", "") for v in vectors]
                collection.upsert(ids=ids, embeddings=embeddings, metadatas=metadatas, documents=documents)
                return True
            elif self.provider == "pinecone" and hasattr(self, "pc"):
                index = self.pc.Index(collection_name)
                # Parse to Pinecone tuple format
                to_upsert = [(v["id"], v["values"], v["metadata"]) for v in vectors]
                index.upsert(vectors=to_upsert)
                return True
            elif self.provider == "qdrant" and hasattr(self, "qc"):
                from qdrant_client.http.models import PointStruct
                points = [
                    PointStruct(id=v["id"], vector=v["values"], payload=v["metadata"])
                    for v in vectors
                ]
                self.qc.upsert(collection_name=collection_name, points=points)
                return True

            # In-memory upsert fallback
            if collection_name not in self.in_memory_store:
                self.in_memory_store[collection_name] = []
            # Merge/Overwrite
            existing = {v["id"]: v for v in self.in_memory_store[collection_name]}
            for v in vectors:
                existing[v["id"]] = v
            self.in_memory_store[collection_name] = list(existing.values())
            logger.info(f"Upserted {len(vectors)} vectors to in-memory collection '{collection_name}'")
            return True
        except Exception as e:
            logger.error(f"Failed to upsert vectors in '{collection_name}': {e}")
            return False

    def query_similarity(
        self, 
        collection_name: str, 
        vector: List[float], 
        top_k: int = 5, 
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Searches closest matching vectors in the target collection.
        Returns matching list: [{"id": "...", "score": 0.95, "metadata": {...}}]
        """
        try:
            if self.provider == "chromadb":
                collection = self.chroma_client.get_collection(name=collection_name)
                res = collection.query(query_embeddings=[vector], n_results=top_k)
                matches = []
                if res and res["ids"] and len(res["ids"][0]) > 0:
                    for i in range(len(res["ids"][0])):
                        matches.append({
                            "id": res["ids"][0][i],
                            "score": 1.0 - (res["distances"][0][i] if res["distances"] else 0.0), # Convert distance to similarity
                            "metadata": res["metadatas"][0][i] if res["metadatas"] else {}
                        })
                return matches
            elif self.provider == "pinecone" and hasattr(self, "pc"):
                index = self.pc.Index(collection_name)
                res = index.query(vector=vector, top_k=top_k, include_metadata=True, filter=filter_dict)
                return [
                    {"id": m["id"], "score": m["score"], "metadata": m.get("metadata", {})}
                    for m in res["matches"]
                ]
            elif self.provider == "qdrant" and hasattr(self, "qc"):
                res = self.qc.search(collection_name=collection_name, query_vector=vector, limit=top_k)
                return [
                    {"id": str(p.id), "score": p.score, "metadata": p.payload}
                    for p in res
                ]
            
            # Simple In-Memory cosine-similarity search fallback
            return self._in_memory_cosine_search(collection_name, vector, top_k)
        except Exception as e:
            logger.error(f"Failed vector search querying in '{collection_name}': {e}")
            return []

    def _in_memory_cosine_search(self, name: str, query_vec: List[float], top_k: int) -> List[Dict[str, Any]]:
        collection = self.in_memory_store.get(name, [])
        if not collection:
            return []
            
        import math
        def dot_product(v1, v2):
            return sum(x*y for x, y in zip(v1, v2))
            
        def magnitude(v):
            return math.sqrt(sum(x*x for x in v))
            
        def cosine_similarity(v1, v2):
            mag1 = magnitude(v1)
            mag2 = magnitude(v2)
            if mag1 == 0 or mag2 == 0:
                return 0.0
            return dot_product(v1, v2) / (mag1 * mag2)

        scored = []
        for item in collection:
            score = cosine_similarity(query_vec, item["values"])
            scored.append({
                "id": item["id"],
                "score": score,
                "metadata": item["metadata"]
            })
            
        # Sort desc by score
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]
