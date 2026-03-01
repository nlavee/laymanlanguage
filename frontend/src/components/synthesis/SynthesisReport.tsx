"use client";

import { useQuery } from "@tanstack/react-query";
import { getSynthesis, TimelineEvent } from "@/api/client";
import { Loader2, Trophy, TrendingUp, Presentation, Download, Info, X, Lock } from "lucide-react";
import ParetoFrontier from "./ParetoFrontier";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function SynthesisReport({ workspaceId, query }: { workspaceId: string, query: string }) {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const { data: synthesis, isLoading, error } = useQuery({
        queryKey: ["synthesis", workspaceId],
        queryFn: () => getSynthesis(workspaceId),
        retry: 0,
        refetchOnWindowFocus: false,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl mt-8">
                <Loader2 size={32} className="animate-spin text-emerald-500 mb-4" />
                <p className="text-neutral-300 font-medium text-lg">Synthesizing Final Roadmap...</p>
                <p className="text-neutral-500 text-sm mt-2">Evaluating Search Data against your Persona parameters.</p>
            </div>
        );
    }

    if (error || !synthesis) {
        return (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 mt-8">
                Failed to generate the formal roadmap. Ensure API limits or models are correctly set.
                <pre className="mt-4 text-xs font-mono bg-black/50 p-4 rounded-xl overflow-auto text-red-300">
                    {JSON.stringify({ error: error?.message, hasSynthesis: !!synthesis, synthesis: synthesis }, null, 2)}
                </pre>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    return (
        <>
            <AnimatePresence>
                {isExportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#111] border border-neutral-800 p-8 rounded-2xl max-w-lg w-full relative shadow-2xl"
                        >
                            <button 
                                onClick={() => setIsExportModalOpen(false)}
                                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-blue-500/10 rounded-full text-blue-400">
                                    <Presentation size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Executive Slide Export</h3>
                            </div>
                            
                            <p className="text-neutral-300 mb-6 leading-relaxed">
                                Transform your AI research directly into a high-fidelity presentation. Our slide engine automatically reorganizes this report into a boardroom-ready format:
                            </p>
                            
                            <ul className="space-y-3 mb-8 text-sm text-neutral-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span><strong>Executive Summary First:</strong> High-level insights and key decision points are placed at the front for C-Suite alignment.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span><strong>Visual Pareto Charts:</strong> The complex model tradeoffs are rendered directly into visual charts for immediate understanding.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    <span><strong>Deep-Dive Appendices:</strong> All rigorous technical documentation is smartly paginated into appendix slides for engineering leads.</span>
                                </li>
                            </ul>
                            
                            <div className="bg-[#0A0A0A] border border-neutral-800 rounded-xl p-5 mb-6">
                                <h4 className="font-bold text-white flex items-center gap-2 mb-2 text-sm">
                                    <Lock size={16} className="text-yellow-500" /> Premium Feature
                                </h4>
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    Automated presentation generation via the Presenton engine requires an active enterprise subscription. 
                                </p>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <a 
                                    href="https://www.vuishere.com" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors"
                                >
                                    Contact vuishere.com to Upgrade
                                </a>
                                <button 
                                    onClick={() => setIsExportModalOpen(false)}
                                    className="w-full text-center bg-transparent border border-neutral-700 hover:border-neutral-500 text-neutral-300 py-2.5 rounded-lg transition-colors"
                                >
                                    Close Preview
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="mt-12 space-y-12 pb-32">
                
                {/* Executive Summary Section */}
                <motion.div variants={itemVariants} className="bg-[#111] border border-neutral-800 p-8 rounded-2xl relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Presentation className="text-blue-400" size={20} /> Executive Summary
                        </h2>
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="group flex items-center gap-2 bg-neutral-900/50 border border-neutral-800 text-neutral-500 px-4 py-2 rounded-lg font-medium transition-all hover:bg-neutral-800 hover:text-neutral-300"
                            title="Requires Premium Subscription"
                        >
                            <Lock size={14} className="text-neutral-600 group-hover:text-yellow-500 transition-colors" />
                            Export Slides (Premium)
                        </button>
                    </div>
                    <div className="mb-4 text-neutral-400 text-sm italic border-l-2 border-neutral-700 pl-4 py-1">
                        <span className="font-semibold text-neutral-300">Goal:</span> {query}
                    </div>
                    <p className="text-neutral-300 text-[17px] leading-relaxed">{synthesis.summary}</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ranking Section */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            <Trophy className="text-yellow-500" size={20} /> Stack Ranked Models
                        </h3>
                        
                        <div className="space-y-4">
                            {synthesis.ranked_models.map((model, i) => (
                                <div key={i} className={`p-6 rounded-xl border transition-all ${i === 0 ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-[#0A0A0A] border-neutral-800 text-white hover:border-neutral-600'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-black text-white' : 'bg-neutral-900 border border-neutral-700 text-neutral-300'}`}>
                                                #{i + 1}
                                            </div>
                                            <h4 className="font-bold text-lg">{model.model_name}</h4>
                                        </div>
                                    </div>
                                    <p className={`text-sm mb-5 leading-relaxed ${i === 0 ? 'text-neutral-800' : 'text-neutral-400'}`}>{model.rationale}</p>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className={`p-2 rounded flex-col flex items-center border ${i === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#111] border-neutral-800'}`}>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${i === 0 ? 'text-emerald-500/70' : 'text-neutral-500'}`}>Capab.</span>
                                            <span className={`font-mono font-bold ${i === 0 ? 'text-emerald-400' : 'text-emerald-500/80'}`}>{model.capabilities_score}</span>
                                        </div>
                                        <div className={`p-2 rounded flex-col flex items-center border ${i === 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-[#111] border-neutral-800'}`}>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${i === 0 ? 'text-blue-500/70' : 'text-neutral-500'}`}>Ease</span>
                                            <span className={`font-mono font-bold ${i === 0 ? 'text-blue-400' : 'text-blue-500/80'}`}>{model.ease_of_use_score}</span>
                                        </div>
                                        <div className={`p-2 rounded flex-col flex items-center border ${i === 0 ? 'bg-purple-500/10 border-purple-500/30' : 'bg-[#111] border-neutral-800'}`}>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${i === 0 ? 'text-purple-500/70' : 'text-neutral-500'}`}>Cost Eff.</span>
                                            <span className={`font-mono font-bold ${i === 0 ? 'text-purple-400' : 'text-purple-500/80'}`}>{model.cost_efficiency_score}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Pareto Frontier */}
                    <motion.div variants={itemVariants}>
                        <ParetoFrontier data={synthesis.pareto_data} />
                        <div className="mt-8 bg-[#0A0A0A] rounded-2xl p-6 border border-neutral-800 lg:sticky lg:top-8 shadow-lg">
                             <h3 className="text-lg font-bold flex items-center gap-2 text-white mb-6 uppercase tracking-wider text-xs">
                                 <TrendingUp className="text-purple-400" size={16} /> Historical R&D Context
                             </h3>
                             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-neutral-800">
                                 {synthesis.historical_timeline?.map((event: TimelineEvent, i: number) => (
                                     <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                         <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#0A0A0A] bg-purple-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                                         <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-[#111] p-4 rounded-xl border border-neutral-800 shadow-sm hover:border-purple-500/30 transition-colors">
                                             <div className="flex items-center justify-between space-x-2 mb-2">
                                                 <div className="font-bold text-white text-sm">{event.title}</div>
                                                 <time className="font-mono text-[10px] font-semibold text-purple-400/80 border border-purple-500/20 px-2 py-0.5 rounded uppercase tracking-wider bg-purple-500/5">{event.date}</time>
                                             </div>
                                             <div className="text-neutral-400 text-xs leading-relaxed">{event.description}</div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </motion.div>
                </div>

                {/* Implementation Timeline */}
                <motion.div variants={itemVariants} className="bg-[#0A0A0A] rounded-2xl p-6 border border-neutral-800 shadow-lg">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white mb-6 uppercase tracking-wider text-xs">
                        <TrendingUp className="text-blue-400" size={16} /> Implementation Projection
                    </h3>
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-neutral-800">
                        {synthesis.implementation_timeline?.map((event: TimelineEvent, i: number) => (
                            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-5 h-5 rounded-full border-4 border-[#0A0A0A] bg-blue-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_10px_rgba(59,130,246,0.4)]" />
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-[#111] p-4 rounded-xl border border-neutral-800 shadow-sm hover:border-blue-500/30 transition-colors">
                                    <div className="flex items-center justify-between space-x-2 mb-2">
                                        <div className="font-bold text-white text-sm">{event.title}</div>
                                        <time className="font-mono text-[10px] font-semibold text-blue-400/80 border border-blue-500/20 px-2 py-0.5 rounded uppercase tracking-wider bg-blue-500/5">{event.date}</time>
                                    </div>
                                    <div className="text-neutral-400 text-xs leading-relaxed">{event.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
                
            </motion.div>
        </>
    );
}
