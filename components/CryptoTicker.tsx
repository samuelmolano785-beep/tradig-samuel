
import React, { useState, useEffect } from 'react';

interface CryptoPrice {
  symbol: string;
  price: number;
  change: number;
}

const initialCoins: CryptoPrice[] = [
  { symbol: 'BTC', price: 64230.50, change: 1.2 },
  { symbol: 'ETH', price: 3450.12, change: -0.5 },
  { symbol: 'SOL', price: 145.80, change: 3.4 },
  { symbol: 'BNB', price: 590.20, change: 0.1 },
  { symbol: 'XRP', price: 0.62, change: -1.1 },
  { symbol: 'ADA', price: 0.45, change: 0.8 },
  { symbol: 'DOGE', price: 0.16, change: 5.2 },
  { symbol: 'DOT', price: 7.20, change: -2.3 },
];

export const CryptoTicker: React.FC = () => {
  const [coins, setCoins] = useState<CryptoPrice[]>(initialCoins);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prevCoins => 
        prevCoins.map(coin => {
          const volatility = 0.002; // 0.2% movement
          const changePercent = (Math.random() * volatility * 2) - volatility;
          const newPrice = coin.price * (1 + changePercent);
          return {
            ...coin,
            price: newPrice,
            change: coin.change + (changePercent * 100)
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-950 border-b border-slate-800 overflow-hidden py-2">
      <div className="flex animate-scroll whitespace-nowrap gap-8 px-4">
        {/* Double the list to create seamless infinite scroll effect if we used CSS animation, 
            but for now we just map them horizontally with overflow-x-auto style for mobile */}
        <div className="flex gap-6 overflow-x-auto no-scrollbar items-center w-full">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-950 pr-2">Mercado 24h:</span>
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
