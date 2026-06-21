import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: "📍", label: "Hyperlocal picks based on where you are" },
  { icon: "✨", label: "Matched to your mood and vibe" },
  { icon: "⏱️", label: "Fits your free time, not your whole day" },
];

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col">
      {/* Top decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-rose-400 rounded-3xl shadow-xl shadow-orange-200 mb-5 text-4xl">
            🌊
          </div>
          <h1 className="text-4xl font-bold text-orange-900 tracking-tight mb-3">
            DriftSpot
          </h1>
          <p className="text-gray-600 text-lg leading-snug max-w-xs mx-auto">
            Your one stop solution to find places that match your vibes
          </p>
        </div>

        {/* Feature highlights */}
        <div className="w-full max-w-sm mb-10 flex flex-col gap-3">
          {FEATURES.map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-white/70 backdrop-blur-sm border border-orange-100 rounded-2xl px-4 py-3 shadow-sm"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-gray-700 text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Sign in */}
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border border-orange-200 text-gray-700 font-semibold text-sm px-6 py-4 rounded-2xl shadow-md shadow-orange-100 hover:shadow-lg hover:shadow-orange-200 hover:border-orange-300 transition-all duration-200"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-gray-400 text-center px-4">
            By continuing, you agree to DriftSpot saving your search history and shortlisted places.
          </p>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative h-24 overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 1440 96"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64 C360,96 1080,32 1440,64 L1440,96 L0,96 Z"
            fill="rgb(251 146 60 / 0.15)"
          />
          <path
            d="M0,80 C480,48 960,96 1440,72 L1440,96 L0,96 Z"
            fill="rgb(251 146 60 / 0.1)"
          />
        </svg>
      </div>
    </div>
  );
}
