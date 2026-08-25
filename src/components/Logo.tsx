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
            {/* Background subtle sheen */}
            <rect width="160" height="160" rx="28" fill="#ffffff" />
            <rect x="2" y="2" width="156" height="156" rx="26" stroke="#065f46" strokeWidth="1" strokeOpacity="0.08" />

            {/* Letter 1: S (Dual Line Monogram) */}
            {/* Line 1 S1 */}
            <path
              d="M 52 46 C 48 37 38 35 30 35 C 19 35 14 43 14 53 C 14 65 26 71 36 76 C 48 82 54 89 54 103 C 54 116 44 125 31 125 C 19 125 14 116 14 107"
              stroke="url(#sstGoldGrad1)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Line 2 S1 */}
            <path
              d="M 52 57 C 49 50 42 46 32 46 C 24 46 22 50 22 54 C 22 61 30 65 39 69 C 52 75 62 83 62 100 C 62 113 54 125 40 125 C 29 125 24 118 24 113"
              stroke="url(#sstGoldGrad2)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Letter 2: S (Dual Line Monogram) */}
            {/* Line 1 S2 */}
            <path
              d="M 94 46 C 90 37 80 35 72 35 C 61 35 56 43 56 53 C 56 65 68 71 78 76 C 90 82 96 89 96 103 C 96 116 86 125 73 125 C 61 125 56 116 56 107"
              stroke="url(#sstGoldGrad1)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Line 2 S2 */}
            <path
              d="M 94 57 C 91 50 84 46 74 46 C 66 46 64 50 64 54 C 64 61 72 65 81 69 C 94 75 104 83 104 100 C 104 113 96 125 82 125 C 71 125 66 118 66 113"
              stroke="url(#sstGoldGrad2)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Letter 3: T (Dual Line Monogram) */}
            {/* Top Bar Line 1 */}
            <path
              d="M 104 35 L 148 35"
              stroke="url(#sstGoldGrad1)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Top Bar Line 2 */}
            <path
              d="M 106 46 L 146 46"
              stroke="url(#sstGoldGrad2)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Vertical Stem Line 1 */}
            <path
              d="M 121 46 L 121 125"
              stroke="url(#sstGoldGrad1)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Vertical Stem Line 2 */}
            <path
              d="M 131 46 L 131 125"
              stroke="url(#sstGoldGrad2)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="sstGoldGrad1" x1="14" y1="35" x2="148" y2="125" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#dfb2a1" />
                <stop offset="30%" stopColor="#c58d78" />
                <stop offset="70%" stopColor="#8d5644" />
                <stop offset="100%" stopColor="#b9806b" />
              </linearGradient>
              <linearGradient id="sstGoldGrad2" x1="22" y1="46" x2="146" y2="125" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#edd0c4" />
                <stop offset="40%" stopColor="#d59f8c" />
                <stop offset="80%" stopColor="#7a4737" />
                <stop offset="100%" stopColor="#ad735f" />
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
