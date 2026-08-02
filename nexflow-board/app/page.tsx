"use client"

import { useState, useRef, useEffect } from "react"
import { Task, parseCSV } from "@/lib/data-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Upload,
  Sparkles,
  Trash2,
  Clock,
  FileSpreadsheet,
  Plus,
  Activity,
  Stethoscope,
  FileText,
  User,
  Calendar,
  AlertCircle
} from "lucide-react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

const healthcareDemoData: Task[] = [
  { id: "PT-1042", title: "ER Trauma Intake - MVA", assignee: "Dr. Reynolds", priority: "High", status: "Backlog", timeElapsed: "4m" },
  { id: "PT-0931", title: "Appendectomy Post-Op", assignee: "Dr. Chen", priority: "Medium", status: "In Progress", timeElapsed: "1h 45m" },
  { id: "EQ-8821", title: "MRI Machine Recalibration", assignee: "BioMed Tech", priority: "Medium", status: "Review", timeElapsed: "2h 30m" },
  { id: "PT-1102", title: "Routine Vitals - Ward C", assignee: "Nurse Kelly", priority: "Low", status: "Backlog", timeElapsed: "12m" },
  { id: "PT-0844", title: "Cardiac Monitoring - Bed 12", assignee: "Dr. Smith", priority: "High", status: "Review", timeElapsed: "4h" },
  { id: "PT-0722", title: "Discharge Paperwork - Room 402", assignee: "Admin Sarah", priority: "Low", status: "Completed", timeElapsed: "1d" },
]

interface NewRecordForm {
  title: string
  assignee: string
  priority: "High" | "Medium" | "Low"
  status: "Backlog" | "In Progress" | "Review" | "Completed"
}

const statusConfig = {
  Backlog: { label: "Triage / Intake", dot: "bg-slate-400 dark:bg-slate-500" },
  "In Progress": { label: "Active Treatment", dot: "bg-[#0056D2] dark:bg-blue-500" },
  Review: { label: "Observation / QA", dot: "bg-amber-500 dark:bg-amber-400" },
  Completed: { label: "Discharged / Resolved", dot: "bg-emerald-500 dark:bg-emerald-400" },
} as const

const priorityConfig = {
  High: { class: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900", label: "Critical" },
  Medium: { class: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900", label: "Urgent" },
  Low: { class: "bg-blue-50 text-[#0056D2] border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900", label: "Routine" },
} as const

export default function Home() {
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [mounted, setMounted] = useState(false)
  const [newTask, setNewTask] = useState<NewRecordForm>({
    title: "",
    assignee: "",
    priority: "Medium",
    status: "Backlog",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLoadDemo = () => setTasks(healthcareDemoData)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsLoading(true)
    try {
      const result = await parseCSV(file)
      setTasks(result)
    } catch (err) {
      console.error("CSV parse error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearBoard = () => {
    setTasks(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleCreateTask = () => {
    if (!tasks || !newTask.title.trim()) return
    const task: Task = {
      id: `REC-${String(tasks.length + 1).padStart(3, "0")}`,
      title: newTask.title,
      assignee: newTask.assignee || "Unassigned",
      priority: newTask.priority,
      status: newTask.status,
      timeElapsed: "0m",
    }
    setTasks([...tasks, task])
    setNewTask({ title: "", assignee: "", priority: "Medium", status: "Backlog" })
    setDialogOpen(false)
  }

  const onDragEnd = (result: DropResult) => {
    if (!tasks || !result.destination) return
    const { source, destination } = result
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const updatedTasks = Array.from(tasks)
    const draggedTask = updatedTasks.find(t => t.id === result.draggableId)
    
    if (!draggedTask) return

    const filteredTasks = updatedTasks.filter(t => t.id !== result.draggableId)
    draggedTask.status = destination.droppableId as Task["status"]
    filteredTasks.splice(destination.index, 0, draggedTask)
    setTasks(filteredTasks)
  }

  if (!mounted) return null

  // ─── Landing screen ───
  if (tasks === null) {
    return (
      <div className="mx-auto flex min-h-screen flex-col bg-white dark:bg-slate-950 font-sans antialiased transition-colors duration-200">
        <div className="w-full bg-[#1F2937] dark:bg-slate-900 px-6 py-2 border-b border-transparent dark:border-slate-800">
          <p className="text-xs font-medium text-slate-300 dark:text-slate-400">NexFlow Healthcare Systems — Enterprise Tracking</p>
        </div>
        
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl space-y-10 text-center">
            
            <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
              <Activity className="size-10 text-[#0056D2] dark:text-blue-500"/>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl">
                Track patients and resources <br/>
                <span className="text-[#0056D2] dark:text-blue-500">with absolute precision.</span>
              </h1>
              <p className="mx-auto max-w-xl text-lg text-slate-600 dark:text-slate-400">
                A high-trust, HIPAA-compliant visual board for managing facility operations, patient triaging, and equipment lifecycles.
              </p>
            </div>

            <div className="mx-auto grid max-w-lg gap-4 sm:grid-cols-2">
              <button
                onClick={handleLoadDemo}
                className="group relative flex flex-col items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-left shadow-sm transition-all hover:border-[#0056D2]/30 dark:hover:border-blue-500/50 hover:shadow-lg"
              >
                <div className="rounded-full bg-blue-50 dark:bg-blue-950/50 p-3 transition-all group-hover:bg-[#0056D2] dark:group-hover:bg-blue-600 group-hover:text-white">
                  <Sparkles className="size-6 text-[#0056D2] dark:text-blue-500 transition-colors group-hover:text-white"/>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">Load Demo Data</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Populate clinical tracking board
                  </p>
                </div>
              </button>

              <label
                className="group relative flex cursor-pointer flex-col items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-left shadow-sm transition-all hover:border-[#0056D2]/30 dark:hover:border-blue-500/50 hover:shadow-lg"
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragOver(false)
                  const file = e.dataTransfer.files?.[0]
                  if (file) {
                    setIsLoading(true)
                    parseCSV(file).then(setTasks).catch(console.error).finally(() => setIsLoading(false))
                  }
                }}
              >
                <div className="rounded-full bg-blue-50 dark:bg-blue-950/50 p-3 transition-all group-hover:bg-[#0056D2] dark:group-hover:bg-blue-600 group-hover:text-white">
                  <Upload className="size-6 text-[#0056D2] dark:text-blue-500 transition-colors group-hover:text-white"/>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {isLoading ? "Processing..." : "Import Secure CSV"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Local device ingestion only
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  disabled={isLoading}
                />
              </label>
            </div>
            
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              <FileSpreadsheet className="mr-1.5 inline size-3.5"/>
              Zero data leaves your machine. Processed 100% client-side.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const columns = ["Backlog", "In Progress", "Review", "Completed"] as const

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased transition-colors duration-200">
      <div className="w-full bg-[#1F2937] dark:bg-slate-900 px-6 py-2 border-b border-transparent dark:border-slate-800">
        <p className="text-xs font-medium text-slate-300 dark:text-slate-400">NexFlow Healthcare Systems — Enterprise Tracking</p>
      </div>
      
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#0056D2] dark:bg-blue-600 shadow-sm">
                <Stethoscope className="size-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Clinical Operations Board
                  </h1>
                  <Badge className="bg-blue-50 text-[#0056D2] border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/50" variant="outline">
                    {tasks.length} Active Records
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Secure facility overview of patient triage and resource statuses.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleLoadDemo} size="sm" variant="outline" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <Sparkles className="mr-2 size-4 text-[#0056D2] dark:text-blue-400"/>
                Reload Demo
              </Button>
              <Button onClick={handleClearBoard} size="sm" variant="outline" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                <Trash2 className="mr-2 size-4 text-slate-500 dark:text-slate-400"/>
                Clear Board
              </Button>
              <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 md:block" />
              <Button onClick={() => setDialogOpen(true)} size="sm" className="bg-[#0056D2] dark:bg-blue-600 text-white shadow-sm hover:bg-[#0047A5] dark:hover:bg-blue-500">
                <Plus className="mr-2 size-4"/>
                New Record
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* New Record Dialog */}
      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className="sm:max-w-[425px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">Admit / Create Record</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">Add a new patient or equipment record to the tracking board.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-slate-700 dark:text-slate-300 font-semibold">Record ID / Details</Label>
              <Input id="title" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus-visible:ring-[#0056D2] dark:focus-visible:ring-blue-500" onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g. PT-012 Cardiac Event" value={newTask.title} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignee" className="text-slate-700 dark:text-slate-300 font-semibold">Provider / Assignee</Label>
              <Input id="assignee" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus-visible:ring-[#0056D2] dark:focus-visible:ring-blue-500" onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })} placeholder="e.g. Dr. House" value={newTask.assignee} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority" className="text-slate-700 dark:text-slate-300 font-semibold">Severity / Priority</Label>
                <Select onValueChange={(value) => setNewTask({ ...newTask, priority: value as "High" | "Medium" | "Low" })} value={newTask.priority}>
                  <SelectTrigger className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-[#0056D2] dark:focus:ring-blue-500">
                    <SelectValue placeholder="Priority"/>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                    <SelectItem value="High">Critical</SelectItem>
                    <SelectItem value="Medium">Urgent</SelectItem>
                    <SelectItem value="Low">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-slate-700 dark:text-slate-300 font-semibold">Stage</Label>
                <Select onValueChange={(value) => setNewTask({ ...newTask, status: value as "Backlog" | "In Progress" | "Review" | "Completed" })} value={newTask.status}>
                  <SelectTrigger className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-[#0056D2] dark:focus:ring-blue-500">
                    <SelectValue placeholder="Stage"/>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 dark:border-slate-800">
                    <SelectItem value="Backlog">Triage / Intake</SelectItem>
                    <SelectItem value="In Progress">Active Treatment</SelectItem>
                    <SelectItem value="Review">Observation / QA</SelectItem>
                    <SelectItem value="Completed">Discharged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</Button>
            <Button className="bg-[#0056D2] dark:bg-blue-600 hover:bg-[#0047A5] dark:hover:bg-blue-500 text-white" disabled={!newTask.title.trim()} onClick={handleCreateTask}>
              Create Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog (Read-only enterprise view) */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-[600px] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 overflow-hidden">
          {selectedTask && (() => {
            const priority = priorityConfig[selectedTask.priority]
            const stage = statusConfig[selectedTask.status]
            return (
              <>
                <div className="bg-slate-50 dark:bg-slate-950/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                      <FileText className="size-5 text-[#0056D2] dark:text-blue-400" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">{selectedTask.id}</DialogTitle>
                      <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">Record Details</DialogDescription>
                    </div>
                  </div>
                  <Badge className={`px-3 py-1 text-xs font-bold uppercase tracking-wider ${priority.class}`} variant="outline">
                    {priority.label} Priority
                  </Badge>
                </div>
                
                <div className="px-6 py-6 grid gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTask.title}</h3>
                    <div className="mt-4 flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${stage.dot}`} />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Stage: {stage.label}</span>
                    </div>
                  </div>
                  
                  <Separator className="bg-slate-200 dark:bg-slate-800" />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <User className="size-4" /> Assigned Provider
                      </p>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <AvatarFallback className="bg-[#0056D2] dark:bg-blue-600 text-white font-bold">
                            {selectedTask.assignee.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedTask.assignee}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Primary Contact</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Calendar className="size-4" /> Admission / Uptime
                      </p>
                      <div className="flex items-center gap-2">
                        <Clock className="size-5 text-slate-400 dark:text-slate-500" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedTask.timeElapsed} elapsed</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Since initial intake</p>
                    </div>
                  </div>
                  
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="size-4 text-slate-500 dark:text-slate-400" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">System Notes</p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      Record generated electronically. Standard operational protocols apply based on severity index. Ensure all charts and relevant compliance documentation are updated prior to transition to the next workflow stage.
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-950/50 px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                  <Button onClick={() => setSelectedTask(null)} className="bg-[#0056D2] dark:bg-blue-600 text-white hover:bg-[#0047A5] dark:hover:bg-blue-500">
                    Acknowledge & Close
                  </Button>
                </div>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Kanban columns */}
      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {columns.map((status) => {
              const config = statusConfig[status]
              const columnTasks = tasks.filter((task) => task.status === status)

              return (
                <div key={status} className="flex h-full flex-col">
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex min-h-[600px] flex-col gap-4 rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 transition-colors duration-200 ${
                          snapshot.isDraggingOver ? "ring-2 ring-[#0056D2] dark:ring-blue-500 bg-blue-50/30 dark:bg-slate-800/80" : "ring-slate-200 dark:ring-slate-800"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className={`size-3 rounded-full ${config.dot}`} />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                              {config.label}
                            </h2>
                          </div>
                          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                            {columnTasks.length}
                          </span>
                        </div>

                        {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex h-32 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">No active records</p>
                          </div>
                        )}
                        
                        {columnTasks.map((task, index) => {
                          const priority = priorityConfig[task.priority]
                          return (
                            <Draggable draggableId={task.id} index={index} key={task.id}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedTask(task)}
                                  style={{
                                    ...provided.draggableProps.style,
                                  }}
                                  className={`group relative rounded-xl border bg-white dark:bg-slate-900 p-4 transition-all ${
                                    snapshot.isDragging 
                                      ? "z-50 scale-[1.02] cursor-grabbing border-[#0056D2] dark:border-blue-500 shadow-xl shadow-[#0056D2]/10 dark:shadow-blue-900/20 ring-1 ring-[#0056D2] dark:ring-blue-500" 
                                      : "cursor-pointer border-slate-200 dark:border-slate-700 shadow-sm hover:border-[#0056D2]/50 dark:hover:border-blue-500/50 hover:shadow-md"
                                  }`}
                                >
                                  <div className="mb-4 flex items-start justify-between gap-4">
                                    <h3 className="text-sm font-bold leading-snug text-slate-900 dark:text-white group-hover:text-[#0056D2] dark:group-hover:text-blue-400 transition-colors">
                                      {task.title}
                                    </h3>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="size-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                                          {task.assignee.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="max-w-[100px] truncate text-xs font-semibold text-slate-600 dark:text-slate-400">
                                        {task.assignee}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-500">
                                        <Clock className="size-3.5"/>
                                        {task.timeElapsed}
                                      </span>
                                      <Badge className={`h-6 px-2.5 text-[10px] font-bold uppercase tracking-wider ${priority.class}`} variant="outline">
                                        {priority.label}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}