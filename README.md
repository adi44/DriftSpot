# DriftSpot 🌊

**Hyperlocal travel discovery for time-constrained travelers.**

> "I was at a conference in Whitefield, Bangalore. It was 6 PM. I had the evening free but no idea what was nearby — Google Maps showed places 45 minutes away in traffic, TripAdvisor gave me a city-wide Top 10. I ended up staying at the hotel. I built DriftSpot so that never happens again."

**[Live Demo](https://driftspot-app.vercel.app)** · **[API Docs](https://driftspot-api.onrender.com/docs)** · **[Product Docs](./docs/)**

▶ **[Watch Demo on Loom](https://www.loom.com/share/e2d58d7075d64664b90d04bcd752e048)**

---

## What It Does

DriftSpot takes a single free-form query and returns 2–3 curated, opinionated place recommendations — filtered for where you actually are, what time it is, and how you feel right now.

```
"I'm done with my conference in Whitefield. It's 6 PM, I want to relax somewhere quiet nearby."

→  Windmills Craftworks Brewery   ·  12 min  ·  "mellow craft beer evening"
→  Cubbon Park                    ·  18 min  ·  "quiet and green, good for a walk"
→  Koshy's                        ·  20 min  ·  "old-world Bangalore, filter coffee"
```

No search. No filters. No scrolling. Just go.

---

## Architecture

```
User Query (Natural Language)
          │
          ▼
┌─────────────────────────────────────────┐
│           FastAPI Backend               │
│                                         │
│  JWT Auth (Supabase)                    │
│          │                              │
│          ▼                              │
│   ┌─────────────────┐                   │
│   │  ExtractIntent  │  GPT-4.1-mini     │
│   │                 │  Expert + Few-shot│
│   └────────┬────────┘  prompting        │
│            │ intent {mood, purpose ...} │
│            ▼                            │
│   ┌─────────────────┐                   │
│   │  DiscoverPlaces │  Google Places    │
│   │                 │  Nearby Search    │
│   └────────┬────────┘  keyword-filtered │
│            │ candidate places[]         │
│            ▼                            │
│   ┌─────────────────┐                   │
│   │   RankPlaces    │  GPT-4.1-mini     │
│   │                 │  Strict rules,    │
│   └────────┬────────┘  no forced fits   │
│            │ recommendations[]          │
└────────────┼────────────────────────────┘
             │
             ▼
    Supabase (PostgreSQL + RLS)
    queries · saved_places · feedback
```

The pipeline is built with **LangGraph** — each stage is a discrete, independently testable node with typed state flowing between them.

---

## Key Technical Decisions

### 1. LangGraph for AI Pipeline Orchestration
Rather than chaining everything into a single monolithic prompt, the pipeline is broken into three nodes with a shared `TravelState` TypedDict. This makes each step independently debuggable, swappable, and testable — critical for a system where prompt changes in one step affect the entire output chain.

### 2. `purpose` Field for Targeted Place Search
Instead of hardcoding a mood → place-type mapping, the LLM extracts the traveler's specific activity goal as a Google Places keyword:
```
"I want to smoke somewhere" → purpose: "hookah bar OR tobacco shop"
"eat biryani"              → purpose: "biryani restaurant"
```
This keyword is passed directly to Google Places — so discovery is targeted before ranking, not after.

### 3. JWT Auth + Supabase RLS (No Service Role Key on Client)
B2C auth via Google OAuth. The frontend only holds the user's JWT — no admin keys ever leave the backend. Row Level Security enforces per-user data isolation at the database layer:
```sql
create policy "Users access own data"
  on saved_places for all using (auth.uid() = user_id);
```
Even a compromised client cannot read or modify another user's data.

### 4. Persistent Schema Designed for Future Graph Recommendations
Every query, shortlist, and feedback action is stored with structured fields (not raw blobs), designed to be projected into a user–intent–place graph:
```
(User) -[:SEARCHED_IN]-> (Location)
(User) -[:SHORTLISTED {vibe, travel_time}]-> (Place)
(User) -[:LIKED / :DISLIKED]-> (Place)
```
This enables collaborative filtering and preference learning from Day 1 — without a painful schema migration later.

### 5. Expert + Few-Shot Prompt Engineering
Two techniques in combination:
- **Expert persona** — `"You are a knowledgeable local travel guide..."` activates domain-specific reasoning embedded in the model's weights
- **Few-shot examples** — constrain output vocabulary to values the downstream system expects (`"relaxed"` not `"chill"`)
- **Strict rules layer** — prevents creative reinterpretation (`"If someone asks to smoke, do NOT recommend salons"`)

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | FastAPI | Async-native, auto OpenAPI docs, Pydantic validation |
| AI Orchestration | LangGraph | Stateful multi-node pipelines; independently testable nodes |
| LLM | GPT-4.1-mini | Best quality/cost ratio for structured extraction + ranking |
| Place Data | Google Places API | Largest real-time coverage; open/closed status; keyword search |
| Auth + DB | Supabase | Google OAuth; RLS; PostgreSQL structured for graph-readiness |
| Frontend | React + Vite + Tailwind | Fast iteration; warm amber/orange design system |
| Hosting | Render (API) + Vercel (web) | Zero-config deploys from GitHub |

---

## Product Documentation

| Document | Description |
|---|---|
| [PRD](./docs/PRD.md) | Problem statement, target user, north star scenario |
| [User Stories](./docs/USER_STORIES.md) | Acceptance criteria for V1 and V2 features |
| [Sprint Plan V1](./docs/SPRINT_PLAN.md) | 5-day build plan for the core discovery loop |
| [Sprint Plan V2](./docs/SPRINT_2_PLAN.md) | Trust signals, cab booking, feedback loop |
| [Architecture](./docs/ARCHITECTURE.md) | ADRs — the why behind each technical decision |
| [Startup Foundation](./docs/STARTUP_FOUNDATION.md) | Market sizing, business model, GTM, competitive analysis |

---

## Running Locally

**Backend**
```bash
cd apps/api
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
uvicorn main:app --app-dir src --reload
# API at http://localhost:8000  ·  Docs at http://localhost:8000/docs
```

**Frontend**
```bash
cd apps/web
npm install
cp .env.example .env   # fill in your keys
npm run dev
# App at http://localhost:5173
```

**Required environment variables**

| Variable | Where to get it |
|---|---|
| `OPENAI_API_KEY` | platform.openai.com |
| `GOOGLE_PLACES_API_KEY` | Google Cloud Console → Maps → Places API |
| `SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `VITE_SUPABASE_KEY` | Same as `SUPABASE_ANON_KEY` |
| `VITE_API_URL` | `http://localhost:8000` (local) or your Render URL |

---

## Roadmap

- [x] Natural language intent extraction (mood, purpose, constraints)
- [x] Hyperlocal discovery via Google Places with keyword filtering
- [x] LLM-ranked recommendations with context-aware explanations
- [x] Google OAuth + JWT auth
- [x] Saved places (shortlist) persisted to Supabase
- [x] Left panel showing shortlisted spots across sessions
- [ ] Trust signals per recommendation (safety, crowd, solo-friendliness)
- [ ] Cab booking deeplink (Uber/Ola) from recommendation card
- [ ] Thumbs up/down feedback loop for personalization
- [ ] Graph-based collaborative recommendations (Neo4j)
- [ ] GPS auto-location

---

## About

Built by [Aditya Dhir](mailto:adityadhir97@gmail.com) — Senior AI Engineer.

DriftSpot demonstrates the intersection of AI engineering (LangGraph, prompt engineering, LLM orchestration) and product thinking (PRD, sprint planning, competitive analysis, investor framing).
