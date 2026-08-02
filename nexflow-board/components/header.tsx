"use client"

import { ThemeToggle } from "./theme-toggle"
import { LayoutDashboard } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2 ring-1 ring-primary/20">
            <LayoutDashboard className="size-5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            NexFlow<span className="text-primary/70"> Board</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border/50">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}