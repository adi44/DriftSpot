import json

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from prompts.intent_prompt import INTENT_PROMPT
from core.settings import settings

llm = ChatOpenAI(
    model="gpt-4.1-mini",
    temperature=0,
    api_key=settings.OPENAI_API_KEY
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", INTENT_PROMPT),
        ("human", "{query}")
    ]
)

chain = prompt | llm


def extract_intent(state: dict) -> dict:
    response = chain.invoke({"query": state["query"]})
    content = response.content.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    parsed = json.loads(content)
    return {
        "intent": parsed.get("intent", {}),
        "constraints": parsed.get("constraints", {})
    }