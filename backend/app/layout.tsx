import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";

export const metadata: Metadata = {
  title: "Finesskin",
  description: "AI-powered skincare analysis and routine management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#F8FAFC] text-slate-900">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute right-[-7rem] top-24 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />
          <div className="absolute bottom-[-10rem] left-1/3 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
        </div>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
