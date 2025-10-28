import React, { useState } from 'react';
import type { ExecutedTrade } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface TradingTerminalProps {
  trades: ExecutedTrade[];
  currentOrder: Omit<ExecutedTrade, 'id' | 'status'> | null;
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

export const TradingTerminal: React.FC<TradingTerminalProps> = ({ trades, currentOrder, onCloseTrade, onConfirmOrder, onCancelOrder }) => {

  const handleCloseClick = (trade: ExecutedTrade) => {
    const closePriceStr = prompt(`Introduce el precio de cierre para ${trade.market}:`);
    if (closePriceStr) {
        const closePrice = parseFloat(closePriceStr);
        if (!isNaN(closePrice)) {
            onCloseTrade(trade.id, closePrice);
        } else {
            alert("Por favor, introduce un número válido.");
        }
    }
  };
  
  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy: ', err));
  };

  const totalPnl = trades
    .filter(trade => trade.status === 'Cerrada' && trade.pnl != null)
    .reduce((sum, trade) => sum + (trade.pnl ?? 0), 0);
    
  const openTrades = trades.filter(t => t.status === 'Abierta');
  const closedTrades = trades.filter(t => t.status === 'Cerrada');

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
                        <p className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                            **Aviso:** Esto es una simulación. Usa los botones de copiar para introducir los datos en tu bróker real.
                        </p>
                       <div className="flex gap-2 pt-2">
                            <button onClick={() => onConfirmOrder(currentOrder)} className="flex-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">Confirmar Orden (Simulada)</button>
                            <button onClick={onCancelOrder} className="text-sm bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded">Cancelar</button>
                       </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">Haz clic en "Ejecutar Operación" en una recomendación del chat para cargarla aquí.</p>
                )}
            </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700 flex-grow">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSignIcon className="w-6 h-6" />
                    Posiciones Abiertas y Cerradas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4 pb-3 border-b border-slate-700">
                    <h4 className="font-semibold text-md mb-1">Resumen Diario</h4>
                    <div className={`text-xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalPnl.toFixed(2)} USD
                    </div>
                    <div className="text-xs text-slate-400">Ganancia/Pérdida Total</div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2 text-sm">Operaciones Abiertas ({openTrades.length})</h4>
                        <div className="space-y-2">
                            {openTrades.length > 0 ? openTrades.map(trade => (
                                <div key={trade.id} className="bg-slate-700/50 p-3 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className={`font-bold ${trade.action === 'COMPRAR' ? 'text-green-400' : 'text-red-400'}`}>
                                                {trade.action}
                                            </span>
                                            <span className="font-semibold ml-2">{trade.market}</span>
                                        </div>
                                        <button onClick={() => handleCloseClick(trade)} className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded">Cerrar</button>
                                    </div>
                                    <div className="text-sm text-slate-400 mt-1">
                                        Entrada: @ {trade.entryPrice.toFixed(2)}
                                    </div>
                                </div>
                            )) : <p className="text-xs text-slate-500">No hay operaciones abiertas.</p>}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-cyan-400 mb-2 text-sm">Operaciones Cerradas ({closedTrades.length})</h4>
                        <div className="space-y-2">
                           {closedTrades.length > 0 ? closedTrades.map(trade => (
                                <div key={trade.id} className="bg-slate-900/50 p-3 rounded-md opacity-70">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className={`font-bold text-sm ${trade.action === 'COMPRAR' ? 'text-green-500' : 'text-red-500'}`}>
                                                {trade.action}
                                            </span>
                                            <span className="font-semibold ml-2 text-sm">{trade.market}</span>
                                        </div>
                                        <div className={`font-bold text-sm ${trade.pnl! >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {trade.pnl?.toFixed(2)} USD
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        Entrada: {trade.entryPrice.toFixed(2)} &rarr; Cierre: {trade.closePrice?.toFixed(2)}
                                    </div>
                                </div>
                           )) : <p className="text-xs text-slate-500">No hay operaciones cerradas.</p>}
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    </div>
  );
};