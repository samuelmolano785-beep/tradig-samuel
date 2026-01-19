
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createChat, sendMessageStreamToChat } from './services/geminiService';
import type { ChatMessage, ExecutedTrade, PriceChartData, TradeSignal } from './types';
import { Chat } from '@google/genai';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Spinner } from './components/ui/Spinner';
import { Card, CardContent } from './components/ui/Card';
import { TradingTerminal } from './components/TradingTerminal';
import { PriceChart } from './components/PriceChart';
import { CryptoTicker, CryptoPrice } from './components/CryptoTicker';
import { TradeSignalCard } from './components/TradeSignalCard';

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
);

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);

const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"/>
    </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="6 3 20 12 6 21 6 3"/>
    </svg>
);

const PlusCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
);

const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
    </svg>
);

const TerminalIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>
    </svg>
);

// Initial Market Data with USDT pairs to match AI output
const initialCoins: CryptoPrice[] = [
  { symbol: 'BTC/USDT', price: 64230.50, change: 1.2 },
  { symbol: 'ETH/USDT', price: 3450.12, change: -0.5 },
  { symbol: 'SOL/USDT', price: 145.80, change: 3.4 },
  { symbol: 'BNB/USDT', price: 590.20, change: 0.1 },
  { symbol: 'PEPE/USDT', price: 0.00000850, change: 15.2 },
  { symbol: 'DOGE/USDT', price: 0.16, change: 5.2 },
  { symbol: 'XRP/USDT', price: 0.62, change: -1.1 },
  { symbol: 'ADA/USDT', price: 0.45, change: 0.8 },
];

const marketSuggestions = ['BTC/USDT', 'SOL/USDT', 'PEPE/USDT', 'DOGE/USDT', 'ETH/USDT'];
const questionSuggestions = [
    'Dame una Señal de Entrada',
    '¿Qué monedas recomiendas hoy?',
    'Analizar ETH para corto plazo',
    'Buscar oportunidades x10'
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('Dame una Señal de Entrada');
  const [timeframe, setTimeframe] = useState('10 horas');
  const [broker, setBroker] = useState('Binance');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [executedTrades, setExecutedTrades] = useState<ExecutedTrade[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Omit<ExecutedTrade, 'id' | 'status'> | null>(null);
  
  // Market Simulation State
  const [coins, setCoins] = useState<CryptoPrice[]>(initialCoins);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  // Mobile View State
  const [activeTab, setActiveTab] = useState<'chat' | 'terminal'>('chat');

  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Streaming buffers
  const streamingChartData = useRef<{ [messageId: string]: string }>({});
  const streamingSignalData = useRef<{ [messageId: string]: string }>({});

  // Initialize prices
  useEffect(() => {
      const priceMap = initialCoins.reduce((acc, coin) => ({ ...acc, [coin.symbol]: coin.price }), {});
      setCurrentPrices(priceMap);
  }, []);

  // Simulate Live Market Data
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prevCoins => {
        const newCoins = prevCoins.map(coin => {
          // More volatility for PEPE/DOGE
          const isMeme = coin.symbol.includes('PEPE') || coin.symbol.includes('DOGE');
          const volatility = isMeme ? 0.005 : 0.001; 
          
          const changePercent = (Math.random() * volatility * 2) - volatility;
          const newPrice = coin.price * (1 + changePercent);
          
          return {
            ...coin,
            price: newPrice,
            change: coin.change + (changePercent * 100)
          };
        });
        
        // Update price map for fast lookup in Terminal
        const priceMap = newCoins.reduce((acc, coin) => ({ ...acc, [coin.symbol]: coin.price }), {});
        setCurrentPrices(priceMap);
        
        return newCoins;
      });
    }, 2000); // 2 second updates

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!chatRef.current) {
        chatRef.current = createChat();
        setMessages([
            {
                id: Date.now().toString(),
                role: 'model',
                content: '¡Hola! Soy tu Analista Crypto. Dime "¿Qué recomiendas hoy?" y te daré señales claras con precio de ENTRADA y SALIDA.'
            }
        ]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, activeTab]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImage(file);
        setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };
  
  const parsePrice = (priceString: string): number => {
    return parseFloat(priceString.replace(/[^0-9.-]+/g,""));
  };

  const handleExecuteSignal = (signal: TradeSignal) => {
      const newOrder: Omit<ExecutedTrade, 'id' | 'status'> = {
          market: signal.symbol,
          action: signal.action.includes('LONG') || signal.action.includes('COMPRAR') ? 'COMPRAR' : 'VENDER',
          entryPrice: signal.entryPrice,
          stopLoss: signal.stopLoss,
          takeProfit: signal.targetPrice,
      };
      setCurrentOrder(newOrder);
      if (window.innerWidth < 1024) {
          setActiveTab('terminal');
      }
  };

  const handleExecuteTrade = (tradeMessage: ChatMessage) => {
    const content = tradeMessage.content;
    const marketMatch = content.match(/\*\*(?:Mercado Sugerido|Activo|Activo Identificado):\*\*\s*\*\*(.*?)\*\*/);
    const actionMatch = content.match(/\*\*(?:Acción Recomendada|Acción):\*\*\s*\*\*(.*?)\*\*/);
    const entryMatch = content.match(/\*\s+\*\*Entrada:\*\*\s*\*\*(.*?)\*\*/);
    const stopLossMatch = content.match(/\*\s+\*\*Stop Loss:\*\*\s*\*\*(.*?)\*\*/);
    const takeProfitMatch = content.match(/\*\s+\*\*Take Profit.*:\*\*\s*\*\*(.*?)\*\*/);
    
    if (marketMatch && actionMatch && entryMatch) {
      const entryPrice = parsePrice(entryMatch[1]);
      if (!isNaN(entryPrice)) {
          const newOrder: Omit<ExecutedTrade, 'id' | 'status'> = {
              market: marketMatch[1],
              action: actionMatch[1].toUpperCase().includes('VENDER') || actionMatch[1].toUpperCase().includes('CORTO') ? 'VENDER' : 'COMPRAR',
              entryPrice,
              stopLoss: stopLossMatch ? parsePrice(stopLossMatch[1]) : undefined,
              takeProfit: takeProfitMatch ? parsePrice(takeProfitMatch[1]) : undefined,
          };
          setCurrentOrder(newOrder);
          setMessages(prev => prev.map(msg => msg.id === tradeMessage.id ? { ...msg, tradeExecuted: true } : msg));
          
          if (window.innerWidth < 1024) {
              setActiveTab('terminal');
          }
      }
    }
  };
  
  const handleApplyTradeUpdate = (tradeMessage: ChatMessage) => {
    const content = tradeMessage.content;
    const resultMatch = content.match(/\*\*Resultado:\*\*\s*\*\*(GANANCIA|PÉRDIDA)\*\*/);
    const amountMatch = content.match(/\*\*Monto:\*\*\s*\*\*([0-9.,]+)\*\*/);

    if (resultMatch && amountMatch) {
        const result = resultMatch[1];
        const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
        
        if (!isNaN(amount)) {
            const pnl = result === 'GANANCIA' ? amount : -amount;

            const manualTrade: ExecutedTrade = {
                id: Date.now().toString(),
                market: 'Ajuste Manual',
                action: pnl >= 0 ? 'COMPRAR' : 'VENDER',
                entryPrice: 0,
                closePrice: Math.abs(pnl),
                status: 'Cerrada',
                pnl: pnl,
            };
            setExecutedTrades(prev => [manualTrade, ...prev]);
            setMessages(prev => prev.map(msg => msg.id === tradeMessage.id ? { ...msg, tradeUpdateApplied: true } : msg));
             if (window.innerWidth < 1024) {
                setActiveTab('terminal');
            }
        }
    }
  };

  const handleConfirmOrder = (orderToConfirm: Omit<ExecutedTrade, 'id' | 'status'>) => {
    const newTrade: ExecutedTrade = {
        ...orderToConfirm,
        id: Date.now().toString(),
        status: 'Abierta',
    };
    setExecutedTrades(prev => [newTrade, ...prev]);
    setCurrentOrder(null);
  };
  
  const handleCloseTrade = (tradeId: string, closePrice: number) => {
      setExecutedTrades(prev => prev.map(trade => {
          if (trade.id === tradeId) {
              const pnl = (closePrice - trade.entryPrice) * (trade.action === 'COMPRAR' ? 1 : -1);
              return { ...trade, status: 'Cerrada', closePrice, pnl };
          }
          return trade;
      }));
  };

  const handleSendMessage = useCallback(async () => {
    if ((!prompt.trim() && !image) || !chatRef.current) return;

    const currentPrompt = prompt;
    const currentImagePreview = imagePreview;
    const currentImage = image;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: currentPrompt, imageUrl: currentImagePreview ?? undefined };
    setMessages(prev => [...prev, userMessage]);
    
    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', content: '' }]);
    
    setIsLoading(true);
    setPrompt('');
    handleRemoveImage();
    
    const messageForAI = `Usuario: "${currentPrompt}". Meta: Ganar el doble (x2). Plazo: "${timeframe}". Exchange: "${broker}"`;

    let chartJsonDetected = false;
    let signalJsonDetected = false;

    try {
      const stream = await sendMessageStreamToChat(chatRef.current, messageForAI, currentImage ?? undefined);
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;

        setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages.find(m => m.id === modelMessageId);
            
            if (lastMessage) {
                let needsUpdate = false;
                if (chunkText) {
                    
                    // --- Chart Parsing ---
                    if (chunkText.includes('```json:chart')) {
                        chartJsonDetected = true;
                        streamingChartData.current[modelMessageId] = '';
                    }

                    if (chartJsonDetected) {
                        streamingChartData.current[modelMessageId] += chunkText;
                        if (streamingChartData.current[modelMessageId].includes('```') && streamingChartData.current[modelMessageId].split('```').length > 2) {
                            const fullJsonBlock = streamingChartData.current[modelMessageId];
                            const jsonContent = fullJsonBlock.substring(fullJsonBlock.indexOf('{'), fullJsonBlock.lastIndexOf('}') + 1);
                            try {
                                const parsedChartData: PriceChartData = JSON.parse(jsonContent);
                                lastMessage.chartData = parsedChartData;
                                delete streamingChartData.current[modelMessageId];
                                chartJsonDetected = false;
                            } catch (e) {
                                console.error("Failed to parse chart JSON:", e);
                            }
                        }
                    }

                    // --- Signal Parsing ---
                    if (chunkText.includes('```json:signal')) {
                        signalJsonDetected = true;
                        streamingSignalData.current[modelMessageId] = '';
                    }

                    if (signalJsonDetected) {
                         streamingSignalData.current[modelMessageId] += chunkText;
                         if (streamingSignalData.current[modelMessageId].includes('```') && streamingSignalData.current[modelMessageId].split('```').length > 2) {
                             const fullJsonBlock = streamingSignalData.current[modelMessageId];
                             const jsonContent = fullJsonBlock.substring(fullJsonBlock.indexOf('{'), fullJsonBlock.lastIndexOf('}') + 1);
                             try {
                                 const parsedSignal: TradeSignal = JSON.parse(jsonContent);
                                 lastMessage.signalData = parsedSignal;
                                 delete streamingSignalData.current[modelMessageId];
                                 signalJsonDetected = false;
                             } catch (e) {
                                 console.error("Failed to parse signal JSON:", e);
                             }
                         }
                    }

                    lastMessage.content += chunkText;
                    needsUpdate = true;
                }

                if (groundingChunks?.length && !lastMessage.sources?.length) {
                    const sources = groundingChunks
                        .map(chunk => chunk.web)
                        .filter((web): web is { uri: string; title: string } => !!(web?.uri && web.title))
                        .filter((web, index, self) => index === self.findIndex(t => t.uri === web.uri));
                    
                    if (sources.length > 0) {
                        lastMessage.sources = sources;
                        needsUpdate = true;
                    }
                }
                if (needsUpdate) return [...newMessages];
            }
            return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages.find(m => m.id === modelMessageId);
          if(lastMessage && lastMessage.content === '') {
              lastMessage.role = 'system';
              lastMessage.content = 'Lo siento, he encontrado un error al conectar con el mercado. Por favor, inténtalo de nuevo.';
          } else {
              newMessages.push({ id: Date.now().toString(), role: 'system', content: 'Lo siento, se interrumpió la conexión. Por favor, inténtalo de nuevo.' });
          }
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }, [prompt, timeframe, image, imagePreview, broker]);
  
  const canExecuteTradeOld = (messageContent: string): boolean => {
    return (/\*\*Acción Recomendada:\*\*/.test(messageContent) || /\*\*Acción:\*\*/.test(messageContent)) && /\*\s+\*\*Entrada:\*\*/.test(messageContent);
  };
  
  const isTradeUpdate = (messageContent: string): boolean => {
    return /### Actualización de Operación/.test(messageContent);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 font-sans text-slate-200 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between bg-slate-800/50 border-b border-slate-700 p-3 shadow-md flex-shrink-0 z-10">
          <div className="flex items-center space-x-2">
              <BotIcon className="w-6 h-6 text-cyan-400" />
              <h1 className="text-lg md:text-xl font-bold text-white">Crypto Sniper IA</h1>
          </div>
          <a
            href="https://github.com/google/generative-ai-docs/tree/main/demos/palm-api-cookbook"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
        </header>

        {/* Crypto Ticker - Now receives coins as props for sync */}
        <CryptoTicker coins={coins} />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
            
            {/* Chat Column */}
            <div className={`flex flex-col flex-1 min-w-0 transition-opacity duration-200 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 absolute inset-0 -z-10 lg:opacity-100 lg:relative lg:z-auto'}`}>
                 <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    <div className="max-w-4xl mx-auto pb-24 lg:pb-0">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex items-start gap-4 mb-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'model' ? 'bg-cyan-600/20 text-cyan-400' : (msg.role === 'system' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-white')}`}>
                                    {msg.role === 'model' ? <BotIcon className="w-6 h-6" /> : (msg.role === 'system' ? <span className="font-bold">!</span> : <span className="font-bold">TÚ</span>)}
                                </div>
                                <div className={`flex-1 max-w-[85%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                                    <div className={`rounded-2xl p-4 shadow-sm inline-block text-left ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : (msg.role === 'system' ? 'bg-red-900/30 border border-red-800 rounded-tl-none' : 'bg-slate-800 border border-slate-700 rounded-tl-none')}`}>
                                        
                                        {msg.imageUrl && (
                                            <div className="mb-3">
                                                <img src={msg.imageUrl} alt="Uploaded chart" className="max-w-full h-auto rounded-lg border border-slate-600 max-h-60 object-contain" />
                                            </div>
                                        )}

                                        <MarkdownRenderer content={msg.content} />

                                        {msg.signalData && (
                                            <TradeSignalCard 
                                                signal={msg.signalData} 
                                                onExecute={() => handleExecuteSignal(msg.signalData!)}
                                            />
                                        )}

                                        {msg.chartData && <PriceChart data={msg.chartData} />}

                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                                                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Fuentes:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {msg.sources.map((source, idx) => (
                                                        <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline bg-cyan-900/20 px-2 py-1 rounded-full truncate max-w-[200px]">
                                                            {source.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {msg.role === 'model' && canExecuteTradeOld(msg.content) && !msg.tradeExecuted && !msg.signalData && (
                                            <div className="mt-4">
                                                <button 
                                                    onClick={() => handleExecuteTrade(msg)}
                                                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-green-900/20"
                                                >
                                                    <PlayIcon className="w-4 h-4" />
                                                    Ejecutar Operación (Texto)
                                                </button>
                                            </div>
                                        )}
                                        {msg.role === 'model' && msg.tradeExecuted && (
                                            <div className="mt-2 text-xs text-green-400 flex items-center gap-1 font-medium">
                                                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                                                Operación enviada a la terminal
                                            </div>
                                        )}

                                        {msg.role === 'model' && isTradeUpdate(msg.content) && !msg.tradeUpdateApplied && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => handleApplyTradeUpdate(msg)}
                                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    <PlusCircleIcon className="w-4 h-4" />
                                                    Registrar en Historial
                                                </button>
                                            </div>
                                        )}
                                        {msg.role === 'model' && msg.tradeUpdateApplied && (
                                             <div className="mt-2 text-xs text-blue-400 flex items-center gap-1 font-medium">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                                                Historial actualizado
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
                                    <BotIcon className="w-6 h-6" />
                                </div>
                                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                                    <Spinner className="text-cyan-400" />
                                    <span className="text-slate-400 text-sm animate-pulse">Buscando las mejores señales...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                 </main>

                 {/* Input Area */}
                 <div className="p-4 bg-slate-800/80 border-t border-slate-700 backdrop-blur-sm z-20">
                    <div className="max-w-4xl mx-auto space-y-4">
                        
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {messages.length === 1 && (
                                <>
                                    {questionSuggestions.map((q, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => setPrompt(q)}
                                            className="whitespace-nowrap px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full text-xs transition-colors border border-slate-600"
                                        >
                                            {q}
                                        </button>
                                    ))}
                                </>
                            )}
                             {marketSuggestions.map((m, idx) => (
                                <button 
                                    key={`m-${idx}`} 
                                    onClick={() => setPrompt(`Analiza ${m} para una operación x2`)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-full text-xs transition-colors border border-slate-700 font-mono"
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                             <div className="flex items-center gap-2">
                                <label className="text-xs uppercase font-bold tracking-wider text-slate-500">Tiempo:</label>
                                <select 
                                    value={timeframe} 
                                    onChange={(e) => setTimeframe(e.target.value)}
                                    className="bg-slate-800 border-none rounded text-slate-200 text-sm focus:ring-1 focus:ring-cyan-500 cursor-pointer py-1 px-2"
                                >
                                    <option value="1 hora">Scalping (1h)</option>
                                    <option value="4 horas">Intradía (4h)</option>
                                    <option value="10 horas">Meta (10h)</option>
                                    <option value="24 horas">Swing (24h)</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs uppercase font-bold tracking-wider text-slate-500">Broker:</label>
                                <select 
                                    value={broker} 
                                    onChange={(e) => setBroker(e.target.value)}
                                    className="bg-slate-800 border-none rounded text-slate-200 text-sm focus:ring-1 focus:ring-cyan-500 cursor-pointer py-1 px-2"
                                >
                                    <option value="Binance">Binance</option>
                                    <option value="Bybit">Bybit</option>
                                    <option value="Coinbase">Coinbase</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                        </div>

                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Pídeme una señal de entrada o recomendación..."
                                className="w-full bg-slate-950 text-white rounded-xl border border-slate-700 p-4 pr-32 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none h-[60px] custom-scrollbar"
                            />
                            
                            {imagePreview && (
                                <div className="absolute top-[-60px] left-0 bg-slate-800 p-2 rounded-lg border border-slate-600 shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <img src={imagePreview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                                    <span className="text-xs text-slate-300 max-w-[100px] truncate">{image?.name}</span>
                                    <button onClick={handleRemoveImage} className="text-slate-400 hover:text-red-400 p-1">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
                                    title="Subir gráfico"
                                >
                                    <PaperclipIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={isLoading || (!prompt.trim() && !image)}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-900/20"
                                >
                                    {isLoading ? <Spinner className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Terminal Column (Desktop: Always visible / Mobile: Toggled) */}
             <div className={`
                flex-col bg-slate-900 border-l border-slate-800 w-full lg:w-[400px] xl:w-[450px] transition-all duration-300
                ${activeTab === 'terminal' ? 'flex absolute inset-0 z-20' : 'hidden lg:flex relative'}
            `}>
                <TradingTerminal 
                    trades={executedTrades} 
                    currentOrder={currentOrder}
                    currentPrices={currentPrices}
                    onCloseTrade={handleCloseTrade}
                    onConfirmOrder={handleConfirmOrder}
                    onCancelOrder={() => setCurrentOrder(null)}
                />
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-30 pb-safe">
                <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'chat' ? 'text-cyan-400' : 'text-slate-500'}`}
                >
                    <ChatBubbleIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">CHAT IA</span>
                </button>
                <button 
                    onClick={() => setActiveTab('terminal')}
                    className={`flex flex-col items-center gap-1 ${activeTab === 'terminal' ? 'text-cyan-400' : 'text-slate-500'}`}
                >
                    <TerminalIcon className="w-6 h-6" />
                     <span className="text-[10px] font-bold">TERMINAL</span>
                </button>
            </div>

        </div>
    </div>
  );
};

export default App;
