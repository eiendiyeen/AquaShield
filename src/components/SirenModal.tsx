import React, { useState } from 'react';
import { Phone, ShieldAlert, Send, Check, X, Megaphone, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SirenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAlert: (title: string, desc: string, severity: 'high') => void;
}

export default function SirenModal({ isOpen, onClose, onTriggerAlert }: SirenModalProps) {
  const [targetRegion, setTargetRegion] = useState('Semua Wilayah Bantaran');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'PERINGATAN DINI BPBD: S. Ciliwung Katulampa mencapai SIAGA I (210cm). Aliran air diprediksi masuk wilayah bantaran Jakarta Selatan & Timur dalam 3-4 jam. Segera evakuasi mandiri!'
  );
  const [isSent, setIsSent] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    // Trigger on main dashboard alert log
    onTriggerAlert(
      `Broadcast Darurat: ${targetRegion}`,
      broadcastMessage,
      'high'
    );

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      onClose();
    }, 2000);
  };

  const toggleSirenSfx = () => {
    setIsSirenActive(!isSirenActive);
    // Play sound simulation if wanted or just visual indication
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100"
      >
        {/* Header */}
        <div className="bg-red-600 text-white p-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <div>
              <h2 className="font-bold text-base">Pusat Kontak & Broadcast Darurat</h2>
              <p className="text-xs text-red-100">Badan Penanggulangan Bencana Daerah (BPBD) DKI Jakarta</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6">
          {/* Quick Hotlines Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              HOTLINE DARURAT MITIGASI (PILIH UNTUK TELEPON)
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: 'Call Center Jakarta', number: '112', desc: 'Bebas Pulsa' },
                { name: 'Pusdalops BPBD', number: '021-3865632', desc: 'Posko Utama' },
                { name: 'SAR Nasional (BASARNAS)', number: '115', desc: 'Penyelamatan & Evakuasi' },
                { name: 'Ambulans AGD Dinkes', number: '118', desc: 'Gawat Darurat Medis' },
                { name: 'Pemadam Kebakaran', number: '113', desc: 'Pompa & Penyelamatan' },
                { name: 'PMI DKI Jakarta', number: '021-3906666', desc: 'Bantuan Logistik' }
              ].map((contact) => (
                <a 
                  key={contact.number}
                  href={`tel:${contact.number}`}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-red-50 hover:border-red-200 border border-slate-100 rounded-xl transition-all group"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Simulasi menelepon: ${contact.name} (${contact.number})`);
                  }}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-800">{contact.name}</div>
                    <div className="text-[10px] text-slate-500">{contact.desc}</div>
                  </div>
                  <div className="p-2 bg-white rounded-full group-hover:bg-red-100 text-slate-700 group-hover:text-red-600 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Siren Sound simulation block */}
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between">
            <div className="flex gap-3">
              <div className="p-2.5 bg-orange-500/10 text-orange-600 rounded-full h-fit">
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-orange-950">Sirene Peringatan Evakuasi</div>
                <p className="text-[11px] text-orange-800 leading-normal">
                  Aktifkan sirene lapangan pada pos pantau Jakarta Selatan/Timur secara instan.
                </p>
              </div>
            </div>
            <button
              onClick={toggleSirenSfx}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSirenActive ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
            >
              {isSirenActive ? 'SIRENE AKTIF' : 'NYALAKAN SIRENE'}
            </button>
          </div>

          {/* Citizen Broadcast Alert Form */}
          <form onSubmit={handleSendBroadcast} className="space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              KIRIM BROADCAST SMS BROADCAST / KELUARGA
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">WILAYAH TUJUAN</label>
                <select 
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-700"
                >
                  <option value="Semua Wilayah Bantaran">Semua Wilayah Bantaran (Sungai Ciliwung & Pesanggrahan)</option>
                  <option value="Jakarta Selatan (Tebet, Kampung Melayu)">Jakarta Selatan (Tebet, Kampung Melayu, Pancoran)</option>
                  <option value="Jakarta Timur (Cawang, Kebon Pala)">Jakarta Timur (Cawang, Kebon Pala, Jatinegara)</option>
                  <option value="Jakarta Utara & Barat (Pluit, Cengkareng)">Jakarta Utara & Barat (Pluit, Cengkareng, Daan Mogot)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">PESAN ALARM SMS (EWS CELL BROADCAST)</label>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 h-20 focus:outline-none focus:ring-1 focus:ring-red-500 text-slate-700 leading-relaxed font-mono"
                  placeholder="Isi pesan darurat..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSent}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {isSent ? (
                  <>
                    <Check className="w-4 h-4 animate-scale-up" />
                    BERHASIL DIKIRIM KE 42,500 WARGA
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    KIRIM BROADCAST MASSAL (CELL BROADCAST)
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
