import React, { useState } from 'react';
import { AlertLog } from '../types';
import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, PlusCircle, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlertLogsWidgetProps {
  logs: AlertLog[];
  onAddLog: (title: string, description: string, severity: 'high' | 'medium' | 'low' | 'success') => void;
}

export default function AlertLogsWidget({ logs, onAddLog }: AlertLogsWidgetProps) {
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSeverity, setFormSeverity] = useState<'high' | 'medium' | 'low' | 'success'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;
    onAddLog(formTitle, formDesc, formSeverity);
    setFormTitle('');
    setFormDesc('');
    setShowForm(false);
  };

  // Pre-configured trigger templates for testing simulation
  const triggerSimulation = (type: 'siren' | 'weather' | 'pump') => {
    if (type === 'siren') {
      onAddLog(
        'Siren Aktif - Manggarai',
        'Siren evakuasi diaktifkan secara manual di wilayah Pintu Air Manggarai akibat limpasan kritis.',
        'high'
      );
    } else if (type === 'weather') {
      onAddLog(
        'Awan Konvektif Ekstrem',
        'Analisis radar menunjukkan konsentrasi hujan ekstrem di atas wilayah Depok menuju Jakarta Selatan.',
        'medium'
      );
    } else {
      onAddLog(
        'Pompa Mobile Aktif',
        'Dua unit pompa mobile tambahan tiba di Kampung Melayu untuk mempercepat penyedotan genangan.',
        'success'
      );
    }
  };

  return (
    <div id="alerts-widget-container" className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
      {/* Header section with trigger options */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            Detail Peringatan Dini
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">EWS Real-time & Protokol Evakuasi</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="text-[10px] font-bold text-primary hover:text-primary-light flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Lapor Log
          </button>
        </div>
      </div>

      {/* Simulator quick event generator panels */}
      <div className="mb-3.5 grid grid-cols-3 gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100/60">
        <button 
          onClick={() => triggerSimulation('siren')}
          className="text-[8px] font-bold text-red-700 bg-white hover:bg-red-50 border border-red-100 py-1 rounded flex items-center justify-center gap-1 transition-all"
        >
          <Volume2 className="w-2.5 h-2.5 animate-bounce" />
          Siren 
        </button>
        <button 
          onClick={() => triggerSimulation('weather')}
          className="text-[8px] font-bold text-orange-700 bg-white hover:bg-orange-50 border border-orange-100 py-1 rounded flex items-center justify-center gap-1 transition-all"
        >
          <AlertTriangle className="w-2.5 h-2.5" />
          Cuaca
        </button>
        <button 
          onClick={() => triggerSimulation('pump')}
          className="text-[8px] font-bold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-100 py-1 rounded flex items-center justify-center gap-1 transition-all"
        >
          <CheckCircle2 className="w-2.5 h-2.5" />
          Pompa
        </button>
      </div>

      {/* Quick Manual Log Submission form */}
      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5 overflow-hidden"
          >
            <div className="text-xs font-bold text-slate-700">Submit New Alert Event</div>
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Judul Kejadian (e.g., Tanggul Jebol)"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-secondary text-slate-700"
                required
              />
              <textarea 
                placeholder="Deskripsi singkat & rekomendasi aksi..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-secondary h-12 text-slate-700"
                required
              />
              <div className="flex justify-between items-center">
                <select
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value as any)}
                  className="text-[10px] bg-white border border-slate-200 rounded px-1.5 py-1 focus:outline-none text-slate-600"
                >
                  <option value="high">Kritis (Merah)</option>
                  <option value="medium">Waspada (Orange)</option>
                  <option value="low">Info (Biru)</option>
                  <option value="success">Normal (Hijau)</option>
                </select>
                <div className="flex gap-1.5">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="text-[10px] bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="text-[10px] bg-secondary text-white px-2.5 py-1 rounded hover:bg-secondary/95"
                  >
                    Kirim
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Feed list of Alert events */}
      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {logs.map((log) => {
            // Mapping colors to match the exact design left-border highlight
            const borderColors = {
              high: 'border-l-4 border-l-red-500',
              medium: 'border-l-4 border-l-orange-500',
              low: 'border-l-4 border-l-sky-500',
              success: 'border-l-4 border-l-emerald-500'
            };

            const severityBg = {
              high: 'bg-red-50/50 hover:bg-red-50',
              medium: 'bg-orange-50/50 hover:bg-orange-50',
              low: 'bg-sky-50/50 hover:bg-sky-50',
              success: 'bg-emerald-50/50 hover:bg-emerald-50'
            };

            const severityIcons = {
              high: <ShieldAlert className="w-3.5 h-3.5 text-red-600" />,
              medium: <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />,
              low: <Bell className="w-3.5 h-3.5 text-sky-600" />,
              success: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            };

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -15, y: -5 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className={`p-3.5 rounded-r-xl border-y border-r border-slate-100 transition-colors ${borderColors[log.severity]} ${severityBg[log.severity]} flex flex-col gap-1`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {severityIcons[log.severity]}
                    {log.title}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-slate-500">{log.time}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  {log.description}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
