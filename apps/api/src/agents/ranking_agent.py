import json

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from prompts.ranking_prompt import RANKING_PROMPT
from core.settings import settings

llm = ChatOpenAI(
    model="gpt-4.1-mini",
    temperature=0.3,
    api_key=settings.OPENAI_API_KEY
)

prompt = ChatPromptTemplate.from_messages([
    ("system", RANKING_PROMPT),
])


def _format_places(places: list) -> str:
    lines = []
    for i, p in enumerate(places[:15], 1):
        types = ", ".join(p.get("place_types", []))
        rating = p.get("rating") or "N/A"
        lines.append(
            f"{i}. {p['name']} | Types: {types} | Rating: {rating} | Area: {p.get('vicinity', '')}"
        )
    return "\n".join(lines)


def rank_places(state: dict) -> dict:
    places = state.get("places", [])
    if not places:
        return {"recommendations": []}

    intent = state.get("intent", {})
    constraints = state.get("constraints", {})

    response = llm.invoke(
        prompt.format_messages(
            query=state.get("query", ""),
            purpose=intent.get("purpose") or "not specified",
            mood=intent.get("mood") or "not specified",
            travel_style=intent.get("travel_style") or "not specified",
            companions=intent.get("companions") or "not specified",
            crowd_preference=intent.get("crowd_preference") or "not specified",
            location=constraints.get("location") or "not specified",
            budget=constraints.get("budget") or "not specified",
            places=_format_places(places),
        )
    )

    content = response.content.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    recommendations = json.loads(content)

    return {
        "recommendations": recommendations,
        "no_match": len(recommendations) == 0,
    }
