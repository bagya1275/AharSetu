import React from 'react';

interface LogoMarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'auto' | 'dark' | 'light';
  className?: string;
}

export const LogoMark: React.FC<LogoMarkProps> = ({ 
  size = 'md', 
  showText = true,
  variant = 'auto',
  className = ''
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-lg text-lg', text: 'text-lg', sub: 'text-[8px]' },
    md: { box: 'w-10 h-10 rounded-xl text-2xl', text: 'text-2xl', sub: 'text-[9px]' },
    lg: { box: 'w-12 h-12 rounded-2xl text-3xl', text: 'text-3xl', sub: 'text-[10px]' },
    xl: { box: 'w-14 h-14 rounded-2xl text-4xl', text: 'text-4xl', sub: 'text-[11px]' },
  }[size];

  const textColor = variant === 'dark' 
    ? 'text-white' 
    : variant === 'light' 
    ? 'text-[#111827]' 
    : 'text-[#111827] dark:text-white';

  const subColor = variant === 'dark' 
    ? 'text-emerald-200/80' 
    : 'text-gray-400 dark:text-slate-400';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Optimal Simple "A" Badge */}
      <div className={`relative ${sizeMap.box} bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-800 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20 border border-emerald-400/30 overflow-hidden shrink-0`}>
        {/* Subtle Bridge/Setu Arc Accent */}
        <span className="font-sans font-extrabold tracking-tighter drop-shadow-sm transform -translate-y-[0.5px]">
          A
        </span>
        <div className="absolute bottom-0.5 inset-x-2 h-0.5 bg-gradient-to-r from-amber-300 via-emerald-200 to-amber-300 rounded-full opacity-90" />
      </div>

      {showText && (
        <div className="leading-none">
          <span className={`${sizeMap.text} font-extrabold tracking-tight ${textColor}`}>
            Ahar<span className="text-[#16A34A]">Setu</span>
          </span>
          <span className={`block ${sizeMap.sub} font-bold ${subColor} tracking-widest uppercase mt-0.5`}>
            Smart Redistribution
          </span>
        </div>
      )}
    </div>
  );
};
