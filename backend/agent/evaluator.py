"""
Evaluator: judges whether search results are good enough
to answer the research goal. Returns a structured verdict.
"""
import json
from openai import OpenAI
from config import OPENAI_API_KEY, OPENAI_MODEL

client = OpenAI(api_key=OPENAI_API_KEY)


def evaluate_results(goal: str, results: list[dict]) -> dict:
    """
    Returns: {"quality": "high"|"medium"|"low", "reason": str}
    """
    # Build a short summary of results for the model to judge
    summary = "\n".join(
        f"- {r['title']}: {r['content'][:200]}" for r in results
    ) or "No results found."

    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You judge whether search results sufficiently answer a research goal. "
                    "Reply with ONLY valid JSON, no other text, in this exact format: "
                    '{"quality": "high" | "medium" | "low", "reason": "short explanation"}'
                ),
            },
            {
                "role": "user",
                "content": f"Research goal: {goal}\n\nSearch results:\n{summary}",
            },
        ],
    )

    raw = response.choices[0].message.content.strip()
    try:
        verdict = json.loads(raw)
    except json.JSONDecodeError:
        # Fallback if model doesn't return clean JSON
        verdict = {"quality": "medium", "reason": "Could not parse evaluation, assuming acceptable."}

    return verdict