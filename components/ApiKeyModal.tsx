
import React, { useState } from 'react';
import { Spinner } from './ui/Spinner';

interface ApiKeyModalProps {
    onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
    const [inputKey, setInputKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputKey.trim()) {
            setError('CRITICAL: API Key required for system access.');
            return;
        }
        if (!inputKey.startsWith('AIza')) {
            setError('WARNING: Invalid key format detected.');
            return;
        }
        onSave(inputKey.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            
            <div className="relative w-full max-w-md p-8 bg-slate-900/80 border border-slate-700 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
                {/* Decorative Elements */}
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-500"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-500"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-500"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-500"></div>

                <div className="text-center mb-8 space-y-2">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)] mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Crypto Sniper <span className="text-cyan-400">Pro</span></h2>
                    <p className="text-slate-400 text-sm">Autenticación requerida para acceder al análisis institucional.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest ml-1">Google Gemini API Key</label>
                        <div className="relative group">
                            <input
                                type="password"
                                value={inputKey}
                                onChange={(e) => {
                                    setInputKey(e.target.value);
                                    setError('');
                                }}
                                placeholder="Pegar clave aquí (AIza...)"
                                className="w-full bg-slate-950 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-mono text-sm shadow-inner placeholder:text-slate-600"
                            />
                            <div className="absolute inset-0 rounded-lg bg-cyan-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                        </div>
                        {error && (
                            <div className="text-red-400 text-xs font-mono flex items-center gap-2 animate-pulse">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold py-3 rounded-lg shadow-lg shadow-cyan-900/20 transition-all transform active:scale-[0.98] uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                    >
                        Inicializar Sistema
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-cyan-400 transition-colors border-b border-transparent hover:border-cyan-400/50 pb-0.5"
                    >
                        ¿No tienes una API Key? Consíguela aquí gratis
                    </a>
                </div>
            </div>
        </div>
    );
};
