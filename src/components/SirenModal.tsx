import React, { useState } from 'react';
import { Phone, ShieldAlert, Send, Check, X, Megaphone, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SirenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAlert: (title: string, desc: string, severity: 'high' | 'success' | 'medium') => void;
  deviceLocation?: { lat: number; lon: number; region: string } | null;
}

export default function SirenModal({ isOpen, onClose, onTriggerAlert, deviceLocation }: SirenModalProps) {
  const city = deviceLocation ? deviceLocation.region.replace(/\(.*\)/g, '').split(',')[0].trim() : 'DKI Jakarta';
  const cityLower = city.toLowerCase();

  let bpbdSubtext = "Badan Penanggulangan Bencana Daerah (BPBD) DKI Jakarta";
  let contacts = [
    { name: 'Call Center Jakarta', number: '112', desc: 'Bebas Pulsa' },
    { name: 'Pusdalops BPBD', number: '021-3865632', desc: 'Posko Utama' },
    { name: 'SAR Nasional (BASARNAS)', number: '115', desc: 'Penyelamatan & Evakuasi' },
    { name: 'Ambulans AGD Dinkes', number: '118', desc: 'Gawat Darurat Medis' },
    { name: 'Pemadam Kebakaran', number: '113', desc: 'Pompa & Penyelamatan' },
    { name: 'PMI DKI Jakarta', number: '021-3906666', desc: 'Bantuan Logistik' }
  ];
  let sirenDesc = "Aktifkan sirene lapangan pada pos pantau Jakarta Selatan/Timur secara instan.";
  let targetOptions = [
    { value: 'Semua Wilayah Bantaran', label: 'Semua Wilayah Bantaran (Sungai Ciliwung & Pesanggrahan)' },
    { value: 'Jakarta Selatan (Tebet, Kampung Melayu)', label: 'Jakarta Selatan (Tebet, Kampung Melayu, Pancoran)' },
    { value: 'Jakarta Timur (Cawang, Kebon Pala)', label: 'Jakarta Timur (Cawang, Kebon Pala, Jatinegara)' },
    { value: 'Jakarta Utara & Barat (Pluit, Cengkareng)', label: 'Jakarta Utara & Barat (Pluit, Cengkareng, Daan Mogot)' }
  ];
  let defaultMessage = 'PERINGATAN DINI BPBD: S. Ciliwung Katulampa mencapai SIAGA I (210cm). Aliran air diprediksi masuk wilayah bantaran Jakarta Selatan & Timur dalam 3-4 jam. Segera evakuasi mandiri!';

  if (cityLower.includes('bogor')) {
    bpbdSubtext = "Badan Penanggulangan Bencana Daerah (BPBD) Kota/Kabupaten Bogor";
    contacts = [
      { name: 'Call Center Bogor', number: '112', desc: 'Bebas Pulsa' },
      { name: 'Pusdalops BPBD Bogor', number: '0251-8321075', desc: 'Posko Utama' },
      { name: 'SAR Bogor (BASARNAS)', number: '115', desc: 'Penyelamatan & Evakuasi' },
      { name: 'Ambulans RSUD Bogor', number: '0251-8312111', desc: 'Gawat Darurat Medis' },
      { name: 'Pemadam Kebakaran', number: '0251-8322100', desc: 'Pompa & Penyelamatan' },
      { name: 'PMI Kota Bogor', number: '0251-8324082', desc: 'Bantuan Logistik' }
    ];
    sirenDesc = "Aktifkan sirene lapangan pada pos pantau Katulampa/Baranangsiang secara instan.";
    targetOptions = [
      { value: 'Semua Wilayah Aliran Sungai', label: 'Semua Wilayah Aliran Sungai (Ciliwung & Cisadane)' },
      { value: 'Bogor Tengah (Sempur, Baranangsiang)', label: 'Bogor Tengah (Sempur, Baranangsiang)' },
      { value: 'Bogor Timur (Katulampa, Tajur)', label: 'Bogor Timur (Katulampa, Tajur)' },
      { value: 'Kabupaten Bogor (Bojonggede, Ciawi)', label: 'Kabupaten Bogor (Bojonggede, Ciawi)' }
    ];
    defaultMessage = 'PERINGATAN DINI BPBD: Hulu S. Ciliwung Ciawi terpantau meluap. Aliran air diprediksi membanjiri bantaran Sempur & Baranangsiang dalam 1-2 jam. Segera bersiap evakuasi!';
  } else if (cityLower.includes('bandung')) {
    bpbdSubtext = "Badan Penanggulangan Bencana Daerah (BPBD) Kota Bandung";
    contacts = [
      { name: 'Call Center Bandung', number: '112', desc: 'Bebas Pulsa' },
      { name: 'Pusdalops BPBD Bandung', number: '022-7301113', desc: 'Posko Utama' },
      { name: 'SAR Bandung (BASARNAS)', number: '022-7780111', desc: 'Penyelamatan & Evakuasi' },
      { name: 'Ambulans Dinkes Bandung', number: '119', desc: 'Gawat Darurat Medis' },
      { name: 'Pemadam Kebakaran', number: '022-7207113', desc: 'Pompa & Penyelamatan' },
      { name: 'PMI Kota Bandung', number: '022-4207052', desc: 'Bantuan Logistik' }
    ];
    sirenDesc = "Aktifkan sirene lapangan pada pos pantau Dayeuhkolot/Gedebage secara instan.";
    targetOptions = [
      { value: 'Semua Wilayah Aliran Sungai', label: 'Semua Wilayah Aliran Sungai (Citarum & Cikapundung)' },
      { value: 'Bandung Selatan (Dayeuhkolot, Baleendah)', label: 'Bandung Selatan (Dayeuhkolot, Baleendah)' },
      { value: 'Bandung Timur (Gedebage, Rancaekek)', label: 'Bandung Timur (Gedebage, Rancaekek)' },
      { value: 'Bandung Utara (Dago, Pasteur)', label: 'Bandung Utara (Dago, Pasteur)' }
    ];
    defaultMessage = 'PERINGATAN DINI BPBD: Aliran S. Citarum di Dayeuhkolot & Baleendah meluap melebihi batas aman. Potensi genangan setinggi 50-150cm. Dimohon mengungsi ke tempat aman!';
  } else if (cityLower.includes('surabaya')) {
    bpbdSubtext = "Badan Penanggulangan Bencana Daerah (BPBD) Kota Surabaya";
    contacts = [
      { name: 'Call Center Surabaya', number: '112', desc: 'Bebas Pulsa' },
      { name: 'Pusdalops BPBD Surabaya', number: '031-5034112', desc: 'Posko Utama' },
      { name: 'SAR Surabaya (BASARNAS)', number: '031-8497525', desc: 'Penyelamatan & Evakuasi' },
      { name: 'Ambulans Dr. Soetomo', number: '031-5501001', desc: 'Gawat Darurat Medis' },
      { name: 'Pemadam Kebakaran', number: '031-3533843', desc: 'Pompa & Penyelamatan' },
      { name: 'PMI Kota Surabaya', number: '031-5311740', desc: 'Bantuan Logistik' }
    ];
    sirenDesc = "Aktifkan sirene lapangan pada pos pantau Kalimas/Wonokromo secara instan.";
    targetOptions = [
      { value: 'Semua Wilayah Aliran Sungai', label: 'Semua Wilayah Aliran Sungai (Kalimas & Brantas)' },
      { value: 'Surabaya Selatan (Wonokromo, Gubeng)', label: 'Surabaya Selatan (Wonokromo, Gubeng)' },
      { value: 'Surabaya Utara (Jembatan Merah, Kenjeran)', label: 'Surabaya Utara (Jembatan Merah, Kenjeran)' },
      { value: 'Surabaya Barat & Timur', label: 'Surabaya Barat & Timur (Tandes, Keputih)' }
    ];
    defaultMessage = 'PERINGATAN DINI BPBD: Kali Jagir & Wonokromo dalam kondisi kritis akibat debit air laut pasang tinggi (Rob). Waspadai luapan air di pesisir Kenjeran & Kalimas!';
  } else if (cityLower.includes('semarang')) {
    bpbdSubtext = "Badan Penanggulangan Bencana Daerah (BPBD) Kota Semarang";
    contacts = [
      { name: 'Call Center Semarang', number: '112', desc: 'Bebas Pulsa' },
      { name: 'Pusdalops BPBD Semarang', number: '024-7624157', desc: 'Posko Utama' },
      { name: 'SAR Semarang (BASARNAS)', number: '024-7629192', desc: 'Penyelamatan & Evakuasi' },
      { name: 'Ambulans Dinkes Semarang', number: '119', desc: 'Gawat Darurat Medis' },
      { name: 'Pemadam Kebakaran', number: '024-113', desc: 'Pompa & Penyelamatan' },
      { name: 'PMI Kota Semarang', number: '024-3541243', desc: 'Bantuan Logistik' }
    ];
    sirenDesc = "Aktifkan sirene lapangan pada pos pantau Kaligawe/Mangkang secara instan.";
    targetOptions = [
      { value: 'Semua Wilayah Aliran Sungai', label: 'Semua Wilayah Aliran Sungai (Banjir Kanal Barat & Timur)' },
      { value: 'Semarang Utara & Timur', label: 'Semarang Utara & Timur (Kaligawe, Genuk, Johar)' },
      { value: 'Semarang Barat (Mangkang, Tugu)', label: 'Semarang Barat (Mangkang, Tugu)' },
      { value: 'Semarang Tengah & Selatan', label: 'Semarang Tengah & Selatan (Simpang Lima, Tembalang)' }
    ];
    defaultMessage = 'PERINGATAN DINI BPBD: Curah hujan ekstrem di hulu Kali Garang memicu peningkatan drastis debit air Banjir Kanal Barat. Warga Kaligawe & Genuk diharap bersiap mengantisipasi rob!';
  } else if (cityLower.includes('yogyakarta') || cityLower.includes('jogja')) {
    bpbdSubtext = "Badan Penanggulangan Bencana Daerah (BPBD) DIY / Kota Yogyakarta";
    contacts = [
      { name: 'Call Center Yogyakarta', number: '112', desc: 'Bebas Pulsa' },
      { name: 'Pusdalops BPBD DIY', number: '0274-555584', desc: 'Posko Utama' },
      { name: 'SAR DIY (BASARNAS)', number: '0274-6462111', desc: 'Penyelamatan & Evakuasi' },
      { name: 'Ambulans RS Sardjito', number: '0274-587333', desc: 'Gawat Darurat Medis' },
      { name: 'Pemadam Kebakaran Jogja', number: '0274-587101', desc: 'Pompa & Penyelamatan' },
      { name: 'PMI DIY', number: '0274-5011112', desc: 'Bantuan Logistik' }
    ];
    sirenDesc = "Aktifkan sirene lapangan pada pos pantau Kali Code secara instan.";
    targetOptions = [
      { value: 'Semua Wilayah Bantaran', label: 'Semua Wilayah Bantaran (Kali Code, Winongo, Gajah Wong)' },
      { value: 'Bantaran Kali Code', label: 'Bantaran Kali Code (Tugu, Gondolayu)' },
      { value: 'Bantaran Kali Winongo & Gajah Wong', label: 'Bantaran Kali Winongo & Gajah Wong' },
      { value: 'Wilayah Sleman & Bantul', label: 'Wilayah Sleman & Bantul' }
    ];
    defaultMessage = 'PERINGATAN DINI BPBD: Aliran hulu lereng Gunung Merapi membawa debit air hujan tinggi. Aliran Kali Code terpantau naik pesat. Harap menjauhi bibir sungai dan bersiap mengungsi!';
  } else if (cityLower.includes('medan')) {
    bpbdSubtext = "Badan Penanggulangan Bencana Daerah (BPBD) Kota Medan";
    contacts = [
      { name: 'Call Center Medan', number: '112', desc: 'Bebas Pulsa' },
      { name: 'Pusdalops BPBD Medan', number: '061-8220555', desc: 'Posko Utama' },
      { name: 'SAR Medan (BASARNAS)', number: '061-4553111', desc: 'Penyelamatan & Evakuasi' },
      { name: 'Ambulans RS Pirngadi', number: '061-4522014', desc: 'Gawat Darurat Medis' },
      { name: 'Pemadam Kebakaran', number: '061-4515356', desc: 'Pompa & Penyelamatan' },
      { name: 'PMI Kota Medan', number: '061-4530115', desc: 'Bantuan Logistik' }
    ];
    sirenDesc = "Aktifkan sirene lapangan pada pos pantau Sungai Deli/Belawan secara instan.";
    targetOptions = [
      { value: 'Semua Wilayah Bantaran', label: 'Semua Wilayah Bantaran (Sungai Deli & Babura)' },
      { value: 'Medan Maimun & Johor', label: 'Medan Maimun & Johor (Kampung Baru)' },
      { value: 'Medan Belawan & Labuhan', label: 'Medan Belawan & Labuhan (Pesisir Pantai)' },
      { value: 'Medan Amplas & Petisah', label: 'Medan Amplas & Petisah' }
    ];
    defaultMessage = 'PERINGATAN DINI BPBD: Luapan Sungai Deli dan Sungai Babura memicu banjir genangan di kawasan Medan Maimun & Kampung Baru setinggi 40-80cm. Warga diimbau mengamankan barang berharga!';
  } else if (cityLower.includes('makassar')) {
    bpbdSubtext = "Badan Penanggulangan Bencana Daerah (BPBD) Kota Makassar";
    contacts = [
      { name: 'Call Center Makassar', number: '112', desc: 'Bebas Pulsa' },
      { name: 'Pusdalops BPBD Makassar', number: '0411-442222', desc: 'Posko Utama' },
      { name: 'SAR Makassar (BASARNAS)', number: '0411-554111', desc: 'Penyelamatan & Evakuasi' },
      { name: 'Ambulans RS Wahidin', number: '0411-584058', desc: 'Gawat Darurat Medis' },
      { name: 'Pemadam Kebakaran', number: '0411-873211', desc: 'Pompa & Penyelamatan' },
      { name: 'PMI Kota Makassar', number: '0411-872224', desc: 'Bantuan Logistik' }
    ];
    sirenDesc = "Aktifkan sirene lapangan pada pos pantau Sungai Tallo secara instan.";
    targetOptions = [
      { value: 'Semua Wilayah Aliran Sungai', label: 'Semua Wilayah Aliran Sungai (Jeneberang & Tallo)' },
      { value: 'Makassar Timur', label: 'Makassar Timur (Panakkukang, Tamalanrea, Tallo)' },
      { value: 'Makassar Selatan', label: 'Makassar Selatan (Losari, Gowa)' },
      { value: 'Ujung Pandang & Biringkanaya', label: 'Ujung Pandang & Biringkanaya' }
    ];
    defaultMessage = 'PERINGATAN DINI BPBD: Aliran Sungai Tallo meluap akibat curah hujan ekstrem disertai pasang laut di sekitar Losari. Wilayah Panakkukang & Tallo diimbau bersiap siaga menghadapi genangan!';
  } else if (deviceLocation) {
    bpbdSubtext = `Badan Penanggulangan Bencana Daerah (BPBD) ${city}`;
    contacts = [
      { name: `Call Center ${city}`, number: '112', desc: 'Bebas Pulsa' },
      { name: 'Pusdalops BPBD', number: '021-112-EWS', desc: 'Posko Utama' },
      { name: 'SAR Nasional (BASARNAS)', number: '115', desc: 'Penyelamatan & Evakuasi' },
      { name: 'Ambulans AGD', number: '118', desc: 'Gawat Darurat Medis' },
      { name: 'Pemadam Kebakaran', number: '113', desc: 'Pompa & Penyelamatan' },
      { name: `PMI Cabang ${city}`, number: '021-112-LOG', desc: 'Bantuan Logistik' }
    ];
    sirenDesc = `Aktifkan sirene lapangan pada pos pantau utama wilayah ${city} secara instan.`;
    targetOptions = [
      { value: 'Semua Wilayah Aliran Sungai', label: `Semua Wilayah Aliran Sungai ${city}` },
      { value: 'Wilayah Utara & Timur', label: `Wilayah ${city} Utara & Timur` },
      { value: 'Wilayah Selatan & Barat', label: `Wilayah ${city} Selatan & Barat` },
      { value: 'Pusat Kota & Pemukiman Rendah', label: 'Pusat Kota & Area Pemukiman Rendah' }
    ];
    defaultMessage = `PERINGATAN DINI BPBD: Curah hujan ekstrem di wilayah ${city} mengakibatkan debit air sungai meningkat tajam. Potensi luapan di bantaran sungai utama. Selalu siaga bencana!`;
  }

  const [targetRegion, setTargetRegion] = useState(targetOptions[0].value);
  const [broadcastMessage, setBroadcastMessage] = useState(defaultMessage);
  const [isSent, setIsSent] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);

  // Sync state with deviceLocation updates when the modal is opened
  React.useEffect(() => {
    setTargetRegion(targetOptions[0].value);
    setBroadcastMessage(defaultMessage);
  }, [deviceLocation]);

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
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
              <p className="text-xs text-red-100">{bpbdSubtext}</p>
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
              {contacts.map((contact) => (
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
                  {sirenDesc}
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
                  {targetOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
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
