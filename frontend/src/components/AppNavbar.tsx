"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import type { User } from "@/lib/types";

const links = [
  { href: "/compose", label: "Compose" },
  { href: "/reports", label: "Reports" },
  { href: "/configs", label: "SMTP Configs" },
];

export function AppNavbar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await authApi.logout();
    router.push("/login");
  }

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
        <Link href="/compose" className="text-lg font-bold text-white no-underline">
          📧 Bulk Email Sender
        </Link>
        <nav className="flex flex-1 gap-1" aria-label="Main">
          {links.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold no-underline transition ${
                  active ? "bg-white/20 text-white" : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="font-semibold">{user.name}</span>
          <span className="hidden text-white/80 sm:inline">{user.email}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
