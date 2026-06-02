"use client";

import { useEffect, useRef, useState } from "react";
import { dashboardApi } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import type { BatchStatus, ScheduledJob } from "@/lib/types";

export function JobDashboard() {
  const { toast } = useToast();
  const [visible, setVisible] = useState(false);
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const pollRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;

    const poll = async () => {
      try {
        const pollRes = await dashboardApi.pollStatus();
        const data = pollRes.data;
        if (!data || cancelled) return;

        setVisible(data.hasActiveBatch || data.hasScheduledJobs || data.pollNeeded);

        if (data.pollNeeded) {
          const [batchRes, dashRes, schedRes] = await Promise.all([
            dashboardApi.batchStatus(),
            dashboardApi.data(),
            dashboardApi.scheduledJobs(),
          ]);
          if (cancelled) return;
          setBatchStatus(batchRes.data ?? null);
          setScheduledJobs(dashRes.data?.scheduledJobs ?? schedRes.data ?? []);
        }

        const interval = data.pollInterval ?? 30000;
        timeoutId = window.setTimeout(() => {
          void poll();
        }, interval);
      } catch {
        if (!cancelled) {
          timeoutId = window.setTimeout(() => {
            void poll();
          }, 30000);
        }
      }
    };

    pollRef.current = poll;
    void poll();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  if (!visible) return null;

  const job = batchStatus?.currentJob;

  const rerun = () => {
    void pollRef.current();
  };

  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-800">
        📊 Active Jobs
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Batch jobs</h3>
          {batchStatus?.isRunning && job ? (
            <div className="rounded-lg border border-slate-200 p-3 text-sm">
              <p>
                <strong>{job.emailsSent}</strong> / {job.totalContacts} sent
              </p>
              <p className="text-slate-500">
                Batch {job.currentBatch} of {job.totalBatches} · {job.status}
              </p>
              <div className="mt-2 flex gap-2">
                {job.status === "Running" && (
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50"
                    onClick={async () => {
                      await dashboardApi.pauseBatch();
                      toast("success", "Batch paused");
                      rerun();
                    }}
                  >
                    Pause
                  </button>
                )}
                {job.status === "Paused" && (
                  <button
                    type="button"
                    className="rounded-lg bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                    onClick={async () => {
                      await dashboardApi.resumeBatch();
                      toast("success", "Batch resumed");
                      rerun();
                    }}
                  >
                    Resume
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                  onClick={async () => {
                    if (!confirm("Cancel batch job?")) return;
                    await dashboardApi.cancelBatch();
                    toast("info", "Batch cancelled");
                    rerun();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No active batch jobs</p>
          )}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Scheduled jobs</h3>
          {scheduledJobs.length ? (
            <ul className="space-y-2">
              {scheduledJobs.map((j) => (
                <li
                  key={j.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{j.subject || "Campaign"}</p>
                    <p className="text-slate-500">
                      {j.contactCount} contacts · {j.status}
                    </p>
                    <p className="text-slate-500">{new Date(j.scheduledTime).toLocaleString()}</p>
                  </div>
                  {j.status === "scheduled" && (
                    <button
                      type="button"
                      className="shrink-0 rounded-lg bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                      onClick={async () => {
                        if (!confirm("Cancel scheduled job?")) return;
                        const res = await dashboardApi.cancelScheduled(j.id);
                        toast(res.success ? "success" : "error", res.message ?? "Done");
                        rerun();
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No scheduled jobs</p>
          )}
        </div>
      </div>
    </section>
  );
}
