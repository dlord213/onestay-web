/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type FormEvent } from "react";
import type { User, UserRole } from "./types/user";
import { authAPI } from "../api/auth";
import { useAuthStore } from "./store/Auth";
import { AlertCircle, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { login } = useAuthStore();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(email, password);

      const user: User = {
        id: response.user.id,
        name: response.user.username,
        email: response.user.email,
        role: response.user.role as UserRole,
        avatar:
          response.user.role === "owner"
            ? "https://randomuser.me/api/portraits/men/45.jpg"
            : "https://randomuser.me/api/portraits/women/32.jpg",
      };

      await login(user, response.token);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-dvh p-4 mx-auto bg-base-300 items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="flex flex-col p-12 bg-base-100 rounded-lg gap-4 w-full max-w-lg"
      >
        <div className="flex flex-col items-center text-center gap-3 mb-4">
          <div className="p-4 bg-primary rounded-full text-primary-content">
            <LockKeyhole size={32} />
          </div>
          <h1 className="text-3xl font-bold">OneStay</h1>
          <p className="text-base-content/70 text-sm">
            Let the relaxation begin.
          </p>
        </div>

        {/* --- Error Display --- */}
        {error && (
          <div className="alert alert-error shadow-lg text-sm">
            <div>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend">Email</legend>
            <input
              type="email"
              className="input w-full"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Password</legend>
            <input
              type="password"
              className="input w-full"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </fieldset>
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="loading loading-spinner"></span>
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </main>
  );
}
