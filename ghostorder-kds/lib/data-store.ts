export type OrderSource = "UberEats" | "DoorDash" | "Zomato" | "Swiggy" | "Web" | "Walk-in"
export type OrderStatus = "New" | "Prep" | "Ready"

export interface OrderItem {
  id: string
  name: string
  qty: number
  modifiers?: string[]
}

export interface Order {
  id: string
  source: OrderSource
  customerName: string
  createdAt: Date
  targetPrepTimeMinutes: number
  status: OrderStatus
  items: OrderItem[]
}

const now = new Date()

export const initialOrders: Order[] = [
  {
    id: "ZO-7721",
    source: "Zomato",
    customerName: "Aarav M.",
    createdAt: new Date(now.getTime() - 14 * 60000), 
    targetPrepTimeMinutes: 15,
    status: "Prep",
    items: [
      { id: "i1", name: "Double Smashburger", qty: 2, modifiers: ["No Pickles", "Extra Sauce"] },
      { id: "i2", name: "Truffle Fries", qty: 1 },
    ],
  },
  {
    id: "SW-8812",
    source: "Swiggy",
    customerName: "Priya K.",
    createdAt: new Date(now.getTime() - 4 * 60000), 
    targetPrepTimeMinutes: 20,
    status: "New",
    items: [
      { id: "i3", name: "Spicy Chicken Sandwich", qty: 1 },
      { id: "i4", name: "Onion Rings", qty: 1 },
      { id: "i5", name: "Large Cola", qty: 2 },
    ],
  },
  {
    id: "UE-8472",
    source: "UberEats",
    customerName: "Alex M.",
    createdAt: new Date(now.getTime() - 8 * 60000), 
    targetPrepTimeMinutes: 15,
    status: "Prep",
    items: [
      { id: "i6", name: "Vegan Bowl", qty: 1, modifiers: ["Dressing on side", "Allergy: Nuts"] },
    ],
  },
  {
    id: "DD-1923",
    source: "DoorDash",
    customerName: "Sarah K.",
    createdAt: new Date(now.getTime() - 1 * 60000),
    targetPrepTimeMinutes: 15,
    status: "New",
    items: [
      { id: "i7", name: "Classic Cheeseburger", qty: 4 },
      { id: "i8", name: "Fries", qty: 4 },
    ],
  },
]