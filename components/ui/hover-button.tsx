"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface HoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const HoverButton = React.forwardRef<HTMLButtonElement, HoverButtonProps>(
  ({ className, children, ...props }, ref) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null)
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
          "relative isolate px-8 py-4 rounded-[22px]",
          "brand-font text-base leading-6 uppercase",
          "text-[#151515] font-black",
          "bg-[#f7f7f2] border border-white/30",
          "cursor-pointer overflow-hidden",
          "before:content-[''] before:absolute before:inset-0",
          "before:rounded-[inherit] before:pointer-events-none",
          "before:z-0",
          "before:bg-[radial-gradient(circle_at_18%_20%,rgba(255,21,21,0.18),transparent_26%),radial-gradient(circle_at_86%_78%,rgba(19,87,255,0.16),transparent_28%)]",
          "before:opacity-70",
          "shadow-[0_18px_48px_rgba(0,0,0,0.28)]",
          "transition-all duration-200",
          "hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_68px_rgba(0,0,0,0.36)]",
          "active:translate-y-0",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

HoverButton.displayName = "HoverButton"

export { HoverButton }
