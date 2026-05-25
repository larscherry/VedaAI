import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "VedaAI - Assessment Creator",
  description: "AI-powered assessment creation platform",
  icons: {
    icon: "/veda.png",
    apple: "/veda.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
