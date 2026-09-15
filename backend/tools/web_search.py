"""
Wrapper around Tavily's search API.
Keeps the raw API details out of the agent logic.
"""
from tavily import TavilyClient
from config import TAVILY_API_KEY

client = TavilyClient(api_key=TAVILY_API_KEY)


def web_search(query: str, max_results: int = 5) -> list[dict]:
    """
    Runs a web search and returns a clean list of results.
    Each result: {title, url, content, score}
    """
    response = client.search(query=query, max_results=max_results)

    results = []
    for item in response.get("results", []):
        results.append({
            "title": item.get("title", ""),
            "url": item.get("url", ""),
            "content": item.get("content", ""),
            "score": item.get("score", 0),
        })
    return results