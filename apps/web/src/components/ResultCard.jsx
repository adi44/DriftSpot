import { useState } from "react";

const PLACE_ICONS = {
  cafe: "☕",
  park: "🌳",
  museum: "🏛️",
  restaurant: "🍽️",
  bar: "🍻",
  temple: "🛕",
  art_gallery: "🎨",
  shopping: "🛍️",
  viewpoint: "🌅",
  default: "📍",
};

function getIcon(placeType) {
  if (!placeType) return PLACE_ICONS.default;
  const key = Object.keys(PLACE_ICONS).find((k) =>
    placeType.toLowerCase().includes(k)
  );
  return key ? PLACE_ICONS[key] : PLACE_ICONS.default;
}

const ACCENT_COLORS = [
  "from-amber-400 to-orange-400",
  "from-rose-400 to-pink-400",
  "from-orange-400 to-amber-400",
];

export default function ResultCard({ rec, index, queryId, session, apiUrl, shortlisted, onShortlist }) {
  const [loading, setLoading] = useState(false);

  const { name, place_type, why_it_suits_you, estimated_travel_time, vibe, how_long_to_spend } = rec;

  async function handleShortlist() {
    if (loading) return;

    if (!session?.access_token) {
      alert("Sign in to shortlist places.");
      return;
    }

    setLoading(true);
    try {
      if (!shortlisted) {
        const res = await fetch(`${apiUrl}/places/shortlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ place: rec, query_id: queryId }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.detail || "Failed to save place. Please try again.");
          return;
        }
      }
      onShortlist(rec);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`bg-white rounded-3xl shadow-md border overflow-hidden transition-all duration-200 ${
        shortlisted
          ? "border-orange-400 shadow-orange-200 ring-2 ring-orange-300"
          : "border-orange-50 shadow-orange-100 hover:shadow-lg hover:shadow-orange-100"
      }`}
    >
      <div className={`h-1 w-full bg-gradient-to-r ${ACCENT_COLORS[index % ACCENT_COLORS.length]}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="text-2xl mt-0.5">{getIcon(place_type)}</div>
            <div>
              <h3 className="text-gray-900 font-semibold text-base leading-snug">{name}</h3>
              {place_type && (
                <span className="text-xs text-orange-500 font-medium capitalize">
                  {place_type.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleShortlist}
            disabled={loading}
            className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
              shortlisted
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-white border-orange-200 text-orange-500 hover:bg-orange-50"
            }`}
          >
            {shortlisted ? "✓ Shortlisted" : "+ Shortlist"}
          </button>
        </div>

        {why_it_suits_you && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{why_it_suits_you}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {estimated_travel_time && <Pill icon="🚗" label={estimated_travel_time} />}
          {how_long_to_spend && <Pill icon="⏱️" label={how_long_to_spend} />}
          {vibe && <Pill icon="✨" label={vibe} />}
        </div>
      </div>
    </div>
  );
}

function Pill({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1.5 rounded-full">
      <span>{icon}</span>
      {label}
    </span>
  );
}
