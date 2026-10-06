import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlight?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border transition-all duration-200 ${
        highlight
          ? 'bg-gradient-to-br from-[#0057B8] to-[#003B7A] text-white border-blue-600 shadow-lg shadow-blue-900/15'
          : 'bg-white text-slate-800 border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-blue-200'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-xs font-semibold tracking-wider uppercase ${
              highlight ? 'text-blue-100' : 'text-[#64748B]'
            }`}
          >
            {title}
          </p>
          <h3
            className={`text-2xl lg:text-3xl font-extrabold mt-1 tracking-tight ${
              highlight ? 'text-white' : 'text-slate-900'
            }`}
          >
            {value}
          </h3>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
            highlight
              ? 'bg-white/15 text-white backdrop-blur-xs'
              : 'bg-[#EAF3FF] text-[#0057B8]'
          }`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && (
            <span className={highlight ? 'text-blue-200' : 'text-slate-500'}>
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={`font-semibold flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
