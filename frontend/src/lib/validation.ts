import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const smtpConfigSchema = z.object({
  name: z.string().min(1, "Configuration name is required"),
  host: z.string().min(1, "SMTP host is required"),
  port: z.coerce.number().int().positive(),
  secure: z.boolean(),
  user: z.string().min(1, "Username is required"),
  pass: z.string().optional(),
  fromEmail: z.string().email("Valid from email required"),
  fromName: z.string().optional(),
  isDefault: z.boolean().optional(),
});
