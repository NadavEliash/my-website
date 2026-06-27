export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string // URL
  available: boolean
}

export type Settings = {
  availabilityStart: string // "HH:MM"
  availabilityEnd: string   // "HH:MM"
  slotMinutes: number       // 15, 30, or 60
  open: boolean
}

export type OrderItem = {
  productId: string
  productName: string
  quantity: number
  price: number
}

export type Order = {
  id: string
  customerName: string
  phone: string
  items: OrderItem[]
  timeSlot: string // "HH:MM"
  total: number
  status: 'pending' | 'confirmed' | 'done'
  createdAt: string
}
