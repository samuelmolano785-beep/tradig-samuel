
import React from 'react';

export interface CryptoPrice {
  symbol: string;
  price: number;
  change: number;
}

interface CryptoTickerProps {
    coins: CryptoPrice[];
}

export const CryptoTicker: React.FC<CryptoTickerProps> = ({ coins }) => {
  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 overflow-hidden py-2">
      <div className="flex animate-scroll whitespace-nowrap gap-8 px-4">
        <div className="flex gap-6 overflow-x-auto no-scrollbar items-center w-full">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-950 pr-2">Mercado en Vivo:</span>
            {coins.map((coin) => (
            <div key={coin.symbol} className="flex items-center gap-2 flex-shrink-0">
                <span className="font-bold text-slate-300 text-sm">{coin.symbol}</span>
                <span className="text-slate-200 text-sm">${coin.price.toFixed(2)}</span>
                <span className={`text-xs ${coin.change >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                {coin.change >= 0 ? '▲' : '▼'} {Math.abs(coin.change).toFixed(2)}%
                </span>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};
