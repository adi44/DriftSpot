import { useEffect, useState } from "react";

export default function ShortlistPanel({ session, apiUrl, open, onClose }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;
    fetchPlaces();
  }, [session]);

  async function fetchPlaces() {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/saved-places`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setPlaces(data.saved_places || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id) {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
    await fetch(`${apiUrl}/saved-places/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
  }

  const content = (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-orange-100">
        <div>
          <h2 className="text-sm font-bold text-orange-900 tracking-tight">
            Your Shortlisted
          </h2>
          <p className="text-xs text-orange-500 font-medium">Drift Spots</p>
        </div>
        <button
          onClick={onClose}
          className="md:hidden text-gray-400 hover:text-gray-600 text-lg"
        >
          ✕
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-orange-50 rounded-2xl h-20" />
          ))
        ) : places.length === 0 ? (
          <div className="text-center mt-10 px-4">
            <div className="text-3xl mb-3">🏷️</div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Shortlist places from your results and they'll appear here.
            </p>
          </div>
        ) : (
          places.map((place) => (
            <div
              key={place.id}
              className="bg-white border border-orange-100 rounded-2xl p-4 shadow-sm group relative"
            >
              <button
                onClick={() => handleRemove(place.id)}
                className="absolute top-3 right-3 text-gray-200 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
              <p className="text-gray-900 font-semibold text-sm leading-snug pr-4 mb-2">
                {place.place_name}
              </p>
              {place.place_type && (
                <span className="inline-block text-xs text-orange-500 font-medium capitalize mb-2">
                  {place.place_type.replace(/_/g, " ")}
                </span>
              )}
              <div className="flex flex-col gap-1">
                {place.estimated_travel_time && (
                  <span className="text-xs text-gray-500">🚗 {place.estimated_travel_time}</span>
                )}
                {place.vibe && (
                  <span className="text-xs text-gray-500">✨ {place.vibe}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 bg-white/70 backdrop-blur-sm border-r border-orange-100 min-h-screen sticky top-0 h-screen">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <aside className="relative w-72 bg-white h-full shadow-2xl flex flex-col">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
