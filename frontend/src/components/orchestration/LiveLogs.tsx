"use client";

import { useEffect, useRef } from "react";
import { Terminal, CheckCircle2, Loader2 } from "lucide-react";

export interface LogEvent {
    timestamp: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
}

export default function LiveLogs({ events, status }: { events: LogEvent[], status: "idle" | "running" | "done" }) {
    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of terminal
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [events]);

    return (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden h-[450px] flex flex-col font-mono text-sm shadow-2xl">
            <div className="bg-neutral-900 border-b border-neutral-800 p-3 flex justify-between items-center text-neutral-400">
                <div className="flex gap-2 items-center text-white">
                    <Terminal size={14} /> 
                    <span className="font-semibold text-[10px] tracking-wider uppercase">Live Orchestration Stream</span>
                </div>
                {status === "running" && <Loader2 size={14} className="animate-spin text-neutral-400" />}
                {status === "done" && <CheckCircle2 size={14} className="text-white" />}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {events.map((ev, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-neutral-500 text-[10px] tracking-wider">
                            <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border
                                ${ev.type === 'error' ? 'bg-[#222] text-white border-neutral-600' : 
                                  ev.type === 'tool_call' ? 'bg-[#111] text-neutral-300 border-neutral-800' :
                                  ev.type === 'tool_result' ? 'bg-white text-black border-white' :
                                  ev.type === 'status' ? 'bg-[#111] text-white border-neutral-700' :
                                  'bg-[#0A0A0A] text-neutral-500 border-neutral-900'
                                }`}
                            >{ev.type}</span>
                        </div>
                        <div className="text-neutral-300 break-words leading-relaxed pl-2 border-l-2 border-neutral-800">
                            {ev.payload?.message || JSON.stringify(ev.payload)}
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
}
