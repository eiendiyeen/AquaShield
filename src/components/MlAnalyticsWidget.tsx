import React, { useState } from 'react';
import { Sparkles, Brain, Cpu, BarChart2, ShieldAlert, Sliders, Info, InfoIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function MlAnalyticsWidget() {
  // Simulator inputs for our neural network prediction
  const [upstreamRain, setUpstreamRain] = useState<number>(120); // in mm
  const [localRain, setLocalRain] = useState<number>(85); // in mm
  const [seaTide, setSeaTide] = useState<number>(180); // in cm

  // Calculate predicted general flood probability & height level
  const upstreamImpact = (upstreamRain / 200) * 45; // Max 45% weight
  const localImpact = (localRain / 150) * 35; // Max 35% weight
  const tideImpact = (seaTide / 250) * 20; // Max 20% weight

  const totalRiskPercentage = Math.min(100, Math.round(upstreamImpact + localImpact + tideImpact));

  let riskCategory = "Aman";
  let riskColor = "text-emerald-500 bg-emerald-50 border-emerald-100";
  let riskAlertText = "Seluruh indikator berada dalam batas wajar. Resiko banjir relatif rendah.";
  let riskAdvice = "Teruskan pemantauan berkala dan pastikan saluran air lokal terbebas dari sumbatan sampah.";

  if (totalRiskPercentage >= 80) {
    riskCategory = "Bencana / Ekstrem (Kritis)";
    riskColor = "text-red-600 bg-red-50 border-red-200";
    riskAlertText = "BAHAYA BESAR! Luapan air diprediksi merendam wilayah DKI Jakarta secara luas.";
    riskAdvice = "AKTIFKAN SIRENE EVAKUASI. Siapkan tim SAR di titik rawan bencana banjir Jakarta.";
  } else if (totalRiskPercentage >= 55) {
    riskCategory = "Waspada / Siaga Tinggi";
    riskColor = "text-orange-600 bg-orange-50 border-orange-200";
    riskAlertText = "RESIKO TINGGI! Air limpasan hulu segera masuk pintu air Manggarai dalam 3 jam.";
    riskAdvice = "Siapkan pompa penyedot mobile di wilayah bantaran Ciliwung dan koordinasi tim BPBD kelurahan.";
  } else if (totalRiskPercentage >= 30) {
    riskCategory = "Siaga Ringan / Waspada";
    riskColor = "text-yellow-600 bg-yellow-50 border-yellow-200";
    riskAlertText = "Kenaikan ketinggian air terdeteksi. Beberapa genangan dangkal mulai terbentuk.";
    riskAdvice = "Pastikan operator rumah pompa bersiaga mengaktifkan katup pengontrol pintu air.";
  }

  return (
    <div id="ml-analytics-widget" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
      {/* Title block */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Analitik Kecerdasan Buatan (AI / ML)
            <Brain className="w-5 h-5 text-secondary" />
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Eksplorasi simulator prediksi neural network (LSTM) mitigasi banjir Jakarta. Sesuaikan parameter meteorologi untuk memantau output AI.
          </p>
        </div>
      </div>

      {/* Main Two Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Sliders */}
        <div className="lg:col-span-5 space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-4.5 h-4.5 text-secondary" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Parameter Simulator Meteorologi</h3>
          </div>

          {/* Upstream Rainfall */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Curah Hujan Hulu (Katulampa)</span>
              <span className="font-mono text-secondary font-bold">{upstreamRain} mm</span>
            </div>
            <input
              type="range"
              min="10"
              max="250"
              step="5"
              value={upstreamRain}
              onChange={(e) => setUpstreamRain(Number(e.target.value))}
              className="w-full accent-secondary cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Hujan Ringan (&lt;50mm)</span>
              <span>Ekstrem (&gt;200mm)</span>
            </div>
          </div>

          {/* Local Rainfall */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Curah Hujan Lokal (Jakarta)</span>
              <span className="font-mono text-secondary font-bold">{localRain} mm</span>
            </div>
            <input
              type="range"
              min="10"
              max="180"
              step="5"
              value={localRain}
              onChange={(e) => setLocalRain(Number(e.target.value))}
              className="w-full accent-secondary cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Hujan Ringan</span>
              <span>Hujan Badai (&gt;150mm)</span>
            </div>
          </div>

          {/* Coastal Swell Tide */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Tinggi Pasang Air Laut (Teluk Jkt)</span>
              <span className="font-mono text-secondary font-bold">{seaTide} cm</span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="5"
              value={seaTide}
              onChange={(e) => setSeaTide(Number(e.target.value))}
              className="w-full accent-secondary cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>Surut (&lt;100cm)</span>
              <span>Banjir Rob (&gt;250cm)</span>
            </div>
          </div>

          <div className="text-[10px] bg-slate-100 text-slate-500 rounded-xl p-3 flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <p className="leading-normal">
              Neural network memproses tiga data utama di atas beserta trend histori muka air sungai guna meramalkan potensi banjir rob dan luapan banjir kiriman.
            </p>
          </div>
        </div>

        {/* Right Column: AI Output visualization & confidence metrics */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Calculated Flood risk Gauge */}
          <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-secondary" /> Output Model LSTM
              </span>
              <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full">
                Confidence: 94.2%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              {/* Radial gauge representing probability */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-slate-100"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="48"
                    className={totalRiskPercentage >= 80 ? 'stroke-red-500' : totalRiskPercentage >= 55 ? 'stroke-orange-500' : totalRiskPercentage >= 30 ? 'stroke-yellow-500' : 'stroke-emerald-400'}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - totalRiskPercentage / 100) }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-mono font-bold text-slate-800">{totalRiskPercentage}%</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">RISIKO</span>
                </div>
              </div>

              {/* Status and Action recommendation text details */}
              <div className="space-y-2 flex-1">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KATEGORI ANCAMAN</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold border mt-1 ${riskColor}`}>
                    {riskCategory}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  {riskAlertText}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">Rekomendasi BPBD:</strong> {riskAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Model feature importance / parameters distribution */}
          <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-secondary" /> Distribusi Bobot Prediktif (Feature Weights)
            </h4>

            <div className="space-y-3">
              {[
                { name: 'Curah Hujan Hulu (Katulampa Watershed)', weight: '45%', value: upstreamRain, max: 250, color: 'bg-indigo-500' },
                { name: 'Curah Hujan Lokal (Urban Runoff Jakarta)', weight: '35%', value: localRain, max: 180, color: 'bg-emerald-400' },
                { name: 'Tinggi Pasang Air Laut (Banjir Rob Barrier)', weight: '20%', value: seaTide, max: 300, color: 'bg-sky-400' }
              ].map((feat) => {
                const fillPct = Math.round((feat.value / feat.max) * 100);
                return (
                  <div key={feat.name} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">{feat.name}</span>
                      <span className="font-mono text-slate-800 font-bold">{feat.weight} (W)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <motion.div
                        className={`h-full rounded-full ${feat.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${fillPct}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
