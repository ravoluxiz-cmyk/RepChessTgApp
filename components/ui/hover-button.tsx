"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface HoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const HoverButton = React.forwardRef<HTMLButtonElement, HoverButtonProps>(
  ({ className, children, ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const [isListening, setIsListening] = React.useState(false)
    const [circles, setCircles] = React.useState<Array<{
      id: number
      x: number
      y: number
      color: string
      fadeState: "in" | "out" | null
    }>>([])
    const lastAddedRef = React.useRef(0)

    const createCircle = React.useCallback((x: number, y: number) => {
      const buttonWidth = buttonRef.current?.offsetWidth || 0
      const xPos = x / buttonWidth
      const color = `linear-gradient(to right, var(--circle-start) ${xPos * 100}%, var(--circle-end) ${xPos * 100
        }%)`

      const id = Date.now() + Math.random()

      // Создаём кружок сразу с fadeState "in" (вместо null → useEffect loop)
      setCircles((prev) => [
        ...prev,
        { id, x, y, color, fadeState: "in" as const },
      ])

      // Планируем fade-out и удаление
      setTimeout(() => {
        setCircles((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, fadeState: "out" as const } : c
          )
        )
      }, 1000)

      setTimeout(() => {
        setCircles((prev) => prev.filter((c) => c.id !== id))
      }, 2200)
    }, [])

    const handlePointerMove = React.useCallback(
      (event: React.PointerEvent<HTMLButtonElement>) => {
        if (!isListening) return

        const currentTime = Date.now()
        if (currentTime - lastAddedRef.current > 100) {
          lastAddedRef.current = currentTime
          const rect = event.currentTarget.getBoundingClientRect()
          const x = event.clientX - rect.left
          const y = event.clientY - rect.top
          createCircle(x, y)
        }
      },
      [isListening, createCircle]
    )

    const handlePointerEnter = React.useCallback(() => {
      setIsListening(true)
    }, [])

    const handlePointerLeave = React.useCallback(() => {
      setIsListening(false)
    }, [])

    // Вместо useEffect с зависимостью от circles (бесконечный цикл),
    // планируем timeout-ы прямо при создании кружка в createCircle.
    // Кружки создаются сразу с fadeState: "in".

    const setCombinedRef = (node: HTMLButtonElement | null) => {
      buttonRef.current = node
      if (!ref) return
      if (typeof ref === "function") {
        ref(node)
      } else {
        try {
          ; (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
        } catch {
          // ignore
        }
      }
    }

    return (
      <button
        ref={setCombinedRef}
        className={cn(
          "relative isolate px-8 py-4 rounded-lg",
          "brand-font text-base leading-6 uppercase",
          "text-white font-black",
          "backdrop-blur-lg bg-white/[0.075] border border-white/15",
          "cursor-pointer overflow-hidden",
          "before:content-[''] before:absolute before:inset-0",
          "before:rounded-[inherit] before:pointer-events-none",
          "before:z-[1]",
          "before:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_3px_0_rgba(0,0,0,0.50),0_12px_28px_0_rgba(0,0,0,0.35)]",
          "before:transition-transform before:duration-300",
          "active:before:scale-[0.975]",
          "hover:bg-white/[0.14] hover:border-white/35",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        {...props}
        style={{
          "--circle-start": "var(--tw-gradient-from, #ff3131)",
          "--circle-end": "var(--tw-gradient-to, #2563ff)",
        } as React.CSSProperties}
      >
        {circles.map(({ id, x, y, color, fadeState }) => (
          <div
            key={id}
            className={cn(
              "absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full",
              "blur-lg pointer-events-none z-[-1] transition-opacity duration-300",
              fadeState === "in" && "opacity-75",
              fadeState === "out" && "opacity-0 duration-[1.2s]",
              !fadeState && "opacity-0"
            )}
            style={{
              left: x,
              top: y,
              background: color,
            }}
          />
        ))}
        {children}
      </button>
    )
  }
)

HoverButton.displayName = "HoverButton"

export { HoverButton }
