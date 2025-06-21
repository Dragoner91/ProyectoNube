import { apiClient } from "@/lib/api"
import type { Client, ApiResponse, PaginatedResponse } from "@/lib/types"

export class ClientsService {
  static async getClients(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<PaginatedResponse<Client>> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.search) searchParams.append("search", params.search)

    const queryString = searchParams.toString()
    const endpoint = `/clients${queryString ? `?${queryString}` : ""}`

    return apiClient.get<PaginatedResponse<Client>>(endpoint)
  }

  static async getClientById(id: string): Promise<ApiResponse<Client>> {
    return apiClient.get<ApiResponse<Client>>(`/clients/${id}`)
  }

  static async createClient(clientData: Omit<Client, "id" | "createdAt">): Promise<ApiResponse<Client>> {
    return apiClient.post<ApiResponse<Client>>("/clients", clientData)
  }
}
