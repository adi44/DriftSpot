export default function QueryInput({ value, onChange, onSubmit, loading }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className="mt-6 bg-white rounded-3xl shadow-lg shadow-orange-100 border border-orange-100 overflow-hidden">
      <textarea
        className="w-full px-5 pt-5 pb-3 text-gray-800 placeholder-gray-400 text-base resize-none focus:outline-none bg-transparent"
        rows={3}
        placeholder="e.g. I'm in Whitefield, free after 6 PM, want to relax and see something nearby..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center justify-between px-4 pb-4 pt-1">
        <p className="text-xs text-gray-400">Press Enter to discover</p>
        <button
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all duration-200 shadow-md shadow-orange-200"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Finding...
            </>
          ) : (
            <>
              <span>✨</span>
              Discover
            </>
          )}
        </button>
      </div>
    </div>
  );
}
