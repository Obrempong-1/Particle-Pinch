import React, { useState } from 'react';
import { ParticleConfig } from '../types';
import { TEMPLATES } from '../constants';
import { generateParticleConfig } from '../services/geminiService';
import { Sparkles, Loader2, Hand, Wand2, Palette, Sliders, AlertTriangle, Menu, X, Settings2 } from 'lucide-react';

interface InterfaceProps {
  currentConfig: ParticleConfig;
  onConfigChange: (config: ParticleConfig) => void;
  hasApiKey: boolean;
  onSetApiKey: (key: string) => void;
}

const Interface: React.FC<InterfaceProps> = ({ currentConfig, onConfigChange, hasApiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);

  const handleTemplateClick = (key: string) => {
    onConfigChange(TEMPLATES[key]);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ ...currentConfig, color: e.target.value });
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ ...currentConfig, count: parseInt(e.target.value, 10) });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const newConfig = await generateParticleConfig(prompt);
      onConfigChange(newConfig);
      if (window.innerWidth < 768) setShowControls(false);
    } catch (err) {
      setError("Failed to generate. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between overflow-hidden">
      <div className="flex justify-between items-start pointer-events-auto p-4 md:p-6 w-full z-50">
        <div className="bg-black/60 backdrop-blur-xl p-3 md:p-5 rounded-2xl border border-white/10 text-white shadow-2xl flex flex-col gap-1">
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
                <Sparkles size={20} className="text-purple-400 md:w-6 md:h-6" />
                <span className="hidden md:inline">Obrempong Flow</span>
                
                
                <span className="md:hidden">Obrempong</span>
            </h1>
            
            
            <div className="space-y-1 text-xs md:text-sm text-gray-400 mt-2">
                <div className="flex items-center gap-2">
                    <Hand size={14} className="shrink-0" />
                    <span>Open hand to <b>Expel</b></span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-gray-500 rounded-full shrink-0"></div>
                    <span>Pinch to <b>Attract</b></span>
                </div>
            </div>
        </div>

        
        <button 
            onClick={() => setShowControls(!showControls)}
            className="md:hidden bg-black/60 backdrop-blur-xl p-3 rounded-xl border border-white/10 text-white shadow-2xl active:scale-95 transition-transform"
        >
            {showControls ? <X size={24} /> : <Settings2 size={24} />}
        </button>
      </div>


      <div className={`
            pointer-events-auto 
            fixed md:absolute 
            bottom-0 md:bottom-6 right-0 md:right-6 
            w-full md:w-[380px] md:max-w-sm 
            bg-black/80 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none
            rounded-t-3xl md:rounded-none
            transition-transform duration-300 ease-in-out z-40
            ${showControls ? 'translate-y-0' : 'translate-y-[100%] md:translate-y-0'}
            flex flex-col gap-3 md:gap-4 p-5 md:p-0
            max-h-[80dvh] overflow-y-auto
      `}>
        
       
        <div className="md:hidden w-12 h-1 bg-white/20 rounded-full mx-auto mb-2" />

        <div className="bg-black/40 md:bg-black/60 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-white/10 text-white shadow-2xl relative overflow-hidden shrink-0">
             <div className="flex items-center gap-2 mb-3 md:mb-4 text-sm font-semibold text-purple-300">
                <Wand2 size={18} />
                <span>AI Particle Gen</span>
             </div>
             
             {!hasApiKey ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-200 text-xs flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-bold">
                        <AlertTriangle size={14} /> API Key Missing
                    </div>
                    <p>Check console/code for setup.</p>
                </div>
             ) : (
                 <>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. fiery explosion" 
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 md:py-2 text-base md:text-sm w-full focus:outline-none focus:border-purple-500 transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button 
                            onClick={handleGenerate}
                            disabled={loading}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 rounded-lg px-4 flex items-center justify-center transition-all shadow-lg min-w-[50px]"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                 </>
             )}
        </div>

        <div className="bg-black/40 md:bg-black/60 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-white/10 text-white shadow-2xl shrink-0 pb-8 md:pb-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2">
                <Palette size={16} /> Presets & Settings
            </h3>
            
            <div className="grid grid-cols-2 xs:grid-cols-4 md:grid-cols-2 gap-2 md:gap-3 mb-5">
                {Object.keys(TEMPLATES).map(key => (
                    <button 
                        key={key}
                        onClick={() => handleTemplateClick(key)}
                        className="px-2 py-3 md:px-4 text-[10px] md:text-xs font-medium rounded-lg bg-white/5 hover:bg-white/15 border border-white/5 hover:border-white/20 transition-all text-center md:text-left uppercase tracking-wider truncate"
                    >
                        {key}
                    </button>
                ))}
            </div>
            
            <div className="space-y-5 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Base Color</span>
                    <div className="relative group">
                        <div 
                            className="w-10 h-10 md:w-8 md:h-8 rounded-full border-2 border-white/20 shadow-inner group-hover:border-white/40 transition-colors"
                            style={{ backgroundColor: currentConfig.color }}
                        ></div>
                        <input 
                            type="color" 
                            value={currentConfig.color} 
                            onChange={handleColorChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400 flex items-center gap-2">
                            <Sliders size={14} /> Count
                        </span>
                        <span className="text-xs font-mono text-cyan-400">{currentConfig.count}</span>
                    </div>
                    <input 
                        type="range" 
                        min="1000" 
                        max="10000" 
                        step="100"
                        value={currentConfig.count} 
                        onChange={handleCountChange}
                        className="w-full h-2 md:h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:bg-white/30 transition-colors touch-none"
                    />
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Interface;