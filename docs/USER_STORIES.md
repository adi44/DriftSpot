# User Stories
## AI Traveller Discovery Agent

---

## V1 — Core Experience

---

### US-01 — Free-Form Query Input

**As a** work traveler with limited free time,  
**I want to** describe my situation in plain text (e.g. "I'm in Whitefield, free after 6 PM, want to relax and see something nearby"),  
**So that** I don't have to fill out forms or navigate complex filters.

**Acceptance Criteria:**
- User can type any natural language query
- System extracts intent (mood, travel style, companions, crowd preference) and constraints (time, location, budget) from the query
- If critical information is missing (e.g. no location), system asks a single follow-up question
- Query input is the only required interaction before getting results

---

### US-02 — Location via Text

**As a** traveler who doesn't know the city well,  
**I want to** specify my current location by typing a landmark or neighborhood name (e.g. "Whitefield", "near ITC Gardenia"),  
**So that** I get recommendations that are actually reachable from where I am.

**Acceptance Criteria:**
- System accepts neighborhood names, hotel names, or landmarks as location input
- Recommendations are filtered based on proximity to that location
- Travel time estimates reflect real-world distance, not straight-line distance

---

### US-03 — Time-Aware Recommendations

**As a** traveler with a fixed free window,  
**I want** the system to account for my available time (e.g. "free from 6 PM to 9 PM"),  
**So that** I only see places I can actually visit and enjoy without rushing.

**Acceptance Criteria:**
- System understands time windows from natural language ("after 6 PM", "3 hours free", "just the evening")
- Only recommends places that are open during the specified window
- Factors in travel time so total (travel + visit) fits within the window

---

### US-04 — Mood-Matched Discovery

**As a** tired traveler after a long conference day,  
**I want** recommendations that match my current mood (relaxed, not adventurous),  
**So that** I don't end up at a place that requires energy or planning I don't have.

**Acceptance Criteria:**
- System infers mood from query language ("tired", "chill evening", "just want to decompress")
- Mood influences the type of places recommended (e.g. relaxed → quiet cafes, parks, viewpoints over nightclubs or trekking spots)
- User does not need to explicitly label their mood — it is inferred

---

### US-05 — Curated Shortlist Output

**As a** traveler who doesn't want to make complex decisions,  
**I want** to receive 2–3 specific place recommendations (not a long list),  
**So that** I can make a quick decision and just go.

**Acceptance Criteria:**
- System returns a maximum of 3 recommendations
- Each recommendation includes:
  - Place name and type (café, park, market, etc.)
  - Why it suits the user's current context
  - Estimated travel time from user's location
  - What to expect (vibe, typical crowd, how long to spend)
- Output is readable and actionable — no filler content

---

---

## V2 — Trust, Action & Feedback

---

### US-09 — Trust Signals on Recommendations

**As a** solo traveler in an unfamiliar city,  
**I want to** see safety and crowd signals alongside each recommendation (e.g. "popular with solo travelers", "well-lit area", "busy at this hour"),  
**So that** I can make a confident decision without worrying about whether a place is appropriate for me right now.

**Acceptance Criteria:**
- Each recommendation displays at least one trust signal inferred from the place type, rating, and time of day
- Signals are short labels, not paragraphs (e.g. "Solo-friendly", "Busy now", "Well-rated")
- Backend extracts trust signals as part of the ranking step — no separate API call
- Signals do not clutter the card; shown as small tags below the vibe

---

### US-10 — Book a Cab from Recommendation

**As a** traveler who has chosen a place to go,  
**I want to** tap "Book Cab" directly on the recommendation card and be taken to Uber or Ola with the destination pre-filled,  
**So that** I can get there without switching apps and manually searching for the address.

**Acceptance Criteria:**
- "Book Cab" button appears on each recommendation card
- Tapping opens Uber (primary) or Ola (secondary) with dropoff pre-set to the recommended place's coordinates
- Falls back to a web URL if the native app is not installed
- Works on mobile (deeplink) and desktop (web URL)
- Coordinates (lat/lng) are returned by the backend in the recommendation payload

---

### US-11 — Get Directions to a Place

**As a** traveler ready to leave,  
**I want to** tap "Directions" on a recommendation and open Google Maps with the route pre-loaded,  
**So that** I can navigate immediately without copying an address.

**Acceptance Criteria:**
- "Directions" button opens Google Maps with destination set to the place's coordinates
- Works on both mobile (app deeplink) and desktop (web)
- No additional input required from the user

---

### US-12 — Recommendation Feedback

**As a** returning DriftSpot user,  
**I want to** give a quick thumbs up or thumbs down on each recommendation,  
**So that** the app learns my taste over time and future suggestions get better.

**Acceptance Criteria:**
- Thumbs up / thumbs down button visible on each recommendation card
- Feedback is saved to the user's profile (requires login)
- Feedback is stored against the place + query context (not just the place in isolation)
- No confirmation screen — one tap saves it
- Users who are not logged in see a "Sign in to give feedback" prompt

---

## Future — Planned but Out of Scope for V1

---

### US-06 — GPS Auto-Location *(Future)*

**As a** traveler on the move,  
**I want** the app to detect my current location automatically,  
**So that** I don't have to type where I am.

**Notes:** Requires device GPS integration. Will replace typed location in US-02.

---

### US-07 — Transport Booking *(Future)*

**As a** traveler who has chosen a destination,  
**I want** to book a cab or auto directly from the recommendation,  
**So that** I can go there without switching to another app.

**Notes:** Integration with local transport APIs (Ola, Uber, Rapido). Triggered after the user selects a recommendation.

---

### US-08 — In-App Translator *(Future)*

**As a** traveler in a city where I don't speak the local language,  
**I want** a translator I can use on the ground to communicate with locals,  
**So that** I can navigate and interact without a language barrier.

**Notes:** Real-time translation for spoken or typed input. Especially relevant for non-English speaking destinations.
