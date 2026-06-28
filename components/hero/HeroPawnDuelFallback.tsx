export function HeroPawnDuelFallback() {
  return (
    <div className="pawn-duel-fallback" aria-hidden="true">
      <div className="pawn-duel-glow" />
      <div className="fallback-pawn fallback-pawn-white">
        <div className="fallback-eyes fallback-eyes-dark" />
        <div className="fallback-label">REP CHESS</div>
      </div>
      <div className="fallback-vs">VS</div>
      <div className="fallback-pawn fallback-pawn-black">
        <div className="fallback-eyes fallback-eyes-light" />
        <div className="fallback-label">KRD</div>
      </div>
    </div>
  )
}
