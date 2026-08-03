"use client"

import { ThemeToggle } from "./theme-toggle"
import { Shield, Cpu, Lock } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="rounded-full bg-primary/10 p-1.5 ring-1 ring-primary/20">
              <Shield className="size-4 text-primary" />
            </div>
            <div className="rounded-full bg-emerald-500/10 p-1.5 ring-1 ring-emerald-500/20">
              <Lock className="size-4 text-emerald-500" />
            </div>
            <div className="rounded-full bg-amber-500/10 p-1.5 ring-1 ring-amber-500/20">
              <Cpu className="size-4 text-amber-500" />
            </div>
          </div>
          <div className="h-5 w-px bg-border/50" />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            LuminaGrid<span className="text-primary/70"> AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground ring-1 ring-border/50">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
            </span>
            All systems operational
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}