from pydantic import BaseModel


class TravelerIntent(BaseModel):
    mood: str | None = None
    travel_style: str | None = None
    companions: str | None = None
    crowd_preference: str | None = None
    purpose: str | None = None


class TravelConstraints(BaseModel):
    location: str | None = None
    radius_km: int | None = None
    number_of_days: int | None = None
    budget: int | None = None
    travel_month: str | None = None
