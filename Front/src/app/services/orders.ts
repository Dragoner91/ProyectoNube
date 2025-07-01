import { apiClient } from "@/lib/api"
import type { Order, CreateOrderRequest, ApiResponse, PaginatedResponse } from "@/lib/types"

export interface StatusHistoryItem {
  status: string
  timestamp: string
}

export class OrdersService {
  private static transformOrder(order: any): Order {
    const statusMapping: { [key: string]: Order["status"] } = {
      pendiente: "pending",
      "en tránsito": "in_transit",
      entregado: "delivered",
      cancelado: "cancelled",
      retrasado: "delayed",
    }

    const items = order.productosPedidos.map((item: any) => ({
      quantity: item.cantidad,
      product: {
        id: item.producto.ID_Producto,
        name: item.producto.nombre,
        price: parseFloat(item.producto.price) || 0,
        weight: parseFloat(item.producto.peso) || 0,
        stock: item.producto.disponibilidad || 0,
      },
    })) || []

    const totalWeight = items.reduce((acc: number, item: any) => acc + item.product.weight * item.quantity, 0)
    // Tomar el último estatus como el actual
    const lastStatusObj = order.estatus && order.estatus.length > 0 ? order.estatus[order.estatus.length - 1] : null;
    const rawStatus = lastStatusObj?.estatus ? lastStatusObj.estatus.toLowerCase() : "pending"
    const currentStatus = statusMapping[rawStatus] || "pending"
    let createdAt = new Date().toISOString();
    if (Array.isArray(order.estatus)) {
      const pendiente = order.estatus.find((s: any) => s.estatus && s.estatus.toLowerCase() === "pendiente");
      if (pendiente && pendiente.fecha_hora && !isNaN(new Date(pendiente.fecha_hora).getTime())) {
        createdAt = new Date(pendiente.fecha_hora).toISOString();
      } else if (order.fecha_creacion && !isNaN(new Date(order.fecha_creacion).getTime())) {
        createdAt = new Date(order.fecha_creacion).toISOString();
      }
    } else if (order.fecha_creacion && !isNaN(new Date(order.fecha_creacion).getTime())) {
      createdAt = new Date(order.fecha_creacion).toISOString();
    }

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
        status: s.estatus ? statusMapping[s.estatus.toLowerCase()] : "unknown",
        timestamp: s.fecha_hora && !isNaN(new Date(s.fecha_hora).getTime()) 
          ? new Date(s.fecha_hora).toISOString() 
          : new Date().toISOString(),
        note: s.nota || `Estado actualizado a ${s.estatus || 'desconocido'}`,
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

