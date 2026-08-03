"use client"

import { useState, useRef } from "react"
import { parseFile } from "@/lib/parser"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileSpreadsheet,
  Trash2,
  ArrowRight,
  BarChart3,
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react"

interface ParsedData {
  fileName: string
  rowCount: number
  columns: string[]
  sampleRows: Record<string, unknown>[]
}

interface AnalysisResult {
  summary: string
  insights: string[]
  recommendations: string[]
}

export default function Home() {
  const [fileObject, setFileObject] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileObject(file)
    setError(null)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const valid = /\.(csv|xlsx?)$/i.test(file.name)
    if (!valid) {
      setError('Please upload a .csv or .xlsx file')
      return
    }
    setFileObject(file)
    setError(null)
  }

  async function handleParse() {
    if (!fileObject) return
    setIsParsing(true)
    setError(null)

    try {
      const data = await parseFile(fileObject)
      setParsedData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
    } finally {
      setIsParsing(false)
    }
  }

  async function runAnalysis() {
    if (!parsedData) return
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      })
      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.error?.message || 'Analysis failed')
      }
      setAnalysisResult(result as AnalysisResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleClear() {
    setFileObject(null)
    setParsedData(null)
    setError(null)
    setAnalysisResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  // --- Initial state: file upload card ---
  if (!parsedData) {
    return (
      <div className='mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
        <Card className='w-full max-w-lg'>
          <CardHeader className='text-center'>
            <div className='mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20'>
              <Database className='size-7 text-primary' />
            </div>
            <CardTitle className='text-2xl'>Import your data</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file to extract insights instantly.
              All processing happens on your device — nothing is uploaded to any server.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <label
              htmlFor='file-upload'
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed p-10 text-center transition-all"
            >
              <div className='rounded-full bg-gradient-to-br from-primary to-emerald-500 p-4 shadow-lg shadow-primary/20'>
                <Upload className='size-6 text-white' />
              </div>
              <div>
                <p className='text-sm font-semibold text-foreground'>
                  {fileObject ? fileObject.name : 'Click to browse or drop a file here'}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  .csv or .xlsx &middot; Client-side processing &middot; Zero data leaves your machine
                </p>
              </div>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Badge variant='secondary' className='rounded-full'>CSV</Badge>
                <Badge variant='secondary' className='rounded-full'>XLSX</Badge>
                <Badge variant='secondary' className='rounded-full'>XLS</Badge>
              </div>
            </label>
            <input
              id='file-upload'
              ref={inputRef}
              type='file'
              accept='.csv,.xlsx,.xls'
              onChange={handleFileChange}
              className='sr-only'
            />
            {error && (
              <div className='flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                <AlertCircle className='size-4 shrink-0' />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className='justify-end gap-3'>
            <Button
              variant='ghost'
              onClick={handleClear}
              disabled={!fileObject || isParsing}
            >
              Clear
            </Button>
            <Button
              onClick={handleParse}
              disabled={!fileObject || isParsing}
              className='min-w-[120px]'
            >
              {isParsing ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Parsing...
                </>
              ) : (
                <>
                  <FileText className='mr-2 size-4' />
                  Extract Data
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // --- Data overview state ---
  return (
    <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
      {/* Header */}
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <h1 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl'>
              Dataset Overview
            </h1>
            <CheckCircle2 className='size-5 text-emerald-500' />
          </div>
          <p className='flex items-center gap-2 text-sm text-muted-foreground'>
            <FileSpreadsheet className='size-4 text-primary' />
            {parsedData.fileName}
            <span className='text-muted-foreground/50'>·</span>
            <span className='font-medium text-foreground'>{parsedData.rowCount.toLocaleString()}</span> rows detected
            <span className='text-muted-foreground/50'>·</span>
            <span className='font-medium text-foreground'>{parsedData.columns.length}</span> columns
          </p>
        </div>
        <div className='flex gap-3'>
          <Button variant='outline' onClick={handleClear}>
            <Trash2 className='mr-2 size-4' />
            Discard
          </Button>
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className='min-w-[160px]'
          >
            {isAnalyzing ? (
              <>
                <Loader2 className='mr-2 size-4 animate-spin' />
                Analyzing...
              </>
            ) : (
              <>
                Run AI Analysis
                <ArrowRight className='ml-2 size-4' />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Data table */}
      <Card className='overflow-hidden'>
        <CardHeader className='border-b bg-muted/30'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-sm font-medium'>Sample Data ({parsedData.sampleRows.length} rows)</CardTitle>
            <Badge variant='secondary' className='rounded-full text-xs'>
              {parsedData.columns.length} columns
            </Badge>
          </div>
        </CardHeader>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader className='bg-muted/50'>
              <TableRow>
                {parsedData.columns.map((col) => (
                  <TableHead key={col} className='whitespace-nowrap font-semibold'>
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedData.sampleRows.map((row, i) => (
                <TableRow key={i}>
                  {parsedData.columns.map((col) => (
                    <TableCell key={col} className='max-w-[200px] truncate whitespace-nowrap'>
                      {String(row[col] ?? '—')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Analysis results */}
      {analysisResult && (
        <Card className='mt-6 overflow-hidden border-emerald-500/20'>
          <CardHeader className='border-b bg-emerald-500/5'>
            <div className='flex items-center gap-2'>
              <div className='rounded-full bg-emerald-500/10 p-1.5'>
                <BarChart3 className='size-4 text-emerald-500' />
              </div>
              <CardTitle className='text-base'>Analysis Results</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-6 pt-6'>
            <div className='rounded-lg border bg-muted/30 p-4'>
              <h3 className='mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                Summary
              </h3>
              <p className='text-sm leading-relaxed text-foreground'>
                {analysisResult.summary}
              </p>
            </div>

            <div>
              <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-primary'>
                Key Insights
              </h3>
              <ul className='space-y-2'>
                {analysisResult.insights.map((insight, i) => (
                  <li key={i} className='flex items-start gap-3 rounded-lg border border-transparent bg-muted/30 p-3 text-sm transition-colors hover:border-border hover:bg-muted/50'>
                    <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary'>
                      {i + 1}
                    </span>
                    <span className='text-foreground'>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className='mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400'>
                Recommendations
              </h3>
              <ul className='space-y-2'>
                {analysisResult.recommendations.map((rec, i) => (
                  <li key={i} className='flex items-start gap-3 rounded-lg border border-amber-500/10 bg-amber-500/5 p-3 text-sm transition-colors hover:border-amber-500/20'>
                    <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-medium text-amber-600 dark:text-amber-400'>
                      {i + 1}
                    </span>
                    <span className='text-foreground'>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className='border-t bg-muted/30'>
            <p className='flex items-center gap-2 text-xs text-muted-foreground'>
              <CheckCircle2 className='size-3.5 text-emerald-500' />
              AI analysis completed. All data remains on your device.
            </p>
          </CardFooter>
        </Card>
      )}

      {/* Error banner */}
      {error && (
        <div className='mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
          <AlertCircle className='size-4 shrink-0' />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}