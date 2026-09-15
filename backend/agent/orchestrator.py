"""
Orchestrator: runs the full agent loop.
goal -> plan -> search -> evaluate -> self-correct (if needed) -> synthesize -> report
"""
from openai import OpenAI
from config import OPENAI_API_KEY, OPENAI_MODEL, MAX_RETRIES
from tools.web_search import web_search
from agent.planner import create_plan, refine_query
from agent.evaluator import evaluate_results
from agent.synthesizer import synthesize_report

client = OpenAI(api_key=OPENAI_API_KEY)


def test_openai_connection(goal: str) -> str:
    """Simple sanity-check call used during Phase 3 testing."""
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {"role": "system", "content": "You are a helpful research assistant."},
            {"role": "user", "content": f"In one sentence, what would you need to research to answer: {goal}"},
        ],
    )
    return response.choices[0].message.content


def run_agent(goal: str) -> dict:
    events = []
    events.append({"type": "goal_received", "goal": goal})

    # STEP 1: PLANNING
    try:
        events.append({"type": "planning", "status": "started"})
        query = create_plan(goal)
        events.append({"type": "planning", "status": "completed", "query": query})
    except Exception as e:
        events.append({"type": "error", "stage": "planning", "message": str(e)})
        return {
            "goal": goal,
            "events": events,
            "results": [],
            "verdict": None,
            "report": None,
            "error": "Planning failed.",
        }

    results = []
    verdict = {"quality": "low", "reason": "Not yet searched."}

    # STEP 2-4: SEARCH -> EVALUATE -> SELF-CORRECT LOOP
    attempt = 0
    while attempt <= MAX_RETRIES:
        try:
            events.append({"type": "search", "query": query, "attempt": attempt})
            results = web_search(query)
            events.append({"type": "search_results", "count": len(results), "attempt": attempt})
        except Exception as e:
            events.append({"type": "error", "stage": "search", "message": str(e)})
            break

        try:
            events.append({"type": "evaluation", "status": "started"})
            verdict = evaluate_results(goal, results)
            events.append({"type": "evaluation", "status": "completed", "verdict": verdict})
        except Exception as e:
            events.append({"type": "error", "stage": "evaluation", "message": str(e)})
            break

        if verdict["quality"] in ("high", "medium"):
            break

        if attempt == MAX_RETRIES:
            events.append({"type": "correction", "status": "retry_limit_reached"})
            break

        try:
            events.append({"type": "correction", "status": "started", "reason": verdict["reason"]})
            query = refine_query(goal, query, verdict["reason"])
            events.append({"type": "correction", "status": "completed", "new_query": query})
        except Exception as e:
            events.append({"type": "error", "stage": "correction", "message": str(e)})
            break

        attempt += 1

    # STEP 5: SYNTHESIS
    try:
        events.append({"type": "synthesis", "status": "started"})
        report = synthesize_report(goal, results)
        events.append({"type": "synthesis", "status": "completed"})
    except Exception as e:
        events.append({"type": "error", "stage": "synthesis", "message": str(e)})
        report = {
            "title": goal,
            "executive_summary": "Report generation failed due to an internal error.",
            "key_findings": [],
            "comparison": "",
            "conclusion": "",
            "sources": [{"title": r["title"], "url": r["url"]} for r in results],
        }

    events.append({"type": "completed"})

    return {
        "goal": goal,
        "events": events,
        "results": results,
        "verdict": verdict,
        "report": report,
    }