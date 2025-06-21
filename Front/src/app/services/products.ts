import { apiClient } from "@/lib/api"
import type { Product, ApiResponse, PaginatedResponse } from "@/lib/types"

export class ProductsService {
  static async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    isActive?: boolean
  }): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append("page", params.page.toString())
    if (params?.limit) searchParams.append("limit", params.limit.toString())
    if (params?.search) searchParams.append("search", params.search)
    if (params?.category) searchParams.append("category", params.category)
    if (params?.isActive !== undefined) searchParams.append("isActive", params.isActive.toString())

    const queryString = searchParams.toString()
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`

    return apiClient.get<PaginatedResponse<Product>>(endpoint)
  }

  static async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<ApiResponse<Product>>(`/products/${id}`)
  }
}
