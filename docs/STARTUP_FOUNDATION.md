# DriftSpot — Startup Foundation Document

---

## 1. One-Liner

> DriftSpot helps time-constrained travelers discover the best nearby places that match their vibe — in seconds, not searches.

---

## 2. Vision

A world where no traveler wastes their limited free time staring at Google Maps, scrolling through generic lists, or staying in their hotel room because they couldn't figure out what to do.

---

## 3. Mission

To give every traveler — wherever they are, however much time they have — a confident, personalized plan for their next few hours, without any effort on their part.

---

## 4. The Problem

Millions of professionals travel for work every week. Conferences, offsites, client visits. Most of them have a few hours free — usually an evening. And most of them end up doing nothing useful with that time.

Not because there's nothing to do. Because:

- Existing tools (Google Maps, TripAdvisor, Yelp) give city-wide recommendations, not neighborhood-level ones
- Traffic is ignored — a "nearby" place can be an hour away
- Recommendations are generic — not filtered for a person who just had a 9-hour conference day and wants to unwind
- Discovery requires effort — searching, reading reviews, comparing, deciding. That's exactly the energy a tired traveler doesn't have

**The gap:** there is no product built for the person who is *already somewhere*, has *limited time*, and wants a *confident, low-effort answer* — not a list to research.

---

## 5. The Solution

DriftSpot takes a single natural language input — "I'm done with my conference in Whitefield, it's 6 PM, I want to relax somewhere quiet nearby" — and returns 2–3 highly specific recommendations:

- Reachable from the user's current location
- Open right now
- Matched to mood, companions, and time budget
- With a clear reason why each place suits them

No search. No filters. No tabs. Just go.

---

## 6. Target Market

### Primary ICP (Ideal Customer Profile)

| Attribute | Description |
|---|---|
| Who | Working professional, 25–45 |
| Travel type | Work-related (conference, client visit, offsite) |
| Frequency | 4–20 trips/year |
| Pain | Has 2–4 free hours in an unfamiliar city, doesn't know where to go |
| Behavior | Currently uses Google Maps or asks colleagues — both give suboptimal results |
| Decision time | Wants an answer in under 2 minutes |

### Secondary ICP

Weekend getaway travelers who land in a new city and want quick local recommendations without over-planning.

### Market Size

- **Global business travel market:** $1.4 trillion/year (pre-2025 levels recovering)
- **Addressable travelers:** ~500M business trips annually globally
- **Engaged segment:** Travelers with discretionary free time who actively seek local experiences — estimated 30–40% of business travelers
- **TAM:** Local discovery for business travelers — ~$8–12B (intersection of travel tech + local discovery)
- **SAM (near-term):** English-speaking markets, India + Southeast Asia first — ~$800M
- **SOM (Year 1–2):** India's conference/offsite-heavy metros (Bangalore, Mumbai, Delhi, Hyderabad, Pune) — ~$20–50M addressable

---

## 7. Business Model

### Phase 1 — Free (Growth)
Free access to core discovery. Build habit and user base.

### Phase 2 — Freemium (Monetization begins)

| Tier | Features | Price |
|---|---|---|
| Free | 3 queries/day, basic recommendations | $0 |
| Pro | Unlimited queries, saved history, curated collections, offline access | $5–8/month |
| Teams | Shared shortlists, company travel integration, concierge mode | $15/user/month |

### Phase 3 — B2B & Partnerships

- **Corporate travel integrations:** Partner with Concur, TravelPerk, AmEx GBT to embed DriftSpot recommendations in expense/booking flows
- **Venue partnerships:** Featured placement for restaurants, experiences (similar to OpenTable/Resy model)
- **Conference organizers:** White-label "discover the city" tool bundled with event apps

### Revenue Streams (Steady State)

1. SaaS subscriptions (Pro + Teams)
2. B2B licensing to travel management companies
3. Affiliate/commission from bookings (restaurants, experiences)
4. Venue promotion (non-intrusive, clearly labeled)

---

## 8. Competitive Landscape

| Competitor | What they do | Why DriftSpot wins |
|---|---|---|
| Google Maps | City-wide discovery, reviews | Generic, not personalized to current context or mood |
| TripAdvisor | Top lists, reviews | Tourist-oriented, requires heavy research |
| Yelp | Local business discovery | US-centric, no intent understanding |
| ChatGPT / Gemini | Can answer travel questions | No real-time place data, no location awareness, not built for this use case |
| Airbnb Experiences | Curated activities | Pre-booked, not spontaneous; no "right now" mode |

**The white space:** No product owns the "I'm here right now, what should I do in the next 3 hours" moment with a truly personalized, low-effort answer.

---

## 9. Moat & Defensibility

**Short-term moat (Year 1):**
- Intent extraction quality — the LangGraph pipeline + prompt engineering produces recommendations that feel locally knowledgeable, not algorithmically generated
- Speed to value — answer in one free-form sentence, no onboarding, no filters

**Medium-term moat (Year 2–3):**
- **User preference graph:** Each query, shortlist, and return visit builds a preference model per user. Over time, DriftSpot knows your travel style better than any generic tool
- **City-depth data:** Curated local knowledge layered on top of Google Places (hidden gems, timing tips, local crowd data)
- **Network effects in Teams:** When a company's travelers all use DriftSpot, shared shortlists and colleague recommendations create stickiness

**Long-term moat:**
- Proprietary dataset of traveler intent + outcome (what was searched, what was shortlisted, what was actually visited)
- This data is hard to replicate and enables increasingly better recommendations

---

## 10. Go-to-Market Strategy

### Stage 1 — Seed Distribution (Month 1–3)
- Target conference-heavy communities: startup founders, developers, product managers
- Launch on Product Hunt, Hacker News ("Show HN")
- Founder-led outreach to tech conference WhatsApp/Slack groups in Indian metros
- Personal story: "I built this because I was stuck in Whitefield after a conference" — authentic, relatable

### Stage 2 — Community & Word of Mouth (Month 3–6)
- Embed in conference attendee packs / event apps (partner with local event organizers)
- "Drift packs" — city guides for top 5 conference cities in India, shareable on LinkedIn
- Target travel-adjacent communities: remote workers, digital nomads

### Stage 3 — B2B Outreach (Month 6–12)
- Approach HR/admin teams at large Indian tech companies who manage offsite travel
- Pilot with one mid-size company (~200–500 employees, frequent offsites)
- Use pilot to build case study for enterprise sales

### Stage 4 — Platform Integrations (Year 2)
- API partnerships with travel booking platforms
- White-label offering for conference organizers

---

## 11. Traction Milestones

| Milestone | Target | Timeline |
|---|---|---|
| Working V1 (NLP → recommendations) | Done | Sprint 1–5 complete |
| 100 active users | 100 MAU | Month 1 post-launch |
| 1,000 queries served | Validation | Month 2 |
| First paying Pro user | Revenue | Month 3 |
| 1,000 MAU | Growth | Month 6 |
| First B2B pilot | Enterprise signal | Month 9 |
| 10,000 MAU | Scale | Month 12 |

---

## 12. Key Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Google launches a direct competitor | Medium | Move fast on personalization layer — raw place data is commoditized, intent understanding is not |
| Google Places API costs become prohibitive | Low–Medium | Cache aggressively, explore OpenStreetMap + Foursquare as fallbacks |
| Low retention (single-use tool) | Medium | Build history, shortlists, preference profiles that make returning more valuable |
| Recommendation quality inconsistent | Medium | Continuous prompt tuning, add user feedback loop (thumbs up/down per recommendation) |
| Hard to acquire B2B clients early | Medium | Start B2C, use real user stories as B2B proof points |

---

## 13. What We're Building Towards

The short-term product is a travel discovery tool.

The long-term product is a **personal travel intelligence layer** — something that knows your travel style deeply enough that before you even ask, it can surface what you'll want to do next time you're in a city you've been to before, or a new one entirely.

DriftSpot is the wedge. The habit we're building is: *"When I arrive somewhere new, I open DriftSpot."* That habit, at scale, is the business.

---

## 14. Ask (For Investors / Co-founders)

**Seeking:**
- Seed funding: $300K–$500K USD
- Use of funds: 12 months of runway, engineering (1 backend, 1 frontend), Google Places API costs, GTM in top 5 Indian cities
- Strategic advisors with travel-tech or B2B SaaS experience

**Not seeking:** Pre-mature scaling. V1 proves the core loop works. Capital accelerates distribution, not product discovery.

---

*Document version: June 2026. DriftSpot is an early-stage product. All projections are directional.*
