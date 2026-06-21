export default function EmptyState() {
  return (
    <div className="mt-10 text-center px-4">
      <div className="text-5xl mb-4">🗺️</div>
      <h3 className="text-gray-700 font-semibold text-base mb-1">
        No places found nearby
      </h3>
      <p className="text-gray-400 text-sm">
        Try being more specific about your location or broaden your preferences.
      </p>
    </div>
  );
}
