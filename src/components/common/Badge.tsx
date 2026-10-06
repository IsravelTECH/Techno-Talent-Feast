import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'orange' | 'success' | 'warning' | 'danger' | 'neutral' | 'live';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  dot = false
}) => {
  const variantStyles = {
    primary: 'bg-[#EAF3FF] text-[#0057B8] border-blue-200',
    orange: 'bg-[#FFF3EC] text-[#F36C21] border-orange-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    live: 'bg-red-50 text-red-600 border-red-200 font-bold'
  };

  const dotColors = {
    primary: 'bg-[#0057B8]',
    orange: 'bg-[#F36C21]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    neutral: 'bg-slate-500',
    live: 'bg-red-500 animate-pulse'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-bold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
