from services.places_service import fetch_nearby_places


DEFAULT_RADIUS_KM = 5


def discover_places(state: dict) -> dict:
    constraints = state.get("constraints", {})
    location = constraints.get("location")

    if not location:
        return {"places": []}

    radius_km = constraints.get("radius_km") or DEFAULT_RADIUS_KM
    purpose = state.get("intent", {}).get("purpose")
    places = fetch_nearby_places(location, radius_km=radius_km, keyword=purpose)

    open_places = [p for p in places if p.open_now is not False]
    sorted_places = sorted(open_places, key=lambda p: p.rating or 0, reverse=True)

    return {"places": [p.model_dump() for p in sorted_places]}
