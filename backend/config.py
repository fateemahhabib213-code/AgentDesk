import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "2"))
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

if not OPENAI_API_KEY:
    print("[config] WARNING: OPENAI_API_KEY is not set.")
if not TAVILY_API_KEY:
    print("[config] WARNING: TAVILY_API_KEY is not set.")