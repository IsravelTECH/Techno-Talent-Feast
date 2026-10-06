import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'orange' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 shadow-xs rounded-xl',
    md: 'text-xs px-4 py-2 gap-2 shadow-sm rounded-xl',
    lg: 'text-sm px-5 py-2.5 gap-2.5 shadow-md rounded-2xl'
  };

  const variantStyles = {
    primary: 'bg-[#03A695] hover:bg-[#008C7E] text-white focus:ring-[#03A695] shadow-teal-900/10',
    orange: 'bg-[#FD5E01] hover:bg-[#E05200] text-white focus:ring-[#FD5E01] shadow-orange-900/15',
    secondary: 'bg-white hover:bg-[#F7FCFB] text-[#03A695] border border-[#03A695]/40 focus:ring-[#03A695]',
    outline: 'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-200 focus:ring-slate-400',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus:ring-slate-300 shadow-none',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-900/10'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : icon && iconPosition === 'left' ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
};
