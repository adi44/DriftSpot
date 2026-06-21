export default function ShortlistBar({ items, onRemove, onClear }) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-white border-t border-orange-100 shadow-2xl shadow-orange-200 px-4 pt-4 pb-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-orange-800/60">
              Your shortlist · {items.length} place{items.length > 1 ? "s" : ""}
            </span>
            <button
              onClick={onClear}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {items.map((item) => (
              <div
                key={item.name}
                className="shrink-0 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 min-w-40 max-w-52 relative"
              >
                <button
                  onClick={() => onRemove(item.name)}
                  className="absolute top-2 right-2 text-gray-300 hover:text-red-400 text-xs transition-colors"
                >
                  ✕
                </button>
                <p className="text-gray-900 font-semibold text-sm leading-snug pr-4 mb-2">
                  {item.name}
                </p>
                <div className="flex flex-col gap-1">
                  {item.estimated_travel_time && (
                    <span className="text-xs text-orange-600">
                      🚗 {item.estimated_travel_time}
                    </span>
                  )}
                  {item.vibe && (
                    <span className="text-xs text-orange-600">
                      ✨ {item.vibe}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
