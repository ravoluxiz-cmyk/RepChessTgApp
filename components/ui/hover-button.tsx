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
          "relative isolate px-8 py-4 rounded-lg",
          "brand-font text-base leading-6 uppercase",
          "text-white font-black",
          "bg-[#151515] border-2 border-[#151515]",
          "cursor-pointer overflow-hidden",
          "before:content-[''] before:absolute before:inset-0",
          "before:rounded-[inherit] before:pointer-events-none",
          "before:z-[1]",
          "before:shadow-[6px_6px_0_#f7f7f2]",
          "before:transition-transform before:duration-200",
          "transition-transform duration-200",
          "hover:translate-x-1 hover:translate-y-1 hover:bg-white hover:text-[#151515]",
          "active:translate-x-1 active:translate-y-1",
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
