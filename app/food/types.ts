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

export type Settings = {
  open: boolean
  bitPhone?: string
  payboxPhone?: string
  scheduleDays?: ScheduleDay[]
}

export type OrderItem = {
  productId: string
  productName: string
  quantity: number
  price: number
  selectedOptions?: SelectedOption[]
}

export type Order = {
  id: string
  customerName: string
  phone: string
  items: OrderItem[]
  timeSlot: string
  total: number
  status: 'pending' | 'confirmed' | 'done'
  createdAt: string
}
