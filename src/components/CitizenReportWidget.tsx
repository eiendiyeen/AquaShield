import React, { useState } from 'react';
import { CitizenReport } from '../types';
import { MessageSquare, Users, ThumbsUp, AlertCircle, PlusCircle, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CitizenReportWidgetProps {
  reports: CitizenReport[];
  onAddReport: (title: string, reporter: string, location: string, depth: number, description: string) => void;
  onUpvoteReport: (id: string) => void;
}

export default function CitizenReportWidget({ reports, onAddReport, onUpvoteReport }: CitizenReportWidgetProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [reporter, setReporter] = useState('');
  const [location, setLocation] = useState('');
  const [depth, setDepth] = useState<number>(30);
  const [desc, setDesc] = useState('');

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reporter.trim() || !location.trim() || !desc.trim()) return;

    onAddReport(title, reporter, location, depth, desc);

    // Reset Form
    setTitle('');
    setLocation('');
    setDesc('');
    setShowForm(false);
  };

  return (
    <div id="citizen-reports-widget" className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
      {/* Title block with stat overview */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Laporan & Pengaduan Warga (Crowdsourced)
            <Users className="w-5 h-5 text-secondary" />
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Laporan banjir langsung dari warga Jakarta dan petugas di lapangan.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-secondary text-white rounded-full text-xs font-bold hover:bg-secondary/95 flex items-center gap-1.5 transition-all shadow-md shadow-secondary/10"
        >
          <PlusCircle className="w-4 h-4" />
          Buat Laporan Warga
        </button>
      </div>

      {/* Citizen Report Form modal/inline */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            onSubmit={handleSubmitReport}
            className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 overflow-hidden"
          >
            <h3 className="text-sm font-bold text-slate-800">Formulir Laporan Banjir Warga</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500">NAMA PELAPOR</label>
                <input
                  type="text"
                  placeholder="Nama Anda atau Instansi"
                  value={reporter}
                  onChange={(e) => setReporter(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-secondary text-slate-700 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500">LOKASI BANJIR / GENANGAN</label>
                <input
                  type="text"
                  placeholder="Nama jalan, RT/RW, Kelurahan, Kecamatan"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-secondary text-slate-700 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500">JUDUL SINGKAT</label>
                <input
                  type="text"
                  placeholder="Contoh: Genangan Dapur, Luapan Drainase"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-secondary text-slate-700 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 flex justify-between">
                  <span>ESTIMASI KETINGGIAN AIR (CM)</span>
                  <span className="font-mono text-secondary font-bold">{depth} cm</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={depth}
                    onChange={(e) => setDepth(Number(e.target.value))}
                    className="w-full accent-secondary cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-500">DETAIL KRONOLOGI / KONDISI TERKINI</label>
              <textarea
                placeholder="Jelaskan kondisi air saat ini, apakah ada korban terisolir, penanganan posko terdekat, dsb."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 h-20 focus:outline-none focus:border-secondary text-slate-700 leading-relaxed"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-secondary hover:bg-secondary/95 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Kirim Laporan
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reports Feed */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto opacity-30 mb-2" />
            <p className="text-sm">Belum ada laporan warga untuk wilayah ini.</p>
          </div>
        ) : (
          reports.map((rep) => {
            // Determine badge colors based on status
            const statusStyle = {
              'Diverifikasi': 'bg-emerald-50 text-emerald-700 border-emerald-100',
              'Dalam Penanganan': 'bg-yellow-50 text-yellow-700 border-yellow-100',
              'Selesai': 'bg-sky-50 text-sky-700 border-sky-100'
            };

            const statusIcon = {
              'Diverifikasi': <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
              'Dalam Penanganan': <Clock className="w-3.5 h-3.5 text-yellow-600" />,
              'Selesai': <CheckCircle className="w-3.5 h-3.5 text-sky-600" />
            };

            return (
              <motion.div
                key={rep.id}
                layoutId={`report-card-${rep.id}`}
                className="p-5 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all"
              >
                <div className="space-y-2.5 flex-1">
                  {/* Metadata Header line */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${statusStyle[rep.status] || ''}`}>
                      {statusIcon[rep.status]}
                      {rep.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">{rep.timestamp}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Pelapor: <span className="font-semibold text-slate-700">{rep.reporter}</span></span>
                  </div>

                  {/* Title & Location details */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">{rep.title}</h3>
                    <p className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                      📍 Lokasi: <span className="text-slate-700 font-normal">{rep.location}</span>
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed text-slate-600">
                    {rep.description}
                  </p>
                </div>

                {/* Right Area: Depth Indicator & Upvote Controls */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-5 min-w-[120px]">
                  <div className="text-left sm:text-right">
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ketinggian Genangan</div>
                    <div className="text-lg font-mono font-bold text-red-600 leading-none mt-1">
                      {rep.depth} cm
                    </div>
                  </div>

                  <button
                    onClick={() => onUpvoteReport(rep.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 hover:border-secondary hover:text-secondary hover:bg-secondary/5 transition-all shadow-sm active:scale-95"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Sangat Mendesak ({rep.upvotes})
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
