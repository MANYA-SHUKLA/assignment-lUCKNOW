"use client";

import { useEffect, useState } from "react";
import { configApi, sendApi } from "@/lib/api";
import { smtpConfigSchema } from "@/lib/validation";
import { useToast } from "@/components/ToastProvider";
import type { SmtpConfig } from "@/lib/types";

export default function ConfigsPage() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const [name, setName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState(587);
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

  async function load() {
    setLoading(true);
    try {
      const res = await configApi.list();
      setConfigs(res.userConfigs ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await configApi.list();
        if (!cancelled) setConfigs(res.userConfigs ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setName("");
    setHost("");
    setPort(587);
    setSecure(false);
    setUser("");
    setPass("");
    setFromEmail("");
    setFromName("");
    setIsDefault(false);
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(c: SmtpConfig) {
    setEditingId(c.id);
    setName(c.name);
    setHost(c.host);
    setPort(c.port);
    setSecure(c.secure);
    setUser(c.user);
    setPass("");
    setFromEmail(c.fromEmail);
    setFromName(c.fromName);
    setIsDefault(c.isDefault);
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const parsed = smtpConfigSchema.safeParse({
      name,
      host,
      port,
      secure,
      user,
      pass: pass || undefined,
      fromEmail,
      fromName,
      isDefault,
    });
    if (!parsed.success) {
      toast("error", parsed.error.issues[0]?.message ?? "Invalid form");
      return;
    }
    if (!editingId && !pass) {
      toast("error", "Password is required");
      return;
    }

    const body: Record<string, unknown> = {
      name: parsed.data.name,
      host: parsed.data.host,
      port: parsed.data.port,
      secure: parsed.data.secure,
      user: parsed.data.user,
      fromEmail: parsed.data.fromEmail,
      fromName: parsed.data.fromName ?? "",
      isDefault: parsed.data.isDefault ?? false,
    };
    if (pass) body.pass = pass;

    try {
      const res = editingId
        ? await configApi.update(editingId, body)
        : await configApi.create(body);
      if (res.success) {
        toast("success", res.message ?? "Saved");
        resetForm();
        await load();
      } else toast("error", res.message ?? "Save failed");
    } catch {
      toast("error", "Failed to save");
    }
  }

  async function testConnection() {
    if (!host || !user || !pass) {
      toast("error", "Host, user, and password required");
      return;
    }
    setTesting(true);
    try {
      const res = await configApi.test({ host, port, secure, user, pass });
      toast(res.success ? "success" : "error", res.message ?? "Done");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">SMTP configurations</h1>
        <button
          type="button"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Add configuration
        </button>
      </div>

      {showForm && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 font-semibold">
            {editingId ? "Edit" : "New"} configuration
          </div>
          <form onSubmit={save} className="space-y-3 p-4">
            <div>
              <label htmlFor="cfg-name" className="mb-1 block text-sm font-medium">Name</label>
              <input id="cfg-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="cfg-host" className="mb-1 block text-sm font-medium">SMTP host</label>
                <input id="cfg-host" className={inputClass} value={host} onChange={(e) => setHost(e.target.value)} placeholder="smtp.gmail.com" required />
              </div>
              <div>
                <label htmlFor="cfg-port" className="mb-1 block text-sm font-medium">Port</label>
                <input id="cfg-port" type="number" className={inputClass} value={port} onChange={(e) => setPort(Number(e.target.value))} required />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={secure} onChange={(e) => setSecure(e.target.checked)} />
              Use TLS/SSL
            </label>
            <div>
              <label htmlFor="cfg-user" className="mb-1 block text-sm font-medium">Username</label>
              <input id="cfg-user" className={inputClass} value={user} onChange={(e) => setUser(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="cfg-pass" className="mb-1 block text-sm font-medium">
                Password {editingId ? "(leave blank to keep)" : ""}
              </label>
              <input id="cfg-pass" type="password" className={inputClass} value={pass} onChange={(e) => setPass(e.target.value)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="cfg-from" className="mb-1 block text-sm font-medium">From email</label>
                <input id="cfg-from" type="email" className={inputClass} value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="cfg-from-name" className="mb-1 block text-sm font-medium">From name</label>
                <input id="cfg-from-name" className={inputClass} value={fromName} onChange={(e) => setFromName(e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              Set as default
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Save
              </button>
              <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50" onClick={testConnection} disabled={testing}>
                Test connection
              </button>
              <button type="button" className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 font-semibold">Your configurations</div>
        <div className="p-4">
          {loading ? (
            <p className="text-slate-500">Loading…</p>
          ) : configs.length === 0 ? (
            <p className="text-slate-500">No configurations yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-2 font-semibold">Name</th>
                    <th className="pb-2 font-semibold">Host</th>
                    <th className="pb-2 font-semibold">From</th>
                    <th className="pb-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((c) => (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="py-2">
                        {c.name}
                        {c.isDefault && (
                          <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">Default</span>
                        )}
                      </td>
                      <td className="py-2">{c.host}:{c.port}</td>
                      <td className="py-2">{c.fromEmail}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          <button type="button" className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-50" onClick={() => startEdit(c)}>
                            Edit
                          </button>
                          {!c.isDefault && (
                            <button
                              type="button"
                              className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-50"
                              onClick={async () => {
                                const res = await configApi.setDefault(c.id);
                                if (res.success) {
                                  toast("success", "Default updated");
                                  load();
                                }
                              }}
                            >
                              Set default
                            </button>
                          )}
                          <button
                            type="button"
                            className="rounded bg-red-600 px-2 py-0.5 text-xs text-white hover:bg-red-700"
                            onClick={async () => {
                              if (!confirm("Delete configuration?")) return;
                              const res = await configApi.delete(c.id);
                              if (res.success) {
                                toast("success", "Deleted");
                                load();
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button
            type="button"
            className="mt-4 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={async () => {
              const email = prompt("Email for test notification:");
              if (!email) return;
              const res = await sendApi.testNotification(email);
              toast(res.success ? "success" : "error", res.message ?? "Done");
            }}
          >
            Test notification email
          </button>
        </div>
      </section>
    </div>
  );
}
