import Papa from "papaparse"

export interface Task {
  id: string
  title: string
  assignee: string
  priority: "High" | "Medium" | "Low"
  status: "Backlog" | "In Progress" | "Review" | "Completed"
  timeElapsed: string
}

export const demoTasks: Task[] = [
  { id: "NX-01", title: "Update server SSL certificates", assignee: "Sarah C.", priority: "High", status: "In Progress", timeElapsed: "2h 15m" },
  { id: "NX-02", title: "Migrate database to Postgres 16", assignee: "Marcus W.", priority: "High", status: "Review", timeElapsed: "1d 4h" },
  { id: "NX-03", title: "Design mobile nav menu", assignee: "Elena R.", priority: "Medium", status: "Backlog", timeElapsed: "0m" },
  { id: "NX-04", title: "Fix memory leak in parser", assignee: "David K.", priority: "High", status: "In Progress", timeElapsed: "45m" },
  { id: "NX-05", title: "Update Terms of Service", assignee: "Anita P.", priority: "Low", status: "Completed", timeElapsed: "3d" },
  { id: "NX-06", title: "Implement OAuth2 providers", assignee: "Sarah C.", priority: "Medium", status: "Review", timeElapsed: "5h" },
]

export async function parseCSV(file: File): Promise<Task[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Map generic CSV columns to our Task interface
        const parsed = results.data.map((row: any, index) => ({
          id: row.id || `CSV-${index + 1}`,
          title: row.title || row.task || row.name || "Untitled Task",
          assignee: row.assignee || row.owner || "Unassigned",
          priority: (row.priority || "Medium") as Task["priority"],
          status: (row.status || "Backlog") as Task["status"],
          timeElapsed: row.timeElapsed || row.time || "0m",
        }))
        resolve(parsed)
      },
      error: (err) => reject(err),
    })
  })
}
