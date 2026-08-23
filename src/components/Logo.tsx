import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textClassName = '',
}) => {
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconSizeMap = {
    sm: 36,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const px = iconSizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`} id="brand-logo-container">
      <div className={`relative shrink-0 flex items-center justify-center rounded-full bg-white shadow-xs ring-1 ring-[#065f46]/20 p-1 ${sizeMap[size]}`}>
        <svg
          width={px}
          height={px}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Outer circle border */}
          <circle cx="80" cy="80" r="74" stroke="#22c55e" strokeWidth="2.5" strokeOpacity="0.5" fill="#fcfdfd" />
          <circle cx="80" cy="80" r="70" stroke="#044e42" strokeWidth="1.5" strokeOpacity="0.8" fill="white" />

          {/* House Structure */}
          {/* Chimney */}
          <path
            d="M 96 46 L 96 66 L 88 60 L 88 46 Z"
            fill="#0b463a"
          />
          {/* Chimney Cap */}
          <rect x="85" y="44" width="14" height="4" rx="1.5" fill="#0b463a" />

          {/* House Roof & Body */}
          <path
            d="M 80 44 L 118 76 L 112 76 L 112 110 L 48 110 L 48 76 L 42 76 Z"
            fill="#0f5145"
            stroke="#09382f"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* House Glowing Inner Space */}
          <path
            d="M 80 50 L 108 75 L 106 106 L 54 106 L 54 75 Z"
            fill="url(#houseInnerGlow)"
          />

          {/* Door / Entrance */}
          <path
            d="M 70 82 Q 80 77 90 82 L 90 106 L 70 106 Z"
            fill="#0a3c32"
          />

          {/* Sun / Light Ray inside house */}
          <circle cx="78" cy="72" r="14" fill="#fbbf24" fillOpacity="0.4" />

          {/* Dynamic Sprouting Fresh Leaves */}
          {/* Big Leaf */}
          <path
            d="M 68 88 C 45 74 38 48 64 36 C 78 52 74 76 68 88 Z"
            fill="url(#leafGradient1)"
            stroke="#0b463a"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Leaf vein 1 */}
          <path
            d="M 46 54 C 54 60 62 72 68 88"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />

          {/* Small Top Leaf */}
          <path
            d="M 62 46 C 52 38 52 26 64 22 C 70 30 68 40 62 46 Z"
            fill="url(#leafGradient2)"
            stroke="#0b463a"
            strokeWidth="1.5"
          />

          {/* Organic Leaf Stem wrapping around */}
          <path
            d="M 68 88 C 66 98 56 106 48 108 C 42 109 38 112 44 116 C 52 118 64 114 70 104 C 74 96 72 90 68 88 Z"
            fill="#15803d"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="houseInnerGlow" x1="60" y1="50" x2="100" y2="110" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="50%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            <linearGradient id="leafGradient1" x1="42" y1="40" x2="72" y2="88" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="60%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>

            <linearGradient id="leafGradient2" x1="54" y1="24" x2="68" y2="46" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className={`flex flex-col ${textClassName}`}>
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold tracking-tight text-[#064e3b] text-lg sm:text-xl uppercase font-sans">
              SOLUSI
            </span>
            <span className="font-black tracking-tight text-[#0f5145] text-lg sm:text-xl uppercase font-sans">
              RUMAHKU
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-[#15803d] uppercase -mt-1">
            Toko Online Listrik & Tehnik
          </span>
        </div>
      )}
    </div>
  );
};
