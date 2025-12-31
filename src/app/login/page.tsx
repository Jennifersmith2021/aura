"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegisterMode) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Registration failed");
        }
      }

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur rounded-2xl shadow-lg border border-border p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{isRegisterMode ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isRegisterMode ? "Sign up to keep your wardrobe in sync everywhere." : "Sign in to sync your data across devices."}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegisterMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                className="w-full rounded-lg border border-border bg-transparent px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aura User"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 rounded-lg font-semibold shadow-md disabled:opacity-60"
          >
            {loading ? "Working..." : isRegisterMode ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          className="w-full text-sm text-primary font-medium"
          onClick={() => {
            setIsRegisterMode((prev) => !prev);
            setError(null);
          }}
        >
          {isRegisterMode ? "Already have an account? Sign in" : "Need an account? Create one"}
        </button>
      </div>
    </div>
  );
}
