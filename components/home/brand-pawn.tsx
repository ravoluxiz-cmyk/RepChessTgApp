export function BrandPawn() {
  return (
    <div className="brand-pawn-shell pointer-events-none relative hidden h-[360px] w-[310px] shrink-0 items-center justify-center lg:flex xl:h-[430px] xl:w-[360px]" aria-hidden="true">
      <div className="absolute inset-x-7 bottom-10 h-14 rounded-full bg-black/60 blur-2xl" />
      <div className="brand-pawn relative h-full w-full">
        <svg
          className="brand-pawn-figure absolute inset-0 h-full w-full"
          viewBox="0 0 360 430"
          role="img"
        >
          <defs>
            <radialGradient id="pawnHighlight" cx="34%" cy="18%" r="68%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="34%" stopColor="#3b3b3b" />
              <stop offset="72%" stopColor="#080808" />
              <stop offset="100%" stopColor="#020202" />
            </radialGradient>
            <linearGradient id="pawnEdge" x1="18%" y1="0%" x2="88%" y2="100%">
              <stop offset="0%" stopColor="#565656" />
              <stop offset="48%" stopColor="#111111" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
            <filter id="pawnShadow" x="-30%" y="-20%" width="160%" height="150%">
              <feDropShadow dx="0" dy="28" stdDeviation="18" floodColor="#000000" floodOpacity="0.42" />
            </filter>
          </defs>

          <g filter="url(#pawnShadow)">
            <ellipse cx="180" cy="376" rx="124" ry="30" fill="#070707" opacity="0.5" />
            <path
              d="M89 347c0-24 24-44 54-44h74c30 0 54 20 54 44 0 22-20 39-48 43H137c-28-4-48-21-48-43Z"
              fill="url(#pawnEdge)"
              stroke="rgba(255,255,255,.18)"
            />
            <path
              d="M121 309c0-19 18-35 41-35h36c23 0 41 16 41 35 0 18-16 33-37 36h-44c-21-3-37-18-37-36Z"
              fill="url(#pawnHighlight)"
              stroke="rgba(255,255,255,.14)"
            />
            <path
              d="M134 275c16-22 24-54 25-98h42c1 44 9 76 25 98-7 13-24 22-46 22s-39-9-46-22Z"
              fill="url(#pawnHighlight)"
              stroke="rgba(255,255,255,.15)"
            />
            <path
              d="M119 164c0-18 19-33 43-33h36c24 0 43 15 43 33 0 17-18 31-40 34h-42c-22-3-40-17-40-34Z"
              fill="url(#pawnEdge)"
              stroke="rgba(255,255,255,.16)"
            />
            <circle
              cx="180"
              cy="93"
              r="54"
              fill="url(#pawnHighlight)"
              stroke="rgba(255,255,255,.18)"
            />
            <path
              d="M151 58c10-9 23-14 39-14 13 0 24 4 34 11-7-3-17-4-28-2-23 3-39 14-45 31-2-11-2-20 0-26Z"
              fill="#ffffff"
              opacity="0.18"
            />
          </g>
        </svg>

        <div className="brand-pawn-ribbon brand-font absolute left-1/2 top-[196px] flex h-12 w-52 items-center justify-center overflow-hidden rounded-full bg-[#ff1515] text-base text-white shadow-[0_22px_62px_rgba(255,21,21,0.28)] xl:top-[222px]">
          KRD
        </div>
      </div>
    </div>
  )
}
