
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from agent.orchestrator import run_agent


app = FastAPI(title="AgentDesk API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


# Serve React frontend
frontend_dir = Path(__file__).resolve().parent / "frontend" / "dist"

if frontend_dir.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=frontend_dir / "assets"),
        name="assets",
    )

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = frontend_dir / full_path

        if file_path.is_file():
            return FileResponse(file_path)

        return FileResponse(frontend_dir / "index.html")
