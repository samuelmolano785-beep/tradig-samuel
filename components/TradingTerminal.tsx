
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

const DollarSignIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
);

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
    const displayValue = typeof value === 'number' ? value.toFixed(5).replace(/\.?0+$/, '') : value;
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">{label}:</span>
            <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">{displayValue}</span>
                {onCopy && (
                    <button onClick={() => onCopy(value.toString())} className="text-slate-500 hover:text-white transition-colors">
                        <CopyIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export const TradingTerminal: React.FC<TradingTerminalProps> = ({ trades, currentOrder, currentPrices, onCloseTrade, onConfirmOrder, onCancelOrder }) => {

  const handleCloseClick = (trade: ExecutedTrade) => {
    // If we have a live price, use it as default
    const currentPrice = currentPrices[trade.market] || trade.entryPrice;
    
    // In a real app we might not ask, but for simulation it's good to allow manual override or auto-fill
    // For "functional" feel, let's just close it at current market price instantly if available
    if (currentPrices[trade.market]) {
        if(confirm(`¿Cerrar posición en ${trade.market} a precio de mercado $${currentPrice.toFixed(2)}?`)) {
            onCloseTrade(trade.id, currentPrice);
        }
    } else {
        const closePriceStr = prompt(`Precio actual desconocido. Introduce precio de cierre para ${trade.market}:`);
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

  // Calculate stats
  const closedPnl = closedTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0);
  
  // Calculate unrealized PnL from open trades based on live prices
  const unrealizedPnl = openTrades.reduce((sum, trade) => {
      const currentPrice = currentPrices[trade.market];
      if (!currentPrice) return sum;
      const diff = currentPrice - trade.entryPrice;
      const tradePnl = trade.action === 'COMPRAR' ? diff : -diff;
      // Assume 1 unit position size for simulation simplicity if not defined, 
      // or we could assume the "recommendedAmount" implies a size. 
      // To make it visible, let's assume a standard position size relative to price (e.g. 1 ETH, 0.1 BTC, 10 SOL)
      // or just pure price delta for simplicity.
      return sum + tradePnl; 
  }, 0);

  const totalPnl = closedPnl; // Realized PnL

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto space-y-4">
        <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TerminalIcon className="w-6 h-6" />
                    Terminal de Operaciones
                </CardTitle>
            </CardHeader>
             <CardContent>
                <h4 className="font-semibold text-cyan-400 mb-2">Nueva Orden</h4>
                {currentOrder ? (
                    <div className="bg-slate-900/50 p-3 rounded-md space-y-3">
                       <div className="flex justify-between items-center">
                            <span className={`text-lg font-bold ${currentOrder.action === 'COMPRAR' ? 'text-green-400' : 'text-red-400'}`}>
                                {currentOrder.action}
                            </span>
                            <span className="text-lg font-bold">{currentOrder.market}</span>
                        </div>
                        <div className="space-y-2">
                            <ValueRow label="Entrada" value={currentOrder.entryPrice} onCopy={handleCopy} />
                            <ValueRow label="Stop Loss" value={currentOrder.stopLoss} onCopy={handleCopy} />
                            <ValueRow label="Take Profit" value={currentOrder.takeProfit} onCopy={handleCopy} />
                        </div>
                       <div className="flex gap-2 pt-2">
                            <button onClick={() => onConfirmOrder(currentOrder)} className="flex-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded shadow-lg shadow-green-900/20 font-bold">Confirmar</button>
                            <button onClick={onCancelOrder} className="text-sm bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded">Cancelar</button>
                       </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">Esperando señal de la IA...</p>
                )}
            </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 flex-grow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-between w-full">
                    <div className="flex items-center gap-2">
                        <DollarSignIcon className="w-6 h-6" />
                        Cartera
                    </div>
                    <div className="text-sm font-normal text-slate-400">
                        Balance Realizado
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 pb-3 border-b border-slate-700 flex justify-between items-end">
                    <div>
                         <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} USD
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                            Flotante (No realizado): <span className={unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'}>{unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2 text-sm flex justify-between">
                            <span>Posiciones Abiertas</span>
                            <span className="bg-cyan-900/50 text-cyan-200 text-xs px-2 py-0.5 rounded-full">{openTrades.length}</span>
                        </h4>
                        <div className="space-y-2">
                            {openTrades.length > 0 ? openTrades.map(trade => {
                                const currentPrice = currentPrices[trade.market] || trade.entryPrice;
                                const diff = currentPrice - trade.entryPrice;
                                const tradePnl = trade.action === 'COMPRAR' ? diff : -diff;
                                const pnlPercent = (diff / trade.entryPrice) * 100 * (trade.action === 'COMPRAR' ? 1 : -1);

                                return (
                                <div key={trade.id} className="bg-slate-700/30 border border-slate-600 p-3 rounded-md relative overflow-hidden group">
                                    <div className="flex justify-between items-center z-10 relative">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold text-xs px-1.5 rounded ${trade.action === 'COMPRAR' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                                                    {trade.action === 'COMPRAR' ? 'LONG' : 'SHORT'}
                                                </span>
                                                <span className="font-bold text-slate-200">{trade.market}</span>
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                Entrada: {trade.entryPrice.toFixed(2)} <span className="mx-1">|</span> Actual: <span className="text-slate-200">{currentPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold ${tradePnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {tradePnl >= 0 ? '+' : ''}{tradePnl.toFixed(2)}
                                            </div>
                                            <div className={`text-xs ${pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {pnlPercent.toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Quick Close Overlay */}
                                    <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleCloseClick(trade)} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-4 rounded-full shadow-lg transform scale-95 group-hover:scale-100 transition-transform">
                                            CERRAR POSICIÓN
                                        </button>
                                    </div>
                                </div>
                            )}) : <p className="text-xs text-slate-500 italic text-center py-2">Sin posiciones activas</p>}
                        </div>
                    </div>
                    
                    {closedTrades.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-slate-500 mb-2 text-sm mt-6">Historial Reciente</h4>
                            <div className="space-y-2 opacity-75">
                            {closedTrades.slice(0, 5).map(trade => (
                                    <div key={trade.id} className="bg-slate-900/30 p-2 rounded-md border border-slate-800 flex justify-between items-center">
                                        <div>
                                            <span className={`font-bold text-xs mr-2 ${trade.action === 'COMPRAR' ? 'text-green-600' : 'text-red-600'}`}>
                                                {trade.action.charAt(0)}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-400">{trade.market}</span>
                                        </div>
                                        <div className={`font-mono text-xs ${trade.pnl! >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {trade.pnl! >= 0 ? '+' : ''}{trade.pnl?.toFixed(2)}
                                        </div>
                                    </div>
                            ))}
                            </div>
                        </div>
                    )}
                </div>

            </CardContent>
        </Card>
    </div>
  );
};
