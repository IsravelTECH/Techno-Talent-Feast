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
      className={`relative p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 ${
        highlight
          ? 'bg-gradient-to-br from-[#03A695] to-[#0B2545] text-white border-teal-500 shadow-lg shadow-teal-900/15'
          : 'bg-white text-slate-800 border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-teal-200'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={`text-[10px] sm:text-xs font-semibold tracking-wider uppercase truncate ${
              highlight ? 'text-teal-100' : 'text-[#64748B]'
            }`}
          >
            {title}
          </p>
          <h3
            className={`text-xl sm:text-2xl lg:text-3xl font-extrabold mt-0.5 sm:mt-1 tracking-tight truncate ${
              highlight ? 'text-white' : 'text-slate-900'
            }`}
          >
            {value}
          </h3>
        </div>
        <div
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${
            highlight
              ? 'bg-white/15 text-white backdrop-blur-xs'
              : 'bg-[#E6F7F5] text-[#03A695]'
          }`}
        >
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs">
          {subtitle && (
            <span className={`truncate mr-1 ${highlight ? 'text-teal-200' : 'text-slate-500'}`}>
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
