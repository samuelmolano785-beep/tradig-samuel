
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
    // Use live price if available, otherwise fallback to entry price or prompt
    const currentPrice = currentPrices[trade.market] || trade.entryPrice;
    
    if (currentPrices[trade.market]) {
        // Simple confirmation for better UX
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

  const closedPnl = closedTrades.reduce((sum, trade) => sum + (trade.pnl ?? 0), 0);
  
  // Calculate unrealized PnL from open trades based on live prices
  const unrealizedPnl = openTrades.reduce((sum, trade) => {
      const currentPrice = currentPrices[trade.market];
      if (!currentPrice) return sum;
      const diff = currentPrice - trade.entryPrice;
      const tradePnl = trade.action === 'COMPRAR' ? diff : -diff;
      return sum + tradePnl; 
  }, 0);

  const totalPnl = closedPnl;

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
                    <p className="text-sm text-slate-500 text-center py-4">Esperando señal de la IA