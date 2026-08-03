export type ESILevel = 1 | 2 | 3 | 4 | 5

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'M' | 'F' | 'Other'
  chiefComplaint: string
  esiLevel: ESILevel
  arrivalTime: string
  vitals: {
    bp?: string
    hr?: number
    spo2?: number
    temp?: number
    rr?: number
  }
  assignedNurse?: string
  room?: string
  notes?: string
  status: 'waiting' | 'in-progress' | 'ready-for-disposition' | 'discharged' | 'admitted'
  waitTimeMinutes: number
}

export const ESI_LABELS: Record<ESILevel, string> = {
  1: 'Resuscitation',
  2: 'Emergent',
  3: 'Urgent',
  4: 'Less Urgent',
  5: 'Non-Urgent',
}

export const ESI_COLORS: Record<ESILevel, string> = {
  1: 'esi1',
  2: 'esi2',
  3: 'esi3',
  4: 'esi4',
  5: 'esi5',
}

export const COLUMNS = [
  { id: 'waiting', label: 'Waiting', color: 'slate' },
  { id: 'in-progress', label: 'In Progress', color: 'blue' },
  { id: 'ready-for-disposition', label: 'Ready for Disposition', color: 'amber' },
  { id: 'discharged', label: 'Discharged', color: 'green' },
  { id: 'admitted', label: 'Admitted', color: 'purple' },
] as const

export type ColumnId = typeof COLUMNS[number]['id']