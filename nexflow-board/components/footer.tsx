import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="size-3 text-primary/70" />
              Enterprise-grade · Zero data leaves your machine
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NexFlow Board. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}