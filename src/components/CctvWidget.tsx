import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Volume2, VolumeX, Radio, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CctvWidgetProps {
  selectedSensorName: string;
}

export default function CctvWidget({ selectedSensorName }: CctvWidgetProps) {
  const [timestamp, setTimestamp] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [noiseLevel, setNoiseLevel] = useState<number>(1);
  const [cctvChannel, setCctvChannel] = useState<string>('CAM-01 (Gate Outlet)');

  // Maintain ticking CCTV time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });
      const dateStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
      setTimestamp(`${dateStr} ${timeStr}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulating random interference / static noise spikes
  useEffect(() => {
    const noiseTimer = setInterval(() => {
      setNoiseLevel(Math.random() > 0.85 ? 3 : 1);
      setTimeout(() => setNoiseLevel(1), 150);
    }, 4000);
    return () => clearInterval(noiseTimer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div id="cctv-stream-container" className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg flex flex-col group/cctv">
      {/* CCTV Header info */}
      <div className="px-4 py-3 bg-slate-950 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          <span className="text-xs font-semibold text-slate-200">LIVE FEED</span>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={cctvChannel}
            onChange={(e) => setCctvChannel(e.target.value)}
            className="text-[10px] bg-slate-900 text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-secondary cursor-pointer"
          >
            <option value="CAM-01 (Gate Outlet)">CAM-01 (Gate Outlet)</option>
            <option value="CAM-02 (Upstream Inlet)">CAM-02 (Upstream Inlet)</option>
            <option value="CAM-03 (Siren & Mast)">CAM-03 (Siren & Mast)</option>
          </select>
          <button 
            onClick={handleRefresh}
            className={`text-slate-400 hover:text-white transition-all p-1 hover:bg-slate-800 rounded ${isRefreshing ? 'animate-spin' : ''}`}
            title="Refresh Stream"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Simulated Live Camera Stream Area */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {/* Stream Overlays */}
        <div className="absolute inset-0 z-10 pointer-events-none p-3 flex flex-col justify-between text-emerald-500 font-mono text-[10px]">
          {/* Top Info line */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold tracking-wider">{cctvChannel}</span>
              <span className="text-emerald-500/80">LOC: {selectedSensorName || 'DKI JAKARTA'}</span>
              <span className="text-emerald-500/80">FPS: 29.97 (NTSC)</span>
            </div>
            <div className="text-right">
              <span>{timestamp}</span>
              <div className="text-emerald-500/60 mt-0.5">SYS: ACTIVE [OK]</div>
            </div>
          </div>

          {/* Central Grid overlays & Crosshair representing camera metrics */}
          <div className="absolute inset-0 flex items-center justify-center opacity-40">
            <div className="w-8 h-8 border border-emerald-500 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </div>
            <div className="absolute h-10 w-[0.5px] bg-emerald-500" />
            <div className="absolute w-10 h-[0.5px] bg-emerald-500" />
          </div>

          {/* Bottom Info line (Water Level gauge simulation on the right wall) */}
          <div className="flex justify-between items-end mt-auto">
            <div className="bg-black/40 px-1.5 py-0.5 rounded text-[9px] border border-emerald-500/20 text-emerald-400">
              HD Auto-Focus
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="h-20 w-8 border-l border-emerald-500/30 flex flex-col justify-between text-[8px] pl-1">
                <span className="flex items-center gap-1">H: 3.0m <span className="w-1 h-[0.5px] bg-emerald-500"></span></span>
                <span className="flex items-center gap-1 text-yellow-500">W: 2.0m <span className="w-1 h-[0.5px] bg-yellow-500"></span></span>
                <span className="flex items-center gap-1 text-red-500">C: 1.0m <span className="w-1 h-[0.5px] bg-red-500"></span></span>
              </div>
              <span className="font-semibold text-emerald-400">GAUGE IND: +1.84m</span>
            </div>
          </div>
        </div>

        {/* Dynamic Static Noise overlay based on state */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-screen"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            transform: `scale(${noiseLevel})`
          }}
        />

        {/* Moving scanlines across the CCTV Feed */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] z-20" />

        {/* CCTV video graphic background - Simulated flowing water near dam using CSS waves */}
        <div className="absolute inset-0 flex flex-col justify-end bg-slate-950 overflow-hidden">
          {/* Sluice Gate structure outline */}
          <div className="absolute inset-x-0 top-0 h-[60%] border-b-4 border-slate-800 bg-slate-900/60 flex items-center justify-around px-10">
            <div className="w-8 h-full bg-slate-800 border-x border-slate-700 flex flex-col justify-end">
              <div className="h-10 bg-slate-950 w-full" />
            </div>
            <div className="w-12 h-full bg-slate-900 border-x border-slate-700 flex flex-col justify-end">
              <div className="h-16 bg-slate-950 w-full" />
            </div>
            <div className="w-8 h-full bg-slate-800 border-x border-slate-700 flex flex-col justify-end">
              <div className="h-10 bg-slate-950 w-full" />
            </div>
          </div>

          {/* Flowing Water Level waves */}
          <div className="relative h-[45%] w-full bg-sky-950/80 overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 top-2 bg-sky-900/40"></div>
            {/* Animated SVG Wave 1 */}
            <svg className="absolute bottom-0 w-full h-16 text-sky-700/50 fill-current animate-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1350,20 1500,60 L1500,120 L0,120 Z"></path>
            </svg>
            {/* Animated SVG Wave 2 */}
            <svg className="absolute bottom-0 w-full h-12 text-sky-800/60 fill-current animate-wave" style={{ animationDelay: '1.5s', animationDuration: '4s' }} viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,50 C100,20 300,80 500,50 C700,20 900,80 1100,50 L1100,120 L0,120 Z"></path>
            </svg>
            {/* Swirling white water bubbles at bottom */}
            <div className="absolute bottom-1 left-1/4 w-3 h-3 bg-white/30 rounded-full blur-[1px] animate-ping" />
            <div className="absolute bottom-2 right-1/3 w-2 h-2 bg-white/20 rounded-full blur-[1px] animate-ping" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Loading/Refreshing overlay indicator */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 z-30 flex flex-col items-center justify-center gap-2"
            >
              <RefreshCw className="w-8 h-8 text-secondary animate-spin" />
              <span className="text-xs font-mono text-slate-400">MEMULIHKAN SINYAL CCTV...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CCTV Bottom controller buttons */}
      <div className="px-3 py-2 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/40">
        <span className="flex items-center gap-1 text-emerald-500/95 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          KONEKSI ENKRIPSI AES-256
        </span>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="hover:text-white flex items-center gap-1 transition-all"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                Mute
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                Audio
              </>
            )}
          </button>
          <div className="w-[1px] h-3 bg-slate-800" />
          <button className="hover:text-white flex items-center gap-1 transition-all" title="Full Screen View">
            <Maximize2 className="w-3 h-3" />
            Fit
          </button>
        </div>
      </div>
    </div>
  );
}
