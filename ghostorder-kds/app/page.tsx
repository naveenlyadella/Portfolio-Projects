"use client"

import { useState, useEffect, useRef } from "react"
import { initialOrders, Order } from "@/lib/data-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Clock, ChefHat, CheckCircle2, AlertTriangle, UtensilsCrossed, Activity, Wifi } from "lucide-react"
import { differenceInMinutes } from "date-fns"

const sourceColors = {
  UberEats: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  DoorDash: "bg-red-500/15 text-red-400 border-red-500/30",
  Zomato: "bg-rose-600/15 text-rose-400 border-rose-600/30",
  Swiggy: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Web: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Walk-in": "bg-slate-500/15 text-slate-300 border-slate-500/30",
}

export default function GhostOrderKDS() {
  const [orders, setOrders] = useState<Order[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [isLiveTraffic, setIsLiveTraffic] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  
  // Use a ref to keep track of audio so it doesn't trigger on initial load
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    setOrders(initialOrders)
    setMounted(true)
    const interval = setInterval(() => setCurrentTime(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  // The Live Traffic Polling Engine
  useEffect(() => {
    if (!isLiveTraffic) return

    const fetchNewOrder = async () => {
      try {
        setIsFetching(true)
        const res = await fetch("/api/orders")
        if (!res.ok) throw new Error("Network response was not ok")
        const newOrder = await res.json()
        
        // Convert ISO string back to Date object
        newOrder.createdAt = new Date(newOrder.createdAt)
        
        // Add to the front of the line
        setOrders(prev => [newOrder, ...prev])
      } catch (error) {
        console.error("Failed to fetch order:", error)
      } finally {
        setIsFetching(false)
      }
    }

    const trafficInterval = setInterval(fetchNewOrder, 8000) // Fetch every 8 seconds
    return () => clearInterval(trafficInterval)
  }, [isLiveTraffic])

  if (!mounted) return null

  const activeOrders = orders.filter((o) => o.status !== "Ready")

  const handleBump = (orderId: string) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id === orderId) {
          const nextStatus = order.status === "New" ? "Prep" : "Ready"
          return { ...order, status: nextStatus }
        }
        return order
      })
    )
  }

  return (
    <div className="min-h-screen bg-[#09090b] font-sans antialiased text-slate-100 selection:bg-indigo-500/30">
      
      {/* KDS Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800/60 bg-[#09090b]/90 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-900/20">
              <UtensilsCrossed className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase">GhostOrder KDS</h1>
              <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">Main Kitchen Routing</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-slate-800" />
          
          {/* Live Traffic Toggle Flex */}
          <Button 
            onClick={() => setIsLiveTraffic(!isLiveTraffic)}
            variant="outline"
            className={`border-2 transition-all ${
              isLiveTraffic 
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300" 
                : "border-slate-800 bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-300"
            }`}
          >
            {isLiveTraffic ? (
              <><Activity className="mr-2 size-4 animate-pulse" /> Traffic: Live</>
            ) : (
              <><Wifi className="mr-2 size-4" /> Traffic: Paused</>
            )}
          </Button>
          
          {isFetching && <span className="text-xs font-bold text-slate-500 uppercase tracking-wider animate-pulse">Receiving...</span>}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">System Live</span>
          </div>
          <div className="text-3xl font-black tabular-nums tracking-tight text-white">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </header>

      {/* Ticket Grid */}
      <main className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:items-start">
          {activeOrders.map((order) => {
            const minutesElapsed = differenceInMinutes(currentTime, order.createdAt)
            const isWarning = minutesElapsed >= order.targetPrepTimeMinutes * 0.75
            const isCritical = minutesElapsed >= order.targetPrepTimeMinutes

            return (
              <div
                key={order.id}
                className={`flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                  isCritical
                    ? "border-red-500/80 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-[pulse_4s_ease-in-out_infinite]"
                    : isWarning
                    ? "border-amber-500/50 bg-[#09090b]"
                    : "border-slate-800 bg-[#09090b]"
                }`}
              >
                <div
                  className={`h-2 w-full transition-colors ${
                    order.status === "New" ? "bg-blue-600" : "bg-amber-500"
                  }`}
                />
                
                <div className="p-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-white">
                        {order.id}
                      </h2>
                      <p className="mt-1 text-sm font-bold text-slate-400">{order.customerName}</p>
                    </div>
                    <Badge variant="outline" className={`font-black uppercase tracking-wider text-[10px] px-2 py-0.5 ${sourceColors[order.source]}`}>
                      {order.source}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 px-5 space-y-4">
                  <div
                    className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                      isCritical
                        ? "bg-red-500/20 text-red-400"
                        : isWarning
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-slate-900 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black">
                      <Clock className="size-5" />
                      <span className="text-2xl tabular-nums tracking-tighter">{minutesElapsed}m</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                      Target: {order.targetPrepTimeMinutes}m
                    </span>
                  </div>

                  <Separator className="bg-slate-800/60" />

                  <ul className="space-y-5 pb-5">
                    {order.items.map((item) => (
                      <li key={item.id} className="text-slate-200">
                        <div className="flex items-start gap-3">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded bg-slate-800 text-sm font-black text-white">
                            {item.qty}
                          </span>
                          <div className="pt-0.5">
                            <p className="text-lg font-bold leading-tight tracking-tight text-white">{item.name}</p>
                            {item.modifiers && item.modifiers.length > 0 && (
                              <ul className="mt-1.5 space-y-1.5">
                                {item.modifiers.map((mod, i) => (
                                  <li
                                    key={i}
                                    className="flex items-center gap-1.5 text-sm font-bold text-amber-500"
                                  >
                                    <AlertTriangle className="size-4 shrink-0" />
                                    {mod}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-0 mt-auto">
                  <button
                    onClick={() => handleBump(order.id)}
                    className={`flex w-full items-center justify-center gap-2 py-5 text-lg font-black uppercase tracking-widest transition-colors ${
                      order.status === "New"
                        ? "bg-amber-600 text-white hover:bg-amber-500"
                        : "bg-emerald-600 text-white hover:bg-emerald-500"
                    }`}
                  >
                    {order.status === "New" ? (
                      <>
                        <ChefHat className="size-6" /> Start Prep
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-6" /> Bump Ticket
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}