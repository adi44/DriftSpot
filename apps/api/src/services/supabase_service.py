from supabase import create_client, Client
from core.settings import settings

_client: Client = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    return _client


def _authed(jwt: str) -> Client:
    client = get_client()
    client.postgrest.auth(jwt)
    return client


def get_user(jwt: str):
    try:
        return get_client().auth.get_user(jwt).user
    except Exception:
        return None


def save_query(jwt: str, user_id: str, query_text: str, location: str | None, mood: str | None, radius_km: int | None) -> str | None:
    try:
        result = _authed(jwt).table("queries").insert({
            "user_id": user_id,
            "query_text": query_text,
            "location": location,
            "mood": mood,
            "radius_km": radius_km,
        }).execute()
        return result.data[0]["id"]
    except Exception:
        return None


def save_place(jwt: str, user_id: str, query_id: str | None, place: dict) -> bool:
    try:
        _authed(jwt).table("saved_places").insert({
            "user_id": user_id,
            "query_id": query_id,
            "place_name": place.get("name"),
            "place_type": place.get("place_type"),
            "why_it_suits_you": place.get("why_it_suits_you"),
            "estimated_travel_time": place.get("estimated_travel_time"),
            "vibe": place.get("vibe"),
            "how_long_to_spend": place.get("how_long_to_spend"),
        }).execute()
        return True
    except Exception as e:
        print(f"save_place error: {e}")
        return False


def get_saved_places(jwt: str, user_id: str) -> list:
    try:
        result = _authed(jwt).table("saved_places").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data
    except Exception:
        return []


def delete_saved_place(jwt: str, user_id: str, place_id: str) -> bool:
    try:
        _authed(jwt).table("saved_places").delete().eq("id", place_id).eq("user_id", user_id).execute()
        return True
    except Exception:
        return False


def get_query_history(jwt: str, user_id: str) -> list:
    try:
        result = _authed(jwt).table("queries").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(20).execute()
        return result.data
    except Exception:
        return []
