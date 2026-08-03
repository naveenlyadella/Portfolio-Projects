export type ReconStatus = "Matched" | "Unmatched" | "Discrepancy"

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  currency: string
  status: ReconStatus
  processorFee?: number
  netAmount?: number
  matchId?: string // Links to the opposing ledger if matched
  resolutionNote?: string
}

// Internal Database (What our app recorded)
export const internalLedger: Transaction[] = [
  { id: "INT-1001", date: "2026-08-01", description: "Pro Plan Subscription", amount: 49.00, currency: "USD", status: "Unmatched" },
  { id: "INT-1002", date: "2026-08-01", description: "Enterprise Seat License", amount: 1500.00, currency: "USD", status: "Unmatched" },
  { id: "INT-1003", date: "2026-08-02", description: "API Overage Charge", amount: 12.50, currency: "USD", status: "Unmatched" },
  { id: "INT-1004", date: "2026-08-02", description: "Pro Plan Subscription", amount: 49.00, currency: "USD", status: "Unmatched" },
  { id: "INT-1005", date: "2026-08-03", description: "Custom Integration Fee", amount: 250.00, currency: "USD", status: "Unmatched" },
]

// Payment Processor (What Stripe actually paid out)
export const processorLedger: Transaction[] = [
  { id: "STR-9942", date: "2026-08-01", description: "Payment - ch_1N4a", amount: 49.00, processorFee: 1.72, netAmount: 47.28, currency: "USD", status: "Unmatched" },
  // Notice the discrepancy below: User upgraded mid-month, internal DB expects 1500, Stripe processed prorated 1450.
  { id: "STR-9943", date: "2026-08-01", description: "Payment - ch_1N4b", amount: 1450.00, processorFee: 42.35, netAmount: 1407.65, currency: "USD", status: "Unmatched" }, 
  { id: "STR-9944", date: "2026-08-02", description: "Payment - ch_1N4c", amount: 12.50, processorFee: 0.66, netAmount: 11.84, currency: "USD", status: "Unmatched" },
  // Missing INT-1004 (Failed payment in reality, but internal DB recorded it as success)
  { id: "STR-9945", date: "2026-08-03", description: "Payment - ch_1N4d", amount: 250.00, processorFee: 7.55, netAmount: 242.45, currency: "USD", status: "Unmatched" },
]
