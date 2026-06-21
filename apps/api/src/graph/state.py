from typing import TypedDict


class TravelState(TypedDict):
    query: str
    intent: dict
    constraints: dict
    places: list
    recommendations: list
    no_match: bool

