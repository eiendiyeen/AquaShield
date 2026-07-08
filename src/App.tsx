import React, { useState, useEffect } from 'react';
import { 
  initialSensors, 
  initialWeather, 
  initialAlertLogs, 
  initialCitizenReports, 
  calculateStatus 
} from './data';
import { Sensor, WeatherInfo, AlertLog, CitizenReport } from './types';

// Icons from lucide-react
import { 
  Bell, 
  Settings, 
  HelpCircle, 
  Search, 
  Map, 
  Layers, 
  Waves, 
  Brain, 
  FileText, 
  LogOut, 
  Phone, 
  AlertTriangle, 
  ChevronRight, 
  RefreshCw, 
  CloudRain, 
  CloudLightning,
  Sun,
  Cloud,
  Thermometer,
  Compass,
  Play,
  Square,
  ShieldAlert,
  Menu,
  X,
  Volume2
} from 'lucide-react';

// Subcomponents
import MapWidget from './components/MapWidget';
import CctvWidget from './components/CctvWidget';
import PredictionsWidget from './components/PredictionsWidget';
import AlertLogsWidget from './components/AlertLogsWidget';
import SirenModal from './components/SirenModal';
import CitizenReportWidget from './components/CitizenReportWidget';
import RiverLevelWidget from './components/RiverLevelWidget';
import MlAnalyticsWidget from './components/MlAnalyticsWidget';

import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>('ringkasan');
  const [isSirenModalOpen, setIsSirenModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Primary Data States
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(initialSensors[0]);
  const [weather, setWeather] = useState<WeatherInfo>(initialWeather);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>(initialAlertLogs);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>(initialCitizenReports);
  const [deviceLocation, setDeviceLocation] = useState<{ lat: number; lon: number; region: string } | null>(null);
  
  // Interactive Simulation & Live State
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [liveTimestamp, setLiveTimestamp] = useState<string>('14:02 WIB');
  const [isSimulatingMonsoon, setIsSimulatingMonsoon] = useState<boolean>(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);
  const [systemLogsAlertCount, setSystemLogsAlertCount] = useState<number>(2);

  const getRawanLocations = () => {
    const city = deviceLocation ? deviceLocation.region.replace(/\(.*\)/g, '').split(',')[0].trim() : 'Jakarta';
    if (!deviceLocation) {
      return [
        { name: 'Kampung Melayu', status: 'Rentan', desc: 'Bantaran Ciliwung' },
        { name: 'Rawa Buaya', status: 'Sedang', desc: 'S. Angke' },
        { name: 'Pluit', status: 'Sangat Rentan', desc: 'Pasang Rob / Pesisir' },
        { name: 'Tebet Dalam', status: 'Ringan', desc: 'Saluran Drainase' }
      ];
    }
    
    const cityLower = city.toLowerCase();
    let riverNames = ['Sungai Utama', 'Kali Anak', 'Saluran Pembuang', 'Tanggul Utama'];
    if (cityLower.includes('jakarta')) {
      riverNames = ['Ciliwung', 'Pesanggrahan', 'Angke', 'Banjir Kanal Barat'];
    } else if (cityLower.includes('bogor')) {
      riverNames = ['Ciliwung', 'Cisadane', 'Ciawi', 'Cikeas'];
    } else if (cityLower.includes('bandung')) {
      riverNames = ['Citarum', 'Cikapundung', 'Cisangkuy', 'Citepus'];
    } else if (cityLower.includes('surabaya')) {
      riverNames = ['Kalimas', 'Kali Jagir', 'Brantas', 'Kali Surabaya'];
    } else if (cityLower.includes('semarang')) {
      riverNames = ['Banjir Kanal Barat', 'Banjir Kanal Timur', 'Kali Garang', 'Kali Semarang'];
    } else if (cityLower.includes('yogyakarta') || cityLower.includes('jogja')) {
      riverNames = ['Kali Code', 'Kali Winongo', 'Kali Gajah Wong', 'Kali Progo'];
    } else if (cityLower.includes('medan')) {
      riverNames = ['Sungai Deli', 'Sungai Babura', 'Sungai Belawan', 'Sungai Denai'];
    } else if (cityLower.includes('makassar')) {
      riverNames = ['Sungai Jeneberang', 'Sungai Tallo', 'Paping', 'Saluran Pampang'];
    }

    return [
      { name: sensors[0]?.name.replace('Pos Pantau ', '').replace('Pintu Air ', '').replace('Sensor Kali ', '') || 'Bantaran Hulu', status: 'Rentan', desc: `Bantaran ${riverNames[0] || 'Utama'}` },
      { name: sensors[1]?.name.replace('Pos Pantau ', '').replace('Pintu Air ', '').replace('Sensor Kali ', '') || 'Wilayah Barat', status: 'Sedang', desc: `Aliran ${riverNames[1] || 'Anak'}` },
      { name: sensors[3]?.name.replace('Pos Pantau ', '').replace('Pintu Air ', '').replace('Sensor Kali ', '') || 'Wilayah Utara', status: 'Sangat Rentan', desc: `Pasang Air / ${riverNames[3] || 'Tanggul'}` },
      { name: sensors[5]?.name.replace('Pos Pantau ', '').replace('Pintu Air ', '').replace('Sensor Kali ', '') || 'Pusat Kota', status: 'Ringan', desc: `Saluran Drainase ${city}` }
    ];
  };

  // Auto-ticking simulation representing live data variation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulatingMonsoon) {
      interval = setInterval(() => {
        // Increment random sensors representation of rainfall
        setSensors((prevSensors) => {
          const updated = prevSensors.map((sensor) => {
            // Increase water levels gradually by random amounts
            const increment = Math.round(Math.random() * 8) + 2;
            const newLevel = Math.min(350, sensor.currentLevel + increment);
            const newStatus = calculateStatus(newLevel, sensor);
            
            // Trigger automatic EWS high level warnings
            if (newStatus === 'Critical' && sensor.status !== 'Critical') {
              triggerAlertLog(
                `Awas Kritis - ${sensor.name}`,
                `Sensor mencatat tinggi air kritis ${newLevel}cm melebihi ambang batas aman ${sensor.alertLevel1}cm. Sirine daerah aktif!`,
                'high'
              );
              setSystemLogsAlertCount((c) => c + 1);
            } else if (newStatus === 'Siaga' && sensor.status === 'Waspada') {
              triggerAlertLog(
                `Siaga II - ${sensor.name}`,
                `Tinggi muka air meningkat menjadi ${newLevel}cm. Warga dihimbau mengamankan barang berharga.`,
                'medium'
              );
              setSystemLogsAlertCount((c) => c + 1);
            }

            return {
              ...sensor,
              currentLevel: newLevel,
              status: newStatus,
              history: [...sensor.history.slice(1), newLevel]
            };
          });

          // Keep selected sensor in sync
          if (selectedSensor) {
            const currentSelected = updated.find(s => s.id === selectedSensor.id);
            if (currentSelected) {
              setSelectedSensor(currentSelected);
            }
          }
          return updated;
        });

        // Increase weather temperature fluctuation
        setWeather(prev => ({
          ...prev,
          temp: Math.min(30, Math.max(24, prev.temp + (Math.random() > 0.5 ? 0.5 : -0.5)))
        }));

      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isSimulatingMonsoon, selectedSensor]);

  // Sync clock time for "Live Update"
  useEffect(() => {
    const clock = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      setLiveTimestamp(timeStr);
    }, 15000);
    return () => clearInterval(clock);
  }, []);

  // Sync regional weather metrics dynamically when selected sensor changes (reflecting device location context)
  useEffect(() => {
    if (!selectedSensor) return;
    const region = selectedSensor.region;
    
    // Create organic, realistic local variations in weather depending on the area
    let temp = 26;
    let humidity = 88;
    let windSpeed = 12;
    let condition = weather.condition;
    
    if (region.includes('Bogor') || region.includes('Hulu')) {
      temp = 22; // cooler mountainous region
      humidity = 94; // wetter/misted air
      windSpeed = 7;
      condition = 'Hujan Ringan'; // higher likelihood of light rain in Bogor hills
    } else if (region.includes('Utara')) {
      temp = 29; // hotter coastal sea level
      humidity = 82;
      windSpeed = 17; // stronger marine winds
    } else if (region.includes('Selatan')) {
      temp = 26;
      humidity = 87;
      windSpeed = 11;
    } else if (region.includes('Pusat')) {
      temp = 28;
      humidity = 84;
      windSpeed = 9;
    } else if (region.includes('Timur')) {
      temp = 27;
      humidity = 85;
      windSpeed = 12;
    } else if (region.includes('Barat')) {
      temp = 28;
      humidity = 86;
      windSpeed = 13;
    }
    
    setWeather(prev => ({
      ...prev,
      temp,
      humidity,
      windSpeed,
      condition
    }));
  }, [selectedSensor?.id]);

  // Update specified sensor water level directly (e.g. from sliders or simulator)
  const handleUpdateSensorLevel = (id: string, level: number) => {
    setSensors((prev) => 
      prev.map((s) => {
        if (s.id === id) {
          const newStatus = calculateStatus(level, s);
          const updated = {
            ...s,
            currentLevel: level,
            status: newStatus,
            history: [...s.history.slice(1), level]
          };
          if (selectedSensor?.id === id) {
            setSelectedSensor(updated);
          }
          return updated;
        }
        return s;
      })
    );
  };

  // Update specified sensor coordinates (x, y) on the map
  const handleUpdateSensorCoordinates = (id: string, x: number, y: number) => {
    setSensors((prev) => 
      prev.map((s) => {
        if (s.id === id) {
          const updated = {
            ...s,
            coordinates: { x, y }
          };
          if (selectedSensor?.id === id) {
            setSelectedSensor(updated);
          }
          return updated;
        }
        return s;
      })
    );
    // Find sensor name for the alert log
    const targetSensor = sensors.find(s => s.id === id);
    if (targetSensor) {
      triggerAlertLog(
        `Lokasi Diubah: ${targetSensor.name}`,
        `Posisi koordinat sensor berhasil dipindahkan ke X: ${x}%, Y: ${y}% pada peta spasial.`,
        'success'
      );
    }
  };

  // Add a new custom sensor
  const handleAddSensor = (newSensor: Sensor) => {
    setSensors((prev) => [...prev, newSensor]);
    setSelectedSensor(newSensor);
    triggerAlertLog(
      `Sensor Baru Ditambahkan`,
      `Sensor "${newSensor.name}" berhasil dikonfigurasi pada koordinat X: ${newSensor.coordinates.x}%, Y: ${newSensor.coordinates.y}%.`,
      'success'
    );
  };

  // Helper function to append to alert logs
  const triggerAlertLog = (title: string, description: string, severity: 'high' | 'medium' | 'low' | 'success') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const newLog: AlertLog = {
      id: `alert-${Date.now()}`,
      title,
      time: timeStr,
      timeRaw: now,
      description,
      severity
    };
    setAlertLogs((prev) => [newLog, ...prev]);
  };

  // Helper to add citizen reports
  const handleAddCitizenReport = (title: string, reporter: string, location: string, depth: number, description: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const newReport: CitizenReport = {
      id: `report-${Date.now()}`,
      title,
      reporter,
      location,
      depth,
      timestamp: timeStr,
      status: 'Diverifikasi',
      description,
      upvotes: 1
    };
    setCitizenReports((prev) => [newReport, ...prev]);
    
    // Auto-alert notification representation
    triggerAlertLog(
      `Laporan Warga: ${location}`,
      `Laporan dari ${reporter}: "${title}" dengan genangan setinggi ${depth}cm.`,
      depth > 50 ? 'medium' : 'low'
    );
    setSystemLogsAlertCount((c) => c + 1);
  };

  // Upvote Citizen report
  const handleUpvoteReport = (id: string) => {
    setCitizenReports((prev) =>
      prev.map((r) => r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r)
    );
  };

  // Synchronize entire app's telemetry and data when deviceLocation changes (localizing around user coordinates)
  useEffect(() => {
    if (!deviceLocation) return;

    const synchronizeAroundLocation = async () => {
      const { lat, lon, region } = deviceLocation;

      // Initial fallbacks based on parsing the region string
      const cleanRegion = region.replace(/\(.*\)/g, '').trim();
      const parts = cleanRegion.split(',');
      let city = parts[parts.length - 1]?.trim() || parts[0]?.trim() || 'Daerah Sekitar';
      let subdistricts: string[] = [];

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`);
        if (response.ok) {
          const data = await response.json();
          const address = data.address || {};
          city = address.city || address.town || address.municipality || address.city_district || city;
          
          const names = [
            address.suburb,
            address.village,
            address.neighbourhood,
            address.residential,
            address.city_district
          ].filter((n): n is string => typeof n === 'string' && n.length > 0);
          
          if (names.length > 0) {
            subdistricts = Array.from(new Set(names));
          }
        }
      } catch (err) {
        console.warn('Nominatim reverse-geocoding failed, using fallback parsing:', err);
      }

      // Indonesian regions presets to enhance authenticity
      const cityLower = city.toLowerCase();
      let riverNames = ['Sungai Utama', 'Kali Anak', 'Saluran Pembuang', 'Tanggul Utama', 'Kanal Barat', 'Kali Samping'];
      let presetSubs = ['Pusat', 'Utara', 'Selatan', 'Barat', 'Timur', 'Hulu'];

      if (cityLower.includes('jakarta')) {
        riverNames = ['Ciliwung', 'Pesanggrahan', 'Angke', 'Banjir Kanal Barat', 'Cipinang', 'Sunter'];
        presetSubs = ['Manggarai', 'Karet', 'Pluit', 'Kebon Baru', 'Kampung Melayu', 'Sunter'];
      } else if (cityLower.includes('bogor')) {
        riverNames = ['Ciliwung', 'Cisadane', 'Ciawi', 'Cikeas', 'Ciliwung Hulu', 'Cisadane Hulu'];
        presetSubs = ['Katulampa', 'Baranangsiang', 'Ciawi', 'Bojonggede', 'Sempur', 'Sentul'];
      } else if (cityLower.includes('bandung')) {
        riverNames = ['Citarum', 'Cikapundung', 'Cisangkuy', 'Citepus', 'Cidurian', 'Cikapundung Hulu'];
        presetSubs = ['Dayeuhkolot', 'Rancaekek', 'Dago', 'Gedebage', 'Pasteur', 'Cibaduyut'];
      } else if (cityLower.includes('surabaya')) {
        riverNames = ['Kalimas', 'Kali Jagir', 'Brantas', 'Kali Surabaya', 'Pegirian', 'Kanal Wonokromo'];
        presetSubs = ['Gubeng', 'Wonokromo', 'Tandes', 'Jembatan Merah', 'Keputih', 'Kenjeran'];
      } else if (cityLower.includes('semarang')) {
        riverNames = ['Banjir Kanal Barat', 'Banjir Kanal Timur', 'Kali Garang', 'Kali Semarang', 'Kali Kreo', 'Kali Babon'];
        presetSubs = ['Simpang Lima', 'Kaligawe', 'Tugu Muda', 'Johar', 'Tembalang', 'Mangkang'];
      } else if (cityLower.includes('yogyakarta') || cityLower.includes('jogja')) {
        riverNames = ['Kali Code', 'Kali Winongo', 'Kali Gajah Wong', 'Kali Progo', 'Kali Oyo', 'Kali Opak'];
        presetSubs = ['Malioboro', 'Tugu', 'Sleman', 'Bantul', 'Kotagede', 'Gejayan'];
      } else if (cityLower.includes('medan')) {
        riverNames = ['Sungai Deli', 'Sungai Babura', 'Sungai Belawan', 'Sungai Denai', 'Sungai Percut', 'Sungai Sikambing'];
        presetSubs = ['Kampung Baru', 'Belawan', 'Maimun', 'Amplas', 'Petisah', 'Johor'];
      } else if (cityLower.includes('makassar')) {
        riverNames = ['Sungai Jeneberang', 'Sungai Tallo', 'Paping', 'Saluran Pampang', 'Kanal Barat', 'Kanal Tengah'];
        presetSubs = ['Panakkukang', 'Losari', 'Ujung Pandang', 'Tallo', 'Gowa', 'Tamalanrea'];
      }

      const finalSubs = Array.from(new Set([...subdistricts, ...presetSubs])).slice(0, 8);

      // Generate 6 beautifully localized sensors placed around the user's region
      const localSensors: Sensor[] = [
        {
          id: 'katulampa',
          name: `Pos Pantau ${finalSubs[0]} (Hulu)`,
          river: riverNames[0],
          currentLevel: 140,
          normalThreshold: 80,
          alertLevel3: 150,
          alertLevel2: 180,
          alertLevel1: 200,
          status: 'Aman',
          coordinates: { x: 50, y: 88 },
          region: `${city} (Hulu)`,
          history: [90, 100, 110, 115, 120, 125, 130, 135, 140, 145, 142, 140]
        },
        {
          id: 'manggarai',
          name: `Pintu Air ${finalSubs[1]}`,
          river: riverNames[1],
          currentLevel: 185,
          normalThreshold: 100,
          alertLevel3: 150,
          alertLevel2: 180,
          alertLevel1: 210,
          status: 'Siaga',
          coordinates: { x: 55, y: 52 },
          region: `${city} Selatan`,
          history: [130, 135, 140, 145, 150, 155, 160, 170, 175, 180, 182, 185]
        },
        {
          id: 'pesanggrahan',
          name: `Sensor Kali ${finalSubs[2]}`,
          river: riverNames[2],
          currentLevel: 115,
          normalThreshold: 120,
          alertLevel3: 150,
          alertLevel2: 180,
          alertLevel1: 220,
          status: 'Aman',
          coordinates: { x: 32, y: 65 },
          region: `${city} Barat`,
          history: [95, 100, 105, 108, 110, 112, 115, 118, 120, 118, 116, 115]
        },
        {
          id: 'pluit',
          name: `Rumah Pompa ${finalSubs[3]}`,
          river: riverNames[3],
          currentLevel: 265,
          normalThreshold: 150,
          alertLevel3: 200,
          alertLevel2: 240,
          alertLevel1: 270,
          status: 'Siaga',
          coordinates: { x: 42, y: 25 },
          region: `${city} Utara`,
          history: [210, 220, 230, 235, 240, 245, 250, 255, 260, 262, 268, 265]
        },
        {
          id: 'angke',
          name: `Tanggul Banjir ${finalSubs[4]}`,
          river: riverNames[4],
          currentLevel: 165,
          normalThreshold: 130,
          alertLevel3: 160,
          alertLevel2: 190,
          alertLevel1: 230,
          status: 'Waspada',
          coordinates: { x: 22, y: 48 },
          region: `${city} Barat`,
          history: [110, 115, 120, 135, 140, 142, 148, 152, 155, 158, 162, 165]
        },
        {
          id: 'karet',
          name: `Pintu Air ${finalSubs[5]}`,
          river: riverNames[5],
          currentLevel: 152,
          normalThreshold: 120,
          alertLevel3: 150,
          alertLevel2: 180,
          alertLevel1: 210,
          status: 'Waspada',
          coordinates: { x: 45, y: 42 },
          region: `${city} Pusat`,
          history: [115, 120, 122, 128, 132, 136, 140, 142, 145, 148, 150, 152]
        }
      ];

      // Calculate state statuses
      localSensors.forEach(s => {
        s.status = calculateStatus(s.currentLevel, s);
      });

      setSensors(localSensors);
      setSelectedSensor(localSensors[0]);

      // Generate local alert logs
      const localAlerts: AlertLog[] = [
        {
          id: `alert-local-1`,
          title: `Siaga II - Pintu Air ${finalSubs[1]}`,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          timeRaw: new Date(Date.now() - 10 * 60 * 1000),
          description: `Ketinggian air di Pintu Air ${finalSubs[1]} meningkat mencapai 185cm. Bersiap siaga luapan banjir di sekitar aliran ${riverNames[1]}.`,
          severity: 'medium'
        },
        {
          id: `alert-local-2`,
          title: `Waspada Cuaca Ekstrem - ${city}`,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          timeRaw: new Date(Date.now() - 45 * 60 * 1000),
          description: `BMKG merilis peringatan dini curah hujan tinggi disertai angin kencang untuk wilayah ${city} dan sekitarnya.`,
          severity: 'high'
        },
        {
          id: `alert-local-3`,
          title: `Sistem Pemantauan Siap`,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
          timeRaw: new Date(Date.now() - 180 * 60 * 1000),
          description: `Sensor telemetri dan sistem mitigasi bencana di ${city} berfungsi normal. Seluruh gerbang air beroperasi baik.`,
          severity: 'success'
        }
      ];
      setAlertLogs(localAlerts);

      // Generate local citizen reports
      const localReports: CitizenReport[] = [
        {
          id: `report-local-1`,
          title: `Genangan Jalan Raya ${finalSubs[1]}`,
          reporter: 'Budi Santoso',
          location: `Jl. Raya ${finalSubs[1]}, ${city}`,
          depth: 35,
          timestamp: 'Baru Saja',
          status: 'Diverifikasi',
          description: `Luapan air selokan setinggi 35cm merendam jalan raya utama. Kendaraan roda dua disarankan mencari jalur alternatif.`,
          upvotes: 18
        },
        {
          id: `report-local-2`,
          title: `Air Sungai Mulai Naik`,
          reporter: 'Fitriani',
          location: `Bantaran ${riverNames[2]} ${finalSubs[2]}`,
          depth: 20,
          timestamp: '15 menit lalu',
          status: 'Dalam Penanganan',
          description: `Aliran air ${riverNames[2]} terpantau sangat deras dan mulai meluap ke halaman rumah warga terdekat.`,
          upvotes: 11
        }
      ];
      setCitizenReports(localReports);

      // Dynamically adapt local weather info
      setWeather({
        temp: 24 + Math.round(Math.random() * 5),
        condition: 'Hujan Ringan',
        humidity: 89,
        windSpeed: 13
      });

      triggerAlertLog(
        `Lokasi Terpilih: ${city}`,
        `Sistem berhasil menyesuaikan dashboard monitoring di area sekitar ${city}.`,
        'success'
      );
    };

    synchronizeAroundLocation();
  }, [deviceLocation]);

  // Global maximum alarm level calculation for header alert color representation
  const getMaxAlarmSeverity = () => {
    if (sensors.some(s => s.status === 'Critical')) return 'Critical';
    if (sensors.some(s => s.status === 'Siaga')) return 'Siaga';
    if (sensors.some(s => s.status === 'Waspada')) return 'Waspada';
    return 'Aman';
  };

  const currentMaxSeverity = getMaxAlarmSeverity();

  // Navigation click hander
  const handleNavigation = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  // Dynamic status bar styling on top right
  const getSeverityBadgeClass = () => {
    if (currentMaxSeverity === 'Critical') {
      return 'bg-red-600 hover:bg-red-700 text-white animate-pulse-ring';
    }
    if (currentMaxSeverity === 'Siaga') {
      return 'bg-orange-500 hover:bg-orange-600 text-white';
    }
    if (currentMaxSeverity === 'Waspada') {
      return 'bg-yellow-500 text-slate-900';
    }
    return 'bg-emerald-500 text-white';
  };

  const getSeverityLabel = () => {
    if (currentMaxSeverity === 'Critical') return 'Awas Banjir (Siaga I)';
    if (currentMaxSeverity === 'Siaga') return 'Siaga II';
    if (currentMaxSeverity === 'Waspada') return 'Waspada (Siaga III)';
    return 'Kondisi Aman';
  };

  // Weather Condition select options for interaction
  const weatherOptions: { condition: WeatherInfo['condition']; icon: any; desc: string }[] = [
    { condition: 'Hujan Lebat', icon: <CloudLightning className="w-4 h-4 text-slate-600" />, desc: 'Hujan Lebat / Petir' },
    { condition: 'Hujan Ringan', icon: <CloudRain className="w-4 h-4 text-slate-500" />, desc: 'Hujan Gerimis' },
    { condition: 'Berawan', icon: <Cloud className="w-4 h-4 text-slate-400" />, desc: 'Berawan Mendung' },
    { condition: 'Cerah', icon: <Sun className="w-4 h-4 text-yellow-500" />, desc: 'Cerah Berawan' }
  ];

  return (
    <div id="aquashield-application" className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col selection:bg-secondary/20 selection:text-secondary antialiased">
      
      {/* 1. TOP UTILITY HEADER BAR */}
      <header id="top-utility-bar" className="sticky top-0 z-[1050] bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 lg:px-8 py-3.5 flex items-center justify-between transition-all">
        
        {/* Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-slate-50 rounded-lg lg:hidden text-slate-600"
            title="Menu Utama"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-primary flex items-center">
              Aqua<span className="text-secondary">Shield</span>
            </span>
          </div>
        </div>

        {/* Search bar & Focus effects */}
        <div id="search-container" className="hidden md:flex relative max-w-md w-full mx-8">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari wilayah atau sensor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-all"
          />

          {/* Real-time search dropdown suggestions */}
          <AnimatePresence>
            {isSearchFocused && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200/80 rounded-2xl shadow-2xl p-2.5 z-50 text-xs"
              >
                <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider px-2.5 py-1.5">Hasil Pencarian Cepat</div>
                {sensors
                  .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.river.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 4)
                  .map(sensor => (
                    <button
                      key={sensor.id}
                      onClick={() => {
                        setSelectedSensor(sensor);
                        setActiveTab('ringkasan');
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-50 rounded-xl flex items-center justify-between font-medium text-slate-700 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span>{sensor.name}</span>
                        <span className="text-[10px] text-slate-400">Aliran: {sensor.river}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${sensor.status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                        {sensor.currentLevel} cm
                      </span>
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Alert Badge, Notifications, and Profile */}
        <div className="flex items-center gap-3.5">
          {/* Quick simulation broadcast alert trigger button */}
          <button
            onClick={() => setIsSirenModalOpen(true)}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${getSeverityBadgeClass()}`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Status:</span> {getSeverityLabel()}
          </button>

          {/* Notification Alert Bell icon */}
          <div className="relative">
            <button 
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-full border border-slate-100 transition-all relative"
              title="Notifikasi Masuk"
            >
              <Bell className="w-4.5 h-4.5" />
              {systemLogsAlertCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-bounce" />
              )}
            </button>

            {/* Notification drop popover */}
            <AnimatePresence>
              {showNotificationDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 text-xs"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                    <span className="font-bold text-slate-800">Sinyal Notifikasi</span>
                    <button 
                      onClick={() => setSystemLogsAlertCount(0)}
                      className="text-[10px] text-primary hover:underline font-semibold"
                    >
                      Tandai Dibaca
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                    {alertLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="p-2 hover:bg-slate-50 rounded-xl transition-colors border-l-2 border-primary/50">
                        <div className="font-bold text-slate-800 text-[11px]">{log.title}</div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{log.description}</p>
                        <span className="text-[8px] text-slate-400 font-mono mt-1 block">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Help documentation link */}
          <button 
            onClick={() => {
              alert("AquaShield Pro Help Center\n\nUntuk bantuan operasional posko darurat, silakan gunakan Kontak Darurat di bagian bawah sidebar.");
            }}
            className="p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-full border border-slate-100 transition-all hidden sm:block"
            title="Pusat Bantuan"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>

          {/* User Profile Avatar with hotlink */}
          <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" 
              alt="Operator Profile" 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div id="main-workspace-layout" className="flex-1 flex flex-col lg:flex-row relative">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside 
          id="main-navigation-sidebar" 
          className={`fixed lg:sticky top-[61px] bottom-0 left-0 w-72 bg-white border-r border-slate-100 p-6 flex flex-col justify-between z-[1040] transition-all duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
        >
          {/* Top section: Brand Identity & Menu Items */}
          <div className="space-y-7">
            <div className="space-y-1">
              <h1 className="text-xl font-display font-extrabold text-primary tracking-tight">
                AquaShield <span className="text-secondary">Pro</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Sistem Mitigasi Banjir</p>
            </div>

            {/* Main Navigation menu list */}
            <nav className="space-y-1.5">
              {[
                { id: 'ringkasan', label: 'Ringkasan', icon: <Layers className="w-4.5 h-4.5" /> },
                { id: 'peta-risiko', label: 'Peta Risiko', icon: <Map className="w-4.5 h-4.5" /> },
                { id: 'level-sungai', label: 'Level Sungai', icon: <Waves className="w-4.5 h-4.5" /> },
                { id: 'analitik-ml', label: 'Analitik ML', icon: <Brain className="w-4.5 h-4.5" /> },
                { id: 'laporan', label: 'Laporan', icon: <FileText className="w-4.5 h-4.5" /> },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center justify-between px-4.5 py-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#5bd8fe]/15 text-secondary border border-[#5bd8fe]/25 shadow-sm shadow-[#5bd8fe]/5' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-secondary shrink-0" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom section: Settings, Help & Emergency action trigger */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            {/* Quick settings link */}
            <button 
              onClick={() => {
                alert("Pengaturan Sistem:\n\nMode Malam: Otomatis\nSimulasi Kecepatan: Real-time\nPemberitahuan Suara: Aktif");
              }}
              className="w-full flex items-center gap-3.5 px-4.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Settings className="w-4.5 h-4.5" />
              Pengaturan
            </button>

            {/* Logout link */}
            <button 
              onClick={() => {
                if (confirm("Apakah Anda ingin keluar dari posko utama operasional?")) {
                  alert("Sesi simulasi di-reset.");
                  setSensors(initialSensors);
                  setAlertLogs(initialAlertLogs);
                }
              }}
              className="w-full flex items-center gap-3.5 px-4.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
              Keluar
            </button>

            {/* Contact Hotline trigger button - Styled as a primary block */}
            <button 
              onClick={() => setIsSirenModalOpen(true)}
              className="w-full py-3 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] cursor-pointer"
            >
              <Phone className="w-4 h-4 animate-wave" />
              Kontak Darurat
            </button>
          </div>
        </aside>

        {/* Dynamic Content Switching space */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden min-h-[calc(100vh-61px)] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
              
              {/* TAB 1: SUMMARY / DASHBOARD VIEW (RINGKASAN) */}
              {activeTab === 'ringkasan' && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left content area (Map & Water level widget widgets) */}
                  <div className="xl:col-span-8 flex flex-col gap-6">
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-display font-extrabold text-slate-900 tracking-tight">
                          Dashboard Monitoring Real-time
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pantauan sensor mitigasi bencana luapan tanggul & curah hujan wilayah {deviceLocation ? deviceLocation.region.replace(/\(.*\)/g, '').split(',')[0].trim() : 'Jakarta'}.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Simulation trigger */}
                        <button
                          onClick={() => setIsSimulatingMonsoon(!isSimulatingMonsoon)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${isSimulatingMonsoon ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {isSimulatingMonsoon ? (
                            <>
                              <Square className="w-3.5 h-3.5" /> Stop Simulasi Hujan
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-emerald-500" /> Simulasikan Hujan Lebat
                            </>
                          )}
                        </button>

                        <div className="bg-[#eceef0] text-slate-600 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Live Update: {liveTimestamp}
                        </div>
                      </div>
                    </div>

                    {/* Interactive map widget */}
                    <div className="flex-1">
                      <MapWidget 
                        sensors={sensors}
                        selectedSensor={selectedSensor}
                        onSelectSensor={(s) => setSelectedSensor(s)}
                        showHeatmap={showHeatmap}
                        onToggleHeatmap={(val) => setShowHeatmap(val)}
                        onUpdateSensorCoordinates={handleUpdateSensorCoordinates}
                        onAddSensor={handleAddSensor}
                        deviceLocation={deviceLocation}
                        onDeviceLocationChange={(loc) => setDeviceLocation(loc)}
                      />
                    </div>

                    {/* Bottom Row of Cards (Weather & Specific waterway levels) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      
                      {/* CUACA JAKARTA CARD */}
                      <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-sm flex flex-col justify-between gap-3 group/weather">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            CUACA {deviceLocation ? deviceLocation.region.replace(/\(.*\)/g, '').split(',')[0].trim().toUpperCase() : 'JAKARTA'}
                          </span>
                          <CloudRain className="w-4 h-4 text-secondary animate-wave" />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl font-display font-black text-slate-800 leading-none">
                            {Math.round(weather.temp)}°
                          </span>
                          <div className="space-y-0.5">
                            {/* Weather condition status */}
                            <span className="text-xs font-bold text-slate-800 block leading-tight">{weather.condition}</span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Thermometer className="w-3 h-3 text-red-400" /> Terasa Hangat
                            </span>
                          </div>
                        </div>
                        {/* Interactive Weather condition changer */}
                        <div className="border-t border-slate-50 pt-2 mt-1 flex flex-wrap gap-1">
                          {weatherOptions.map((opt) => (
                            <button
                              key={opt.condition}
                              onClick={() => {
                                setWeather(prev => ({
                                  ...prev,
                                  condition: opt.condition,
                                  humidity: opt.condition === 'Hujan Lebat' ? 92 : opt.condition === 'Cerah' ? 65 : 78
                                }));
                                triggerAlertLog(
                                  `Cuaca Berubah: ${opt.condition}`,
                                  `Sistem meteorologi memperbarui perkiraan cuaca lokal menjadi ${opt.condition}.`,
                                  'low'
                                );
                              }}
                              className={`p-1 rounded text-[9px] font-medium transition-all ${weather.condition === opt.condition ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'hover:bg-slate-50 text-slate-500'}`}
                              title={opt.desc}
                            >
                              {opt.condition === 'Hujan Lebat' ? 'Lebat' : opt.condition === 'Hujan Ringan' ? 'Ringan' : opt.condition === 'Berawan' ? 'Awan' : 'Cerah'}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium font-mono pt-1">
                          <span>💧 {weather.humidity}% Hum</span>
                          <span>💨 {weather.windSpeed} km/h</span>
                        </div>
                      </div>

                      {/* SENSOR 1 SUMMARY CARD */}
                      <div 
                        className={`bg-white rounded-2xl p-4.5 border transition-all cursor-pointer flex flex-col justify-between gap-3 ${selectedSensor?.id === (sensors[0]?.id || 'katulampa') ? 'border-red-500 shadow-md ring-1 ring-red-100' : 'border-red-100 hover:border-red-200'}`}
                        onClick={() => setSelectedSensor(sensors[0] || null)}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
                            {sensors[0] ? `${sensors[0].river} - ${sensors[0].name}` : 'S. CILIWUNG - KATULAMPA'}
                          </span>
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-mono font-bold text-red-600 tracking-tight leading-none">
                            {sensors[0]?.currentLevel || 210}
                          </span>
                          <span className="text-xs text-slate-500">cm</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            sensors[0]?.status === 'Critical' ? 'bg-red-100 text-red-700' :
                            sensors[0]?.status === 'Siaga' ? 'bg-orange-100 text-orange-700' :
                            sensors[0]?.status === 'Waspada' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {sensors[0]?.status === 'Critical' ? 'SIAGA I' : sensors[0]?.status === 'Siaga' ? 'SIAGA II' : sensors[0]?.status === 'Waspada' ? 'SIAGA III' : 'NORMAL'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono line-clamp-1">{sensors[0]?.region || 'Tanggul Hulu'}</span>
                        </div>
                      </div>

                      {/* SENSOR 2 SUMMARY CARD */}
                      <div 
                        className={`bg-white rounded-2xl p-4.5 border transition-all cursor-pointer flex flex-col justify-between gap-3 ${selectedSensor?.id === (sensors[1]?.id || 'pesanggrahan') ? 'border-sky-500 shadow-md ring-1 ring-sky-100' : 'border-slate-100 hover:border-slate-200'}`}
                        onClick={() => setSelectedSensor(sensors[1] || null)}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
                            {sensors[1] ? `${sensors[1].river} - ${sensors[1].name}` : 'KALI PESANGGRAHAN'}
                          </span>
                          <span className="h-2 w-2 rounded-full bg-sky-400 shrink-0" />
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-mono font-bold text-slate-800 tracking-tight leading-none">
                            {sensors[1]?.currentLevel || 145}
                          </span>
                          <span className="text-xs text-slate-500">cm</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            sensors[1]?.status === 'Critical' ? 'bg-red-100 text-red-700' :
                            sensors[1]?.status === 'Siaga' ? 'bg-orange-100 text-orange-700' :
                            sensors[1]?.status === 'Waspada' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {sensors[1]?.status === 'Critical' ? 'SIAGA I' : sensors[1]?.status === 'Siaga' ? 'SIAGA II' : sensors[1]?.status === 'Waspada' ? 'SIAGA III' : 'NORMAL'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono line-clamp-1">{sensors[1]?.region || 'Pesanggrahan'}</span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Right sidebar column area (CCTV, Predictions, Alert Feed) */}
                  <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Live CCTV Feed widget */}
                    <CctvWidget selectedSensorName={selectedSensor?.name || ''} />

                    {/* LSTM Predictions graph */}
                    <PredictionsWidget 
                      selectedSensorName={selectedSensor?.name || ''} 
                      currentLevel={selectedSensor?.currentLevel || 185}
                    />

                    {/* Real-time warnings log stream feed */}
                    <AlertLogsWidget 
                      logs={alertLogs} 
                      onAddLog={triggerAlertLog}
                    />
                  </div>

                </div>
              )}

              {/* TAB 2: DETAILED FULL SCREEN RISK MAP VIEW (PETA RISIKO) */}
              {activeTab === 'peta-risiko' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold text-slate-900">Analisis Peta Spasial Risiko Banjir</h2>
                    <p className="text-xs text-slate-500">Visualisasi area genangan, tinggi pasang air laut, jalur evakuasi, dan daerah terdampak kritis.</p>
                  </div>
                  
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6 min-h-[500px]">
                    <div className="lg:w-8/12 flex flex-col justify-between">
                      <MapWidget 
                        sensors={sensors}
                        selectedSensor={selectedSensor}
                        onSelectSensor={(s) => setSelectedSensor(s)}
                        showHeatmap={showHeatmap}
                        onToggleHeatmap={(val) => setShowHeatmap(val)}
                        onUpdateSensorCoordinates={handleUpdateSensorCoordinates}
                        onAddSensor={handleAddSensor}
                        deviceLocation={deviceLocation}
                        onDeviceLocationChange={(loc) => setDeviceLocation(loc)}
                      />
                    </div>
                    
                    {/* Sidebar map settings & options */}
                    <div className="lg:w-4/12 space-y-5">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">Lapisan Geospasial</h3>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                            <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} className="rounded text-secondary focus:ring-secondary" />
                            Zona Resiko Tinggi (Heatmap)
                          </label>
                          <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded text-secondary focus:ring-secondary" />
                            Aliran Sungai {deviceLocation ? deviceLocation.region.replace(/\(.*\)/g, '').split(',')[0].trim().toUpperCase() : 'DKI'} (Main Riverbeds)
                          </label>
                          <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded text-secondary focus:ring-secondary" />
                            Sensor Ultrasonik (Active Telemetry)
                          </label>
                          <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer">
                            <input type="checkbox" className="rounded text-secondary focus:ring-secondary" />
                            Pintu Air & Tanggul Air (Sluice Gates)
                          </label>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Lokasi Rawan Utama</h3>
                        <div className="space-y-2">
                          {getRawanLocations().map((loc) => (
                            <div key={loc.name} className="bg-white p-2.5 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                              <div>
                                <span className="font-bold text-slate-800">{loc.name}</span>
                                <span className="block text-[10px] text-slate-400">{loc.desc}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${loc.status === 'Sangat Rentan' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                {loc.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WATERWAY MONITORING LIST WITH SIMULATION SLIDERS (LEVEL SUNGAI) */}
              {activeTab === 'level-sungai' && (
                <RiverLevelWidget 
                  sensors={sensors}
                  selectedSensor={selectedSensor}
                  onSelectSensor={(s) => setSelectedSensor(s)}
                  onUpdateSensorLevel={handleUpdateSensorLevel}
                  deviceLocation={deviceLocation}
                />
              )}

              {/* TAB 4: LSTM & RANDOM FOREST AI CONTROLS (ANALITIK ML) */}
              {activeTab === 'analitik-ml' && (
                <MlAnalyticsWidget deviceLocation={deviceLocation} />
              )}

              {/* TAB 5: COMMUNITY REPORTS & FIELD INCIDENTS (LAPORAN) */}
              {activeTab === 'laporan' && (
                <CitizenReportWidget 
                  reports={citizenReports}
                  onAddReport={handleAddCitizenReport}
                  onUpvoteReport={handleUpvoteReport}
                />
              )}

            </motion.div>
          </AnimatePresence>

          {/* Core system status line footer */}
          <footer className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center text-[11px] text-slate-400 gap-4">
            <div>
              © 2026 <strong>AquaShield Pro</strong> • Posko Utama Penanggulangan Bencana Banjir {deviceLocation ? deviceLocation.region.replace(/\(.*\)/g, '').split(',')[0].trim() : 'Jakarta'}.
            </div>
            <div className="flex gap-4 font-mono font-medium">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> AWS Core: Online</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Model Engine: V2.4</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating simulator Action Button for rapid monsoon trigger simulation */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => {
            setIsSimulatingMonsoon(!isSimulatingMonsoon);
            if (!isSimulatingMonsoon) {
              triggerAlertLog(
                "Simuliasi Musim Hujan Aktif",
                "Curah hujan di hulu dan hilir terus naik secara simultan. Memantau peningkatan level kritis sungai.",
                "medium"
              );
            }
          }}
          className={`h-12 w-12 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer ${isSimulatingMonsoon ? 'bg-orange-500 animate-spin-slow' : 'bg-primary'}`}
          title="Simulasikan Curah Hujan Global"
        >
          <CloudLightning className="w-5 h-5" />
        </button>
      </div>

      {/* Emergency Center Broadcast Modal Overlay */}
      <AnimatePresence>
        {isSirenModalOpen && (
          <SirenModal 
            isOpen={isSirenModalOpen}
            onClose={() => setIsSirenModalOpen(false)}
            onTriggerAlert={triggerAlertLog}
            deviceLocation={deviceLocation}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
