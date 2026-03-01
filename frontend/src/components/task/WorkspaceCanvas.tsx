"use client";

import { useState, useEffect } from "react";
import { WorkspaceResponse, startOrchestration } from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Cpu, BookOpen, Trash2, ShieldAlert } from "lucide-react";
import LiveLogs, { LogEvent } from "@/components/orchestration/LiveLogs";
import SynthesisReport from "@/components/synthesis/SynthesisReport";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function WorkspaceCanvas({ workspace, onReset }: { workspace: WorkspaceResponse, onReset: () => void }) {
  const { token } = useAuth();
  const isAuthenticated = !!token;
  const router = useRouter();
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  // Lifted SSE State to prevent destruction on unmounts
  const [logEvents, setLogEvents] = useState<LogEvent[]>([]);
  const [logStatus, setLogStatus] = useState<"idle" | "running" | "done">("idle");
  
  const startMutation = useMutation({
    mutationFn: () => startOrchestration(workspace.workspace_id),
    onSuccess: () => {
        setIsOrchestrating(true);
        setLogStatus("running");
    },
    onError: (error) => {
        console.error("Failed to start orchestration:", error);
        alert("Failed to start orchestration. Please check the console for more details.");
    }
  });

  useEffect(() => {
      if (!isOrchestrating || isSynthesizing) return;
      
      const source = new EventSource(`http://127.0.0.1:8000/api/stream/${workspace.workspace_id}`);

      source.onmessage = (event) => {
          try {
              const data = JSON.parse(event.data);
              if (data.type === "DONE") {
                  setLogStatus("done");
                  source.close();
                  setTimeout(() => setIsSynthesizing(true), 2000);
              } else {
                  setLogEvents(prev => [...prev, data]);
              }
          } catch {
              // Ignore empty payloads
          }
      };

      source.onerror = () => {
          source.close();
          setLogStatus("done");
      };

      return () => source.close();
  }, [isOrchestrating, isSynthesizing, workspace.workspace_id]);

  // Unified return to prevent React from unmounting LiveLogs and destroying SSE State
  return (
    <div className="max-w-6xl mx-auto p-8 mt-8 pb-32">
       
       {/* ---------------- RESEARCH OUTCOME STATE ---------------- */}
       <div className={!isSynthesizing ? "hidden" : "block space-y-8"}>
           <div className="flex justify-between items-center">
               <h2 className="text-3xl font-bold flex items-center gap-3">Research Outcome</h2>
               <button onClick={onReset} className="text-neutral-500 hover:text-white transition-colors text-sm">Start Over</button>
           </div>
           <SynthesisReport workspaceId={workspace.workspace_id} query={workspace.query} />
       </div>

       {/* ---------------- RESEARCH FRAMEWORK STATE ---------------- */}
       <div className={isSynthesizing ? "hidden" : "block"}>
           <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-6">
               <div>
                   <h2 className="text-3xl font-bold flex items-center gap-3">
                       <LayoutGrid className="text-blue-500" /> Research Framework
                   </h2>
                   <p className="text-neutral-400 mt-2 text-[15px]">Based on your persona, layman.vuishere.com will investigate the following technical domains.</p>
               </div>
               
               <button 
                  onClick={onReset}
                  className="px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-lg text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
               >
                  New Query
               </button>
           </div>
       
       <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-6 mb-12 relative overflow-hidden text-center shadow-[0_0_40px_rgba(255,255,255,0.02)]">
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />
           <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">Original Objective</p>
           <h3 className="text-2xl font-serif text-white">&quot;{workspace.query}&quot;</h3>
           <div className="h-10 w-px bg-gradient-to-b from-neutral-700 to-transparent mx-auto mt-6 -mb-12" />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {workspace.domains.map((domain, i) => (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 key={domain.id} 
                 className={`bg-[#0A0A0A] border rounded-xl p-6 relative group transition-all duration-300 shadow-xl ${isOrchestrating ? "opacity-40 grayscale pointer-events-none border-neutral-800" : "border-neutral-800 hover:border-blue-500/50 hover:bg-[#111] hover:shadow-[0_0_30px_rgba(59,130,246,0.05)]"}`}
               >
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                       <button className="text-neutral-500 hover:text-red-400 p-1 transition-colors">
                           <Trash2 size={16} />
                       </button>
                   </div>
                   <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shadow-sm">
                       <Cpu size={18} />
                   </div>
                   <h3 className="text-lg font-bold text-white mb-2">{domain.name}</h3>
                   <p className="text-sm text-neutral-400 leading-relaxed mb-6">{domain.description}</p>
                   
                   <div className="relative">
                       <div className={`space-y-4 ${!isAuthenticated ? "blur-md select-none opacity-40 pointer-events-none" : ""}`}>
                           <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80 flex items-center gap-2">
                               <BookOpen size={12} className="text-emerald-500" /> Key Inquiries
                           </h4>
                           {domain.search_queries.map((q, j) => (
                               <div key={j} className="bg-neutral-950 p-3 rounded-lg border border-neutral-800/80 text-xs">
                                   <div className="text-neutral-300 font-medium mb-1 leading-snug">{q.query}</div>
                                   <div className="text-neutral-500">{q.rationale}</div>
                               </div>
                           ))}
                           <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-500/80 flex items-center gap-2 mt-5 pt-4 border-t border-neutral-800/50">
                               <ShieldAlert size={12} className="text-orange-500" /> Core Assumptions
                           </h4>
                           <ul className="list-disc pl-5 text-xs text-neutral-400 space-y-1.5 marker:text-neutral-700">
                               {domain.assumptions?.map((a, j) => <li key={j}>{a}</li>) || <li>None</li>}
                           </ul>
                           
                           <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-500/80 flex items-center gap-2 mt-5 pt-4 border-t border-neutral-800/50">
                               <Cpu size={12} className="text-purple-500" /> Targeted Models
                           </h4>
                           <div className="flex flex-wrap gap-2">
                               {domain.target_models?.map((m, j) => (
                                   <span key={j} className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded font-mono border border-purple-500/20 shadow-sm">{m}</span>
                               )) || <span className="text-[10px] text-neutral-600">None explicitly stated</span>}
                           </div>
                       </div>

                       {!isAuthenticated && (
                           <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                               <ShieldAlert size={20} className="text-blue-500 mb-2 opacity-80" />
                               <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">Gated Content</p>
                               <p className="text-[9px] text-neutral-500 max-w-[140px]">Sign in to unlock explicit research paths</p>
                           </div>
                       )}
                   </div>
               </motion.div>
           ))}
       </div>

           {/* ---------------- PERSISTENT ORCHESTRATOR LOGS ---------------- */}
           {isSynthesizing ? (
               <div className="mt-12 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                    <details className="group">
                        <summary className="p-4 cursor-pointer font-bold text-neutral-300 hover:text-white hover:bg-neutral-800/50 flex justify-between items-center list-none ui-not-collapsed:border-b border-neutral-800 transition-colors">
                            <span className="flex items-center gap-3">
                                <Cpu size={18} className="text-purple-400" />
                                Research Activity: {workspace.orchestrator_model} → {workspace.synthesis_model}
                            </span>
                            <span className="text-neutral-500 text-xs">Click to expand</span>
                        </summary>
                        <div className="p-4 bg-neutral-950">
                            <LiveLogs events={logEvents} status={logStatus} />
                        </div>
                    </details>
               </div>
           ) : (
               <div className="mt-12">
                   <AnimatePresence mode="wait">
                       {!isOrchestrating ? (
                           <motion.div 
                             key="start-btn" 
                             initial={{ opacity: 0 }} 
                             animate={{ opacity: 1 }} 
                             exit={{ opacity: 0 }} 
                             className="flex justify-end"
                           >
                               {!isAuthenticated ? (
                                   <button 
                                     onClick={() => router.push("/login")}
                                     className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                                   >
                                       Sign in to Begin Orchestration →
                                   </button>
                               ) : (
                                   <button 
                                     onClick={() => startMutation.mutate()}
                                     disabled={startMutation.isPending}
                                     className="bg-white text-black px-6 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-white/5 hover:bg-neutral-200 transition-colors w-full md:w-auto flex items-center justify-center gap-2"
                                   >
                                       {startMutation.isPending ? "Initializing Engine..." : "Begin Orchestration →"}
                                   </button>
                               )}
                           </motion.div>
                       ) : (
                           <motion.div 
                             key="live-logs" 
                             initial={{ opacity: 0, y: 50 }} 
                             animate={{ opacity: 1, y: 0 }}
                           >
                               <h3 className="text-2xl font-bold mb-2 text-white flex gap-3 items-center">
                                   Orchestration Execution
                               </h3>
                                <p className="text-neutral-400 text-sm mb-6 font-mono">
                                    Orchestration: {workspace.orchestrator_model} | Targeting: {workspace.synthesis_model}
                                </p>
                               <LiveLogs events={logEvents} status={logStatus} />
                           </motion.div>
                       )}
                   </AnimatePresence>
               </div>
           )}
       </div>
    </div>
  );
}
