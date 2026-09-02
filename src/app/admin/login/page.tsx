"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function login() {
    setLoading(true);
    setStatus("Signing in… the first try can take up to a minute while the database starts.");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
        signal: AbortSignal.timeout(90_000),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        setStatus(data.error || "Login failed");
        return;
      }
      toast.success("Welcome back");
      setStatus("Opening the admin panel…");
      window.location.replace("/admin");
    } catch (e) {
      const timedOut = e instanceof DOMException && e.name === "TimeoutError";
      toast.error(
        timedOut
          ? "Database is still starting. Wait 20 seconds and try Login again."
          : "Could not reach the server. Keep npm run dev running, then try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen hero-glow grid place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <h1 className="font-display text-3xl text-wine">Admin Portal</h1>
        <p className="text-sm text-zinc-500 mt-1">OM SHREE JEWELS</p>
        <form
          className="mt-6 space-y-3"
          autoComplete="off"
          autoCorrect="off"
          onSubmit={(e) => {
            e.preventDefault();
            void login();
          }}
        >
          <input type="text" name="fake-user" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden />
          <input type="password" name="fake-pass" autoComplete="current-password" className="hidden" tabIndex={-1} aria-hidden />
          <input
            name="osb-admin-id"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full rounded-full border px-4 py-3"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <input
            name="osb-admin-secret"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-full border px-4 py-3"
            autoComplete="new-password"
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
          {status ? <p className="text-xs text-center text-zinc-500">{status}</p> : null}
        </form>
      </div>
    </div>
  );
}
