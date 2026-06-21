# Sprint Plan — V2
## DriftSpot
**Duration:** 5 days | **Solo**

---

## Sprint Goal

> A traveler gets a recommendation, sees whether it's safe and right for them, books a cab to get there, and can tell us if we got it right — all without leaving the app.

---

## What's Already Done (End of Sprint 1)

- LangGraph pipeline: ExtractIntent → DiscoverPlaces → RankPlaces
- `purpose` field in intent — narrows Google Places search by activity keyword
- Google OAuth + Supabase auth (anon key + JWT)
- Saved places (shortlist) stored in Supabase, shown in left panel
- Strict ranking prompt — returns `[]` instead of forcing irrelevant places
- Frontend: ResultCard, ShortlistBar, ShortlistPanel, LoginPage

---

## User Stories This Sprint

| Story | Description |
|---|---|
| US-09 | Trust signals on recommendation cards |
| US-10 | Book a cab from recommendation (Uber/Ola deeplink) |
| US-11 | Get directions from recommendation (Google Maps deeplink) |
| US-12 | Thumbs up/down feedback on recommendations |

---

## Day 1 — Trust Signals (US-09)

**Goal:** Each recommendation card shows whether the place is safe, solo-friendly, or crowded — extracted by the LLM during ranking, not a hardcoded lookup.

### Backend Tasks

- [ ] Add `trust_signals` array to ranking prompt output schema:
  ```
  trust_signals: list of short labels, e.g. ["Solo-friendly", "Well-rated", "Busy evenings", "Quiet now"]
  ```
- [ ] Update `RANKING_PROMPT` in `prompts/ranking_prompt.py` — instruct LLM to generate 1–3 trust signals per recommendation based on:
  - Place type (e.g. cafe → likely solo-friendly)
  - Rating and review count
  - Time of day context from the query
  - Crowd preference from intent
- [ ] Update `TravelState` and ranking agent to pass `trust_signals` through
- [ ] Verify trust signals appear in `/discover` API response

### Frontend Tasks

- [ ] Update `ResultCard.jsx` — render `trust_signals` as small pill tags below the vibe line
- [ ] Style: small, muted tags (gray or orange-tinted), not bold — trust signals are context, not headline
- [ ] Handle empty `trust_signals` gracefully (don't show the row if none)

### Definition of Done
A query returns recommendations where each card shows 1–3 short labels like "Solo-friendly · Well-rated · Busy evenings".

---

## Day 2 — Close the Loop: Cab Booking + Directions (US-10, US-11)

**Goal:** A traveler can tap "Book Cab" or "Directions" on a recommendation and be taken directly to Uber/Ola/Google Maps with the destination pre-filled.

### Backend Tasks

- [ ] Pass `lat` and `lng` through from discovered places to final recommendations:
  - In `ranking_agent.py`: after LLM picks top places by name, look up coordinates from the original `places` list and attach them to each recommendation
  - Add `lat: float | None` and `lng: float | None` to recommendation output
- [ ] Verify coordinates appear in `/discover` response payload

### Frontend Tasks

- [ ] Add `BookingActions` section to `ResultCard.jsx` with two buttons:

  **Book Cab (Uber primary, Ola secondary)**
  ```
  Uber deeplink (mobile):
  uber://?action=setPickup&pickup=my_location&dropoff[latitude]={lat}&dropoff[longitude]={lng}&dropoff[nickname]={name}

  Uber web fallback:
  https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]={lat}&dropoff[longitude]={lng}&dropoff[nickname]={name}

  Ola web fallback:
  https://book.olacabs.com/?drop_lat={lat}&drop_lng={lng}&drop_name={name}
  ```

  **Directions (Google Maps)**
  ```
  https://www.google.com/maps/dir/?api=1&destination={lat},{lng}&destination_place_id={name}
  ```

- [ ] "Book Cab" opens Uber deeplink; show a small dropdown/tooltip with "Open in Ola instead" option
- [ ] "Directions" opens Google Maps in a new tab
- [ ] Both buttons are hidden if `lat`/`lng` are null on the recommendation
- [ ] Button style: compact, secondary — below the main card content, not competing with the shortlist button

### Definition of Done
Tapping "Book Cab" on a recommendation opens Uber with the place as the dropoff destination. "Directions" opens Google Maps route to the place. Both work on mobile and desktop.

---

## Day 3 — Recommendation Feedback (US-12)

**Goal:** Users can give thumbs up/down on each recommendation. Feedback is saved to Supabase for future personalization.

### Backend Tasks

- [ ] Add `feedback` table to Supabase:
  ```sql
  create table feedback (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    query_id uuid references queries(id),
    place_name text not null,
    rating int not null check (rating in (1, -1)),  -- 1 = thumbs up, -1 = thumbs down
    created_at timestamptz default now()
  );
  alter table feedback enable row level security;
  create policy "Users manage own feedback"
    on feedback for all using (auth.uid() = user_id);
  ```
- [ ] Add `POST /feedback` route in `routes.py`:
  ```
  Body: { place_name, query_id, rating (1 or -1) }
  Auth: required
  ```
- [ ] Add `save_feedback(jwt, user_id, query_id, place_name, rating)` to `supabase_service.py`

### Frontend Tasks

- [ ] Add thumbs up 👍 / thumbs down 👎 buttons to `ResultCard.jsx`
- [ ] On tap: POST to `/feedback`, optimistically toggle button state
- [ ] Show filled/active state when feedback is recorded
- [ ] If not logged in: show tooltip "Sign in to give feedback" on hover/tap
- [ ] Do not block the user or show a modal — one tap, done

### Definition of Done
Logged-in user can tap 👍 or 👎 on a recommendation. Feedback is saved to Supabase. Button shows active state after tap. Works offline-gracefully (if API fails, UI still updates locally).

---

## Day 4 — Contextual Nudge Foundation

**Goal:** Lay the groundwork for "Done with your meetings?" notifications. No push notification infra yet — build the data hooks and the UI entry point.

### Tasks

- [ ] Add `city` field to the `queries` table (extracted from `location` during `/discover`)
- [ ] Add `GET /context` endpoint that returns the user's most recent query city and timestamp:
  ```
  Response: { last_city: "Whitefield, Bangalore", last_queried_at: "2026-06-21T14:30:00Z" }
  ```
- [ ] Frontend: on app load (after login), if `last_queried_at` was today and current time is between 5 PM–9 PM, show a soft banner: "Back for the evening? Pick up where you left off in {city} →"
- [ ] Banner links to a pre-filled query for the same city
- [ ] Banner is dismissible; only shows once per session

### Definition of Done
A user who searched in Bangalore earlier today sees a contextual banner in the evening suggesting they explore more in Bangalore.

---

## Day 5 — Polish + End-to-End Testing

**Goal:** All Sprint 2 features work together cleanly. No rough edges.

### Tasks

- [ ] Test full flow: query → recommendations with trust signals → book cab → leave feedback → check shortlist panel
- [ ] Test logged-out state: booking works (deeplink), feedback prompts sign-in, shortlist prompts sign-in
- [ ] Verify `lat`/`lng` lookup correctly matches LLM-picked place names to original places list (name mismatch edge case)
- [ ] Check mobile layout: booking buttons and trust signal tags don't overflow on small screens
- [ ] Review trust signal quality across 5 different query types (solo, couple, food, culture, nightlife)
- [ ] Update `SPRINT_PLAN.md` and `USER_STORIES.md` to mark Sprint 2 stories complete

---

## Recommendation Object at End of Sprint 2

```json
{
  "name": "Koshy's",
  "place_type": "cafe",
  "why_it_suits_you": "A Bangalore institution open since 1940, perfect for a quiet solo evening with a book and filter coffee.",
  "estimated_travel_time": "12 min",
  "vibe": "old-world and unhurried",
  "how_long_to_spend": "1–2 hours",
  "trust_signals": ["Solo-friendly", "Well-rated", "Quiet evenings"],
  "lat": 12.9716,
  "lng": 77.5946
}
```

---

## Out of Scope This Sprint

- GPS auto-location (US-06)
- Full push notification system (nudges are UI-only this sprint)
- B2B / Teams features
- In-app translator (US-08)
