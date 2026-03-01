"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, resetProfile } from "@/api/client";
import TaskInput from "@/components/task/TaskInput";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useAuth } from "@/providers/auth-provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { token, user, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { isLoading: isProfileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchProfile,
    enabled: !!token,
  });

  const resetMutation = useMutation({
    mutationFn: resetProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });

  if (isAuthLoading || (token && isProfileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-8 h-8 rounded-full border-2 border-t-emerald-500 border-neutral-800 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] selection:bg-neutral-800 text-neutral-50 flex flex-col font-sans">

      {/* Top Header */}
      <header className="w-full border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white font-[family-name:var(--font-outfit)]">layman.ai</span>
            <span className="text-[10px] font-mono text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 mt-1 uppercase tracking-widest font-[family-name:var(--font-geist-mono)]">alpha</span>
          </div>
          <div className="flex items-center gap-4">
            {token && user && (
              <>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-medium">Authenticated</span>
                  <span className="text-sm text-neutral-300 font-medium">Welcome back, <span className="text-white font-semibold">{user}</span></span>
                </div>
                <button
                  onClick={() => router.push("/profile")}
                  className="px-4 py-2 border border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900 text-neutral-300 hover:text-white text-sm font-medium rounded-lg transition-all"
                >
                  My Profile
                </button>
              </>
            )}

            {token ? (
              <button
                onClick={() => logout()}
                className="px-4 py-2 border border-neutral-800 hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400 text-sm font-medium rounded-lg transition-all"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Centered Main Content */}
      <div className="flex-1 w-full max-w-[1200px] mx-auto relative z-10 px-4 pt-12 pb-24 flex flex-col">
        <ErrorBoundary>
          <TaskInput onProfileReset={() => resetMutation.mutate()} />
        </ErrorBoundary>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-800/50 bg-[#0A0A0A] py-8 text-neutral-400 mt-auto">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex gap-2 items-center">
            <span className="font-bold tracking-tight text-white font-[family-name:var(--font-outfit)]">layman.ai</span>
            <span className="text-[10px] font-mono text-neutral-500 font-[family-name:var(--font-geist-mono)]">(alpha)</span>
            <span className="ml-2 text-neutral-600">— Enterprise Architecture Intelligence</span>
          </div>
          <div className="flex items-center gap-6">
            {token && (
              <button
                onClick={() => router.push("/profile")}
                className="text-neutral-500 hover:text-white text-xs font-medium uppercase tracking-wider transition-colors"
              >
                My Profile
              </button>
            )}
            <button
              onClick={() => logout()}
              className="text-neutral-500 hover:text-red-400 text-xs font-medium uppercase tracking-wider transition-colors"
            >
              Sign Out
            </button>
            <span>Built by <strong className="text-white">nlavee</strong></span>
            <a
              href="https://www.vuishere.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 border border-neutral-700 hover:border-neutral-500 hover:text-white rounded-md transition-colors"
            >
              Visit Website
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
