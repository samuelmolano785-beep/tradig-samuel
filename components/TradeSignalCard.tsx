
import React from 'react';
import { TradeSignal } from '../types';

interface TradeSignalCardProps {
    signal: TradeSignal;
    onExecute: () => void;
}

export const TradeSignalCard: React.FC<TradeSignalCardProps> = ({ signal, onExecute }) => {
    const isLong = signal.action.includes('COMPRAR');
    const potentialGain = Math.abs(((signal.targetPrice - signal.entryPrice) / signal.entryPrice) * 100).toFixed(2);
    
    return (
        <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-0 overflow-hidden shadow-xl my-4 max-w-md">
            {/* Header */}
            <div className={`p-4 flex justify-between items-center ${isLong ? 'bg-green-900/30 border-b border-green-800/50' : 'bg-red-900/30 border-b border-red-800/50'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isLong ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {isLong ? 'L' : 'S'}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">{signal.symbol}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isLong ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                            {signal.action}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-400">Apalancamiento</div>
                    <div className="font-mono font-bold text-yellow-400">{signal.leverage}</div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                
                {/* Visual Range */}
                <div className="flex justify-between text-sm mb-1 text-slate-400">
                    <span>Entrada</span>
                    <span>Meta (Exit)</span>
                </div>
                <div className="relative h-2 bg-slate-700 rounded-full w-full">
                    <div className={`absolute top-0 bottom-0 left-0 rounded-full ${isLong ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: '100%' }}></div>
                </div>
                <div className="flex justify-between font-mono font-bold text-lg">
                    <span className="text-blue-300">${signal.entryPrice}</span>
                    <span className={isLong ? 'text-green-400' : 'text-red-400'}>${signal.targetPrice}</span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4 bg-slate-900/50 p-3 rounded-lg">
                    <div>
                        <span className="text-xs text-slate-500 block">Stop Loss (Salida)</span>
                        <span className="text-red-400 font-mono font-semibold">${signal.stopLoss}</span>
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 block">Inversión Sugerida</span>
                        <span className="text-cyan-300 font-mono font-semibold">{signal.recommendedAmount}</span>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-slate-700 mt-1">
                        <span className="text-xs text-slate-500 block">Potencial Ganancia</span>
                        <span className="text-green-400 font-bold text-lg">+{potentialGain}% (sin apalancamiento)</span>
                    </div>
                </div>

                <div className="text-xs text-slate-400 italic">
                    "{signal.reason}"
                </div>

                <button 
                    onClick={onExecute}
                    className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-transform active:scale-95 ${isLong ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                >
                    APLICAR ESTA SEÑAL
                </button>
            </div>
        </div>
    );
};
