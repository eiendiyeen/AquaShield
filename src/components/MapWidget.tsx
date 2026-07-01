import React, { useState, useEffect, useRef } from 'react';
import { Sensor } from '../types';
import { MapPin, Search, ZoomIn, ZoomOut, Compass, Navigation, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapWidgetProps {
  sensors: Sensor[];
  selectedSensor: Sensor | null;
  onSelectSensor: (sensor: Sensor) => void;
  showHeatmap: boolean;
  onToggleHeatmap: (show: boolean) => void;
  onUpdateSensorCoordinates?: (id: string, x: number, y: number) => void;
  onAddSensor?: (newSensor: Sensor) => void;
}

export default function MapWidget({
  sensors,
  selectedSensor,
  onSelectSensor,
  showHeatmap,
  onToggleHeatmap,
}: MapWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Geolocation & Device Location States
  const [deviceLocation, setDeviceLocation] = useState<{ x: number; y: number; lat: number; lon: number; region: string } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Leaflet references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const heatmapOverlayRef = useRef<L.LayerGroup | null>(null);
  const deviceMarkerRef = useRef<L.Marker | null>(null);

  // Map limits and coordinate helpers
  // Longitude ranges roughly from 106.65 (West) to 106.95 (East)
  // Latitude ranges roughly from -6.05 (North) to -6.65 (South)

  // Interpolation helper: Maps real-world latitude/longitude to schematic coordinates % (0-100)
  const mapRealCoordsToSchematic = (lat: number, lon: number) => {
    const minLon = 106.65;
    const maxLon = 106.95;
    let pctX = ((lon - minLon) / (maxLon - minLon)) * 100;
    pctX = Math.max(15, Math.min(85, pctX)); // clamp to avoid edge clipping

    let pctY = 50;
    if (lat < -6.45) {
      const ratio = (lat - (-6.65)) / (-6.45 - (-6.65)); // 0 to 1
      pctY = 80 + ratio * 15; // 80% to 95%
    } else if (lat < -6.32) {
      const ratio = (lat - (-6.45)) / (-6.32 - (-6.45));
      pctY = 65 + ratio * 15; // 65% to 80%
    } else if (lat < -6.32) {
      const ratio = (lat - (-6.32)) / (-6.22 - (-6.32));
      pctY = 50 + ratio * 15; // 50% to 65%
    } else if (lat < -6.15) {
      const ratio = (lat - (-6.22)) / (-6.15 - (-6.22));
      pctY = 35 + ratio * 15; // 35% to 50%
    } else {
      const ratio = (lat - (-6.15)) / (-6.05 - (-6.15));
      pctY = 15 + ratio * 20; // 15% to 35%
    }

    pctY = Math.max(12, Math.min(92, pctY));
    return { x: Math.round(pctX), y: Math.round(pctY) };
  };

  // Maps percent coordinates (0-100) back to real-world latitude/longitude
  const mapSchematicToRealCoords = (x: number, y: number) => {
    const minLon = 106.65;
    const maxLon = 106.95;
    const lng = minLon + (x / 100) * (maxLon - minLon);

    let lat = -6.20;
    if (y >= 80) {
      const ratio = (y - 80) / 15;
      lat = -6.65 + ratio * (-6.45 - (-6.65));
    } else if (y >= 65) {
      const ratio = (y - 65) / 15;
      lat = -6.45 + ratio * (-6.32 - (-6.45));
    } else if (y >= 50) {
      const ratio = (y - 50) / 15;
      lat = -6.32 + ratio * (-6.22 - (-6.32));
    } else if (y >= 35) {
      const ratio = (y - 35) / 15;
      lat = -6.22 + ratio * (-6.15 - (-6.22));
    } else {
      const ratio = (y - 12) / 23; // from 12% to 35%
      lat = -6.15 + ratio * (-6.05 - (-6.15));
    }

    return { lat, lng };
  };

  // Helper to determine region from coordinates
  const getRegionFromCoords = (lat: number, lon: number): string => {
    if (lat < -6.35) return 'Bogor (Hulu)';
    if (lon < 106.78) return 'Jakarta Barat';
    if (lon > 106.88) return 'Jakarta Timur';
    if (lat < -6.24) return 'Jakarta Selatan';
    if (lat > -6.15) return 'Jakarta Utara';
    return 'Jakarta Pusat';
  };

  // Helper to find and select the nearest sensor to a given coordinate
  const selectNearestSensorToCoords = (x: number, y: number) => {
    if (!sensors || sensors.length === 0) return;
    
    let nearestSensor = sensors[0];
    let minDistance = Infinity;
    
    sensors.forEach((sensor) => {
      const dist = Math.sqrt(
        Math.pow(sensor.coordinates.x - x, 2) + 
        Math.pow(sensor.coordinates.y - y, 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestSensor = sensor;
      }
    });
    
    onSelectSensor(nearestSensor);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center of Jakarta
    const centerLat = -6.2088;
    const centerLng = 106.8456;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 11,
      zoomControl: false, // Customized controls used instead
      attributionControl: true
    });

    // Elegant GPS map styled with Light tiles to make it easy to read like a standard GPS
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Click handler to manually set location pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const coords = mapRealCoordsToSchematic(lat, lng);
      const region = getRegionFromCoords(lat, lng);
      
      setDeviceLocation({
        x: coords.x,
        y: coords.y,
        lat: parseFloat(lat.toFixed(5)),
        lon: parseFloat(lng.toFixed(5)),
        region: `${region} (Manual)`
      });

      selectNearestSensorToCoords(coords.x, coords.y);
      setLocationStatus(`Lokasi disesuaikan manual ke ${region}! Sensor terdekat otomatis dipilih.`);
      setTimeout(() => setLocationStatus(null), 4000);
    });

    mapRef.current = map;
    markersGroupRef.current = L.layerGroup().addTo(map);
    heatmapOverlayRef.current = L.layerGroup().addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Custom Zoom Actions
  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetZoom = () => {
    if (mapRef.current) {
      mapRef.current.setView([-6.2088, 106.8456], 11);
    }
  };

  // Sync / Render Sensor Markers
  const filteredSensorsForMap = sensors.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.river.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const map = mapRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    filteredSensorsForMap.forEach((sensor) => {
      const latLng = mapSchematicToRealCoords(sensor.coordinates.x, sensor.coordinates.y);
      const isSelected = selectedSensor?.id === sensor.id;
      
      const statusColors = {
        Critical: { border: '#ef4444', bg: '#ef4444', text: '#ef4444' },
        Siaga: { border: '#f97316', bg: '#f97316', text: '#f97316' },
        Waspada: { border: '#eab308', bg: '#eab308', text: '#eab308' },
        Aman: { border: '#38bdf8', bg: '#38bdf8', text: '#38bdf8' }
      };
      
      const color = statusColors[sensor.status] || statusColors.Aman;
      
      // Create high-contrast custom HTML marker styled with Tailwind
      const iconHtml = `
        <div class="relative flex flex-col items-center cursor-pointer transition-all duration-300" style="transform: translate(-50%, -100%); width: 110px;">
          ${sensor.status === 'Critical' ? '<span class="absolute top-[8px] left-[43px] w-6 h-6 rounded-full border border-red-500 animate-ping opacity-75"></span>' : ''}
          ${sensor.status === 'Siaga' ? '<span class="absolute top-[8px] left-[43px] w-5 h-5 rounded-full border border-orange-500 animate-pulse opacity-50"></span>' : ''}
          
          <div class="p-1 rounded-full border border-slate-700 shadow-xl transition-all ${isSelected ? 'bg-cyan-400 border-white ring-2 ring-cyan-500/50' : 'bg-slate-950 hover:border-cyan-500'}" style="width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#020617' : color.text}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          
          <span class="mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 bg-slate-950/95 text-slate-100 rounded border border-slate-800 text-center truncate max-w-[95px] shadow-md">
            ${sensor.name.split(' - ')[1] || sensor.name.split(' ')[2] || sensor.name}
          </span>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-sensor-marker',
        iconSize: [110, 48],
        iconAnchor: [55, 34]
      });

      const marker = L.marker([latLng.lat, latLng.lng], { icon })
        .addTo(group)
        .on('click', () => {
          onSelectSensor(sensor);
        });

      const popupContent = `
        <div class="p-1 font-sans">
          <div class="font-bold border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between gap-3 text-xs">
            <span>${sensor.name}</span>
            <span class="w-2 h-2 rounded-full inline-block" style="background-color: ${color.bg}"></span>
          </div>
          <div class="space-y-0.5 text-[11px] text-slate-300">
            <div>Sungai: <span class="font-semibold text-sky-400">${sensor.river}</span></div>
            <div>Tinggi Air: <span class="font-mono font-bold text-white">${sensor.currentLevel} cm</span></div>
            <div>Status: <span class="font-bold" style="color: ${color.text}">${sensor.status}</span></div>
            <div class="text-[9px] text-slate-500 font-mono pt-1">${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-leaflet-popup',
        closeButton: false,
        offset: [0, -18]
      });
    });
  }, [filteredSensorsForMap, selectedSensor, onSelectSensor]);

  // Sync / Center map when selected sensor changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedSensor) return;

    const latLng = mapSchematicToRealCoords(selectedSensor.coordinates.x, selectedSensor.coordinates.y);
    map.setView([latLng.lat, latLng.lng], 13, { animate: true });
  }, [selectedSensor?.id]);

  // Sync Risk Heatmap Layers
  useEffect(() => {
    const map = mapRef.current;
    const group = heatmapOverlayRef.current;
    if (!map || !group) return;

    group.clearLayers();

    if (showHeatmap) {
      // Placing elegant glowing semi-transparent circles at high flood-risk areas
      const riskZones = [
        { lat: -6.1124, lng: 106.7915, radius: 2400, color: '#ef4444', label: 'Zona Bahaya Pluit (Rentan Banjir Rob)' },
        { lat: -6.2115, lng: 106.8438, radius: 1800, color: '#f97316', label: 'Zona Siaga Manggarai' },
        { lat: -6.2418, lng: 106.8624, radius: 2000, color: '#ef4444', label: 'Zona Bahaya Aliran Ciliwung' }
      ];

      riskZones.forEach((zone) => {
        L.circle([zone.lat, zone.lng], {
          radius: zone.radius,
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.16,
          weight: 1.5,
          dashArray: '5, 5'
        })
        .addTo(group)
        .bindTooltip(zone.label, { permanent: false, direction: 'center' });
      });
    }
  }, [showHeatmap]);

  // Sync GPS Device Location Marker & Beacon Map Panning
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (deviceLocation) {
      const latLng = mapSchematicToRealCoords(deviceLocation.x, deviceLocation.y);
      map.setView([latLng.lat, latLng.lng], 13, { animate: true });

      if (deviceMarkerRef.current) {
        deviceMarkerRef.current.remove();
      }

      const deviceIconHtml = `
        <div class="relative flex flex-col items-center" style="width: 100px;">
          <!-- Radar visual waves -->
          <span class="absolute top-[8px] left-[38px] w-12 h-12 rounded-full border-2 border-cyan-400 animate-ping opacity-60 pointer-events-none"></span>
          <span class="absolute top-[14px] left-[44px] w-9 h-9 rounded-full bg-cyan-400/20 animate-pulse pointer-events-none"></span>
          
          <div class="p-2 bg-cyan-500 rounded-full border-2 border-slate-900 shadow-2xl text-slate-950 animate-bounce" style="width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" class="transform rotate-45 text-slate-950">
              <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
          </div>
          
          <span class="mt-1 text-[9px] font-mono font-bold px-1.5 py-0.5 bg-cyan-950 text-cyan-300 rounded border border-cyan-800 text-center shadow-lg">
            LOKASI SAYA
          </span>
        </div>
      `;

      const deviceIcon = L.divIcon({
        html: deviceIconHtml,
        className: 'custom-device-marker',
        iconSize: [100, 55],
        iconAnchor: [50, 27]
      });

      deviceMarkerRef.current = L.marker([latLng.lat, latLng.lng], { icon: deviceIcon })
        .addTo(map)
        .bindPopup(`
          <div class="p-1 font-sans">
            <div class="font-bold text-cyan-400 flex items-center gap-1.5 text-xs">
              <span>📍 Lokasi Anda</span>
            </div>
            <div class="text-slate-300 text-[10px] mt-0.5">Wilayah: ${deviceLocation.region}</div>
            <div class="text-slate-500 text-[9px] font-mono">${latLng.lat.toFixed(5)}, ${latLng.lng.toFixed(5)}</div>
          </div>
        `, { closeButton: false, offset: [0, -12] });
    } else {
      if (deviceMarkerRef.current) {
        deviceMarkerRef.current.remove();
        deviceMarkerRef.current = null;
      }
    }
  }, [deviceLocation]);

  // Geolocation Tracker
  const handleTrackDeviceLocation = () => {
    setIsLocating(true);
    setLocationStatus('Mencari sinyal GPS device Anda...');

    if (!navigator.geolocation) {
      setLocationStatus('Geolokasi tidak didukung oleh browser Anda. Silakan klik langsung pada peta untuk mengatur manual!');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords = mapRealCoordsToSchematic(latitude, longitude);
        const isOutsideJakarta = latitude < -6.80 || latitude > -5.90 || longitude < 106.50 || longitude > 107.10;
        const region = getRegionFromCoords(latitude, longitude);

        setDeviceLocation({
          x: coords.x,
          y: coords.y,
          lat: parseFloat(latitude.toFixed(5)),
          lon: parseFloat(longitude.toFixed(5)),
          region: isOutsideJakarta ? `${region} (Luar Area Peta)` : region
        });

        setIsLocating(false);
        selectNearestSensorToCoords(coords.x, coords.y);
        
        if (isOutsideJakarta) {
          setLocationStatus(`Terdeteksi di luar area peta Jakarta/Bogor (Lat: ${latitude.toFixed(3)}, Lon: ${longitude.toFixed(3)}). Sensor terdekat otomatis dipilih!`);
        } else {
          setLocationStatus(`Lokasi terdeteksi di area ${region}! Sensor terdekat otomatis dipilih.`);
        }
        
        setTimeout(() => setLocationStatus(null), 6000);
      },
      (error) => {
        console.warn('Geolocation failed or permission denied, using mock simulation fallback:', error);
        
        let errorMsg = 'Izin GPS ditolak browser. ';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Akses lokasi ditolak browser / iframe. ';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Sinyal lokasi tidak tersedia. ';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Waktu pencarian GPS habis. ';
        }

        const simLat = -6.2735;
        const simLon = 106.8124;
        const coords = mapRealCoordsToSchematic(simLat, simLon);
        const region = 'Jakarta Selatan (Simulasi)';

        setDeviceLocation({
          x: coords.x,
          y: coords.y,
          lat: simLat,
          lon: simLon,
          region
        });

        setIsLocating(false);
        selectNearestSensorToCoords(coords.x, coords.y);
        setLocationStatus(`${errorMsg}Menggunakan simulasi Jakarta Selatan. Sensor terdekat otomatis dipilih.`);
        setTimeout(() => setLocationStatus(null), 8000);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

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
      {/* Styles injector for custom Leaflet integration styles */}
      <style>{`
        .leaflet-container {
          background: #f8fafc !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background: #090d16 !important;
          border: 1px solid #1e293b !important;
          color: #f1f5f9 !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5) !important;
          padding: 4px 6px !important;
        }
        .leaflet-popup-tip {
          background: #090d16 !important;
          border: 1px solid #1e293b !important;
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 6px !important;
        }
        .leaflet-marker-icon {
          background: none !important;
          border: none !important;
        }
        .leaflet-bar {
          border: 1px solid #1e293b !important;
          box-shadow: none !important;
        }
        .leaflet-bar a {
          background-color: #090d16 !important;
          color: #94a3b8 !important;
          border-bottom: 1px solid #1e293b !important;
        }
        .leaflet-bar a:hover {
          background-color: #0f172a !important;
          color: #f1f5f9 !important;
        }
      `}</style>

      {/* Top Map Action Bar */}
      <div id="map-action-bar" className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap gap-2 items-center justify-between pointer-events-auto">
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
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
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

        {/* Map Search and Device GPS Tracker Controls */}
        <div className="flex items-center gap-2 max-w-md w-full sm:w-auto">
          <button
            onClick={handleTrackDeviceLocation}
            disabled={isLocating}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg select-none cursor-pointer ${deviceLocation ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold hover:bg-cyan-400' : 'bg-slate-950/85 text-slate-200 border-slate-800 hover:text-white hover:bg-slate-900'}`}
            title="Deteksi lokasi fisik device Anda menggunakan GPS"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Navigation className={`w-3.5 h-3.5 ${deviceLocation ? 'fill-slate-950 text-slate-950' : 'text-cyan-400'}`} />
            )}
            <span>{isLocating ? 'Melacak...' : deviceLocation ? 'Lokasi Saya Aktif' : 'Ikuti Lokasi Device'}</span>
          </button>

          {deviceLocation && (
            <button
              onClick={() => {
                setDeviceLocation(null);
                setSearchQuery('');
                handleResetZoom();
              }}
              className="px-2.5 py-1.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-400 hover:text-slate-200 rounded-full transition-colors cursor-pointer"
              title="Reset ke tampilan default seluruh Jakarta"
            >
              Reset
            </button>
          )}

          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Cari sensor/daerah..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-28 sm:w-40 pl-9 pr-3 py-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-full text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary shadow-lg placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Floating GPS Location Status Notification */}
      {locationStatus && (
        <div className="absolute top-18 left-4 right-4 z-[1000] bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl flex items-center justify-between gap-3 text-[11px] animate-fade-in pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <div className="text-slate-200 leading-snug font-medium">
              {locationStatus}
            </div>
          </div>
          <button
            onClick={() => setLocationStatus(null)}
            className="text-slate-400 hover:text-slate-200 font-bold px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Real Geographic Leaflet Map Layer */}
      <div 
        ref={mapContainerRef}
        id="leaflet-map" 
        className="w-full h-full flex-1 z-0 cursor-grab active:cursor-grabbing"
        style={{ minHeight: '380px' }}
      />

      {/* Interactive Manual Location Tip */}
      <div className="absolute top-[80px] right-4 z-[999] bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-slate-300 shadow-lg pointer-events-none max-w-[200px] text-right hidden sm:block leading-relaxed">
        💡 <strong className="text-cyan-400">TIPS:</strong> Klik/tap mana saja pada peta GPS untuk mengatur koordinat <strong className="text-cyan-400">Lokasi Saya</strong> Anda secara manual!
      </div>

      {/* Floating Zoom & Map Orientation Controls */}
      <div id="map-controls" className="absolute right-4 bottom-4 z-[999] flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 flex items-center justify-center bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-lg shadow-xl transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 flex items-center justify-center bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-lg shadow-xl transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={handleResetZoom}
          className="w-10 h-10 flex items-center justify-center bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-200 hover:text-white rounded-lg shadow-xl transition-all cursor-pointer"
          title="Reset View"
        >
          <Compass className="w-4 h-4 animate-spin-slow" />
        </button>
      </div>

      {/* Overlay Affected Regions Card */}
      <div id="affected-regions-overlay" className="absolute bottom-4 left-4 z-[999] max-w-[280px] w-full bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-xl p-4 shadow-2xl">
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
