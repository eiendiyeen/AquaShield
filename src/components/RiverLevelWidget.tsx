import React from 'react';
import { Sensor } from '../types';
import { initialSensors, calculateStatus } from '../data';
import { Waves, TrendingUp, ShieldAlert, CheckCircle, Sliders, Settings2 } from 'lucide-react';
import { motion } from 'motion/react';

interface RiverLevelWidgetProps {
  sensors: Sensor[];
  selectedSensor: Sensor | null;
  onSelectSensor: (sensor: Sensor) => void;
  onUpdateSensorLevel: (id: string, level: number) => void;
}

export default function RiverLevelWidget({
  sensors,
  selectedSensor,
  onSelectSensor,
  onUpdateSensorLevel
}: RiverLevelWidgetProps) {

  return (
    <div id="river-level-widget" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
      {/* Title block with helper explanation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Status Tinggi Muka Air & Aliran Sungai
            <Waves className="w-5 h-5 text-secondary" />
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap pos pantau sensor ultrasonik aliran sungai DKI Jakarta. Sesuaikan slider tinggi air untuk simulasi EWS.
          </p>
        </div>
      </div>

      {/* Grid of waterways */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sensors.map((sensor) => {
          const isSelected = selectedSensor?.id === sensor.id;
          
          // Color styles depending on level
          const statusConfig = {
            Critical: {
              bg: 'bg-red-50 border-red-200 text-red-950',
              badge: 'bg-red-600 text-white',
              bar: 'bg-red-500',
              text: 'text-red-600',
              icon: <ShieldAlert className="w-4.5 h-4.5 text-red-600 animate-pulse" />
            },
            Siaga: {
              bg: 'bg-orange-50 border-orange-200 text-orange-950',
              badge: 'bg-orange-500 text-white',
              bar: 'bg-orange-500',
              text: 'text-orange-600',
              icon: <ShieldAlert className="w-4.5 h-4.5 text-orange-600" />
            },
            Waspada: {
              bg: 'bg-yellow-50 border-yellow-200 text-yellow-950',
              badge: 'bg-yellow-500 text-slate-900',
              bar: 'bg-yellow-500',
              text: 'text-yellow-600',
              icon: <ShieldAlert className="w-4.5 h-4.5 text-yellow-600" />
            },
            Aman: {
              bg: 'bg-slate-50 border-slate-200 text-slate-950',
              badge: 'bg-sky-500 text-white',
              bar: 'bg-sky-400',
              text: 'text-sky-600',
              icon: <CheckCircle className="w-4.5 h-4.5 text-sky-500" />
            }
          };

          const config = statusConfig[sensor.status] || statusConfig.Aman;
          const pct = Math.min(100, Math.round((sensor.currentLevel / sensor.alertLevel1) * 100));

          return (
            <motion.div
              key={sensor.id}
              whileHover={{ y: -3 }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${isSelected ? 'ring-2 ring-secondary bg-white border-transparent' : config.bg}`}
              onClick={() => onSelectSensor(sensor)}
            >
              {/* Header with name & status badge */}
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{sensor.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide shrink-0 ${config.badge}`}>
                    {sensor.status === 'Critical' ? 'SIAGA I / AWAS' : sensor.status === 'Siaga' ? 'SIAGA II' : sensor.status === 'Waspada' ? 'SIAGA III' : 'NORMAL'}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Aliran: {sensor.river}</span>
                  <span>{sensor.region}</span>
                </div>
              </div>

              {/* Water Level Reading */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KETINGGIAN AIR</div>
                  <div className="text-2xl font-mono font-bold text-slate-800 mt-0.5 flex items-baseline gap-1">
                    {sensor.currentLevel}
                    <span className="text-xs font-normal text-slate-500">cm</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KAPASITAS TANGGUL</div>
                  <div className={`text-base font-mono font-bold mt-0.5 ${config.text}`}>
                    {pct}%
                  </div>
                </div>
              </div>

              {/* Graphical bar indicator */}
              <div className="h-2 w-full bg-slate-200/60 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${config.bar}`} style={{ width: `${pct}%` }} />
              </div>

              {/* Dynamic Threshold Limits detail */}
              <div className="bg-white/80 border border-slate-100/40 p-2.5 rounded-xl space-y-1 text-[10px] text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Batas Normal (Aman):</span>
                  <span className="font-mono text-slate-700 font-bold">&lt; {sensor.alertLevel3} cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Siaga III (Waspada):</span>
                  <span className="font-mono text-yellow-600 font-bold">&ge; {sensor.alertLevel3} cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Siaga II (Siaga):</span>
                  <span className="font-mono text-orange-600 font-bold">&ge; {sensor.alertLevel2} cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Siaga I (Critical/Awas):</span>
                  <span className="font-mono text-red-600 font-bold">&ge; {sensor.alertLevel1} cm</span>
                </div>
              </div>

              {/* Interactivity: Level adjustments slider */}
              <div 
                className="pt-2 border-t border-slate-100/60 flex flex-col gap-1"
                onClick={(e) => e.stopPropagation()} // Prevent clicking parent container on slider slide
              >
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3" /> Simulasikan Ketinggian:
                  </span>
                  <span className="font-mono text-slate-800">{sensor.currentLevel} cm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="350"
                  step="5"
                  value={sensor.currentLevel}
                  onChange={(e) => onUpdateSensorLevel(sensor.id, Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
