
import React from 'react';
import type { ExecutedTrade } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface TradingTerminalProps {
  trades: ExecutedTrade[];
  currentOrder: Omit<ExecutedTrade, 'id' | 'status'> | null;
  currentPrices: Record<string, number>;
  onCloseTrade: (tradeId: string, closePrice: number) => void;
  onConfirmOrder: (order: Omit<ExecutedTrade, 'id' | 'status'>) => void;
  onCancelOrder: () => void;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
);

const TerminalIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>
    </svg>
);

const ValueRow: React.FC<{ label: string; value: string | number | undefined, onCopy?: (value: string) => void }> = ({ label, value, onCopy }) => {
    if (value === undefined) return null;
    const displayValue = typeof value === 'number' ? value.toFixed(4).replace(/\.?0+$/, '') : value;
    return (
        <div className="flex justify-between items-center text-sm py-1 border-b border-slate-800/50 last:border-0">
            <span className="text-slate-400">{label}:</span>
            <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-slate-200">{displayValue}</span>
                {onCopy && (
                    <button onClick={() => onCopy(value.toString())} className="text-slate-600 hover:text-cyan-400 transition-colors">
                        <CopyIcon className="w-3 h-3" />
                    </button>
                )}
            </div>
        </div>
    );
};

export const TradingTerminal: React.FC<TradingTerminalProps> = ({ trades, currentOrder, currentPrices, onCloseTrade, onConfirmOrder, onCancelOrder }) => {

  const handleCloseClick = (trade: ExecutedTrade) => {
    // Use live price if available, otherwise fallback to entry price
    const currentPrice = currentPrices[trade.market] || trade.entryPrice;
    
    if (currentPrices[trade.market]) {
        if(confirm(`¿Cerrar posición en ${trade.market} a precio de mercado $${currentPrice.toFixed(2)}?`)) {
            onCloseTrade(trade.id, currentPrice);
        }
    } else {
        const closePriceStr = prompt(`Precio actual desconocido para ${trade.market}. Introduce precio de cierre manual:`);
        if (closePriceStr) {
            const closePrice = parseFloat(closePriceStr);
            if (!isNaN(closePrice)) {
                onCloseTrade(trade.id, closePrice);
            }
        }
    }
  };
  
  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy: ', err));
  };

  const openTrades = trades.filter(t => t.status === 'Abierta');
  const closedTrades = trades.filter(t => t.status === 'Cerrada');

  // Calculate unrealized PnL from open trades based on live prices
  const unrealizedPnl = openTrades.reduce((sum, trade) => {
      const currentPrice = currentPrices[trade.market];
      if (!currentPrice) return sum;
      const diff = currentPrice - trade.entryPrice;
      const tradePnl = trade.action === 'COMPRAR' ? diff : -diff;
      // Very basic PnL calculation (ignoring leverage/amount for simplicity in UI)
      return sum + tradePnl; 
  }, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950">
        
        {/* Header */}
        <div className="flex items-center gap-2 p-4 bg-slate-900 border-b border-slate-800">
            <TerminalIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-lg text-slate-100">Terminal de Trading</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            
            {/* 1. Order Confirmation (Pending) */}
            {currentOrder && (
                <div className="bg-slate-900 border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.1)] animate-in fade-in slide-in-from-top-2">
                    <div className="bg-cyan-900/20 p-2 border-b border-cyan-500/20 flex justify-between items-center">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider animate-pulse">Confirmar Orden</span>
                        <span className="text-[10px] text-cyan-500/70">IA SIGNAL</span>
                    </div>
                    <div className="p-4 space-y-3">
                         <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-white">{currentOrder.market}</span>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${currentOrder.action === 'COMPRAR' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {currentOrder.action}
                            </span>
                        </div>
                        
                        <div className="space-y-1 bg-slate-950/50 p-3 rounded border border-slate-800">
                            <ValueRow label="Entrada" value={currentOrder.entryPrice} />
                            <ValueRow label="Stop Loss" value={currentOrder.stopLoss} />
                            <ValueRow label="Take Profit" value={currentOrder.takeProfit} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                             <button 
                                onClick={() => onConfirmOrder(currentOrder)} 
                                className="bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold text-sm transition-colors shadow-lg shadow-green-900/20"
                             >
                                CONFIRMAR
                             </button>
                             <button 
                                onClick={onCancelOrder} 
                                className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded font-bold text-sm transition-colors"
                             >
                                CANCELAR
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Open Positions */}
            <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">Posiciones Abiertas ({openTrades.length})</h3>
                    {openTrades.length > 0 && (
                        <span className={`font-mono text-sm font-bold ${unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            PNL: {unrealizedPnl > 0 ? '+' : ''}{unrealizedPnl.toFixed(2)}
                        </span>
                    )}
                </div>

                {openTrades.length === 0 && !currentOrder && (
                     <div className="py-8 px-4 border border-dashed border-slate-800 rounded-lg text-center">
                        <p className="text-sm text-slate-500">Sin operaciones activas</p>
                        <p className="text-xs text-slate-600 mt-1">Usa el chat para obtener señales</p>
                     </div>
                )}

                {openTrades.map(trade => {
                    const currentPrice = currentPrices[trade.market] || trade.entryPrice;
                    const diff = currentPrice - trade.entryPrice;
                    const pnl = trade.action === 'COMPRAR' ? diff : -diff;
                    const pnlPercent = ((pnl / trade.entryPrice) * 100);
                    
                    return (
                        <div key={trade.id} className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg hover:border-slate-600 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                                 <div className="flex flex-col">
                                    <span className="font-bold text-slate-200">{trade.market}</span>
                                    <span className={`text-[10px] font-bold w-fit px-1.5 rounded-sm ${trade.action === 'COMPRAR' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                                        {trade.action === 'COMPRAR' ? 'LONG' : 'SHORT'}
                                    </span>
                                 </div>
                                 <div className="text-right">
                                    <div className={`font-mono font-bold text-sm ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}
                                    </div>
                                    <div className={`text-[10px] ${pnl >= 0 ? 'text-green-500/70' : 'text-red-500/70'}`}>
                                        {pnlPercent.toFixed(2)}%
                                    </div>
                                 </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-3 bg-slate-900/30 p-2 rounded">
                                <div>Entry: <span className="text-slate-300 font-mono">${trade.entryPrice}</span></div>
                                <div>Mark: <span className="text-slate-300 font-mono">${currentPrice.toFixed(2)}</span></div>
                            </div>
                            
                            <button 
                                onClick={() => handleCloseClick(trade)}
                                className="w-full py-1.5 bg-slate-700 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 border border-transparent text-slate-300 text-xs font-semibold rounded transition-all"
                            >
                                Cerrar Posición
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* 3. History */}
            {closedTrades.length > 0 && (
                 <div className="pt-6 space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase border-b border-slate-800 pb-2">Historial Reciente</h3>
                    <div className="space-y-2">
                        {closedTrades.slice(0, 10).map(trade => (
                            <div key={trade.id} className="flex justify-between items-center text-xs p-2 bg-slate-900/50 rounded border border-slate-800/50 opacity-75 hover:opacity-100 transition-opacity">
                                <div className="flex flex-col">
                                    <span className="text-slate-300 font-semibold">{trade.market}</span>
                                    <span className="text-[10px] text-slate-500">{trade.status}</span>
                                </div>
                                <span className={`font-mono font-bold ${trade.pnl! >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {trade.pnl! > 0 ? '+' : ''}{trade.pnl!.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                 </div>
            )}
        </div>
    </div>
  );
};
