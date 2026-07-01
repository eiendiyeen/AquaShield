export type SensorStatus = 'Aman' | 'Waspada' | 'Siaga' | 'Critical';

export interface Sensor {
  id: string;
  name: string;
  river: string;
  currentLevel: number;
  normalThreshold: number;
  alertLevel3: number; // Waspada
  alertLevel2: number; // Siaga
  alertLevel1: number; // Critical
  status: SensorStatus;
  coordinates: { x: number; y: number }; // Percentage coordinates for our map representation
  region: string;
  history: number[]; // Last 12 hourly readings
}

export interface WeatherInfo {
  temp: number;
  condition: 'Hujan Lebat' | 'Hujan Ringan' | 'Berawan' | 'Cerah' | 'Hujan Badai';
  humidity: number;
  windSpeed: number;
}

export interface MLPredictionData {
  time: string;
  actual: number;
  predicted: number;
}

export interface AlertLog {
  id: string;
  title: string;
  time: string;
  timeRaw: Date;
  description: string;
  severity: 'high' | 'medium' | 'low' | 'success';
}

export interface CitizenReport {
  id: string;
  title: string;
  reporter: string;
  location: string;
  depth: number; // in cm
  timestamp: string;
  status: 'Diverifikasi' | 'Dalam Penanganan' | 'Selesai';
  description: string;
  upvotes: number;
}
