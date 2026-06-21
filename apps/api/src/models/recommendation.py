from pydantic import BaseModel


class Recommendation(BaseModel):
    name: str
    place_type: str
    why_it_suits_you: str
    estimated_travel_time: str
    vibe: str
    how_long_to_spend: str
