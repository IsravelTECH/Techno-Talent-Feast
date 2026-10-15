import React from 'react';

export const getNameInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return 'U';
  // Strip common honorifics/titles (Dr., Prof., Mr., Mrs., Ms.)
  const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  // First letter of first word + first letter of last word (e.g. Ramesh kumar -> RK, Rajesh -> R)
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Deterministic palette based on name string for visual distinction
const PALETTES = [
  'bg-[#03A695] text-white border-teal-300/40',
  'bg-[#FD5E01] text-white border-orange-300/40',
  'bg-[#0B2545] text-white border-blue-400/30',
  'bg-[#008C7E] text-white border-teal-400/40',
  'bg-[#E05200] text-white border-orange-400/40',
  'bg-[#047857] text-white border-emerald-300/40',
  'bg-[#0F766E] text-white border-teal-300/40',
  'bg-[#B45309] text-white border-amber-300/40'
];

const getColorClass = (name: string): string => {
  if (!name) return PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  return PALETTES[index];
};

interface UserAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'color' | 'brand';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 'md',
  className = '',
  variant = 'brand'
}) => {
  const initials = getNameInitials(name);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] rounded-lg',
    sm: 'w-8 h-8 text-xs rounded-xl',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-12 h-12 text-base rounded-2xl',
    xl: 'w-16 h-16 text-xl rounded-2xl'
  };

  const bgStyle =
    variant === 'color'
      ? getColorClass(name)
      : 'bg-gradient-to-br from-[#03A695] to-[#0B2545] text-white border-teal-400/30';

  return (
    <div
      className={`inline-flex items-center justify-center font-black tracking-wider uppercase select-none shrink-0 border shadow-xs ${sizeClasses[size]} ${bgStyle} ${className}`}
      title={name}
      aria-label={name}
    >
      <span>{initials}</span>
    </div>
  );
};
