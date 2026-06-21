import httpx

from core.settings import settings
from models.place import Place

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"
NEARBY_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"

MAX_RADIUS_METERS = 50000


def geocode_location(location: str) -> tuple[float, float]:
    response = httpx.get(GEOCODE_URL, params={
        "address": location,
        "key": settings.GOOGLE_PLACES_API_KEY
    })
    response.raise_for_status()
    data = response.json()

    if not data["results"]:
        raise ValueError(f"Could not geocode location: {location}")

    coords = data["results"][0]["geometry"]["location"]
    return coords["lat"], coords["lng"]


def fetch_nearby_places(location: str, radius_km: int = 5, keyword: str | None = None) -> list[Place]:
    lat, lng = geocode_location(location)
    radius_meters = min(radius_km * 1000, MAX_RADIUS_METERS)

    params = {
        "location": f"{lat},{lng}",
        "radius": radius_meters,
        "key": settings.GOOGLE_PLACES_API_KEY,
    }
    if keyword:
        params["keyword"] = keyword

    response = httpx.get(NEARBY_SEARCH_URL, params=params)
    response.raise_for_status()
    results = response.json().get("results", [])

    places = []
    for r in results:
        loc = r["geometry"]["location"]
        places.append(Place(
            place_id=r["place_id"],
            name=r["name"],
            place_types=r.get("types", []),
            rating=r.get("rating"),
            user_ratings_total=r.get("user_ratings_total"),
            price_level=r.get("price_level"),
            open_now=r.get("opening_hours", {}).get("open_now"),
            vicinity=r.get("vicinity"),
            lat=loc["lat"],
            lng=loc["lng"],
        ))

    return places
