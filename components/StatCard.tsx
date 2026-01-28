
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  status?: string;
  accentColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, status, accentColor }) => {
  return (
    <div className="card-minimal p-7 flex flex-col justify-between">
      <div className="flex justify-between items-start mb-6">
        <span className="text-slate-400 text-[10px] uppercase font-black tracking-widest">{label}</span>
        <div style={{ color: accentColor }} className="opacity-60 bg-slate-50 p-2 rounded-xl">
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-slate-900 tracking-tighter">{value}</span>
          {unit && <span className="text-slate-400 text-xs font-black uppercase tracking-wider">{unit}</span>}
        </div>
        {status && (
          <div className="mt-3">
            <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 tracking-widest inline-block border border-slate-200">
              {status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
