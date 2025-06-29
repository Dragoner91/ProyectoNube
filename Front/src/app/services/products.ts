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
    const endpoint = `/product/view${queryString ? `?${queryString}` : ""}`

    const response = await apiClient.get<any[]>(endpoint);
    
    const transformedData = response.map(this.transformProduct);

    return {
      data: transformedData,
      total: transformedData.length,
      page: 1,
      limit: transformedData.length,
      totalPages: 1,
    };
  }

  static async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<ApiResponse<Product>>(`/products/${id}`)
  }

  private static transformProduct(product: any): Product {
  return {
    id: product.ID_Producto,
    name: product.nombre,
    price: product.price,
    weight: product.peso,
    stock: product.disponibilidad,
  };
}
}
