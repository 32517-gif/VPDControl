
export type ThemeType = 'emerald' | 'sapphire' | 'obsidian' | 'rose';

export interface EnvironmentLog {
  timestamp: string;
  temp: number;
  hum: number;
  soil: number;
  vpd: number;
}

export interface DeviceControlLog {
  timestamp: string;
  fogIntensity: number;
  fanSpeed: number;
  mode: 'Auto' | 'Manual';
}

export enum VpdStatus {
  OPTIMAL = 'Optimal',
  STRESS = 'Stress',
  LOW = 'Low Transpiration'
}

export interface SystemStatus {
  lastUpdate: string;
  currentTemp: number;
  currentHum: number;
  currentSoil: number;
  currentVpd: number;
  totalGdd: number;
  isAutoMode: boolean;
  fogIntensity: number;
  fanSpeed: number;
}
