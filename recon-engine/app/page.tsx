"use client"

import { useState } from "react"
import { internalLedger, processorLedger, Transaction } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRightLeft, CheckCircle2, Search, FileText, Link2, UploadCloud, FileSpreadsheet, Database } from "lucide-react"
import Papa from "papaparse"

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export default function ReconEngine() {
  const [internalData, setInternalData] = useState<Transaction[]>([])
  const [processorData, setProcessorData] = useState<Transaction[]>([])
  
  const [isReconciling, setIsReconciling] = useState(false)
  const [selectedInternalId, setSelectedInternalId] = useState<string | null>(null)
  const [selectedProcessorId, setSelectedProcessorId] = useState<string | null>(null)
  const [resolutionReason, setResolutionReason] = useState("Prorated Downgrade")

// CSV Parsing Handlers for real user data
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'internal' | 'processor') => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      // THE FIX: Strip hidden Windows BOM characters and rogue spaces from CSV headers
      transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
      complete: (results) => {
        const parsedData: Transaction[] = results.data
          .filter((row: any) => row.id && row.id.trim() !== "")
          .map((row: any) => ({
            id: row.id.trim(),
            date: row.date,
            description: row.description || "Stripe Payout",
            amount: parseFloat(row.amount),
            currency: row.currency || "USD",
            status: "Unmatched",
            netAmount: row.netAmount ? parseFloat(row.netAmount) : undefined,
          }))

        if (type === 'internal') setInternalData(parsedData)
        if (type === 'processor') setProcessorData(parsedData)
      }
    })

    // Reset the input so you can re-upload the same file during testing
    e.target.value = ''
  }

  // One-click demo loader for recruiters
  const loadDemoData = () => {
    setInternalData(internalLedger)
    setProcessorData(processorLedger)
  }

  const runAutoReconciliation = () => {
    setIsReconciling(true)
    setTimeout(() => {
      const newInternal = [...internalData]
      const newProcessor = [...processorData]

      newInternal.forEach((intTx) => {
        if (intTx.status !== "Unmatched") return
        const matchIndex = newProcessor.findIndex(
          (procTx) => procTx.status === "Unmatched" && procTx.amount === intTx.amount
        )
        if (matchIndex !== -1) {
          intTx.status = "Matched"
          intTx.matchId = newProcessor[matchIndex].id
          newProcessor[matchIndex].status = "Matched"
          newProcessor[matchIndex].matchId = intTx.id
        }
      })

      setInternalData(newInternal)
      setProcessorData(newProcessor)
      setIsReconciling(false)
      setSelectedInternalId(null)
      setSelectedProcessorId(null)
    }, 800)
  }

  const handleForceResolve = () => {
    const newInternal = [...internalData]
    const newProcessor = [...processorData]
    const intIndex = newInternal.findIndex(t => t.id === selectedInternalId)
    const procIndex = newProcessor.findIndex(t => t.id === selectedProcessorId)

    if (intIndex > -1 && procIndex > -1) {
      newInternal[intIndex].status = "Matched"
      newInternal[intIndex].matchId = selectedProcessorId!
      newInternal[intIndex].resolutionNote = resolutionReason
      newProcessor[procIndex].status = "Matched"
      newProcessor[procIndex].matchId = selectedInternalId!
      newProcessor[procIndex].resolutionNote = resolutionReason

      setInternalData(newInternal)
      setProcessorData(newProcessor)
      setSelectedInternalId(null)
      setSelectedProcessorId(null)
    }
  }

  const getStatusBadge = (tx: Transaction) => {
    if (tx.status === "Matched" && tx.resolutionNote) {
      return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">Manual Override</Badge>
    }
    switch (tx.status) {
      case "Matched":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Matched</Badge>
      case "Discrepancy":
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Discrepancy</Badge>
      default:
        return <Badge variant="outline" className="text-slate-500 border-slate-700">Unmatched</Badge>
    }
  }

  const selectedIntTx = internalData.find(t => t.id === selectedInternalId)
  const selectedProcTx = processorData.find(t => t.id === selectedProcessorId)
  const variance = (selectedIntTx?.amount || 0) - (selectedProcTx?.amount || 0)

  const isDataLoaded = internalData.length > 0 && processorData.length > 0

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 p-6 font-sans antialiased pb-32">
      <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <ArrowRightLeft className="size-6 text-indigo-500" />
            ReconEngine
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Automated Double-Entry Reconciliation
          </p>
        </div>
        
        {isDataLoaded && (
          <div className="flex gap-4">
            <div className="flex items-center gap-4 mr-6 text-sm font-medium border-r border-slate-800 pr-6">
              <div className="flex flex-col">
                <span className="text-slate-500">Unmatched</span>
                <span className="text-red-400 text-lg font-bold">
                  {internalData.filter(t => t.status === "Unmatched").length + processorData.filter(t => t.status === "Unmatched").length}
                </span>
              </div>
            </div>
            <Button 
              onClick={runAutoReconciliation} 
              disabled={isReconciling}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide"
            >
              {isReconciling ? (
                <><Search className="mr-2 size-4 animate-spin" /> Scanning...</>
              ) : (
                <><CheckCircle2 className="mr-2 size-4" /> Run Auto-Match</>
              )}
            </Button>
          </div>
        )}
      </header>

      {!isDataLoaded ? (
        <div className="max-w-5xl mx-auto mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <label className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${internalData.length > 0 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 hover:border-indigo-500/50'}`}>
              <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, 'internal')} />
              {internalData.length > 0 ? (
                <><CheckCircle2 className="size-12 text-emerald-500 mb-4" /><h3 className="text-xl font-bold text-emerald-400">Internal Ledger Loaded</h3><p className="text-slate-400 mt-2">{internalData.length} records parsed</p></>
              ) : (
                <><FileSpreadsheet className="size-12 text-blue-500 mb-4" /><h3 className="text-xl font-bold text-white">Upload Internal DB</h3><p className="text-slate-400 mt-2">CSV format (id, date, description, amount)</p></>
              )}
            </label>

            <label className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${processorData.length > 0 ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 hover:border-purple-500/50'}`}>
              <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, 'processor')} />
              {processorData.length > 0 ? (
                <><CheckCircle2 className="size-12 text-emerald-500 mb-4" /><h3 className="text-xl font-bold text-emerald-400">Processor Payouts Loaded</h3><p className="text-slate-400 mt-2">{processorData.length} records parsed</p></>
              ) : (
                <><UploadCloud className="size-12 text-purple-500 mb-4" /><h3 className="text-xl font-bold text-white">Upload Stripe Payouts</h3><p className="text-slate-400 mt-2">CSV format (id, date, netAmount, amount)</p></>
              )}
            </label>
          </div>

          <div className="mt-16 flex flex-col items-center justify-center animate-in fade-in duration-700 delay-300">
            <div className="flex items-center gap-4 w-full max-w-md mb-8">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">Or quick start</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>
            <Button 
              onClick={loadDemoData} 
              variant="outline" 
              className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-6 text-lg font-bold tracking-wide"
            >
              <Database className="mr-3 size-5" /> Load Enterprise Demo Data
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
          <Card className="border-slate-800 bg-[#09090b] shadow-2xl">
            <CardHeader className="border-b border-slate-800/60 pb-4 bg-slate-900/30">
              <CardTitle className="text-sm font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <FileText className="size-4 text-blue-400" />
                Internal Database (Expected)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-900/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-500 font-bold">ID</TableHead>
                    <TableHead className="text-slate-500 font-bold">Description</TableHead>
                    <TableHead className="text-slate-500 font-bold text-right">Amount</TableHead>
                    <TableHead className="text-slate-500 font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internalData.map((tx) => (
                    <TableRow 
                      key={tx.id} 
                      onClick={() => tx.status === "Unmatched" && setSelectedInternalId(tx.id === selectedInternalId ? null : tx.id)}
                      className={`border-slate-800 transition-colors ${tx.status === 'Matched' ? 'bg-emerald-500/5 opacity-50 cursor-default' : tx.id === selectedInternalId ? 'bg-indigo-500/20 outline outline-1 outline-indigo-500 cursor-pointer' : 'hover:bg-slate-900 cursor-pointer'}`}
                    >
                      <TableCell className="font-mono text-xs text-slate-400">{tx.id}</TableCell>
                      <TableCell className="font-medium text-slate-200">{tx.description}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-white">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(tx)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-[#09090b] shadow-2xl">
            <CardHeader className="border-b border-slate-800/60 pb-4 bg-slate-900/30">
              <CardTitle className="text-sm font-bold tracking-wider text-slate-300 uppercase flex items-center gap-2">
                <FileText className="size-4 text-purple-400" />
                Stripe Payouts (Actual)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-900/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-500 font-bold">ID</TableHead>
                    <TableHead className="text-slate-500 font-bold">Amount</TableHead>
                    <TableHead className="text-slate-500 font-bold">Net (After Fees)</TableHead>
                    <TableHead className="text-slate-500 font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processorData.map((tx) => (
                    <TableRow 
                      key={tx.id} 
                      onClick={() => tx.status === "Unmatched" && setSelectedProcessorId(tx.id === selectedProcessorId ? null : tx.id)}
                      className={`border-slate-800 transition-colors ${tx.status === 'Matched' ? 'bg-emerald-500/5 opacity-50 cursor-default' : tx.id === selectedProcessorId ? 'bg-indigo-500/20 outline outline-1 outline-indigo-500 cursor-pointer' : 'hover:bg-slate-900 cursor-pointer'}`}
                    >
                      <TableCell className="font-mono text-xs text-slate-400">{tx.id}</TableCell>
                      <TableCell className="font-mono font-bold text-white">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="font-mono text-slate-400">
                        {tx.netAmount ? formatCurrency(tx.netAmount) : "—"}
                      </TableCell>
                      <TableCell className="text-center">{getStatusBadge(tx)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedInternalId && selectedProcessorId && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 flex items-center justify-between animate-in slide-in-from-bottom-10 fade-in duration-300 z-50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">
                <Link2 className="size-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Linking Records</p>
                <p className="text-sm font-mono font-bold text-white">{selectedInternalId} <span className="text-slate-500">↔</span> {selectedProcessorId}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Calculated Variance</p>
              <p className={`text-lg font-mono font-black ${variance !== 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {variance > 0 ? '+' : ''}{formatCurrency(variance)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={resolutionReason}
              onChange={(e) => setResolutionReason(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-sm font-medium text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 transition-colors"
            >
              <option>Prorated Downgrade</option>
              <option>Missing Processor Fee</option>
              <option>Partial Refund</option>
              <option>Currency Exchange Loss</option>
            </select>
            <Button 
              onClick={handleForceResolve}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <CheckCircle2 className="mr-2 size-4" />
              Force Resolve
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}