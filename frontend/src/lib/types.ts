export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SmtpConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  fromEmail: string;
  fromName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface EmailLog {
  id: string;
  email: string;
  status: "Sent" | "Failed" | "Error";
  message?: string;
  timestamp: string;
  subject?: string;
}

export interface ReportStats {
  total: number;
  sent: number;
  failed: number;
  errors: number;
}

export interface BatchJob {
  id: string;
  totalContacts: number;
  currentBatch: number;
  totalBatches: number;
  emailsSent: number;
  emailsFailed: number;
  status: "Running" | "Paused" | "Completed" | "Failed";
  startTime: string;
  nextBatchTime?: string;
}

export interface BatchStatus {
  isRunning: boolean;
  currentJob: BatchJob | null;
}

export interface ScheduledJob {
  id: string;
  scheduledTime: string;
  status: string;
  contactCount: number;
  subject: string;
  configName?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
  userConfigs?: SmtpConfig[];
  contacts?: { Email: string; FirstName?: string }[];
  totalCount?: number;
}
