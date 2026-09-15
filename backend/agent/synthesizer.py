"""
Synthesizer: turns raw search results into a structured research report.
"""
import json
import re
from openai import OpenAI
from config import OPENAI_API_KEY, OPENAI_MODEL

client = OpenAI(api_key=OPENAI_API_KEY)


def _clean_json_text(raw: str) -> str:
    """Strip markdown code fences like ```json ... ``` if the model adds them."""
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    return cleaned


def synthesize_report(goal: str, results: list[dict]) -> dict:
    context = "\n\n".join(
        f"Source: {r['title']} ({r['url']})\n{r['content'][:500]}"
        for r in results
    ) or "No search results were found."

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a research analyst. Using ONLY the provided source content, "
                    "write a structured research report. Reply with ONLY valid JSON, no markdown "
                    "code fences, no other text, in this exact format:\n"
                    '{"title": "...", "executive_summary": "...", '
                    '"key_findings": ["...", "..."], "comparison": "...", '
                    '"conclusion": "..."}\n'
                    "If the sources are insufficient to answer the goal, say so honestly "
                    "in the executive_summary instead of making things up."
                ),
            },
            {
                "role": "user",
                "content": f"Research goal: {goal}\n\nSources:\n{context}",
            },
        ],
    )

    raw = response.choices[0].message.content
    cleaned = _clean_json_text(raw)

    try:
        report = json.loads(cleaned)
    except json.JSONDecodeError:
        print("[synthesizer] JSON parse failed. Raw model output was:")
        print(raw)
        report = {
            "title": goal,
            "executive_summary": "Could not generate a structured report from the model output.",
            "key_findings": [],
            "comparison": "",
            "conclusion": "",
        }

    report["sources"] = [
        {"title": r["title"], "url": r["url"]} for r in results
    ]

    return report