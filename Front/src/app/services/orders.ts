import { apiClient } from "@/lib/api"
import type { Order, CreateOrderRequest, UpdateOrderStatusRequest, ApiResponse, PaginatedResponse } from "@/lib/types"

export interface StatusHistoryItem {
  status: string
  timestamp: string
}

export class OrdersService {
  // Obtener todos los pedidos con filtros
  static async getOrders(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<PaginatedResponse<Order>> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.status && params.status !== "all") searchParams.append("status", params.status)
    if (params?.search) searchParams.append("search", params.search)

    const queryString = searchParams.toString()
    const endpoint = `/orders${queryString ? `?${queryString}` : ""}`

    return apiClient.get<PaginatedResponse<Order>>(endpoint)
  }

  // Obtener un pedido por ID
  static async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
  }

  // Crear nuevo pedido
  static async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return apiClient.post<ApiResponse<Order>>("/orders", orderData)
  }

  // Actualizar estado del pedido
  static async updateOrderStatus(id: string, statusData: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    return apiClient.put<ApiResponse<Order>>(`/orders/${id}/status`, statusData)
  }

  // Eliminar pedido
  static async deleteOrder(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/orders/${id}`)
  }

  // Obtener historial de estados
  static async getOrderHistory(id: string): Promise<ApiResponse<StatusHistoryItem[]>> {
    return apiClient.get<ApiResponse<StatusHistoryItem[]>>(`/orders/${id}/history`)
  }
}
