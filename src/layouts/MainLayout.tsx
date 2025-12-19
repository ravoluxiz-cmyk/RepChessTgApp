import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      {children}
    </div>
  )
}