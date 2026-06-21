# Architecture & Design Decisions
## DriftSpot

This document captures the key architectural decisions made during DriftSpot's design — including the reasoning, alternatives considered, and future implications. Each decision was made with both the immediate V1 requirement and long-term product scalability in mind.

---

## System Overview

```
User Query (NL)
      │
      ▼
┌─────────────────────────────────────────────┐
│              FastAPI Backend                │
│                                             │
│   JWT Verification (Supabase Auth)          │
│              │                              │
│              ▼                              │
│      LangGraph Pipeline                     │
│   ┌──────────────────────────┐              │
│   │  ExtractIntent           │  ← Expert + │
│   │  (GPT-4.1-mini)          │    Few-shot  │
│   └──────────┬───────────────┘    prompts  │
│              │ intent + constraints         │
│              ▼                              │
│   ┌──────────────────────────┐              │
│   │  DiscoverPlaces          │  ← Google   │
│   │  (Google Places API)     │    Places   │
│   └──────────┬───────────────┘    keyword  │
│              │ candidate places             │
│              ▼                              │
│   ┌──────────────────────────┐              │
│   │  RankPlaces              │  ← Expert + │
│   │  (GPT-4.1-mini)          │    strict   │
│   └──────────┬───────────────┘    rules    │
│              │ recommendations              │
└─────────────────────────────────────────────┘
              │
              ▼
   Supabase (PostgreSQL + RLS)
   ┌──────────────────────────┐
   │ queries                  │
   │ saved_places             │
   │ feedback                 │
   └──────────────────────────┘
```

---

## ADR-001 — Persistent Storage Schema Designed for Future Graph Recommendations

**Decision:** Use Supabase PostgreSQL with structured, queryable fields per interaction — not a flat log or blob store.

**Context:**
DriftSpot's V1 is a discovery tool. But the long-term vision is a recommendation engine that improves with every user interaction. For that to work, every query, shortlist action, and feedback signal needs to be stored in a schema that can later be projected into a graph.

**What we store and why each field exists:**

| Table | Key Fields | Graph Purpose |
|---|---|---|
| `queries` | `user_id`, `location`, `mood`, `purpose`, `radius_km` | Node: User → Intent → Location edges |
| `saved_places` | `user_id`, `place_name`, `place_type`, `vibe` | Edge: User → [shortlisted] → Place |
| `feedback` | `user_id`, `place_name`, `rating (+1/-1)`, `query_id` | Edge: User → [liked/disliked] → Place |

**Future graph model (Neo4j or graph layer over Postgres):**
```
(User)-[:SEARCHED_IN]->(Location)
(User)-[:SHORTLISTED {vibe, travel_time}]->(Place)
(User)-[:LIKED]->(Place)
(User)-[:DISLIKED]->(Place)
(Place)-[:LOCATED_IN]->(Location)
(Place)-[:HAS_TYPE]->(PlaceType)
```

This enables:
- **Collaborative filtering:** "Users who shortlisted Koshy's in Bangalore also liked X in Mumbai"
- **Mood-to-place learning:** which place types actually get shortlisted when mood is "relaxed"
- **Cold start mitigation:** new users inherit patterns from travelers with similar intent profiles

**Alternatives considered:**
- Logging raw query strings only → not queryable, no graph potential
- Third-party analytics (Mixpanel, Amplitude) → event-level only, no relational structure
- Redis for session storage → ephemeral, no history

**Why this decision matters now:**
The schema is cheap to add at V1 and very expensive to retrofit later. Every shortlist and feedback action from Day 1 becomes training signal.

---

## ADR-002 — JWT Authentication for B2C Security

**Decision:** Use Google OAuth via Supabase, with JWT passed by the client and verified server-side on every request. No server-side sessions. No service role key on the client.

**Context:**
DriftSpot is a B2C product. Users authenticate themselves — there is no admin provisioning, no company SSO, no IT department. The auth model must be:
- Low friction (one-click Google sign-in)
- Stateless and horizontally scalable
- Secure without relying on client-side trust

**How it works:**
```
1. User clicks "Sign in with Google"
2. Supabase Auth handles OAuth flow, issues a signed JWT
3. Frontend (supabase-js) stores the JWT in memory/session
4. Every API call sends: Authorization: Bearer <jwt>
5. Backend calls supabase.auth.get_user(jwt) to verify
6. Supabase returns the user object if valid — rejected otherwise
7. Supabase RLS uses the JWT claim (auth.uid()) to enforce row-level access
```

**Security properties this gives us:**

| Property | How |
|---|---|
| Stateless auth | JWT is self-contained — no session DB needed |
| Per-user data isolation | RLS policies: `using (auth.uid() = user_id)` — enforced at DB level, not app level |
| No privilege escalation | Even if a user knows another user's `place_id`, they cannot read or delete it |
| No secret on the client | Frontend uses anon/publishable key only. Service role key never leaves the backend |
| Expiry + rotation | Supabase JWTs expire; refresh tokens handle re-auth transparently |

**Why JWT over alternatives:**
- **Cookie-based sessions** → requires sticky sessions or shared session store; harder to scale horizontally; CSRF risk
- **API key per user** → no expiry, no standard revocation, manual management overhead
- **OAuth access token direct to Google** → would require verifying with Google on every request; latency + dependency

**B2C-specific reasoning:**
In a B2C product, you cannot trust the client. Every state-changing action (save place, delete place, give feedback) must be verified independently on the backend. JWT makes this stateless and cryptographically verifiable without a database round-trip for session lookup.

---

## ADR-003 — Prompt Engineering: Expert Prompting + Few-Shot Techniques

**Decision:** Use two prompt engineering techniques in combination — Expert Persona prompting for framing and Few-Shot (multi-shot) examples for field-level accuracy.

**Context:**
DriftSpot's quality depends entirely on two LLM steps: intent extraction and place ranking. Generic prompts produce generic, inconsistent output. The difference between "a cafe" and "a quiet cafe near Whitefield that suits someone who's tired after a 9-hour conference" is entirely in the prompt.

---

### Technique 1 — Expert Persona Prompting

**What it is:** Opening the prompt with a defined expert role so the model adopts domain-specific reasoning patterns and vocabulary.

**Where used:**

*Intent extraction:*
```
"You are an expert travel intent extraction system."
```
This frames the model as a structured parser with travel domain knowledge — not a general assistant. It produces more consistent field extraction and fewer hallucinated values.

*Place ranking:*
```
"You are a knowledgeable local travel guide helping a traveler
make the most of their limited free time."
```
This shifts tone from "database lookup" to "local friend who knows the city". The recommendations read as contextual and personal, not like a list generated from filters.

**Why it works:** LLMs have internalized the behavior of domain experts from training data. Activating that persona produces outputs consistent with how that expert would reason — including implicit knowledge (e.g., a travel guide knows that a tired solo traveler doesn't want a loud nightclub, even if not explicitly stated).

---

### Technique 2 — Few-Shot (Multi-Shot) Prompting

**What it is:** Providing labeled examples directly in the prompt so the model learns the expected output format and value range from demonstration, not instruction alone.

**Where used in intent extraction:**
```
mood:
  Examples: adventurous, relaxed, romantic, spiritual, cultural, fun, introspective

crowd_preference:
  One of: "off-the-beaten-path", "moderate", "popular"
  Infer from cues like "hidden gem", "quiet" → off-the-beaten-path;
  "famous", "popular" → popular.

purpose:
  Examples: "smoke" → "hookah bar OR tobacco shop",
            "eat biryani" → "biryani restaurant",
            "drink beer" → "bar OR pub"
```

**Why examples outperform instructions alone:**
Instructions tell the model what to do. Examples show the model what the output space looks like. For enumerated fields like `mood` or `crowd_preference`, examples constrain the output to the vocabulary the downstream system expects — preventing values like "chill" or "tranquil" when "relaxed" is the canonical term.

For the `purpose` field specifically, multi-shot examples teach the model to translate colloquial phrases into Google Places-compatible search terms — a non-obvious mapping that pure instruction struggles to produce consistently.

---

### Combined Effect

The two techniques work together:

```
Expert Persona  →  sets the reasoning frame and tone
Few-Shot        →  constrains output vocabulary and format
Strict Rules    →  prevents over-creative interpretation (e.g. "don't recommend salons for smoking queries")
```

This combination produces outputs that are:
- **Consistent:** same field names, same value ranges, across varied queries
- **Contextual:** grounded in the traveler's actual situation, not generic advice
- **Honest:** returns `[]` when no good match exists rather than hallucinating relevance

---

## ADR-004 — LangGraph Over a Single LLM Call

**Decision:** Use LangGraph to structure the AI pipeline as discrete, stateful nodes rather than a single monolithic prompt.

**Context:**
The naive approach is one prompt: "Given this query, return place recommendations." This fails because:
- Mixing intent extraction + place discovery + ranking in one prompt makes each step worse
- No structured intermediate state to debug, log, or branch on
- Cannot swap out individual components (e.g., replace Google Places with Foursquare) without rewriting the whole prompt

**Node responsibilities:**

| Node | Input | Output | Why separate |
|---|---|---|---|
| `ExtractIntent` | raw query | `intent`, `constraints` | Structured extraction needs its own focused prompt |
| `DiscoverPlaces` | `constraints.location`, `intent.purpose` | candidate `places[]` | Pure API call — no LLM needed here |
| `RankPlaces` | `places[]`, `intent`, `constraints` | `recommendations[]` | Ranking is a different cognitive task than extraction |

**Benefits realized:**
- Each node is independently testable and replaceable
- State object (`TravelState`) is inspectable at every step — debug-friendly
- `DiscoverPlaces` can be parallelized in future (fetch from multiple sources)
- Ranking prompt is not contaminated by intent extraction instructions

---

## Technology Choices Summary

| Component | Choice | Rationale |
|---|---|---|
| Backend framework | FastAPI | Async-native, automatic OpenAPI docs, Pydantic validation |
| AI orchestration | LangGraph | Stateful multi-node pipelines; better than LangChain chains for branching |
| LLM | GPT-4.1-mini | Best quality/cost ratio for structured extraction + ranking |
| Place data | Google Places API | Largest coverage, real-time open/closed status, rating data |
| Auth | Supabase + Google OAuth | Zero-friction B2C login; JWT-based; RLS enforced at DB layer |
| Database | Supabase PostgreSQL | Structured schema for graph-readiness; RLS; familiar SQL |
| Frontend | React + Vite + Tailwind | Fast iteration; component model fits card-based UI |
