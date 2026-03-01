"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiClient } from "@/api/client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      console.log("LoginPage: Attempting login for", username);
      const res = await apiClient.post("/api/auth/login", { username, password });
      console.log("LoginPage: Login successful, token received");
      login(res.data.access_token, username);
    } catch (err: any) {
      console.error("LoginPage: Login failed", err.response?.data || err.message);
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">layman.vuishere.com</h1>
          <p className="text-neutral-500">Sign in to access Enterprise LLM Strategy</p>
        </div>

        <div className="bg-[#0A0A0A] border border-neutral-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-500 hover:text-blue-400 font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
