import React, { useState } from 'react';
import { Sparkles, TrendingUp, HelpCircle, Flame, Droplet, ArrowRightLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface PredictionsWidgetProps {
  selectedSensorName: string;
  currentLevel: number;
}

export default function PredictionsWidget({ selectedSensorName, currentLevel }: PredictionsWidgetProps) {
  const [rainScenario, setRainScenario] = useState<'low' | 'medium' | 'heavy' | 'extreme'>('heavy');

  // Dynamically adjust forecast values based on chosen rain scenario
  const getForecastData = () => {
    const hours = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    let multipliers = [1.02, 1.05, 1.12, 1.25, 1.38, 1.45]; // Default heavy

    if (rainScenario === 'low') {
      multipliers = [0.98, 0.95, 0.92, 0.88, 0.85, 0.82];
    } else if (rainScenario === 'medium') {
      multipliers = [1.01, 1.02, 1.04, 1.08, 1.12, 1.15];
    } else if (rainScenario === 'extreme') {
      multipliers = [1.05, 1.15, 1.32, 1.55, 1.78, 1.95];
    }

    return hours.map((h, i) => {
      const pred = Math.round(currentLevel * multipliers[i]);
      return {
        time: h,
        level: pred,
        isWarning: pred > 200
      };
    });
  };

  const forecast = getForecastData();
  const maxForecast = Math.max(...forecast.map(f => f.level));
  const latestLevel = forecast[forecast.length - 1].level;
  
  // Calculate trend message
  let trendText = "";
  let trendSeverity = "";
  if (rainScenario === 'low') {
    trendText = "Tren menunjukkan penurunan bertahap 3-5% per jam. Kondisi aliran sungai stabil terkendali.";
    trendSeverity = "success";
  } else if (rainScenario === 'medium') {
    trendText = "Tren fluktuatif ringan dengan kenaikan ~2% per jam. Tetap pantau indikator pintu air hilir.";
    trendSeverity = "warning";
  } else if (rainScenario === 'heavy') {
    trendText = "Tren menunjukkan kenaikan signifikan 15% per jam. Potensi banjir kiriman mulai pukul 18:30 WIB.";
    trendSeverity = "danger";
  } else {
    trendText = "TREN EKSTREM! Kenaikan ekstrim mencapai 35% per jam. Potensi limpasan tanggul dalam 2-3 jam kedepan!";
    trendSeverity = "critical";
  }

  return (
    <div id="ml-prediction-card" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
      {/* Header section with ML Title and Accuracy */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            Prediksi LSTM (ML)
            <Sparkles className="w-3.5 h-3.5 text-secondary" />
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Estimasi Ketinggian Air (6 Jam Kedepan)</p>
        </div>
        <div className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-[10px] font-bold text-right leading-none">
          <div className="text-[8px] font-medium text-sky-600/80 uppercase">ACCURACY</div>
          94.2%
        </div>
      </div>

      {/* Simulator Quick Toggles representing rainfall intensity */}
      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          SIMULASI CURAH HUJAN (INPUT LSTM MODEL)
        </span>
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'low', label: 'Ringan', color: 'hover:text-emerald-500' },
            { id: 'medium', label: 'Sedang', color: 'hover:text-yellow-500' },
            { id: 'heavy', label: 'Lebat', color: 'hover:text-orange-500' },
            { id: 'extreme', label: 'Ekstrem', color: 'hover:text-red-500' }
          ].map((scen) => (
            <button
              key={scen.id}
              onClick={() => setRainScenario(scen.id as any)}
              className={`text-[9px] font-semibold py-1 px-1.5 rounded transition-all capitalize border ${rainScenario === scen.id ? 'bg-secondary text-white border-secondary shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'}`}
            >
              {scen.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sparkline / Bar Chart Representing the Forecast */}
      <div className="pt-2">
        <div className="h-28 flex items-end justify-between gap-1.5 px-1 relative">
          {/* Threshold Alert Line representation */}
          <div className="absolute left-0 right-0 top-1/3 border-t border-dashed border-red-300/60 z-0 flex justify-between items-center px-1">
            <span className="text-[8px] font-semibold font-mono text-red-500/70 bg-white/90 px-1 rounded">Batas Bahaya (200cm)</span>
          </div>
          
          {forecast.map((f, idx) => {
            // Calculate height percentage based on max value to fit beautifully
            const barHeight = `${Math.min(95, (f.level / 350) * 100)}%`;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 z-10 group/bar">
                {/* Level popup value */}
                <span className={`text-[9px] font-mono font-bold opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-900 text-white rounded px-1 absolute mb-14 translate-y-[-10px] shadow-md pointer-events-none`}>
                  {f.level} cm
                </span>
                
                {/* Dynamic Bar */}
                <div className="w-full relative h-20 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: barHeight }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                    className={`w-full rounded-t-md transition-colors ${f.level >= 200 ? 'bg-gradient-to-t from-red-500 to-orange-400' : f.level >= 150 ? 'bg-gradient-to-t from-orange-400 to-yellow-400' : 'bg-gradient-to-t from-sky-400 to-secondary-container'}`}
                  />
                </div>

                {/* Time Indicator */}
                <span className="text-[9px] font-mono text-slate-400 font-medium">
                  {f.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation alert box exact style as the design */}
      <div className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${trendSeverity === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-950' : trendSeverity === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-950' : trendSeverity === 'danger' ? 'bg-red-50 border-red-100 text-red-950' : 'bg-rose-100 border-rose-200 text-rose-950'}`}>
        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${trendSeverity === 'success' ? 'bg-emerald-500/15 text-emerald-600' : trendSeverity === 'warning' ? 'bg-yellow-500/15 text-yellow-600' : trendSeverity === 'danger' ? 'bg-red-500/15 text-red-600' : 'bg-rose-500/15 text-rose-700'}`}>
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-bold leading-snug">
            {rainScenario === 'extreme' ? 'ALARM BAHAYA!' : 'Peringatan & Analisis Prediktif'}
          </p>
          <p className="text-[11px] leading-relaxed text-slate-600">
            {trendText}
          </p>
        </div>
      </div>
    </div>
  );
}
