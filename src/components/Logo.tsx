import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customPx?: number;
  showText?: boolean;
  textClassName?: string;
  customLogoUrl?: string;
  textPrefix?: string;
  textSuffix?: string;
  storeName?: string;
  tagline?: string;
  taglinePlacement?: 'bottom' | 'side';
  layout?: 'horizontal' | 'vertical';
  align?: 'left' | 'center' | 'right';
  textColorMode?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'lg',
  customPx,
  showText = true,
  textClassName = '',
  customLogoUrl,
  textPrefix = 'SOLUSI',
  textSuffix = 'RUMAHKU',
  storeName,
  tagline,
  taglinePlacement = 'bottom',
  layout = 'horizontal',
  align = 'left',
  textColorMode = 'light',
}) => {
  const iconSizeMap: Record<string, number> = {
    sm: 48,
    md: 64,
    lg: 96,
    xl: 144,
  };

  const parsedCustomPx =
    customPx !== undefined && customPx !== null && !isNaN(Number(customPx)) && Number(customPx) > 0
      ? Number(customPx)
      : undefined;

  const calculatedPx = parsedCustomPx || iconSizeMap[size] || 64;

  // Alignment classes
  const alignContainerClass =
    align === 'center'
      ? 'items-center text-center justify-center'
      : align === 'right'
      ? 'items-end text-right justify-end'
      : 'items-start text-left justify-start';

  const flexDirClass = layout === 'vertical' ? 'flex-col' : 'flex-row items-center';

  return (
    <div
      className={`inline-flex ${flexDirClass} ${layout === 'vertical' ? alignContainerClass : 'items-center'} gap-3 select-none ${className}`}
      id="brand-logo-container"
    >
      <div
        className="relative shrink-0 flex items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-[#065f46]/20 p-1.5 overflow-hidden transition-all duration-150"
        style={{
          width: `${calculatedPx}px`,
          height: `${calculatedPx}px`,
          minWidth: `${calculatedPx}px`,
          minHeight: `${calculatedPx}px`,
        }}
      >
        {customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt={storeName || `${textPrefix} ${textSuffix}`}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg
            width={calculatedPx}
            height={calculatedPx}
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
        )}
      </div>

      {showText && (
        <div
          className={`flex ${
            taglinePlacement === 'side' && tagline
              ? 'flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'
              : 'flex-col'
          } ${layout === 'vertical' ? alignContainerClass : ''}`}
        >
          <div className={`flex items-baseline gap-1.5 ${layout === 'vertical' && align === 'center' ? 'justify-center' : ''} ${textClassName}`}>
            {storeName ? (
              <span
                className={`font-black tracking-tight uppercase font-sans ${
                  textColorMode === 'dark' ? 'text-white' : 'text-[#064e3b]'
                } ${calculatedPx <= 44 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl lg:text-3xl'}`}
              >
                {storeName}
              </span>
            ) : (
              <>
                <span
                  className={`font-extrabold tracking-tight uppercase font-sans ${
                    textColorMode === 'dark' ? 'text-white' : 'text-[#064e3b]'
                  } ${calculatedPx <= 44 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl lg:text-3xl'}`}
                >
                  {textPrefix}
                </span>
                <span
                  className={`font-black tracking-tight uppercase font-sans ${
                    textColorMode === 'dark' ? 'text-emerald-400' : 'text-[#0f5145]'
                  } ${calculatedPx <= 44 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl lg:text-3xl'}`}
                >
                  {textSuffix}
                </span>
              </>
            )}
          </div>
          {tagline && (
            <div
              className={`flex items-center ${
                taglinePlacement === 'side'
                  ? 'sm:border-l sm:border-slate-700/60 sm:pl-3'
                  : 'mt-0.5'
              }`}
            >
              <p
                className={`text-[11px] font-medium leading-tight max-w-sm ${
                  textColorMode === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {tagline}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
