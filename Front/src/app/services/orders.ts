import { apiClient } from "@/lib/api"
import type { Order, CreateOrderRequest, ApiResponse, PaginatedResponse } from "@/lib/types"

export interface StatusHistoryItem {
  status: string
  timestamp: string
}

export class OrdersService {
  private static transformOrder(order: any): Order {
    const items = order.productosPedidos.map((item: any) => ({
      quantity: item.cantidad,
      product: {
        id: item.producto.ID_Producto,
        name: item.producto.nombre,
        price: parseFloat(item.producto.price) || 0,
        weight: parseFloat(item.producto.peso) || 0,
        stock: item.producto.disponibilidad || 0,
      },
    })) || [];

    const totalWeight = items.reduce((acc: number, item: any) => acc + item.product.weight * item.quantity, 0);
    const currentStatus = order.estatus?.[0]?.nombre ? order.estatus[0].nombre.toLowerCase() : "pending";
    const createdAt = order.fecha_creacion && !isNaN(new Date(order.fecha_creacion).getTime()) 
      ? new Date(order.fecha_creacion).toISOString() 
      : new Date().toISOString();

    return {
      id: order.ID_Pedido,
      customer: order.cliente?.nombre || "Cliente no asignado",
      shippingAddress: order.direccion,
      status: currentStatus as Order['status'],
      createdAt: createdAt,
      value: parseFloat(order.total_a_pagar) || 0,
      weight: totalWeight,
      items: items,
      statusHistory: order.estatus?.map((s: any) => ({
        status: s.nombre ? s.nombre.toLowerCase() : "unknown",
        timestamp: s.fecha_actualizacion && !isNaN(new Date(s.fecha_actualizacion).getTime()) 
          ? new Date(s.fecha_actualizacion).toISOString() 
          : new Date().toISOString(),
        note: `Estado actualizado a ${s.nombre || 'desconocido'}`,
      })) || [],
    };
  }

  // Obtener todos los pedidos con filtros
  static async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Order>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status && params.status !== "all") searchParams.append("status", params.status);
    if (params?.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    const endpoint = `/order${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get<any[]>(endpoint);
    
    const transformedData = response.map(this.transformOrder);

    return {
      data: transformedData,
      total: transformedData.length,
      page: 1,
      limit: transformedData.length,
      totalPages: 1,
    };
  }

  // Obtener un pedido por ID
  static async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponse<any>>(`/order/${id}`);
    return {
      ...response,
      data: this.transformOrder(response.data),
    };
  }

  // Crear nuevo pedido
  static async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
    const response = await apiClient.post<ApiResponse<any>>("/order/create", orderData);
    return {
      ...response,
      data: response.data,
    };
  }

  // Obtener historial de estados
  static async getOrderHistory(id: string): Promise<ApiResponse<StatusHistoryItem[]>> {
    return apiClient.get<ApiResponse<StatusHistoryItem[]>>(`/order/${id}/history`);
  }
}
