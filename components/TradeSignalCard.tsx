
import React from 'react';
import { TradeSignal } from '../types';

interface TradeSignalCardProps {
    signal: TradeSignal;
    onExecute: () => void;
}

export const TradeSignalCard: React.FC<TradeSignalCardProps> = ({ signal, onExecute }) => {
    const isLong = signal.action.includes('COMPRAR') || signal.action.includes('LONG');
    const probability = signal.probability || 80; // Default fallback
    const isUltraHigh = probability >= 90;
    
    // Calculate Percentages
    const entry = signal.entryPrice;
    const target = signal.targetPrice;
    const stop = signal.stopLoss;
    
    const potentialGain = Math.abs(((target - entry) / entry) * 100);
    const potentialLoss = Math.abs(((entry - stop) / entry) * 100);
    
    // Risk/Reward Ratio (Reward / Risk)
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    const ratio = risk > 0 ? (reward / risk).toFixed(2) : 'N/A';

    return (
        <div className={`
            relative overflow-hidden rounded-xl my-6 max-w-md transition-all duration-300 group
            ${isUltraHigh 
                ? 'bg-slate-900 border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' 
                : 'bg-slate-900/80 border border-slate-700 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:border-cyan-500/50'}
        `}>
            {/* Probability Badge */}
            <div className="absolute top-0 right-0 p-3 z-10">
                <div className={`
                    flex flex-col items-center justify-center w-14 h-14 rounded-full border-4 font-bold shadow-lg bg-slate-900
                    ${isUltraHigh ? 'border-yellow-500 text-yellow-400' : 'border-cyan-500 text-cyan-400'}
                `}>
                    <span className="text-sm leading-none">{probability}%</span>
                    <span className="text-[8px] uppercase">Prob</span>
                </div>
            </div>

            {/* Top Border Glow */}
            <div className={`absolute top-0 left-0 w-full h-1 ${isLong ? 'bg-gradient-to-r from-green-500 to-green-300' : 'bg-gradient-to-r from-red-500 to-red-300'}`}></div>

            {/* Header */}
            <div className={`p-5 flex justify-between items-start ${isUltraHigh ? 'bg-yellow-900/10' : 'bg-slate-800/40'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner ${isLong ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                        {isLong ? '🚀' : '📉'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-xl text-white tracking-tight">{signal.symbol}</h3>
                            {isUltraHigh && <span className="text-[10px] bg-yellow-500 text-black font-bold px-1.5 rounded animate-pulse">GEM 💎</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isLong ? 'bg-green-900/60 text-green-300 border border-green-700/50' : 'bg-red-900/60 text-red-300 border border-red-700/50'}`}>
                                {isLong ? 'LONG' : 'SHORT'}
                            </span>
                            <span className="text-[10px] font-mono text-yellow-400 bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-700/30">
                                {signal.leverage}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Visualization */}
            <div className="px-5 py-4 space-y-5">
                
                <div className="flex justify-between items-end font-mono">
                    <div className="text-center">
                        <span className="text-[10px] text-slate-500 block mb-1">ENTRADA</span>
                        <span className="text-white font-bold text-lg bg-slate-800 px-2 py-1 rounded border border-slate-700">${entry}</span>
                    </div>
                    <div className="mb-2 text-slate-600">➔</div>
                    <div className="text-center">
                        <span className="text-[10px] text-slate-500 block mb-1">META</span>
                        <span className={`font-bold text-lg px-2 py-1 rounded border ${isLong ? 'text-green-400 bg-green-900/20 border-green-800' : 'text-red-400 bg-red-900/20 border-red-800'}`}>
                            ${target}
                        </span>
                    </div>
                </div>

                {/* Risk Bar */}
                <div className="relative pt-4">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Stop Loss: <span className="text-red-400 font-mono">${stop}</span></span>
                        <span>Riesgo/Beneficio: <span className="text-cyan-400 font-mono">1:{ratio}</span></span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-red-500/50" style={{ width: '30%' }}></div>
                        <div className="h-full bg-slate-600" style={{ width: '2%' }}></div> {/* Entry marker */}
                        <div className="h-full bg-green-500/50" style={{ width: '68%' }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] mt-1 font-medium">
                        <span className="text-red-400">-{potentialLoss.toFixed(2)}%</span>
                        <span className="text-green-400">+{potentialGain.toFixed(2)}%</span>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-400">Monto Sugerido:</span>
                        <span className="text-sm font-bold text-white">{signal.recommendedAmount}</span>
                     </div>
                     <p className="text-xs text-slate-400 italic border-t border-slate-700/50 pt-2 mt-2">
                        "{signal.reason}"
                     </p>
                </div>

                <button 
                    onClick={onExecute}
                    className={`
                        w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-[0.98] 
                        ${isLong 
                            ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 shadow-green-900/20' 
                            : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-red-900/20'}
                        ${isUltraHigh ? 'animate-pulse' : ''}
                    `}
                >
                    ⚡ EJECUTAR ORDEN
                </button>
            </div>
        </div>
    );
};
