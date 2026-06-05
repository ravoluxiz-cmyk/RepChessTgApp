"use client";

import { motion } from "framer-motion";
import { HoverButton } from "@/components/ui/hover-button";

// Static animation variants hoisted out of component (rendering-hoist-jsx)
const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: 0.5 + i * 0.2,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  }),
};
function ChessboardPattern() {
  return (
    <div className="absolute inset-0 opacity-[0.045]">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="chessboard"
            x="0"
            y="0"
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="48" height="48" fill="#f7f7f2" />
            <rect x="48" y="0" width="48" height="48" fill="transparent" />
            <rect x="0" y="48" width="48" height="48" fill="transparent" />
            <rect x="48" y="48" width="48" height="48" fill="#f7f7f2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#chessboard)" />
      </svg>
    </div>
  );
}

export default function ChessBackground({
  badge = "Обучающая платформа",
  title1 = "Освойте",
  title2 = "Новые Навыки",
  description = "Каждый урок приближает вас к мастерству. Начните свой путь к знаниям уже сегодня.",
  children,
}: {
  badge?: string;
  title1?: string;
  title2?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#151515] text-[#f7f7f2]">
      <div className="brand-photo-strip absolute inset-x-0 top-0 h-16 opacity-95 sm:h-20" />
      <div className="brand-pixel-corner right-5 top-24 rotate-3" />
      <div className="brand-pixel-corner bottom-8 left-4 -rotate-6 opacity-[0.08]" />
      <div className="brand-doodle right-[8%] top-[52%] h-28 w-56 -rotate-6 sm:h-40 sm:w-72" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,21,21,0)_0,rgba(21,21,21,0)_72px,#151515_72px)]" />

      <ChessboardPattern />

      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-4 md:px-6">
        {children ? (
          children
        ) : (
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="brand-chip mb-8 inline-flex items-center gap-2 rounded-none px-4 py-2 md:mb-12"
            >
              <div className="h-2 w-2 bg-[#151515]" />
              <span className="text-sm font-bold uppercase tracking-wide">
                {badge}
              </span>
            </motion.div>

            <motion.div
              custom={1}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <h1 className="brand-title text-5xl sm:text-6xl md:text-8xl mb-6 md:mb-8">
                <span className="text-[#f7f7f2]">
                  {title1}
                </span>
                <br />
                <span className="text-[#f7f7f2]">
                  {title2}
                </span>
              </h1>
            </motion.div>

            <motion.div
              custom={2}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              <p className="mx-auto mb-10 max-w-2xl px-4 text-base font-medium leading-relaxed text-white/65 sm:text-lg md:text-xl">
                {description}
              </p>
            </motion.div>

            <motion.div
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <HoverButton>
                Начать обучение
              </HoverButton>
              <HoverButton>
                Узнать больше
              </HoverButton>
            </motion.div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3 brand-accent-line opacity-70" />
    </div>
  );
}
