import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createChat, sendMessageStreamToChat } from './services/geminiService';
import type { ChatMessage, ExecutedTrade, PriceChartData } from './types';
import { Chat } from '@google/genai';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { Spinner } from './components/ui/Spinner';
import { Card, CardContent } from './components/ui/Card';
import { TradingTerminal } from './components/TradingTerminal';
import { PriceChart } from './components/PriceChart';

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

const marketSuggestions = ['BTC/USD', 'ETH/USD', 'EUR/USD', 'ORO/USD', 'NASDAQ 100'];
const questionSuggestions = [
    '¿Qué mercado opero hoy?',
    'Gané 50 USD en mi última operación',
    'Proyección avanzada para BTC/USD',
    'Analiza el sentimiento del mercado para ORO/USD'
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('BTC/USD');
  const [timeframe, setTimeframe] = useState('próximas 4 horas');
  const [broker, setBroker] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [executedTrades, setExecutedTrades] = useState<ExecutedTrade[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Omit<ExecutedTrade, 'id' | 'status'> | null>(null);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamingChartData = useRef<{ [messageId: string]: string }>({});

  useEffect(() => {
    if (!chatRef.current) {
        chatRef.current = createChat();
        setMessages([
            {
                id: Date.now().toString(),
                role: 'model',
                content: '¡Hola! Soy tu Analista de Trading con IA. Sube una imagen de un gráfico, pídeme una "proyección avanzada" para ver un gráfico predictivo o pregúntame directamente en qué mercado invertir. ¿Cómo te ayudo hoy?'
            }
        ]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

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

  const handleExecuteTrade = (tradeMessage: ChatMessage) => {
    const content = tradeMessage.content;
    const marketMatch = content.match(/\*\*(?:Mercado Sugerido|Activo):\*\*\s*\*\*(.*?)\*\*/);
    const actionMatch = content.match(/\*\*Acción Recomendada:\*\*\s*\*\*(.*?)\*\*/);
    const entryMatch = content.match(/\*\s+\*\*Entrada:\*\*\s*\*\*(.*?)\*\*/);
    const stopLossMatch = content.match(/\*\s+\*\*Stop Loss:\*\*\s*\*\*(.*?)\*\*/);
    const takeProfitMatch = content.match(/\*\s+\*\*Take Profit:\*\*\s*\*\*(.*?)\*\*/);
    
    if (marketMatch && actionMatch && entryMatch) {
      const entryPrice = parsePrice(entryMatch[1]);
      if (!isNaN(entryPrice)) {
          const newOrder: Omit<ExecutedTrade, 'id' | 'status'> = {
              market: marketMatch[1],
              action: actionMatch[1].toUpperCase() as 'COMPRAR' | 'VENDER',
              entryPrice,
              stopLoss: stopLossMatch ? parsePrice(stopLossMatch[1]) : undefined,
              takeProfit: takeProfitMatch ? parsePrice(takeProfitMatch[1]) : undefined,
          };
          setCurrentOrder(newOrder);
          setMessages(prev => prev.map(msg => msg.id === tradeMessage.id ? { ...msg, tradeExecuted: true } : msg));
      } else {
        console.error("Could not parse entry price from:", entryMatch[1]);
      }
    } else {
        console.error("Could not parse trade details from message content.");
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
        } else {
            console.error("Could not parse amount from:", amountMatch[1]);
        }
    } else {
        console.error("Could not parse trade update from message content.");
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
    
    const messageForAI = `Pregunta del usuario: "${currentPrompt}". Marco de tiempo a considerar: "${timeframe}". Broker: "${broker}"`;

    let chartJsonDetected = false;

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
                    if (chunkText.includes('```json:chart')) {
                        chartJsonDetected = true;
                        streamingChartData.current[modelMessageId] = '';
                    }

                    if (chartJsonDetected) {
                        streamingChartData.current[modelMessageId] += chunkText;
                        if (streamingChartData.current[modelMessageId].includes('```')) {
                            const fullJsonBlock = streamingChartData.current[modelMessageId];
                            const jsonContent = fullJsonBlock.substring(fullJsonBlock.indexOf('{'), fullJsonBlock.lastIndexOf('}') + 1);
                            try {
                                const parsedChartData: PriceChartData = JSON.parse(jsonContent);
                                lastMessage.chartData = parsedChartData;
                                delete streamingChartData.current[modelMessageId];
                                chartJsonDetected = false;
                            } catch (e) {
                                console.error("Failed to parse chart JSON:", e);
                                // The JSON might be incomplete, wait for the next chunk
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
              lastMessage.content = 'Lo siento, he encontrado un error. Por favor, inténtalo de nuevo.';
          } else {
              newMessages.push({ id: Date.now().toString(), role: 'system', content: 'Lo siento, se interrumpió la conexión. Por favor, inténtalo de nuevo.' });
          }
          return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }, [prompt, timeframe, image, imagePreview, broker]);
  
  const canExecuteTrade = (messageContent: string): boolean => {
    return /\*\*Acción Recomendada:\*\*/.test(messageContent) && /\*\s+\*\*Entrada:\*\*/.test(messageContent);
  };
  
  const isTradeUpdate = (messageContent: string): boolean => {
    return /### Actualización de Operación/.test(messageContent);
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 font-sans text-slate-200">
        <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between bg-slate-800/50 border-b border-slate-700 p-4 shadow-md flex-shrink-0">
              <div className="flex items-center space-x-3">
                  <BotIcon className="w-7 h-7 text-cyan-400" />
                  <h1 className="text-xl font-bold text-white">Analista de Trading con IA</h1>
              </div>
              <a
                href="https://github.com/google/generative-ai-docs/tree/main/demos/palm-api-cookbook"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <GithubIcon className="w-6 h-6" />
              </a>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
               <div className="max-w-4xl mx-auto">
                  {messages.map((msg) => (
                      <div key={msg.id} className={`flex items-start gap-3 my-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                          {msg.role === 'model' && <BotIcon className="w-8 h-8 text-cyan-400 flex-shrink-0 mt-1" />}
                          <div className={`px-4 py-3 rounded-lg max-w-2xl shadow ${
                              msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200'
                          }`}>
                             {msg.imageUrl && <img src={msg.imageUrl} alt="User upload" className="max-w-xs rounded-md mb-2" />}
                             {msg.chartData && <PriceChart data={msg.chartData} />}
                             {msg.content ? <MarkdownRenderer content={msg.content} /> : (isLoading && <Spinner />)}
                             {msg.sources && msg.sources.length > 0 && (
                                 <div className="mt-4 pt-3 border-t border-slate-700">
                                     <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                                          <LinkIcon className="w-4 h-4" />
                                          Fuentes
                                     </h4>
                                     <ul className="space-y-1">
                                         {msg.sources.map((source, i) => (
                                             <li key={i}>
                                                 <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline break-all">
                                                     {source.title || new URL(source.uri).hostname}
                                                 </a>
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             )}
                             {msg.role === 'model' && msg.content && !isLoading && canExecuteTrade(msg.content) && (
                                <button
                                    onClick={() => handleExecuteTrade(msg)}
                                    disabled={msg.tradeExecuted}
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    <PlayIcon className="w-5 h-5" />
                                    {msg.tradeExecuted ? 'Orden Cargada en Terminal' : 'Ejecutar Operación'}
                                </button>
                             )}
                             {msg.role === 'model' && msg.content && !isLoading && isTradeUpdate(msg.content) && (
                                <button
                                    onClick={() => handleApplyTradeUpdate(msg)}
                                    disabled={msg.tradeUpdateApplied}
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                                >
                                    <PlusCircleIcon className="w-5 h-5" />
                                    {msg.tradeUpdateApplied ? 'Ajuste Aplicado' : 'Aplicar Ajuste de P/L'}
                                </button>
                             )}
                          </div>
                      </div>
                  ))}
                  <div ref={messagesEndRef} />
               </div>
            </main>
            <footer className="bg-slate-800/50 border-t border-slate-700 p-4 shadow-md flex-shrink-0">
               <Card className="max-w-4xl mx-auto bg-slate-800">
                   <CardContent className="p-4">
                      {imagePreview && (
                          <div className="relative mb-4 w-fit">
                              <img src={imagePreview} alt="Vista previa" className="max-h-40 rounded-md" />
                              <button
                                onClick={handleRemoveImage}
                                className="absolute top-1 right-1 bg-slate-900/70 rounded-full p-1 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label="Eliminar imagen"
                              >
                                  <XIcon className="w-4 h-4" />
                              </button>
                          </div>
                      )}
                      <div className="flex flex-wrap gap-2 mb-4">
                          {marketSuggestions.map(suggestion => (
                              <button key={suggestion} onClick={() => setPrompt(suggestion)} className="px-3 py-1 bg-slate-700 text-sm rounded-full hover:bg-slate-600 transition-colors">
                                  {suggestion}
                              </button>
                          ))}
                          {questionSuggestions.map(suggestion => (
                              <button key={suggestion} onClick={() => setPrompt(suggestion)} className="px-3 py-1 bg-slate-600 text-sm rounded-full hover:bg-slate-500 transition-colors">
                                  {suggestion}
                              </button>
                          ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-4">
                          <div className="flex-1 w-full lg:col-span-2">
                              <label htmlFor="market-input" className="block text-sm font-medium text-slate-400 mb-1">Mercado o Pregunta</label>
                              <input
                                  id="market-input"
                                  type="text"
                                  value={prompt}
                                  onChange={(e) => setPrompt(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                                  placeholder='ej., BTC/USD o haz una pregunta...'
                                  className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              />
                          </div>
                           <div className="flex-1 w-full">
                              <label htmlFor="timeframe-select" className="block text-sm font-medium text-slate-400 mb-1">Marco de tiempo</label>
                              <select
                                  id="timeframe-select"
                                  value={timeframe}
                                  onChange={(e) => setTimeframe(e.target.value)}
                                   className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                              >
                                  <option>próximos 15 minutos</option>
                                  <option>próxima hora</option>
                                  <option>próximas 4 horas</option>
                                  <option>final del día</option>
                                  <option>próximas 24 horas</option>
                              </select>
                          </div>
                           <div className="flex-1 w-full">
                                <label htmlFor="broker-select" className="block text-sm font-medium text-slate-400 mb-1">Broker</label>
                                <select
                                    id="broker-select"
                                    value={broker}
                                    onChange={(e) => setBroker(e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option>General</option>
                                    <option>XTB</option>
                                    <option>XM</option>
                                    <option>Binance</option>
                                    <option>Coinbase</option>
                                    <option>eToro</option>
                                </select>
                            </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4">
                           <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleImageChange}
                              accept="image/*"
                              className="hidden"
                          />
                          <button
                              onClick={() => fileInputRef.current?.click()}
                              className="self-end px-4 py-2 bg-slate-700 rounded-md text-white font-semibold hover:bg-slate-600 transition-colors"
                              aria-label="Adjuntar imagen"
                          >
                              <PaperclipIcon className="w-5 h-5" />
                          </button>
                          <button onClick={handleSendMessage} disabled={isLoading || (!prompt.trim() && !image)} className="flex-1 px-6 py-2 bg-cyan-500 rounded-md text-white font-semibold hover:bg-cyan-600 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                              {isLoading ? <Spinner /> : 'Analizar'}
                          </button>
                      </div>
                   </CardContent>
               </Card>
            </footer>
        </div>
        <aside className="w-1/3 max-w-sm bg-slate-950/50 border-l border-slate-700 flex flex-col">
            <TradingTerminal
                trades={executedTrades}
                currentOrder={currentOrder}
                onCloseTrade={handleCloseTrade}
                onConfirmOrder={handleConfirmOrder}
                onCancelOrder={() => setCurrentOrder(null)}
            />
        </aside>
    </div>
  );
};

export default App;
