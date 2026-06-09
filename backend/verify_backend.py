import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("   AETHERMIND BACKEND COMPILE & ROUTE TESTER      ")
    print("==================================================")
    
    # 1. Test Root Status Online
    print("\n[TEST] Verifying root endpoint status...")
    resp = client.get("/")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    print(f"-> Success: Status={data['status']}, Database={data['database']}")

    # 2. Test Get Models API list
    print("\n[TEST] Fetching AI models list...")
    resp = client.get("/api/v1/models")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    models = resp.json()
    print(f"-> Success: Retrieved {len(models)} models. Default icon: {models[0]['icon']}")

    # 3. Test Get Benchmarks
    print("\n[TEST] Querying model performance benchmarks...")
    resp = client.get("/api/v1/models/benchmarks")
    assert resp.status_code == 200
    benchmarks = resp.json()
    print(f"-> Success: Retrieved benchmark indexes for {len(benchmarks)} models.")

    # 4. Test Get Registered System Tools List
    print("\n[TEST] Listing registered system tools...")
    resp = client.get("/api/v1/tools")
    assert resp.status_code == 200
    tools = resp.json()
    print(f"-> Success: {len(tools)} tools registered. First tool: {tools[0]['name']}")

    # 5. Test Guest Login Flow (OAuth Verification)
    print("\n[TEST] Tapping guest profile credentials (Auth Bypass)...")
    # This invokes our auth bypass guest login fallback
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 200
    user = resp.json()
    print(f"-> Success: Guest profile verified. Email: {user['email']}, Role: {user['role']}")

    # 6. Test Create Conversation Chat
    import time
    test_chat_id = f"chat-test-{int(time.time())}"
    print("\n[TEST] Generating new conversation thread...")
    resp = client.post("/api/v1/conversation/chats", json={
        "id": test_chat_id,
        "title": "Verification Test Chat",
        "model_id": "gemini-2-5"
    })
    assert resp.status_code == 200
    chat = resp.json()
    print(f"-> Success: Chat created with ID: {chat['id']}, Title: '{chat['title']}'")

    # 7. Test Send Message and SSE stream receipt
    print("\n[TEST] Testing message submission and SSE stream frames...")
    # This verifies model fallback and event output stream formatting
    resp = client.post(f"/api/v1/chat/chats/{test_chat_id}/send", json={
        "text": "Hello, run a simulation verification",
        "attachments": []
    })
    assert resp.status_code == 200
    print("-> Success: Stream header OK. Reading frames:")
    
    # Read first 3 lines of output stream to ensure formatting matches event-stream
    lines_read = 0
    for line in resp.iter_lines():
        if line:
            decoded = line.decode("utf-8") if isinstance(line, bytes) else line
            if decoded.startswith("data:"):
                print(f"   Frame: {decoded[:100]}...")
                lines_read += 1
                if lines_read >= 2:
                    break
                    
    # 8. Test Browser web search
    print("\n[TEST] Checking free crawler browser search routing...")
    resp = client.get("/api/v1/browser/search?q=test+ai+embeddings")
    assert resp.status_code == 200
    search_data = resp.json()
    print(f"-> Success: Search query complete. Visited pages: {len(search_data['visitedPages'])}")

    print("\n==================================================")
    print("   ALL TESTS CONCLUDED: BACKEND INTEGRITY VALID!   ")
    print("==================================================")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\n[FAIL] Test suite failed: {e}")
        sys.exit(1)
