import { useState } from "react";
import QueryInput from "./components/QueryInput";
import ResultCard from "./components/ResultCard";
import EmptyState from "./components/EmptyState";
import LoadingSkeleton from "./components/LoadingSkeleton";
import UserMenu from "./components/UserMenu";
import ShortlistBar from "./components/ShortlistBar";
import ShortlistPanel from "./components/ShortlistPanel";
import LoginPage from "./pages/LoginPage";
import { useAuth } from "./context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function MainApp({ session }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [queryId, setQueryId] = useState(null);
  const [followUp, setFollowUp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shortlist, setShortlist] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);

  async function handleDiscover() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setFollowUp(null);
    setQueryId(null);
    setShortlist([]);

    const headers = { "Content-Type": "application/json" };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    try {
      const res = await fetch(`${API_URL}/discover`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      const data = await res.json();
      setResults(data.recommendations || []);
      setFollowUp(data.follow_up || null);
      setQueryId(data.query_id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleShortlist(rec) {
    setShortlist((prev) => {
      const exists = prev.find((p) => p.name === rec.name);
      return exists ? prev.filter((p) => p.name !== rec.name) : [...prev, rec];
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex">

      {/* Left Panel */}
      <ShortlistPanel
        session={session}
        apiUrl={API_URL}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="px-6 pt-8 pb-4">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mobile panel toggle */}
              <button
                onClick={() => setPanelOpen(true)}
                className="md:hidden text-orange-400 hover:text-orange-600 mr-1 text-xl"
                title="Your shortlisted spots"
              >
                🏷️
              </button>
              <span className="text-2xl">🌊</span>
              <h1 className="text-xl font-bold text-orange-900 tracking-tight">DriftSpot</h1>
            </div>
            <UserMenu />
          </div>
          <p className="text-center text-orange-700/60 text-sm mt-3">
            Drift to spots worth your time
          </p>
        </header>

        {/* Content */}
        <main className={`px-4 max-w-xl mx-auto w-full ${shortlist.length > 0 ? "pb-48" : "pb-16"}`}>
          <QueryInput
            value={query}
            onChange={setQuery}
            onSubmit={handleDiscover}
            loading={loading}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading && <LoadingSkeleton />}

          {!loading && results && results.length > 0 && (
            <div className="mt-6">
              <p className="text-orange-800/50 text-xs font-semibold uppercase tracking-widest mb-3 px-1">
                Places for you
              </p>
              <div className="flex flex-col gap-4">
                {results.map((rec, i) => (
                  <ResultCard
                    key={i}
                    rec={rec}
                    index={i}
                    queryId={queryId}
                    session={session}
                    apiUrl={API_URL}
                    shortlisted={shortlist.some((p) => p.name === rec.name)}
                    onShortlist={handleShortlist}
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && results && results.length === 0 && (
            followUp ? (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm flex gap-3 items-start">
                <span className="text-lg">💬</span>
                <p>{followUp}</p>
              </div>
            ) : (
              <EmptyState />
            )
          )}
        </main>
      </div>

      <ShortlistBar
        items={shortlist}
        onRemove={(name) => setShortlist((prev) => prev.filter((p) => p.name !== name))}
        onClear={() => setShortlist([])}
      />
    </div>
  );
}

export default function App() {
  const { session, loading: authLoading } = useAuth();

  if (authLoading) return null;
  if (!session) return <LoginPage />;
  return <MainApp session={session} />;
}
