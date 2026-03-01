"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProfile, resetProfile } from "@/api/client";
import OnboardingFlow from "@/components/profile/OnboardingFlow";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { token, user, logout, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthLoading && !token) {
      router.push("/login");
    }
  }, [token, isAuthLoading, router]);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
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

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-emerald-500 border-neutral-800 animate-spin" />
      </div>
    );
  }

  const hasProfile =
    profile &&
    profile.metadata?.traits &&
    Object.keys(profile.metadata.traits).length > 0;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-neutral-50 flex flex-col font-sans">
      {/* Header */}
      <header className="w-full border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xl font-bold tracking-tight text-white font-[family-name:var(--font-outfit)]">layman.vuishere.com</span>
              <span className="text-[10px] font-mono text-neutral-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/10 mt-1 uppercase tracking-widest font-[family-name:var(--font-geist-mono)]">alpha</span>
            </Link>
            <span className="text-neutral-700">/</span>
            <span className="text-sm text-neutral-400 font-medium">Technical Persona</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              ← Back to Search
            </Link>
            {token && user && (
              <button
                onClick={() => logout()}
                className="px-4 py-2 border border-neutral-800 hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400 text-sm font-medium rounded-lg transition-all"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 pt-8 pb-24 flex flex-col">
        {hasProfile ? (
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Your Technical Persona</h1>
            <p className="text-neutral-400 mb-8">Your background is configured. You can reset it to retake the onboarding.</p>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-left mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-4">Current Profile Traits</h2>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(profile!.metadata.traits).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center border-b border-neutral-800/50 pb-3">
                    <span className="text-neutral-400 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-white font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            >
              {resetMutation.isPending ? "Resetting..." : "Reset & Retake Persona Survey"}
            </button>
          </div>
        ) : (
          <OnboardingFlow />
        )}
      </div>
    </main>
  );
}
