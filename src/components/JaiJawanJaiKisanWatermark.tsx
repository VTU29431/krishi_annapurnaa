import React from 'react';

/**
 * Jai Jawan Jai Kisan National Watermark Emblem
 * Positioned in the center/middle of the viewport, covering all pages and the entire app
 * with Indian Flag colours (Saffron #FF9933, White #FFFFFF, Green #138808, Ashoka Navy #000080)
 * and balanced transparency for pristine readability.
 */
export const JaiJawanJaiKisanWatermark: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      id="jai-jawan-jai-kisan-watermark"
      className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center select-none overflow-hidden p-4"
    >
      <div className="relative flex flex-col items-center justify-center opacity-[0.065] transition-opacity duration-300 transform scale-90 sm:scale-100 lg:scale-110">
        {/* Outer Circular Tricolor Aura */}
        <div className="relative w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] lg:w-[560px] lg:h-[560px] rounded-full flex items-center justify-center">
          
          {/* Concentric Tricolor Borders */}
          <div className="absolute inset-0 rounded-full border-[14px] sm:border-[18px] border-[#FF9933]" />
          <div className="absolute inset-[14px] sm:inset-[18px] rounded-full border-[10px] sm:border-[14px] border-white" />
          <div className="absolute inset-[24px] sm:inset-[32px] rounded-full border-[14px] sm:border-[18px] border-[#138808]" />

          {/* SVG Vector Graphic for Farmer & Ashoka Chakra & Motto */}
          <svg
            className="w-[82%] h-[82%]"
            viewBox="0 0 500 500"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Saffron to Green Linear Gradient */}
              <linearGradient id="flagGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FF9933" />
                <stop offset="50%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#138808" />
              </linearGradient>

              {/* Gold Gradient for Wheat Sheaves */}
              <linearGradient id="wheatGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              {/* Curved Text Path for "JAI JAWAN • JAI KISAN" */}
              <path
                id="textPathTop"
                d="M 60,250 A 190,190 0 0,1 440,250"
                fill="none"
              />
              <path
                id="textPathBottom"
                d="M 440,250 A 190,190 0 0,1 60,250"
                fill="none"
              />
            </defs>

            {/* Inner Ring with Navy Blue Ashoka Chakra Spokes */}
            <circle cx="250" cy="250" r="170" stroke="#000080" strokeWidth="4" strokeDasharray="3 3" opacity="0.6" />
            
            {/* 24 Ashoka Chakra Spokes */}
            <g opacity="0.4" stroke="#000080" strokeWidth="2">
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                return (
                  <line
                    key={i}
                    x1="250"
                    y1="250"
                    x2={250 + 165 * Math.cos((angle * Math.PI) / 180)}
                    y2={250 + 165 * Math.sin((angle * Math.PI) / 180)}
                  />
                );
              })}
            </g>

            {/* Arched Bold Devanagari Banner Text on Top */}
            <text fill="#FF9933" fontSize="29" fontWeight="900" letterSpacing="4" textAnchor="middle">
              <textPath href="#textPathTop" startOffset="50%">
                ★ जय जवान ★ जय किसान ★
              </textPath>
            </text>

            {/* Arched English & Govt Banner Text on Bottom */}
            <text fill="#138808" fontSize="22" fontWeight="800" letterSpacing="3" textAnchor="middle">
              <textPath href="#textPathBottom" startOffset="50%">
                • JAI JAWAN • JAI KISAN •
              </textPath>
            </text>

            {/* Center Shield / Sunburst Backing */}
            <circle cx="250" cy="250" r="115" fill="#FFFFFF" stroke="#000080" strokeWidth="6" />

            {/* Traditional Indian Farmer Silhouette (Pagdi / Turban, Proud Stance) */}
            <g transform="translate(195, 175) scale(0.9)">
              {/* Farmer Head with Turban (Pagdi) */}
              {/* Turban folds */}
              <path
                d="M 50,45 C 30,30 20,15 45,5 C 65,-2 85,2 95,20 C 105,8 120,12 115,28 C 110,40 95,48 85,50 Z"
                fill="#FF9933"
              />
              <path
                d="M 38,25 C 50,18 75,18 90,28 C 98,34 95,42 85,45 C 65,42 45,40 38,25 Z"
                fill="#FFFFFF"
                stroke="#FF9933"
                strokeWidth="1.5"
              />
              <path
                d="M 42,32 C 55,26 80,27 94,36 C 88,43 72,46 55,45 Z"
                fill="#138808"
              />
              {/* Face & Moustache */}
              <circle cx="68" cy="60" r="16" fill="#78350F" />
              {/* Moustache */}
              <path
                d="M 58,66 C 64,68 68,64 74,64 C 80,64 84,68 90,66 C 84,72 74,70 68,69 C 62,70 54,71 58,66 Z"
                fill="#1E293B"
              />
              {/* Strong Shoulders & Kurta */}
              <path
                d="M 40,78 C 25,85 10,105 10,125 L 125,125 C 125,105 110,85 95,78 L 82,85 L 53,85 Z"
                fill="#047857"
              />
            </g>

            {/* Left Wheat Sheaf (धान / गेहूँ की सुनहरी बाली) */}
            <g transform="translate(145, 230) scale(0.7) rotate(-25)">
              <path
                d="M 10,100 Q 20,40 40,0"
                stroke="#D97706"
                strokeWidth="4"
                fill="none"
              />
              {/* Golden Grains */}
              <ellipse cx="22" cy="70" rx="8" ry="14" fill="url(#wheatGold)" transform="rotate(-30 22 70)" />
              <ellipse cx="38" cy="65" rx="8" ry="14" fill="url(#wheatGold)" transform="rotate(30 38 65)" />
              <ellipse cx="26" cy="45" rx="8" ry="14" fill="url(#wheatGold)" transform="rotate(-30 26 45)" />
              <ellipse cx="44" cy="40" rx="8" ry="14" fill="url(#wheatGold)" transform="rotate(30 44 40)" />
              <ellipse cx="32" cy="20" rx="7" ry="13" fill="url(#wheatGold)" transform="rotate(-30 32 20)" />
              <ellipse cx="48" cy="18" rx="7" ry="13" fill="url(#wheatGold)" transform="rotate(30 48 18)" />
              <ellipse cx="40" cy="0" rx="6" ry="12" fill="url(#wheatGold)" />
            </g>

            {/* Right Wheat Sheaf */}
            <g transform="translate(355, 230) scale(0.7) rotate(25) scale(-1, 1)">
              <path
                d="M 10,100 Q 20,40 40,0"
                stroke="#D97706"
                strokeWidth="4"
                fill="none"
              />
              <ellipse cx="22" cy="70" rx="8" ry="14" fill="url(#wheatGold)" transform="rotate(-30 22 70)" />
              <ellipse cx="38" cy="65" rx="8" ry="14" fill="url(#wheatGold)" transform="rotate(30 38 65)" />
              <ellipse cx="26" cy="45" rx="8" ry="14" fill="url(#wheatGold)" transform="rotate(-30 26 45)" />
              <ellipse cx="44" cy="40" rx="8" ry="14" fill="url(#wheatGold)" transform="rotate(30 44 40)" />
              <ellipse cx="32" cy="20" rx="7" ry="13" fill="url(#wheatGold)" transform="rotate(-30 32 20)" />
              <ellipse cx="48" cy="18" rx="7" ry="13" fill="url(#wheatGold)" transform="rotate(30 48 18)" />
              <ellipse cx="40" cy="0" rx="6" ry="12" fill="url(#wheatGold)" />
            </g>

            {/* Tractor & Plough Emblem at Bottom Center */}
            <g transform="translate(205, 290) scale(0.7)">
              {/* Plough Blade & Wheel */}
              <circle cx="25" cy="40" r="16" fill="none" stroke="#1E293B" strokeWidth="4" />
              <circle cx="25" cy="40" r="6" fill="#1E293B" />
              <circle cx="80" cy="44" r="12" fill="none" stroke="#1E293B" strokeWidth="3" />
              <circle cx="80" cy="44" r="4" fill="#1E293B" />
              <path
                d="M 25,40 L 45,20 L 75,20 L 80,44 L 25,44 Z"
                fill="#138808"
                stroke="#065F46"
                strokeWidth="2"
              />
              <path
                d="M 45,20 L 45,8 L 65,8 L 65,20 Z"
                fill="#1E293B"
              />
            </g>

            {/* Ashoka 4-Lions Crest Symbol / Satyameva Jayate Banner */}
            <g transform="translate(225, 335) scale(0.65)">
              <rect x="-35" y="0" width="120" height="24" rx="4" fill="#000080" />
              <text
                x="25"
                y="16"
                fill="#FFFFFF"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="serif"
              >
                सत्यमेव जयते
              </text>
            </g>
          </svg>
        </div>

        {/* Clear Subtitle Watermark Label */}
        <div className="mt-2 text-center select-none">
          <div className="font-black text-xl tracking-widest text-slate-800 uppercase">
            जय जवान • जय किसान
          </div>
          <div className="text-xs font-extrabold tracking-widest text-slate-600 uppercase mt-0.5">
            GOVERNMENT OF INDIA • KISAN PROCUREMENT E-MANDI
          </div>
        </div>
      </div>
    </div>
  );
};
