
import { VpdStatus } from '../types';

/**
 * Calculates Vapor Pressure Deficit (kPa)
 * VPD = ES - EA
 * ES = 0.6108 * exp(17.27 * T / (T + 237.3))
 * EA = ES * (RH / 100)
 */
export const calculateVpd = (temp: number, humidity: number): number => {
  const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  const ea = es * (humidity / 100);
  return parseFloat((es - ea).toFixed(2));
};

export const getVpdStatus = (vpd: number): VpdStatus => {
  if (vpd < 0.4) return VpdStatus.LOW;
  if (vpd >= 0.8 && vpd <= 1.2) return VpdStatus.OPTIMAL;
  return VpdStatus.STRESS;
};

/**
 * Calculates Daily Growing Degree Days
 * GDD = ((Tmax + Tmin) / 2) - Tbase
 */
export const calculateDailyGdd = (tmax: number, tmin: number, tbase: number = 10): number => {
  const avg = (tmax + tmin) / 2;
  return Math.max(0, avg - tbase);
};
