import { api, exportUrl } from "./client";
import type {
  ApiResponse,
  BatchStatus,
  EmailLog,
  ReportStats,
  ScheduledJob,
  SmtpConfig,
  User,
} from "@/lib/types";

export const authApi = {
  me: () => api<ApiResponse & { user: User }>("/auth/me"),
  login: (email: string, password: string) =>
    api<ApiResponse & { user: User }>("/auth/login", {
      method: "POST",
      json: { email, password },
    }),
  register: (name: string, email: string, password: string) =>
    api<ApiResponse & { user: User }>("/auth/register", {
      method: "POST",
      json: { name, email, password },
    }),
  logout: () => api<ApiResponse>("/auth/logout", { method: "POST" }),
};

export const configApi = {
  list: () =>
    api<ApiResponse & { userConfigs: SmtpConfig[] }>("/config/smtp"),
  create: (body: Record<string, unknown>) =>
    api<ApiResponse>("/config/smtp", { method: "POST", json: body }),
  update: (id: string, body: Record<string, unknown>) =>
    api<ApiResponse>(`/config/smtp/${id}`, { method: "PUT", json: body }),
  delete: (id: string) =>
    api<ApiResponse>(`/config/smtp/${id}`, { method: "DELETE" }),
  setDefault: (id: string) =>
    api<ApiResponse>(`/config/smtp/${id}/default`, { method: "POST" }),
  test: (body: Record<string, unknown>) =>
    api<ApiResponse>("/config/smtp/test", { method: "POST", json: body }),
};

export const sendApi = {
  send: (formData: FormData) =>
    api<ApiResponse & { contactCount?: number; jobId?: string; scheduledMode?: boolean; batchMode?: boolean; scheduledTime?: string }>(
      "/send",
      { method: "POST", body: formData },
    ),
  parseExcel: (file: File) => {
    const fd = new FormData();
    fd.append("excelFile", file);
    return api<ApiResponse & { contacts: { Email: string; FirstName?: string }[]; totalCount: number }>(
      "/parse-excel",
      { method: "POST", body: fd },
    );
  },
  testNotification: (testEmail: string) =>
    api<ApiResponse>("/test-notification", { method: "POST", json: { testEmail } }),
};

export const reportApi = {
  get: () =>
    api<ApiResponse & { data: { logs: EmailLog[]; stats: ReportStats } }>("/report"),
  clear: () => api<ApiResponse>("/report/clear", { method: "DELETE" }),
  exportUrl: (format: "csv" | "json") => exportUrl(`/report/export/${format}`),
};

export const dashboardApi = {
  pollStatus: () =>
    api<
      ApiResponse & {
        data: {
          pollNeeded: boolean;
          pollInterval: number;
          hasActiveBatch: boolean;
          hasScheduledJobs: boolean;
        };
      }
    >("/dashboard/poll-status"),
  data: () =>
    api<
      ApiResponse & {
        data: { batch: BatchStatus | null; scheduledJobs: ScheduledJob[] };
      }
    >("/dashboard/data"),
  batchStatus: () => api<ApiResponse & { data: BatchStatus }>("/batch-status"),
  scheduledJobs: () =>
    api<ApiResponse & { data: ScheduledJob[] }>("/scheduled-jobs"),
  cancelScheduled: (id: string) =>
    api<ApiResponse>(`/scheduled-jobs/${id}`, { method: "DELETE" }),
  pauseBatch: () => api<ApiResponse>("/batch-pause", { method: "POST" }),
  resumeBatch: () => api<ApiResponse>("/batch-resume", { method: "POST" }),
  cancelBatch: () => api<ApiResponse>("/batch-cancel", { method: "DELETE" }),
};
