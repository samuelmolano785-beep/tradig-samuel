export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  imageUrl?: string;
  sources?: { uri: string; title: string; }[];
  tradeExecuted?: boolean;
  tradeUpdateApplied?: boolean;
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