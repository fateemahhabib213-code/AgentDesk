"""
Planner: asks OpenAI to turn a research goal into a concrete search query.
This is what makes query generation dynamic instead of hardcoded.
"""
from openai import OpenAI
from config import OPENAI_API_KEY, OPENAI_MODEL

client = OpenAI(api_key=OPENAI_API_KEY)


def create_plan(goal: str) -> str:
    """
    Takes a research goal, returns a single concrete search query.
    """
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You turn research goals into a single, effective web search query. "
                    "Reply with ONLY the search query text — no explanation, no quotes."
                ),
            },
            {"role": "user", "content": f"Research goal: {goal}"},
        ],
    )
    query = response.choices[0].message.content.strip()
    return query
def refine_query(goal: str, previous_query: str, reason: str) -> str:
    """
    Takes the failed query + why it failed, returns an improved query.
    """
    response = client.chat.completions.create(
        model=OPENAI_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You improve web search queries. The previous query gave insufficient "
                    "results. Reply with ONLY a new, better search query — no explanation."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Research goal: {goal}\n"
                    f"Previous query: {previous_query}\n"
                    f"Why it failed: {reason}\n"
                    f"Give a better search query."
                ),
            },
        ],
    )
    return response.choices[0].message.content.strip()