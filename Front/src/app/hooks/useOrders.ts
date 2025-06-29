"use client"

import { useState, useEffect, useCallback } from "react"
import { OrdersService } from "@/services/orders"
import type { Order } from "@/lib/types"

export function useOrders(initialFilters?: {
  status?: string
  search?: string
  page?: number
  limit?: number
}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async (filters?: typeof initialFilters) => {
    try {
      setLoading(true)
      setError(null)

      const response = await OrdersService.getOrders(filters);

      setOrders(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pedidos")
      console.error("Error fetching orders:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshOrders = useCallback(() => {
    fetchOrders(initialFilters)
  }, [fetchOrders, initialFilters])

  // Función para actualizar un pedido específico en la lista
  const updateOrderInList = useCallback((orderId: string, newStatus: Order["status"], note?: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id == orderId) {
          const updatedOrder = { ...order, status: newStatus };
          const newStatusHistoryItem = {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note || `Estado actualizado a ${newStatus}`,
          };
          updatedOrder.statusHistory = [...order.statusHistory, newStatusHistoryItem];
          console.log(`Order ${orderId} updated in useOrders:`, updatedOrder); // Added for debugging
          return updatedOrder;
        }
        return order;
      }),
    );
  }, []);

  useEffect(() => {
    fetchOrders(initialFilters)

    const eventSource = new EventSource("/api/sse/order-updates");

    eventSource.onopen = () => {
      console.log("SSE connection opened.");
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "order-update" && data.payload) {
        console.log("Received order update via SSE:", data.payload);
        // Assuming payload contains orderId and the updates
        updateOrderInList(data.payload.orderId, data.payload.status, data.payload.note);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      console.log("Closing SSE connection.");
      eventSource.close();
    };
  }, [fetchOrders, initialFilters, updateOrderInList])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    refreshOrders,
    updateOrderInList,
  }
}
