export type OptionChoice = {
  label: string
  priceAdd: number  // 0 = no extra charge
}

export type ProductOption = {
  id: string
  label: string
  choices: OptionChoice[]
  required: boolean
  multiple?: boolean  // allow selecting more than one choice
}

export type SelectedOption = {
  optionId: string
  label: string
  choice: string
  priceAdd: number
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  available: boolean
  options?: ProductOption[]
}

export type ScheduleDay = {
  id: string
  date: string        // "YYYY-MM-DD"
  start: string       // "HH:MM"
  end: string         // "HH:MM"
  slotMinutes: number // 15, 30, or 60
}

export type DeliveryOption = {
  id: string
  label: string
  price: number
}

// 'takeaway' = customers pick a pickup time window; 'in-house' = served on the
// spot, no time management anywhere (settings, customer flow, or orders view).
export type ServiceMode = 'takeaway' | 'in-house'

export type Settings = {
  open: boolean
  serviceMode?: ServiceMode  // defaults to 'takeaway'
  bitPhone?: string
  payboxPhone?: string
  scheduleDays?: ScheduleDay[]
  deliveryOptions?: DeliveryOption[]
}

// max orders allowed per single time slot
export const MAX_PER_SLOT = 3

export type OrderItem = {
  productId: string
  productName: string
  quantity: number
  price: number
  selectedOptions?: SelectedOption[]
}

export type OrderStatus = 'waiting' | 'approved' | 'paid' | 'sent'

export type Order = {
  id: string
  customerName: string
  phone: string
  waitress?: string          // set when a waitress took the order in person
  items: OrderItem[]
  timeSlot: string           // human-readable display, e.g. "ד׳ 15.7 · 18:00"; empty for in-house / waitress orders
  pickupDate?: string        // "YYYY-MM-DD" — structured, for time-based logic
  pickupTime?: string        // "HH:MM"
  delivery?: { label: string; price: number }
  total: number
  status: OrderStatus
  createdAt: string
}

// legacy orders used pending/confirmed/done — map them to the current model
export function normalizeStatus(s: string): OrderStatus {
  if (s === 'confirmed' || s === 'approved') return 'approved'
  if (s === 'paid') return 'paid'
  if (s === 'done' || s === 'sent') return 'sent'
  return 'waiting'
}
