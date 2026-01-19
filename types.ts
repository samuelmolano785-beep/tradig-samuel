
export interface PriceChartData {
    historicalData: number[];
    predictedData: number[];
    entryPoint: {
        index: number;
        price: number;
    };
    stopLoss: number;
    takeProfit: number;
    timeLabels: string[];
}

export interface TradeSignal {
    symbol: string;
    action: 'COMPRAR (LONG)' | 'VENDER (SHORT)';
    entryPrice: number;
    targetPrice: number;
    stopLoss: number;
    leverage: string;
    recommendedAmount: string; // e.g., "10% del capital" or "$100"
    reason: string;
    probability: number; // 0-100 score indicating confidence
}
  
export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  imageUrl?: string;
  sources?: { uri: string; title: string; }[];
  tradeExecuted?: boolean;
  tradeUpdateApplied?: boolean;
  chartData?: PriceChartData;
  signalData?: TradeSignal; // New field for signals
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ExecutedTrade {
  id: string;
  market: string;
  action: 'COMPRAR' | 'VENDER';
  entryPrice: number;
  closePrice?: number;
  status: 'Abierta' | 'Cerrada';
  pnl?: number;
  stopLoss?: number;
  takeProfit?: number;
}
