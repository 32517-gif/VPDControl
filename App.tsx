
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Sprout, 
  Settings, 
  Wind, 
  RefreshCcw,
  BarChart3,
  CloudFog,
  Fan,
  CheckCircle2,
  Palette,
  Loader2,
  AlertCircle,
  Activity,
  BrainCircuit,
  Terminal,
  ChevronRight,
  Code2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { EnvironmentLog, SystemStatus, VpdStatus, ThemeType } from './types';
import { getVpdStatus } from './services/botany';
import { getBotanicalAdvice } from './services/gemini';
import StatCard from './components/StatCard';

const runBackend = (funcName: string, ...args: any[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    const google = (window as any).google;
    if (typeof google !== 'undefined' && google.script && google.script.run) {
      google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject)[funcName](...args);
    } else {
      console.warn(`Local Mock: ${funcName} called`);
      setTimeout(() => resolve(null), 800);
    }
  });
};

const THEMES: Record<ThemeType, { label: string, color: string }> = {
  emerald: { label: 'Emerald', color: '#10b981' },
  sapphire: { label: 'Sapphire', color: '#3b82f6' },
  obsidian: { label: 'Slate', color: '#334155' },
  rose: { label: 'Rose', color: '#f43f5e' }
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeType>('emerald');
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [showHardwareGuide, setShowHardwareGuide] = useState(false);

  const [status, setStatus] = useState<SystemStatus>({
    lastUpdate: '--:--',
    currentTemp: 0,
    currentHum: 0,
    currentSoil: 0,
    currentVpd: 0,
    totalGdd: 0,
    isAutoMode: true,
    fogIntensity: 0,
    fanSpeed: 0
  });

  const [history, setHistory] = useState<EnvironmentLog[]>([]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 60000); // Auto refresh every minute
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const data = await runBackend('getDashboardData');
      if (data) {
        setHistory(data.history);
        setStatus({
          lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          currentTemp: data.current.temp,
          currentHum: data.current.hum,
          currentSoil: data.current.soil,
          currentVpd: data.current.vpd,
          totalGdd: data.totalGdd,
          isAutoMode: data.device.mode === 'Auto',
          fogIntensity: data.device.fog,
          fanSpeed: data.device.fan
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAiAdvice = async () => {
    setAiLoading(true);
    const advice = await getBotanicalAdvice(status as any);
    setAiAdvice(advice);
    setAiLoading(false);
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    await runBackend('executeActuators', status.fogIntensity, status.fanSpeed, status.isAutoMode ? 'Auto' : 'Manual');
    setIsDeploying(false);
    setDeploySuccess(true);
    setTimeout(() => setDeploySuccess(false), 3000);
  };

  const activeTheme = THEMES[theme];
  const vpdInfo = getVpdStatus(status.currentVpd);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 relative min-h-screen">
      
      {/* Theme & Meta Controls */}
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <button 
          onClick={() => setShowHardwareGuide(true)}
          className="p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm transition-all"
          title="Hardware Setup"
        >
          <Terminal size={20} />
        </button>
        <button 
          onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
          className="p-3 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200 text-slate-500 shadow-sm transition-all"
        >
          <Palette size={20} />
        </button>
        {isThemeMenuOpen && (
          <div className="absolute top-14 right-0 bg-white border border-slate-200 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 w-40 animate-in fade-in slide-in-from-top-2">
            {(Object.keys(THEMES) as ThemeType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTheme(t); setIsThemeMenuOpen(false); }}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all text-xs font-bold text-slate-600"
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEMES[t].color }} />
                {THEMES[t].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Header */}
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-xl">
            <Sprout size={28} />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Veridian<span style={{ color: activeTheme.color }}>Core</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <p className="text-slate-400 text-sm font-bold flex items-center gap-2">
            <Activity size={14} className="animate-pulse text-emerald-500" />
            System Online • Pulse Sync: {status.lastUpdate}
          </p>
          <div className="flex items-center gap-4 bg-white/50 border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Growth Index</span>
            <span className="text-xl font-black text-slate-900">{status.totalGdd} <span className="text-[10px] text-slate-300">GDD</span></span>
          </div>
          <button onClick={refreshData} disabled={isRefreshing} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <RefreshCcw size={18} className={`text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Temp" value={status.currentTemp} unit="°C" icon={<Thermometer size={18} />} accentColor={activeTheme.color} />
            <StatCard label="RH" value={status.currentHum} unit="%" icon={<Droplets size={18} />} accentColor={activeTheme.color} />
            <StatCard label="Soil" value={status.currentSoil} unit="%" icon={<Sprout size={18} />} accentColor={activeTheme.color} />
            <StatCard label="VPD" value={status.currentVpd} unit="kPa" icon={<Wind size={18} />} status={vpdInfo} accentColor={activeTheme.color} />
          </div>

          {/* Chart */}
          <div className="card-minimal p-8">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="text-slate-300" size={20} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Environment Timeline (24h)</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorVpd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={activeTheme.color} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={activeTheme.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="vpd" stroke={activeTheme.color} fill="url(#colorVpd)" strokeWidth={3} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Advisor Section */}
          <div className="card-minimal p-8 bg-gradient-to-br from-white to-slate-50 border-emerald-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BrainCircuit className="text-emerald-500" size={24} />
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Emerald AI Advisor</h3>
              </div>
              <button 
                onClick={handleAiAdvice}
                disabled={aiLoading}
                className="flex items-center gap-2 text-[10px] font-black uppercase bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="animate-spin" size={14} /> : <ChevronRight size={14} />}
                Analyze Now
              </button>
            </div>
            <div className="min-h-[60px] flex items-center">
              {aiAdvice ? (
                <p className="text-slate-600 text-sm leading-relaxed font-medium animate-in fade-in slide-in-from-left-4">
                  {aiAdvice}
                </p>
              ) : (
                <p className="text-slate-300 text-xs italic">กดปุ่มวิเคราะห์เพื่อรับคำแนะนำจากระบบ AI โดยอ้างอิงจากค่าเซนเซอร์ปัจจุบัน</p>
              )}
            </div>
          </div>
        </div>

        {/* Control Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-minimal p-8 space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Hardware Control</h3>
              <button 
                onClick={() => setStatus(s => ({...s, isAutoMode: !s.isAutoMode}))}
                className={`text-[9px] font-black uppercase px-4 py-2 rounded-full border-2 transition-all ${status.isAutoMode ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-200 text-slate-400'}`}
              >
                {status.isAutoMode ? 'Auto Mode' : 'Manual Mode'}
              </button>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <CloudFog size={16} className="text-blue-400" /> Mist (Fog)
                  </div>
                  <span className="text-xl font-black text-slate-900">{status.fogIntensity}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={status.fogIntensity} 
                  disabled={status.isAutoMode}
                  onChange={(e) => setStatus(s => ({...s, fogIntensity: parseInt(e.target.value)}))}
                  className="accent-emerald-500 w-full disabled:opacity-30"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <Fan size={16} className="text-cyan-400" /> Ventilation
                  </div>
                  <span className="text-xl font-black text-slate-900">{status.fanSpeed}%</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={status.fanSpeed} 
                  disabled={status.isAutoMode}
                  onChange={(e) => setStatus(s => ({...s, fanSpeed: parseInt(e.target.value)}))}
                  className="accent-emerald-500 w-full disabled:opacity-30"
                />
              </div>
            </div>

            <button 
              onClick={handleDeploy}
              disabled={isDeploying}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl flex items-center justify-center gap-2 ${deploySuccess ? 'bg-emerald-500' : 'bg-slate-900'} text-white active:scale-95`}
            >
              {isDeploying ? <Loader2 className="animate-spin" size={16} /> : deploySuccess ? <CheckCircle2 size={16} /> : <RefreshCcw size={16} />}
              {isDeploying ? 'Syncing...' : deploySuccess ? 'Success' : 'Push Config'}
            </button>
          </div>

          <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] flex gap-4">
            <AlertCircle className="text-slate-300 shrink-0" size={20} />
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
              เครื่องจะอ่านคำสั่งล่าสุดจาก Google Sheets ทุกๆ 5 นาทีเพื่อปรับการทำงานของระบบพ่นหมอกและพัดลม
            </p>
          </div>
        </div>
      </div>

      {/* Hardware Guide Modal */}
      {showHardwareGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <Code2 className="text-slate-900" size={24} />
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">Hardware Setup Guide</h2>
              </div>
              <button onClick={() => setShowHardwareGuide(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <Settings size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8">
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-3">1. Wiring Diagram</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="p-3 border-r border-slate-200">DHT22 (Temp/Hum) → GPIO 4</div>
                  <div className="p-3">Soil Sensor (Analog) → GPIO 1 (A1)</div>
                  <div className="p-3 border-r border-slate-200">Relay Mist → GPIO 5</div>
                  <div className="p-3">Relay Fan → GPIO 6</div>
                </div>
              </section>
              <section>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-3">2. ESP32-C3 Firmware</h4>
                <p className="text-xs text-slate-500 mb-4">ดาวน์โหลดโค้ด ESP32 ได้จากไฟล์ <code className="bg-slate-100 px-1 rounded text-slate-900">Hardware_ESP32.ino</code> และระบุ Web App URL ของคุณลงในส่วน <code className="text-blue-500">const char* gasUrl</code></p>
                <div className="bg-slate-900 rounded-2xl p-4 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                  // Example POST Payload<br/>
                  {'{ "temp": 28.5, "hum": 65, "soil": 45 }'}
                </div>
              </section>
            </div>
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setShowHardwareGuide(false)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 text-center pb-10">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-200">Emerald Precision • Botanical OS v1.0</p>
      </footer>
    </div>
  );
};

export default App;
