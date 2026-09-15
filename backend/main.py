from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent.orchestrator import test_openai_connection
from tools.web_search import web_search
from agent.orchestrator import run_agent
app = FastAPI(title="AgentDesk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    goal: str

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/research")
def research(req: ResearchRequest):
    if not req.goal.strip():
        return {"error": "Research goal cannot be empty."}

    result = run_agent(req.goal)
    return result
@app.get("/api/test-openai")
def test_openai(goal: str = "top competitors of Tesla"):
    try:
        result = test_openai_connection(goal)
        return {"status": "ok", "response": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}
@app.get("/api/test-search")
def test_search(query: str = "Tesla competitors 2026"):
    try:
        results = web_search(query)
        return {"status": "ok", "count": len(results), "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}
@app.post("/api/research")
def research(req: ResearchRequest):
    if not req.goal.strip():
        return {"error": "Research goal cannot be empty."}

    result = run_agent(req.goal)
    return result