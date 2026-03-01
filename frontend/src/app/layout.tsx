import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "layman.vuishere.com (alpha) | Enterprise LLM Strategy",
  description: "AI architecture recommendations translated for the C-Suite.",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased min-h-screen bg-neutral-950 text-neutral-50`}
      >
        <QueryProvider>
          <AuthProvider>
            {children}
            {/* Global Demo Tag */}
            <div className="fixed bottom-6 left-6 bg-[#111] text-neutral-400 border border-neutral-800 shadow-xl px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest z-50 pointer-events-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse" />
              Live Demo
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
