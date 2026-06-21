from fastapi import APIRouter, HTTPException, Header
from typing import Optional

from graph.travel_graph import travel_graph
from services.supabase_service import (
    get_user,
    save_query,
    save_place,
    get_saved_places,
    delete_saved_place,
    get_query_history,
)

router = APIRouter()


def _extract_jwt(authorization: Optional[str]) -> Optional[str]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    return authorization.removeprefix("Bearer ").strip()


def _extract_user(authorization: Optional[str]):
    jwt = _extract_jwt(authorization)
    if not jwt:
        return None, None
    return get_user(jwt), jwt


@router.post("/discover")
def discover(payload: dict, authorization: Optional[str] = Header(default=None)):
    query = payload.get("query", "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    result = travel_graph.invoke({"query": query})

    location = result.get("constraints", {}).get("location")
    if not location:
        return {
            "recommendations": [],
            "follow_up": "Could you tell me where you are? For example: 'I'm in Whitefield, Bangalore'."
        }

    recommendations = result.get("recommendations", [])
    if not recommendations:
        no_match = result.get("no_match", False)
        follow_up = (
            "I couldn't find places nearby that closely match your request. "
            "Try a broader description — for example 'relaxing spots', 'tea stalls', or 'hookah bars'."
            if no_match
            else "No places found nearby. Try increasing your radius or a different location."
        )
        return {"recommendations": [], "follow_up": follow_up}

    query_id = None
    user, jwt = _extract_user(authorization)
    if user and jwt:
        intent = result.get("intent", {})
        constraints = result.get("constraints", {})
        query_id = save_query(
            jwt=jwt,
            user_id=user.id,
            query_text=query,
            location=constraints.get("location"),
            mood=intent.get("mood"),
            radius_km=constraints.get("radius_km"),
        )

    return {"recommendations": recommendations, "query_id": query_id}


@router.post("/places/shortlist")
def shortlist_place(payload: dict, authorization: Optional[str] = Header(default=None)):
    user, jwt = _extract_user(authorization)
    if not user or not jwt:
        raise HTTPException(status_code=401, detail="Login required to shortlist places.")

    place = payload.get("place")
    query_id = payload.get("query_id")

    if not place:
        raise HTTPException(status_code=400, detail="Place data is required.")

    success = save_place(jwt=jwt, user_id=user.id, query_id=query_id, place=place)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to shortlist place.")

    return {"message": "Place added to shortlist."}


@router.post("/saved-places")
def add_saved_place(payload: dict, authorization: Optional[str] = Header(default=None)):
    user, jwt = _extract_user(authorization)
    if not user or not jwt:
        raise HTTPException(status_code=401, detail="Login required to save places.")

    place = payload.get("place")
    query_id = payload.get("query_id")

    if not place:
        raise HTTPException(status_code=400, detail="Place data is required.")

    success = save_place(jwt=jwt, user_id=user.id, query_id=query_id, place=place)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save place.")

    return {"message": "Place saved successfully."}


@router.get("/saved-places")
def list_saved_places(authorization: Optional[str] = Header(default=None)):
    user, jwt = _extract_user(authorization)
    if not user or not jwt:
        raise HTTPException(status_code=401, detail="Login required.")

    return {"saved_places": get_saved_places(jwt=jwt, user_id=user.id)}


@router.delete("/saved-places/{place_id}")
def remove_saved_place(place_id: str, authorization: Optional[str] = Header(default=None)):
    user, jwt = _extract_user(authorization)
    if not user or not jwt:
        raise HTTPException(status_code=401, detail="Login required.")

    success = delete_saved_place(jwt=jwt, user_id=user.id, place_id=place_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete place.")

    return {"message": "Place removed."}


@router.get("/history")
def query_history(authorization: Optional[str] = Header(default=None)):
    user, jwt = _extract_user(authorization)
    if not user or not jwt:
        raise HTTPException(status_code=401, detail="Login required.")

    return {"history": get_query_history(jwt=jwt, user_id=user.id)}
