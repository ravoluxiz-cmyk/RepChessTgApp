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

export default function ChessBackground({
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(255,255,255,0.13),transparent_24%),radial-gradient(circle_at_86%_18%,rgba(19,87,255,0.16),transparent_20%),radial-gradient(circle_at_12%_86%,rgba(255,21,21,0.14),transparent_22%),radial-gradient(circle_at_80%_84%,rgba(255,242,0,0.10),transparent_18%),linear-gradient(180deg,#111111_0%,#171717_48%,#0f0f0f_100%)]" />
      <div className="brand-noise absolute inset-0 opacity-[0.18]" />
      <div className="brand-bg-icons pointer-events-none absolute -right-28 top-28 hidden h-[430px] w-[520px] rotate-6 opacity-[0.045] md:block" />
      <div className="brand-bg-illustration pointer-events-none absolute -left-28 bottom-8 hidden h-[320px] w-[520px] -rotate-3 opacity-[0.07] lg:block" />
      <div className="pointer-events-none absolute left-4 top-24 h-24 w-48 rounded-full bg-[#ff1515]/15 blur-3xl sm:left-[10%]" />
      <div className="pointer-events-none absolute right-4 top-[42%] h-28 w-56 rounded-full bg-[#1357ff]/14 blur-3xl sm:right-[12%]" />
      <div className="pointer-events-none absolute bottom-16 left-[52%] h-24 w-48 rounded-full bg-[#20d66b]/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-[1480px] px-4 md:px-6">
        {children ? (
          children
        ) : (
          <div className="max-w-4xl mx-auto text-center">
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/10" />
    </div>
  );
}
