from pydantic import BaseModel


class Place(BaseModel):
    place_id: str
    name: str
    place_types: list[str]
    rating: float | None = None
    user_ratings_total: int | None = None
    price_level: int | None = None
    open_now: bool | None = None
    vicinity: str | None = None
    lat: float
    lng: float
