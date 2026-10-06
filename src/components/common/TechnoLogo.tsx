import React, { useState } from 'react';

interface TechnoLogoProps {
  variant?: 'full' | 'icon' | 'white' | 'badge';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TechnoLogo: React.FC<TechnoLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md'
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-12',
    xl: 'h-16'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official TechnoSchool logo fetched from technoschool.in */}
      {!imageError ? (
        <div className={`flex items-center ${variant === 'white' ? 'brightness-0 invert' : ''}`}>
          <img
            src="/assets/logo.png"
            alt="TechnoSchool Logo"
            className={`${sizeClasses[size]} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#03A695] to-[#0B2545] flex items-center justify-center text-white font-black text-lg shadow-md shadow-teal-500/20">
            <span className="text-[#FD5E01]">T</span>S
          </div>
          <div className="flex flex-col">
            <span className={`font-extrabold tracking-tight leading-none text-base ${variant === 'white' ? 'text-white' : 'text-[#0B2545]'}`}>
              Techno<span className="text-[#03A695]">School</span>
            </span>
            <span className="text-[9px] font-bold tracking-widest uppercase text-[#5B6B7C]">
              ICT & STEM Leader
            </span>
          </div>
        </div>
      )}

      {/* Talent Feast Product Badge */}
      {variant === 'badge' && (
        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l-2 border-[#03A695]/30">
          <div className="px-2.5 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] border border-[#03A695]/30 text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FD5E01]" />
            <span>TALENT FEAST 2026</span>
          </div>
        </div>
      )}
    </div>
  );
};
