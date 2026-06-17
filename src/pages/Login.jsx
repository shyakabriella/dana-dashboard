import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, Hotel } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect to admin
  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token");
    if (token) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/dana/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: login,
          password: password,
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Invalid login credentials.");
      }

      const token = data.data?.token || data.token;
      
      if (!token) {
        throw new Error("Login successful, but token was not returned.");
      }

      // Store token
      localStorage.setItem("token", token);
      localStorage.setItem("auth_token", token);
      
      // Store user data
      if (data.data?.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-amber-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-amber-400/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 shadow-lg shadow-amber-500/30">
            <Hotel size={32} className="text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white tracking-tight">
            DANA HOTEL
          </h1>
          <p className="mt-2 text-sm text-amber-200/80">
            Administrator Login
          </p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-900/40 backdrop-blur-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login" className="mb-1.5 block text-sm font-medium text-amber-200">
                Email Address
              </label>
              <input
                id="login"
                type="email"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="admin@danahotel.com"
                className="w-full rounded-xl border border-amber-500/30 bg-amber-800/20 px-4 py-3 text-sm text-white placeholder:text-amber-400/50 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:bg-amber-800/30 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-amber-200">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-amber-500/30 bg-amber-800/20 px-4 py-3 pr-11 text-sm text-white placeholder:text-amber-400/50 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:bg-amber-800/30 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-200 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 transition-all hover:from-amber-600 hover:to-amber-700 hover:shadow-amber-500/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-4 text-center border-t border-amber-500/20">
            <p className="text-xs text-amber-400/60">
              Secure administrator access only
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-amber-500/50">
          DANA KIGALI HOTEL — A welcoming home in Kigali, Rwanda
        </p>
      </div>
    </div>
  );
}