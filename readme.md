# AgentDesk

**Autonomous AI Research Workspace** — give it a goal, and it plans its own research, searches the web, evaluates what it finds, self-corrects when results are insufficient, and writes a structured report.

Built as an internship project demonstrating real agentic AI behavior: an actual agent loop (not a single prompt-to-answer call), autonomous tool use, and genuine self-correction — all visible in a live activity feed for auditing.

---

## What it does

1. You give AgentDesk a research goal (e.g. *"Research the top 3 competitors of Tesla and compare their pricing"*).
2. The agent **plans** a search query using OpenAI.
3. It **searches** the web via Tavily.
4. It **evaluates** whether the results are actually good enough to answer the goal.
5. If not, it **self-corrects** — generates a reason, refines the query, and searches again (up to a retry limit).
6. Once results are sufficient (or retries run out), it **synthesizes** a structured report: executive summary, key findings, comparison, conclusion, and sources.
7. Every step is logged and streamed to the UI as an audit trail.

---

## Architecture

```
React UI  →  FastAPI  →  Orchestrator (agent loop)  →  OpenAI (planning/evaluation/synthesis)
                                                     →  Tavily (web search)
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full breakdown of the agent loop and self-correction logic.

---

## Tech stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev, minimal boilerplate |
| Backend | FastAPI (Python) | Lightweight, async-friendly |
| AI reasoning | OpenAI API (function-calling-style structured prompts) | Decides queries, judges quality, writes reports |
| Web search | Tavily API | Real-time web results |
| No LangChain / no DB | — | The agent loop is written by hand so the logic is fully transparent |

---

## Project structure

```
agentdesk/
├── backend/
│   ├── main.py                 # FastAPI app, /api/research route
│   ├── config.py                # env var loading
│   ├── requirements.txt
│   ├── .env.example
│   ├── agent/
│   │   ├── orchestrator.py     # the agent loop
│   │   ├── planner.py          # query planning + refinement
│   │   ├── evaluator.py        # result quality judgement
│   │   ├── synthesizer.py      # final report generation
│   │   └── prompts.py
│   └── tools/
│       └── web_search.py       # Tavily wrapper
│
└── frontend/
    └── src/
        ├── App.jsx
        └── components/
            ├── ResearchInput.jsx
            ├── AgentActivity.jsx
            ├── ResearchProgress.jsx
            ├── ResearchReport.jsx
            ├── SourceCard.jsx
            └── ChatView.jsx
```

---

## Running locally

### Backend
```bash
cd backend
uv venv
uv pip install -r requirements.txt
cp .env.example .env   # fill in OPENAI_API_KEY and TAVILY_API_KEY
uv run uvicorn main:app --reload
```
Runs on `http://127.0.0.1:8000`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and proxies `/api` calls to the backend.

---

## Environment variables

`backend/.env`:
```
OPENAI_API_KEY=
TAVILY_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
MAX_RETRIES=2
```

---

## API

**`POST /api/research`**

Request:
```json
{ "goal": "Research the top 3 competitors of Tesla and compare their pricing" }
```

Response:
```json
{
  "goal": "...",
  "events": [ /* full step-by-step audit trail */ ],
  "results": [ /* raw search results used */ ],
  "verdict": { "quality": "medium", "reason": "..." },
  "report": {
    "title": "...",
    "executive_summary": "...",
    "key_findings": ["...", "..."],
    "comparison": "...",
    "conclusion": "...",
    "sources": [{ "title": "...", "url": "..." }]
  }
}
```

---

## Demonstrating self-correction

To reliably trigger self-correction in a demo, use a deliberately obscure/unanswerable goal, e.g.:

```json
{ "goal": "xyz19283 fictional made-up product pricing data 2099" }
```

The `events` array will show `evaluation → quality: low → correction → refined query → search again`, repeating up to `MAX_RETRIES` times.

---

## Notes

- The backend responds once, after the full agent loop finishes (plan → search → evaluate → correct → synthesize). It is not currently streamed via SSE, so the frontend's "live" activity feed populates all at once when the response arrives, not incrementally in real time.
- `MAX_RETRIES` (default 2) caps the self-correction loop so it can never run indefinitely.