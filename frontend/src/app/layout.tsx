import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bulk Email Sender",
  description: "Secure bulk email management",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <ToastProvider>
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
