"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { loginSchema, registerSchema } from "@/lib/validation";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await authApi.me();
        if (!cancelled && res.success) router.replace("/compose");
      } catch {
        /* not logged in */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        next[String(i.path[0])] = i.message;
      });
      setErrors(next);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(parsed.data.email, parsed.data.password);
      if (res.success) {
        toast("success", "Welcome back!");
        router.push("/compose");
      } else toast("error", res.message ?? "Login failed");
    } catch {
      toast("error", "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const parsed = registerSchema.safeParse({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        next[String(i.path[0])] = i.message;
      });
      setErrors(next);
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register(
        parsed.data.name,
        parsed.data.email,
        parsed.data.password,
      );
      if (res.success) {
        toast("success", "Account created!");
        router.push("/compose");
      } else toast("error", res.message ?? "Registration failed");
    } catch {
      toast("error", "Network error");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <header className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-3xl font-bold text-transparent">
            Email Sender
          </h1>
          <p className="mt-1 text-sm text-slate-500">Secure bulk email management</p>
        </header>

        <div className="mb-6 flex gap-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-semibold ${
              mode === "login" ? "bg-indigo-600 text-white" : "text-slate-600"
            }`}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 text-sm font-semibold ${
              mode === "register" ? "bg-indigo-600 text-white" : "text-slate-600"
            }`}
            onClick={() => setMode("register")}
          >
            Sign up
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className={inputClass}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className={inputClass}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="mb-1 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="reg-name"
                className={inputClass}
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                className={inputClass}
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                className={inputClass}
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                minLength={6}
                required
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
