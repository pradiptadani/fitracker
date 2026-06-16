import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FiTracker — Personal Finance Tracker",
  description: "A self-hosted personal finance tracker with double-entry bookkeeping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-950 text-white">
        {children}
      </body>
    </html>
  );
}
