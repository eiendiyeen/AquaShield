import React, { useState } from 'react';
import { Sensor } from '../types';
import { MapPin, Search, ZoomIn, ZoomOut, Compass, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MapWidgetProps {
  sensors: Sensor[];
  selectedSensor: Sensor | null;
  onSelectSensor: (sensor: Sensor) => void;
  showHeatmap: boolean;
  onToggleHeatmap: (show: boolean) => void;
}

export default function MapWidget({
  sensors,
  selectedSensor,
  onSelectSensor,
  showHeatmap,
  onToggleHeatmap
}: MapWidgetProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('Semua');

  // Interactive zoom in/out handler
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setMapCenter({ x: 0, y: 0 });
  };

  // Sensor search filter
  const filteredSensorsForMap = sensors.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.river.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // High-risk calculation for affected regions based on current levels
  const getAffectedRegions = () => {
    const regionScores: { [key: string]: { total: number; count: number; maxStatus: string } } = {};
    
    sensors.forEach(s => {
      let score = 0;
      if (s.status === 'Critical') score = 95;
      else if (s.status === 'Siaga') score = 75;
      else if (s.status === 'Waspada') score = 45;
      else score = 15;

      const reg = s.region;
      if (!regionScores[reg]) {
        regionScores[reg] = { total: 0, count: 0, maxStatus: s.status };
      }
      regionScores[reg].total += score;
      regionScores[reg].count += 1;
      if (
        (s.status === 'Critical') ||
        (s.status === 'Siaga' && regionScores[reg].maxStatus !== 'Critical') ||
        (s.status === 'Waspada' && regionScores[reg].maxStatus !== 'Critical' && regionScores[reg].maxStatus !== 'Siaga')
      ) {
        regionScores[reg].maxStatus = s.status;
      }
    });

    return Object.entries(regionScores).map(([name, data]) => ({
      name,
      percentage: Math.round(data.total / data.count),
      status: data.maxStatus
    })).sort((a, b) => b.percentage - a.percentage);
  };

  const affectedRegions = getAffectedRegions();

  return (
    <div id="map-container-card" className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl min-h-[460px] flex flex-col h-full group">
      {/* Top Map Action Bar */}
      <div id="map-action-bar" className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 items-center justify-between">
        {/* Heatmap Toggle Selector & Legend */}
        <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 flex items-center gap-4 text-xs shadow-lg">
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => onToggleHeatmap(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
              <span className="ml-2 font-medium text-slate-200">Risk Heatmap</span>
            </label>
          </div>
          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-ping absolute opacity-75"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block relative"></span>
              Tinggi
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
              Sedang
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
              Aman
            </span>
          </div>
        </div>

        {/* Map Search input */}
        <div className="relative max-w-xs w-full sm:w-auto">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Cari sensor peta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 pl-9 pr-3 py-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-full text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary shadow-lg placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Interactive Map Visual Layer */}
      <div 
        id="jakarta-visual-map" 
        className="relative flex-1 bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ minHeight: '380px' }}
      >
        {/* Stylized background satellite/contour map grid */}
        <div 
          className="absolute inset-0 transition-transform duration-300 ease-out"
          style={{ 
            transform: `scale(${zoomLevel}) translate(${mapCenter.x}px, ${mapCenter.y}px)`,
            backgroundImage: `radial-gradient(circle at 50% 50%, #0c1935 0%, #030712 100%)`
          }}
        >
          {/* Cyberpunk Map Coordinates Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-25" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <radialGradient id="ocean-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#030712" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Outline of Jakarta Bay Coastline (aesthetic stylized line) */}
            <path d="M 0 100 Q 150 90, 300 120 T 600 80 T 900 130 T 1200 90 L 1200 0 L 0 0 Z" fill="url(#ocean-glow)" stroke="#0f172a" strokeWidth="2" opacity="0.8" />
          </svg>

          {/* Simulated Rivers flowing down through Jakarta */}
          <svg className="absolute inset-0 w-full h-full opacity-45 pointer-events-none">
            {/* Ciliwung River Stream */}
            <path 
              d="M 600 600 Q 560 450, 580 320 T 550 180 T 520 80" 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth={showHeatmap ? "4" : "2.5"} 
              className={`transition-all duration-500 ${showHeatmap ? 'stroke-red-500/60 blur-[2px]' : 'stroke-sky-500'}`}
              strokeDasharray="4,4"
              strokeDashoffset="2"
            />
            {/* Pesanggrahan River Stream */}
            <path 
              d="M 380 600 Q 350 480, 320 380 T 360 220 T 300 80" 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="2" 
              className="stroke-sky-400"
            />
            {/* Angke River Stream */}
            <path 
              d="M 220 600 Q 240 450, 200 350 T 250 200 T 210 80" 
              fill="none" 
              stroke="#0ea5e9" 
              strokeWidth="1.5" 
              className="stroke-sky-400"
            />
          </svg>

          {/* Dynamic Interactive Heatmaps Glow (only if enabled) */}
          {showHeatmap && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Pluit/Ancol Heatmap Glow */}
              <div 
                className="absolute bg-gradient-to-r from-red-600/45 to-orange-500/35 blur-3xl rounded-full"
                style={{ top: '15%', left: '35%', width: '180px', height: '180px' }}
              />
              {/* Ciliwung / Manggarai Center Heatmap Glow */}
              <div 
                className="absolute bg-gradient-to-r from-red-500/40 to-orange-500/30 blur-2xl rounded-full"
                style={{ top: '42%', left: '48%', width: '150px', height: '150px' }}
              />
              {/* Kamp Melayu Heatmap Glow */}
              <div 
                className="absolute bg-red-600/35 blur-3xl rounded-full"
                style={{ top: '65%', left: '50%', width: '120px', height: '120px' }}
              />
            </div>
          )}

          {/* Sensor Hotspot Circles and Interactive Map Pins */}
          {filteredSensorsForMap.map((sensor) => {
            const isSelected = selectedSensor?.id === sensor.id;
            const statusColors = {
              Critical: 'text-red-500 bg-red-500',
              Siaga: 'text-orange-500 bg-orange-500',
              Waspada: 'text-yellow-500 bg-yellow-500',
              Aman: 'text-sky-400 bg-sky-400'
            };

            return (
              <div
                key={sensor.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20"
                style={{ 
                  left: `${sensor.coordinates.x}%`, 
                  top: `${sensor.coordinates.y}%`,
                }}
                onClick={() => onSelectSensor(sensor)}
              >
                {/* Dynamic radar wave indicator for alert sensors */}
                {sensor.status === 'Critical' && (
                  <span className="absolute -inset-4 w-12 h-12 rounded-full border-2 border-red-500/40 animate-ping opacity-75 pointer-events-none" />
                )}
                {sensor.status === 'Siaga' && (
                  <span className="absolute -inset-3 w-10 h-10 rounded-full border-2 border-orange-500/30 animate-pulse pointer-events-none" />
                )}

                {/* Pin Container */}
                <div 
                  className={`flex flex-col items-center group/pin ${isSelected ? 'scale-125' : 'hover:scale-110'} transition-transform duration-200`}
                >
                  {/* Tooltip Badge on hover or selection */}
                  <div className={`absolute bottom-full mb-2 bg-slate-950/95 text-slate-100 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] whitespace-nowrap pointer-events-none shadow-2xl transition-all ${isSelected ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 group-hover/pin:opacity-100 translate-y-1'}`}>
                    <div className="font-semibold flex items-center gap-1.5">
                      {sensor.name}
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusColors[sensor.status].split(' ')[1]}`}></span>
                    </div>
                    <div className="text-slate-400 flex justify-between gap-4 mt-0.5 font-mono">
                      <span>Ketinggian: {sensor.currentLevel} cm</span>
                      <span className="text-slate-500">{sensor.status}</span>
                    </div>
                  </div>

                  {/* Icon Pin representing Sensor type */}
                  <div className={`p-1.5 rounded-full border-2 shadow-lg transition-colors ${isSelected ? 'bg-secondary border-white' : 'bg-slate-950 border-slate-700'}`}>
                    <MapPin className={`w-4 h-4 ${statusColors[sensor.status].split(' ')[0]}`} />
                  </div>

                  {/* Miniature Label */}
                  <span className="mt-1 text-[9px] font-mono font-medium px-1.5 py-0.5 bg-slate-950/80 rounded border border-slate-800 text-slate-300 max-w-[90px] truncate text-center">
                    {sensor.name.split(' - ')[1] || sensor.name.split(' ')[2] || sensor.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Zoom & Map Orientation Controls */}
      <div id="map-controls" className="absolute right-4 bottom-4 z-10 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 flex items-center justify-center bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-lg shadow-xl transition-all"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 flex items-center justify-center bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-lg shadow-xl transition-all"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={handleResetZoom}
          className="w-10 h-10 flex items-center justify-center bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-lg shadow-xl transition-all"
          title="Reset View"
        >
          <Compass className="w-4 h-4 animate-spin-slow" />
        </button>
      </div>

      {/* Overlay Affected Regions Card - bottom left overlay styled exactly like the screenshot */}
      <div id="affected-regions-overlay" className="absolute bottom-4 left-4 z-10 max-w-[280px] w-full bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-semibold text-slate-200 tracking-wide">Wilayah Terdampak</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/30">
            CRITICAL
          </span>
        </div>
        
        <div className="space-y-3">
          {affectedRegions.slice(0, 3).map((reg) => {
            const barColors = {
              Critical: 'bg-red-500',
              Siaga: 'bg-orange-500',
              Waspada: 'bg-yellow-500',
              Aman: 'bg-sky-400'
            };

            const textColors = {
              Critical: 'text-red-400',
              Siaga: 'text-orange-400',
              Waspada: 'text-yellow-400',
              Aman: 'text-sky-400'
            };

            return (
              <div key={reg.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">{reg.name}</span>
                  <span className={`font-mono font-bold ${textColors[reg.status as keyof typeof textColors] || 'text-slate-300'}`}>
                    {reg.percentage}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${reg.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full ${barColors[reg.status as keyof typeof barColors] || 'bg-slate-500'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
