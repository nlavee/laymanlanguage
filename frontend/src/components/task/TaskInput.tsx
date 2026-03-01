"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ingestTask, WorkspaceResponse } from "@/api/client";
import { Sparkles, ArrowRight, ShieldAlert } from "lucide-react";
import WorkspaceCanvas from "./WorkspaceCanvas";

export default function TaskInput({ onProfileReset }: { onProfileReset: () => void }) {
  const [query, setQuery] = useState("");
  const [modelId, setModelId] = useState("claude-sonnet-4-6");
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);

  const ingestMutation = useMutation({
    mutationFn: async (data: {q: string, m: string}) => {
      console.log("Submitting strategy generation for model:", data.m);
      return ingestTask(data.q, data.m);
    },
    onSuccess: (data) => {
      setWorkspace(data);
    },
    onError: (err) => {
      console.error("Mutation failed:", err);
      alert("Failed to analyze strategy. Check console.");
    }
  });

  if (workspace) {
    return <WorkspaceCanvas workspace={workspace} onReset={() => setWorkspace(null)} />;
  }

  return (
    <div className="max-w-3xl mx-auto mt-24 p-6 relative">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight mb-4 text-white">
            Architecture Strategy
        </h1>
        <p className="text-[17px] text-neutral-400 max-w-2xl mx-auto">
            Describe your objective. layman.ai will break it down into explicit technical domains and source state-of-the-art models suited for your environment.
        </p>
      </div>

      <div className="relative group max-w-2xl mx-auto">
          <div className="relative bg-[#0A0A0A] border border-neutral-800 rounded-xl p-2 flex flex-col shadow-[0_0_50px_rgba(255,255,255,0.02)] hover:border-neutral-700 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all duration-300">
              <textarea 
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 disabled={ingestMutation.isPending}
                 placeholder="e.g. Implement a distributed Redis cache on Kubernetes..."
                 className="w-full bg-transparent p-4 text-lg text-white placeholder-neutral-500 outline-none resize-none min-h-[140px]"
              />
              <div className="flex justify-between items-center p-2 border-t border-neutral-800/50 mt-2">
                  <div className="flex items-center gap-4">
                      <button onClick={onProfileReset} className="text-neutral-500 text-sm hover:text-white transition-colors">
                          Configure Persona
                      </button>
                      
                      {/* Research Model Selector */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 ml-1">
                            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Research Specialist</span>
                            <div className="group/tooltip relative">
                                <div className="cursor-help text-neutral-600 hover:text-neutral-400 transition-colors">
                                    <ShieldAlert size={10} />
                                </div>
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] text-neutral-400 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                                    This model handles the deep-dive domain research and synthesizes the final strategic report. Higher tier models provide better reasoning but may take longer.
                                </div>
                            </div>
                        </div>
                        <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1.5 hover:border-neutral-700 transition-colors">
                            <select 
                                value={modelId}
                                onChange={(e) => setModelId(e.target.value)}
                                className="bg-transparent text-xs text-neutral-300 outline-none cursor-pointer appearance-none pr-8 w-full"
                            >
                                <option value="claude-sonnet-4-6" className="bg-neutral-900 text-white">Claude 4.6 Sonnet (Premium)</option>
                                <option value="gemini-3-pro-preview" className="bg-neutral-900 text-white">Gemini 3 Pro (Balanced)</option>
                                <option value="gpt-5.2-2025-12-11" className="bg-neutral-900 text-white">GPT 5.2 (Latest)</option>
                            </select>
                            <div className="absolute right-2 pointer-events-none text-neutral-500 text-[10px] opacity-70">▼</div>
                        </div>
                      </div>
                  </div>
                  
                  <button 
                     disabled={!query.trim() || ingestMutation.isPending}
                     onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         console.log("Button clicked!", modelId);
                         ingestMutation.mutate({q: query, m: modelId});
                     }}
                     className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  >
                      {ingestMutation.isPending ? (
                          <>
                            <div className="w-3 h-3 border-2 border-t-black border-neutral-300 rounded-full animate-spin" />
                            Analyzing
                          </>
                      ) : (
                          <>
                            Generate Strategy <ArrowRight size={14} />
                          </>
                      )}
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
