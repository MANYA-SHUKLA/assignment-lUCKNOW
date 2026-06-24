"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { JobDashboard } from "@/components/JobDashboard";
import { useToast } from "@/components/ToastProvider";
import { configApi, sendApi } from "@/lib/api";
import type { SmtpConfig } from "@/lib/types";
export default function ComposePage() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [sending, setSending] = useState(false);

  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [delay, setDelay] = useState(20);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [htmlTemplateFile, setHtmlTemplateFile] = useState<File | null>(null);
  const [contactCount, setContactCount] = useState(0);
  const [contactPreview, setContactPreview] = useState<{ Email: string; FirstName?: string }[]>([]);

  const [useBatch, setUseBatch] = useState(false);
  const [batchSize, setBatchSize] = useState(20);
  const [batchDelay, setBatchDelay] = useState(60);
  const [emailDelay, setEmailDelay] = useState(45);

  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyBrowser, setNotifyBrowser] = useState(false);

  const [sendRange, setSendRange] = useState<"all" | "first" | "range">("all");
  const [firstN, setFirstN] = useState(10);
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(10);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await configApi.list();
        if (cancelled) return;
        const list = res.userConfigs ?? [];
        setConfigs(list);
        const def = list.find((c) => c.isDefault) ?? list[0];
        if (def) setSelectedConfigId(def.id);
      } catch {
        if (!cancelled) toast("error", "Failed to load SMTP configs");
      } finally {
        if (!cancelled) setLoadingConfigs(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  function getRange() {
    if (sendRange === "first") {
      const n = Math.min(firstN, contactCount);
      return { start: 0, count: n };
    }
    if (sendRange === "range") {
      const start = Math.max(0, rangeFrom - 1);
      const end = Math.min(rangeTo, contactCount);
      return { start, count: Math.max(0, end - start) };
    }
    return { start: 0, count: contactCount };
  }

  async function onExcelChange(file: File | null) {
    setExcelFile(file);
    if (!file) {
      setContactCount(0);
      setContactPreview([]);
      return;
    }
    try {
      const res = await sendApi.parseExcel(file);
      if (res.success) {
        setContactCount(res.totalCount ?? 0);
        setContactPreview(res.contacts ?? []);
      }
    } catch {
      toast("error", "Failed to parse Excel");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConfigId) {
      toast("error", "Select an SMTP configuration");
      return;
    }
    if (!excelFile) {
      toast("error", "Excel file is required");
      return;
    }
    if (!subject.trim()) {
      toast("error", "Subject is required");
      return;
    }
    if (!htmlContent.trim() && !htmlTemplateFile) {
      toast("error", "Email content or HTML template required");
      return;
    }

    const fd = new FormData();
    fd.append("configId", selectedConfigId);
    fd.append("subject", subject.trim());
    fd.append("htmlContent", htmlContent);
    fd.append("delay", String(delay));
    fd.append("excelFile", excelFile);
    if (htmlTemplateFile) fd.append("htmlTemplate", htmlTemplateFile);

    const range = getRange();
    fd.append("emailRangeStart", String(range.start));
    fd.append("emailRangeCount", String(range.count));

    if (useBatch) {
      fd.append("useBatch", "on");
      fd.append("batchSize", String(batchSize));
      fd.append("batchDelay", String(batchDelay));
      fd.append("emailDelay", String(emailDelay));
    }

    if (scheduleEmail) {
      if (!scheduledTime) {
        toast("error", "Select schedule date and time");
        return;
      }
      const local = new Date(scheduledTime);
      if (local <= new Date()) {
        toast("error", "Scheduled time must be in the future");
        return;
      }
      fd.append("scheduleEmail", "on");
      fd.append("scheduledTime", local.toISOString());
      if (notifyEmail) fd.append("notifyEmail", notifyEmail);
      if (notifyBrowser) fd.append("notifyBrowser", "on");
    }

    setSending(true);
    try {
      const res = await sendApi.send(fd);
      if (res.success) {
        toast("success", res.message ?? "Campaign started");
        if (notifyBrowser && "Notification" in window && Notification.permission === "granted") {
          new Notification("Email campaign", { body: res.message });
        }
      } else toast("error", res.message ?? "Send failed");
    } catch {
      toast("error", "Failed to send campaign");
    } finally {
      setSending(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  return (
    <>
      <JobDashboard />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3 font-semibold">SMTP configuration</div>
            <div className="p-4">
              {loadingConfigs ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : configs.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No configs. <Link href="/configs" className="text-indigo-600 underline">Add one</Link>
                </p>
              ) : (
                <div className="space-y-2">
                  {configs.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedConfigId(c.id)}
                      className={`w-full rounded-lg border p-3 text-left text-sm transition ${
                        selectedConfigId === c.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      <span className="font-semibold">{c.name}</span>
                      <span className="ml-2 text-slate-500">
                        {c.host}:{c.port}
                      </span>
                      {c.isDefault && (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                          Default
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-3 font-semibold">Campaign details</div>
            <div className="space-y-3 p-4">
              <div>
                <label htmlFor="subject" className="mb-1 block text-sm font-medium">
                  Subject
                </label>
                <input id="subject" className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="excel" className="mb-1 block text-sm font-medium">
                  Contacts (Excel)
                </label>
                <input
                  id="excel"
                  type="file"
                  className={inputClass}
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => onExcelChange(e.target.files?.[0] ?? null)}
                  required
                />
                {contactCount > 0 && (
                  <p className="mt-1 text-xs text-slate-500">{contactCount} contacts</p>
                )}
              </div>
              <div>
                <label htmlFor="sendRange" className="mb-1 block text-sm font-medium">
                  Send range
                </label>
                <select id="sendRange" className={inputClass} value={sendRange} onChange={(e) => setSendRange(e.target.value as typeof sendRange)}>
                  <option value="all">All contacts</option>
                  <option value="first">First N</option>
                  <option value="range">Row range</option>
                </select>
              </div>
              {sendRange === "first" && (
                <div>
                  <label htmlFor="firstN" className="mb-1 block text-sm font-medium">
                    First N
                  </label>
                  <input id="firstN" type="number" className={inputClass} value={firstN} onChange={(e) => setFirstN(Number(e.target.value))} min={1} />
                </div>
              )}
              {sendRange === "range" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="rangeFrom" className="mb-1 block text-sm font-medium">
                      From row
                    </label>
                    <input id="rangeFrom" type="number" className={inputClass} value={rangeFrom} onChange={(e) => setRangeFrom(Number(e.target.value))} min={1} />
                  </div>
                  <div>
                    <label htmlFor="rangeTo" className="mb-1 block text-sm font-medium">
                      To row
                    </label>
                    <input id="rangeTo" type="number" className={inputClass} value={rangeTo} onChange={(e) => setRangeTo(Number(e.target.value))} min={1} />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="delay" className="mb-1 block text-sm font-medium">
                  Delay (seconds)
                </label>
                <input id="delay" type="number" className={inputClass} value={delay} onChange={(e) => setDelay(Number(e.target.value))} min={1} />
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 font-semibold">Email content</div>
          <div className="p-4">
            <p className="mb-2 text-xs text-slate-500">
              Use {"{{FirstName}}"}, {"{{Company}}"} for personalization. HTML is supported.
            </p>
            <textarea
              className={`${inputClass} min-h-[200px] font-mono text-sm`}
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="<p>Hello {{FirstName}},</p>"
            />
            <div className="mt-3">
              <label htmlFor="htmlTemplate" className="mb-1 block text-sm font-medium">
                Or upload HTML template
              </label>
              <input
                id="htmlTemplate"
                type="file"
                className={inputClass}
                accept=".html,.htm"
                onChange={(e) => setHtmlTemplateFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {contactPreview.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-xs text-slate-500">
                {contactPreview.map((c) => (
                  <li key={c.Email}>
                    {c.Email}
                    {c.FirstName ? ` (${c.FirstName})` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="flex items-center gap-2 font-medium">
            <input type="checkbox" checked={useBatch} onChange={(e) => setUseBatch(e.target.checked)} />
            Batch processing
          </label>
          {useBatch && (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="batchSize" className="mb-1 block text-sm">Batch size</label>
                <input id="batchSize" type="number" className={inputClass} value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))} />
              </div>
              <div>
                <label htmlFor="batchDelay" className="mb-1 block text-sm">Batch delay (min)</label>
                <input id="batchDelay" type="number" className={inputClass} value={batchDelay} onChange={(e) => setBatchDelay(Number(e.target.value))} />
              </div>
              <div>
                <label htmlFor="emailDelay" className="mb-1 block text-sm">Email delay (sec)</label>
                <input id="emailDelay" type="number" className={inputClass} value={emailDelay} onChange={(e) => setEmailDelay(Number(e.target.value))} />
              </div>
            </div>
          )}

          <label className="mt-4 flex items-center gap-2 font-medium">
            <input type="checkbox" checked={scheduleEmail} onChange={(e) => setScheduleEmail(e.target.checked)} />
            Schedule for later
          </label>
          {scheduleEmail && (
            <div className="mt-3 space-y-3">
              <div>
                <label htmlFor="scheduled" className="mb-1 block text-sm">Date & time</label>
                <input id="scheduled" type="datetime-local" className={inputClass} value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
              </div>
              <div>
                <label htmlFor="notify" className="mb-1 block text-sm">Notification email</label>
                <input id="notify" type="email" className={inputClass} value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={notifyBrowser}
                  onChange={async (e) => {
                    setNotifyBrowser(e.target.checked);
                    if (e.target.checked && "Notification" in window) {
                      await Notification.requestPermission();
                    }
                  }}
                />
                Browser notification
              </label>
            </div>
          )}
        </section>

        <button
          type="submit"
          disabled={sending || !selectedConfigId}
          className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {sending ? "Processing…" : scheduleEmail ? "Schedule campaign" : "Send campaign"}
        </button>
      </form>
    </>
  );
}
