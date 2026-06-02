"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { AppNavbar } from "@/components/AppNavbar";
import type { User } from "@/lib/types";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await authApi.me();
        if (cancelled) return;
        if (res.success && res.user) setUser(res.user);
        else router.replace("/login");
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-100 text-slate-600">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-1 flex-col">
      <AppNavbar user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10">{children}</main>
    </div>
  );
}
