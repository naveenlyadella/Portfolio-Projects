"use client"

import { useCallback, useState } from "react"
import { parseFile, ParsedData } from "@/lib/parser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileSpreadsheet, X, CheckCircle2, Loader2 } from "lucide-react"

interface FileUploaderProps {
  onParseComplete: (data: ParsedData) => void
  onPatientsReady?: (patients: any[]) => void
  isLoading?: boolean
}

export function FileUploader({ onParseComplete, onPatientsReady, isLoading }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (!selectedFile) return
    if (!selectedFile.name.match(/\.(csv|xlsx|xls)$/i)) {
      setError("Please select a CSV or Excel file")
      return
    }
    setFile(selectedFile)
    setError(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelect(droppedFile)
  }, [handleFileSelect])

  const handleParse = async () => {
    if (!file) return
    setIsParsing(true)
    setError(null)
    try {
      const data = await parseFile(file)
      onParseComplete(data)
      
      // Transform to patient format
      if (onPatientsReady) {
        const patients = transformToPatients(data)
        onPatientsReady(patients)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file")
    } finally {
      setIsParsing(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setError(null)
    const input = document.getElementById("file-upload") as HTMLInputElement
    if (input) input.value = ""
  }

  const transformToPatients = (data: ParsedData): any[] => {
    return data.sampleRows.map((row, index) => ({
      id: `imported-${index}`,
      name: String(row['name'] || row['patient_name'] || row['patient'] || `Patient ${index + 1}`),
      age: Number(row['age'] || row['patient_age'] || Math.floor(Math.random() * 80) + 1),
      gender: String(row['gender'] || row['sex'] || 'M') as 'M' | 'F' | 'Other',
      chiefComplaint: String(row['complaint'] || row['chief_complaint'] || row['reason'] || 'General consultation'),
      esiLevel: Number(row['esi'] || row['esi_level'] || row['acuity'] || Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
      arrivalTime: String(row['arrival'] || row['arrival_time'] || `${String(Math.floor(Math.random() * 12) + 8).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`),
      vitals: {
        bp: String(row['bp'] || row['blood_pressure'] || '120/80'),
        hr: Number(row['hr'] || row['heart_rate'] || 72),
        spo2: Number(row['spo2'] || row['o2_sat'] || 98),
        temp: Number(row['temp'] || row['temperature'] || 37.0),
        rr: Number(row['rr'] || row['resp_rate'] || 16),
      },
      assignedNurse: String(row['nurse'] || row['assigned_nurse'] || ''),
      room: String(row['room'] || row['bed'] || ''),
      notes: String(row['notes'] || row['note'] || ''),
      status: 'waiting' as const,
      waitTimeMinutes: Math.floor(Math.random() * 60),
    }))
  }

  return (
    <Card className="w-full max-w-xl border-slate-800 bg-slate-900/80 backdrop-blur-sm shadow-xl shadow-cyan-500/5">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-cyan-500/20 p-2">
            <Upload className="size-5 text-cyan-400" />
          </div>
          <CardTitle className="text-white">Data Ingestion</CardTitle>
        </div>
        <CardDescription className="text-slate-400">
          Upload patient data via CSV or Excel. Columns auto-mapped to triage fields.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            dragActive
              ? "border-cyan-400/50 bg-cyan-500/5"
              : "border-slate-700/50 hover:border-cyan-400/30 hover:bg-slate-800/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            className="sr-only"
            disabled={isParsing || isLoading}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="mx-auto mb-4 rounded-full p-4 bg-slate-800/50">
              <FileSpreadsheet className="size-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-300 mb-1">
              {file ? file.name : "Click or drag to upload patient data"}
            </p>
            <p className="text-xs text-slate-500">
              .csv, .xlsx, .xls · Auto-detects ESI, vitals, demographics
            </p>
          </label>
        </div>
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400 text-sm">
            <X className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {file && !isParsing && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-emerald-400 text-sm">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Ready to parse: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button
          variant="ghost"
          onClick={handleClear}
          disabled={!file || isParsing || isLoading}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="size-4 mr-1" />
          Clear
        </Button>
        <Button
          onClick={handleParse}
          disabled={!file || isParsing || isLoading}
          className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-500/20"
        >
          {isParsing ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <Upload className="size-4 mr-2" />
              Ingest Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}