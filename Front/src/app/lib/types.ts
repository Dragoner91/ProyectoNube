// Tipos para las respuestas de la API
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string
  customer: string
  customerEmail?: string
  customerPhone?: string
  shippingAddress: string
  status: "pending" | "in_transit" | "delivered" | "cancelled" | "delayed"
  createdAt: string
  updatedAt?: string
  weight: number
  value: number
  trackingNumber?: string
  estimatedDelivery?: string
  statusHistory: StatusHistoryItem[]
  items: OrderItem[]
}

export interface StatusHistoryItem {
  id?: string
  status: "pending" | "in_transit" | "delivered" | "cancelled" | "delayed"
  timestamp: string
  note?: string
}

export interface CreateOrderRequest {
  direccion: string
  ID_Cliente: number
  total_a_pagar: number
  productos: {
    ID_Producto: string
    cantidad: number
  }[]
}

export interface UpdateOrderStatusRequest {
  status: Order["status"]
  note?: string
}

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  createdAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  weight: number
  stock: number
}
