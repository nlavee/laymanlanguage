"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { ParetoDataPoint } from '@/api/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#111] border border-neutral-800 p-3 rounded-lg shadow-2xl text-sm">
                <p className="font-bold text-white mb-2 pb-2 border-b border-neutral-800">{data.name}</p>
                <div className="grid grid-cols-2 gap-4">
                    <p className="text-neutral-400 text-xs flex flex-col uppercase tracking-wider">Capab. <span className="text-white font-mono text-sm">{data.y}/100</span></p>
                    <p className="text-neutral-400 text-xs flex flex-col uppercase tracking-wider">Ease <span className="text-white font-mono text-sm">{data.x}/100</span></p>
                </div>
            </div>
        );
    }
    return null;
};

export default function ParetoFrontier({ data }: { data: ParetoDataPoint[] }) {
    return (
        <div className="h-[400px] w-full bg-[#0A0A0A] rounded-2xl p-4 border border-neutral-800 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 pl-4 uppercase tracking-wider text-[10px] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Pareto Frontier: Tradeoffs
            </h3>
            <ResponsiveContainer width="100%" height="85%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                       type="number" 
                       dataKey="x" 
                       name="Ease of Use" 
                       domain={[0, 100]} 
                       tick={{ fill: '#888', fontSize: 12 }} 
                       axisLine={{ stroke: '#444' }}
                       label={{ value: "Ease of Use / Cost Efficiency ➡", position: "bottom", fill: "#888", fontSize: 12, offset: 0 }}
                    />
                    <YAxis 
                       type="number" 
                       dataKey="y" 
                       name="Capability" 
                       domain={[0, 100]} 
                       tick={{ fill: '#888', fontSize: 12 }}
                       axisLine={{ stroke: '#444' }}
                       label={{ value: "Capability Score", angle: -90, position: "insideLeft", fill: "#888", fontSize: 12, offset: -5 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#555' }} />
                    <Scatter name="Models" data={data} fill="#fff">
                        {data.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#52525b"} /> // Highlight first as best (emerald vs zinc)
                        ))}
                        <LabelList dataKey="name" position="right" fill="#a3a3a3" fontSize={11} offset={10} />
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
