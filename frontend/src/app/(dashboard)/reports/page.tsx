"use client";

import { useCallback, useEffect, useState } from "react";
import { reportApi } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import type { EmailLog, ReportStats } from "@/lib/types";

const emptyStats: ReportStats = { total: 0, sent: 0, failed: 0, errors: 0 };

export default function ReportsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<ReportStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "Sent" | "Failed" | "Error">("all");

  const refresh = useCallback(async () => {
    try {
      const res = await reportApi.get();
      if (res.data) {
        setLogs(res.data.logs ?? []);
        setStats(res.data.stats ?? emptyStats);
      }
    } catch {
      toast("error", "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await reportApi.get();
        if (cancelled) return;
        if (res.data) {
          setLogs(res.data.logs ?? []);
          setStats(res.data.stats ?? emptyStats);
        }
      } catch {
        if (!cancelled) toast("error", "Failed to load report");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const id = setInterval(() => {
      void refresh();
    }, 10000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [refresh, toast]);

  const filtered = filter === "all" ? logs : logs.filter((l) => l.status === filter);

  function statusClass(status: string) {
    if (status === "Sent") return "text-emerald-700 font-semibold";
    if (status === "Failed") return "text-red-700 font-semibold";
    return "text-amber-700 font-semibold";
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-slate-800">Email reports</h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total", value: stats.total, border: "border-indigo-500" },
          { label: "Sent", value: stats.sent, border: "border-emerald-500" },
          { label: "Failed", value: stats.failed, border: "border-red-500" },
          { label: "Errors", value: stats.errors, border: "border-amber-500" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border-l-4 ${s.border} bg-white p-4 shadow-sm`}>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="Sent">Sent</option>
          <option value="Failed">Failed</option>
          <option value="Error">Error</option>
        </select>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-white"
          onClick={() => void refresh()}
        >
          Refresh
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-white"
          onClick={() => window.open(reportApi.exportUrl("csv"), "_blank")}
        >
          Export CSV
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-white"
          onClick={() => window.open(reportApi.exportUrl("json"), "_blank")}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
          onClick={async () => {
            if (!confirm("Clear all logs?")) return;
            const res = await reportApi.clear();
            if (res.success) {
              toast("success", "Logs cleared");
              void refresh();
            }
          }}
        >
          Clear logs
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-slate-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-slate-500">No log entries yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 font-semibold">Time</th>
                <th className="px-4 py-2 font-semibold">Email</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Subject</th>
                <th className="px-4 py-2 font-semibold">Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-2">{log.email}</td>
                  <td className={`px-4 py-2 ${statusClass(log.status)}`}>{log.status}</td>
                  <td className="px-4 py-2">{log.subject ?? "—"}</td>
                  <td className="max-w-xs truncate px-4 py-2 text-slate-500">{log.message ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
