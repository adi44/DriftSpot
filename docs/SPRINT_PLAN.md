# Sprint Plan — V1
## AI Traveller Discovery Agent
**Duration:** 5 days | **Solo**

---

## What's Already Done (Pre-Sprint)
- FastAPI app running
- LangGraph with intent extraction node
- `TravelerIntent` + `TravelConstraints` schemas
- `/discover` API endpoint (basic)

---

## Sprint Goal
> A user types "I'm in Whitefield, free after 6 PM, want to relax" and gets back 2–3 curated, reachable place recommendations with context — no extra research needed.

---

## Day 1 — Google Places Setup + Mood Mapping

**Goal:** Be able to fetch nearby places from Google Places API based on mood.

### Tasks
- [ ] Add `GOOGLE_PLACES_API_KEY` to `.env` and `settings.py`
- [ ] Create `src/services/places_service.py` — wrapper around Google Places Nearby Search API
- [ ] Create `src/models/place.py` — schema for a raw place result (name, type, location, rating, open_now, price_level)
- [ ] Create `src/models/mood_map.py` — mood → Google Places types mapping table
  ```
  relaxed    → cafe, park, museum, art_gallery, tourist_attraction
  cultural   → museum, hindu_temple, church, art_gallery, library
  adventurous → campground, amusement_park, stadium, shopping_mall
  fun        → bar, night_club, restaurant, food, market
  ```
- [ ] Manually test: given "Whitefield, Bangalore" + mood "relaxed", does Places API return sensible results?

---

## Day 2 — Discovery Node (LangGraph Node 2)

**Goal:** Add a second node to the graph that fetches and filters nearby places.

### Tasks
- [ ] Create `src/agents/discovery_agent.py` — `discover_places(state: dict) -> dict`
  - Reads `intent` and `constraints` from state
  - Maps mood → place types
  - Calls Google Places Nearby Search with location + place types + radius
  - Filters results: open now, within reachable radius
  - Uses `popular_times` data to filter by `crowd_preference`
  - Writes `places: list[dict]` back to state
- [ ] Update `TravelState` in `state.py` to include `places: list`
- [ ] Wire `discover_places` as Node 2 in `travel_graph.py` (after `ExtractIntent`)
- [ ] Handle edge case: no places found → set `places: []` with a flag

---

## Day 3 — Ranking Node (LangGraph Node 3)

**Goal:** Use the LLM to re-rank raw places into a curated shortlist of 2–3.

### Tasks
- [ ] Create `src/prompts/ranking_prompt.py` — prompt that takes:
  - User's original query
  - Extracted intent + constraints
  - List of candidate places (name, type, rating, reviews snippet, travel time)
  - Asks LLM to pick and explain the top 2–3
- [ ] Create `src/agents/ranking_agent.py` — `rank_places(state: dict) -> dict`
  - Builds prompt with candidate places + user context
  - Calls LLM
  - Parses output into structured recommendations
  - Writes `recommendations: list[dict]` to state
- [ ] Create `src/models/recommendation.py` — schema for a recommendation:
  ```
  name, place_type, why_it_suits_you, estimated_travel_time, vibe, how_long_to_spend
  ```
- [ ] Update `TravelState` to include `recommendations: list`
- [ ] Wire `rank_places` as Node 3 in `travel_graph.py`

---

## Day 4 — API Output + Edge Cases

**Goal:** Return clean, structured recommendations from the `/discover` endpoint and handle failure cases.

### Tasks
- [ ] Update `src/api/routes.py` — return `recommendations` from state instead of raw state dump
- [ ] Create response schema in `schemas/` for the API response
- [ ] Handle edge cases:
  - No location in query → return a follow-up question asking for location
  - No places found nearby → return a message explaining why + suggest expanding radius
  - LLM returns malformed JSON → fallback gracefully
- [ ] Add `travel_month` awareness — if user mentions a month, include seasonal context in ranking prompt
- [ ] Manual end-to-end test: full query → intent → discovery → ranking → response

---

## Day 5 — Integration Testing + Polish

**Goal:** The north star scenario works reliably. Clean up rough edges.

### Tasks
- [ ] Test with 5 real queries covering different moods, locations, and time windows
- [ ] Validate the Whitefield evening scenario end-to-end
- [ ] Check output quality — are recommendations actually good and contextual?
- [ ] Polish recommendation output text — should feel like a knowledgeable local friend, not a database dump
- [ ] Update `README.md` with how to run the project
- [ ] Review and close any open bugs from days 1–4

---

## Graph State at End of Sprint

```
TravelState {
  query: str                  # original user input
  intent: dict                # mood, travel_style, companions, crowd_preference
  constraints: dict           # number_of_days, budget, travel_month
  places: list[dict]          # raw candidates from Google Places
  recommendations: list[dict] # final curated shortlist (max 3)
}
```

## Graph Flow at End of Sprint

```
ExtractIntent → DiscoverPlaces → RankPlaces
```

---

## Out of Scope This Sprint
- GPS auto-location (US-06)
- Transport booking (US-07)
- In-app translator (US-08)
- Frontend / UI
