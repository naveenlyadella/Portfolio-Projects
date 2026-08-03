import { NextResponse } from "next/server"

const sources = ["UberEats", "DoorDash", "Zomato", "Swiggy", "Web", "Walk-in"] as const
const names = ["Jordan P.", "Taylor R.", "Casey S.", "Morgan L.", "Riley D.", "Sam W.", "Aarav M.", "Priya K.", "Rahul S."]
const menuItems = [
  { name: "Spicy Chicken Sandwich", maxQty: 2 },
  { name: "Double Smashburger", maxQty: 3 },
  { name: "Truffle Fries", maxQty: 2 },
  { name: "Large Cola", maxQty: 4 },
  { name: "Vegan Bowl", maxQty: 1 },
  { name: "Onion Rings", maxQty: 2 }
]
const possibleModifiers = ["No Pickles", "Extra Sauce", "Allergy: Nuts", "Dressing on side"]

const prefixMap: Record<string, string> = {
  "UberEats": "UE",
  "DoorDash": "DD",
  "Zomato": "ZO",
  "Swiggy": "SW",
  "Web": "WEB",
  "Walk-in": "WK"
}

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200))

  const source = sources[Math.floor(Math.random() * sources.length)]
  const customerName = names[Math.floor(Math.random() * names.length)]
  
  const itemCount = Math.floor(Math.random() * 3) + 1
  const items = []
  
  for (let i = 0; i < itemCount; i++) {
    const menuItem = menuItems[Math.floor(Math.random() * menuItems.length)]
    const wantsModifier = Math.random() > 0.7
    
    items.push({
      id: `item-${Math.random().toString(36).substr(2, 5)}`,
      name: menuItem.name,
      qty: Math.floor(Math.random() * menuItem.maxQty) + 1,
      modifiers: wantsModifier ? [possibleModifiers[Math.floor(Math.random() * possibleModifiers.length)]] : []
    })
  }

  const prefix = prefixMap[source]
  const newOrder = {
    id: `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`,
    source,
    customerName,
    createdAt: new Date().toISOString(),
    targetPrepTimeMinutes: source === "Walk-in" ? 10 : 15,
    status: "New",
    items
  }

  return NextResponse.json(newOrder)
}