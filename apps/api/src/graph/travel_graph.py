from langgraph.graph import StateGraph
from graph.state import TravelState
from agents.intent_agent import extract_intent
from agents.discovery_agent import discover_places
from agents.ranking_agent import rank_places


builder = StateGraph(TravelState)

builder.add_node("ExtractIntent", extract_intent)
builder.add_node("DiscoverPlaces", discover_places)
builder.add_node("RankPlaces", rank_places)

builder.set_entry_point("ExtractIntent")
builder.add_edge("ExtractIntent", "DiscoverPlaces")
builder.add_edge("DiscoverPlaces", "RankPlaces")
builder.set_finish_point("RankPlaces")

travel_graph = builder.compile()
