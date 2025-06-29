import { apiClient } from "@/lib/api";
import type { Client, ApiResponse, PaginatedResponse } from "@/lib/types";

export class ClientsService {
  static async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Client>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    const endpoint = `/client/view${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<any[]>(endpoint);

    const transformedData = response.map(this.transformClient);

    return {
      data: transformedData,
      total: transformedData.length,
      page: 1,
      limit: transformedData.length,
      totalPages: 1,
    };
  }

  private static transformClient(client: any): Client {
    return {
      id: client.ID_Cliente,
      name: client.nombre,
      email: client.correo,
      phone: "", 
      address: "", 
      createdAt: new Date().toISOString(), 
    };
  }
}