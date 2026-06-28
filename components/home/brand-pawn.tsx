export function BrandPawn() {
  return (
    <div className="brand-pawn-shell pointer-events-none relative hidden h-[360px] w-[310px] shrink-0 items-center justify-center lg:flex xl:h-[430px] xl:w-[360px]" aria-hidden="true">
      <div className="absolute inset-x-10 bottom-8 h-12 rounded-full bg-black/50 blur-2xl" />
      <div className="brand-pawn relative h-full w-full">
        <div className="absolute left-1/2 top-10 h-24 w-24 -translate-x-1/2 rounded-full brand-pawn-part xl:h-28 xl:w-28" />
        <div className="absolute left-1/2 top-[106px] h-16 w-40 -translate-x-1/2 rounded-[999px] brand-pawn-part xl:top-[124px] xl:h-20 xl:w-48" />
        <div className="absolute left-1/2 top-[150px] h-32 w-28 -translate-x-1/2 rounded-t-[54px] rounded-b-[30px] brand-pawn-part xl:top-[178px] xl:h-36 xl:w-32" />
        <div className="absolute left-1/2 bottom-[74px] h-20 w-52 -translate-x-1/2 rounded-[999px] brand-pawn-part xl:h-24 xl:w-60" />
        <div className="absolute left-1/2 bottom-12 h-9 w-64 -translate-x-1/2 rounded-[999px] border border-white/15 bg-[#ff1515] shadow-[0_18px_54px_rgba(255,21,21,0.24)] xl:w-72" />
        <div className="brand-font absolute left-1/2 bottom-[58px] -translate-x-1/2 text-sm text-white">KRD</div>
      </div>
    </div>
  )
}
