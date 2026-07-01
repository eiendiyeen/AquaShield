import { Sensor, WeatherInfo, AlertLog, CitizenReport } from './types';

export const initialSensors: Sensor[] = [
  {
    id: 'katulampa',
    name: 'S. Ciliwung - Katulampa',
    river: 'Ciliwung',
    currentLevel: 210,
    normalThreshold: 80,
    alertLevel3: 150,
    alertLevel2: 180,
    alertLevel1: 200,
    status: 'Critical',
    coordinates: { x: 50, y: 88 },
    region: 'Bogor (Hulu)',
    history: [110, 120, 135, 140, 160, 175, 190, 195, 205, 212, 215, 210]
  },
  {
    id: 'manggarai',
    name: 'Pintu Air Manggarai',
    river: 'Ciliwung',
    currentLevel: 185,
    normalThreshold: 100,
    alertLevel3: 150,
    alertLevel2: 180,
    alertLevel1: 210,
    status: 'Siaga',
    coordinates: { x: 55, y: 52 },
    region: 'Jakarta Selatan',
    history: [120, 125, 130, 140, 145, 155, 160, 170, 175, 180, 182, 185]
  },
  {
    id: 'pesanggrahan',
    name: 'Kali Pesanggrahan',
    river: 'Pesanggrahan',
    currentLevel: 145,
    normalThreshold: 120,
    alertLevel3: 150,
    alertLevel2: 180,
    alertLevel1: 220,
    status: 'Aman',
    coordinates: { x: 32, y: 65 },
    region: 'Jakarta Barat',
    history: [95, 100, 105, 110, 120, 125, 130, 132, 135, 138, 142, 145]
  },
  {
    id: 'pluit',
    name: 'Pintu Air Pluit',
    river: 'Waduk Pluit',
    currentLevel: 280, // in cm (Critical)
    normalThreshold: 150,
    alertLevel3: 200,
    alertLevel2: 240,
    alertLevel1: 270,
    status: 'Critical',
    coordinates: { x: 42, y: 25 },
    region: 'Jakarta Utara',
    history: [210, 220, 235, 240, 250, 262, 268, 272, 275, 278, 282, 280]
  },
  {
    id: 'angke',
    name: 'Angke Hulu',
    river: 'Angke',
    currentLevel: 165,
    normalThreshold: 130,
    alertLevel3: 160,
    alertLevel2: 190,
    alertLevel1: 230,
    status: 'Waspada',
    coordinates: { x: 22, y: 48 },
    region: 'Jakarta Barat',
    history: [110, 115, 120, 135, 140, 142, 148, 152, 155, 158, 162, 165]
  },
  {
    id: 'karet',
    name: 'Pintu Air Karet',
    river: 'Banjir Kanal Barat',
    currentLevel: 152,
    normalThreshold: 120,
    alertLevel3: 150,
    alertLevel2: 180,
    alertLevel1: 210,
    status: 'Waspada',
    coordinates: { x: 45, y: 42 },
    region: 'Jakarta Pusat',
    history: [115, 120, 122, 128, 132, 136, 140, 142, 145, 148, 150, 152]
  }
];

export const initialWeather: WeatherInfo = {
  temp: 26,
  condition: 'Hujan Lebat',
  humidity: 88,
  windSpeed: 12
};

export const initialAlertLogs: AlertLog[] = [
  {
    id: 'alert-1',
    title: 'Siaga I - Katulampa',
    time: '13:45 WIB',
    timeRaw: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    description: 'Elevasi melebihi 200cm. Sirine peringatan aktif di zona hilir Ciliwung.',
    severity: 'high'
  },
  {
    id: 'alert-2',
    title: 'Waspada Cuaca Ekstrem',
    time: '12:30 WIB',
    timeRaw: new Date(Date.now() - 90 * 60 * 1000), // 1.5h ago
    description: 'BMKG merilis peringatan hujan lebat disertai kilat untuk wilayah Jabodetabek.',
    severity: 'medium'
  },
  {
    id: 'alert-3',
    title: 'Maintenance Sensor Selesai',
    time: '10:15 WIB',
    timeRaw: new Date(Date.now() - 225 * 60 * 1000), // 3h 45m ago
    description: 'Sensor ultrasonik di Kali Grogol telah dikalibrasi ulang. Status online.',
    severity: 'low'
  },
  {
    id: 'alert-4',
    title: 'Sistem Checksum Normal',
    time: '08:00 WIB',
    timeRaw: new Date(Date.now() - 360 * 60 * 1000), // 6h ago
    description: 'Seluruh gerbang air (Sluice Gates) beroperasi normal dengan daya cadangan.',
    severity: 'success'
  }
];

export const initialCitizenReports: CitizenReport[] = [
  {
    id: 'report-1',
    title: 'Banjir Semata Kaki',
    reporter: 'Rian H.',
    location: 'Kebon Baru, Tebet',
    depth: 30,
    timestamp: '14:10 WIB',
    status: 'Diverifikasi',
    description: 'Air luapan Ciliwung mulai masuk ke pemukiman setinggi 30 cm. Warga bersiap memindahkan barang ke lantai 2.',
    upvotes: 24
  },
  {
    id: 'report-2',
    title: 'Genangan Jalan Raya',
    reporter: 'Dewi S.',
    location: 'Jl. Daan Mogot, Grogol',
    depth: 45,
    timestamp: '13:55 WIB',
    status: 'Dalam Penanganan',
    description: 'Genangan setinggi 40-50 cm di depan Mal Ciputra. Kemacetan parah mengular hingga 3 km. Unit pompa mobile sedang dikerahkan.',
    upvotes: 42
  },
  {
    id: 'report-3',
    title: 'Pintu Air Siaga',
    reporter: 'BPBD Pos Pantau',
    location: 'Kampung Melayu',
    depth: 60,
    timestamp: '13:12 WIB',
    status: 'Dalam Penanganan',
    description: 'Genangan di pemukiman bantaran sungai RT 11/RW 03 sudah setinggi paha orang dewasa (60 cm). Evakuasi lansia sedang dilakukan menggunakan perahu karet.',
    upvotes: 56
  }
];

export const calculateStatus = (level: number, sensor: Omit<Sensor, 'status'>): Sensor['status'] => {
  if (level >= sensor.alertLevel1) return 'Critical';
  if (level >= sensor.alertLevel2) return 'Siaga';
  if (level >= sensor.alertLevel3) return 'Waspada';
  return 'Aman';
};
