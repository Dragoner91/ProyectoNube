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
  const updateOrderInList = useCallback((orderId: string, updates: Partial<Order>) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, ...updates }

          // Si hay nuevos elementos en statusHistory, agregarlos
          if (updates.statusHistory) {
            updatedOrder.statusHistory = [...order.statusHistory, ...updates.statusHistory]
          }

          return updatedOrder
        }
        return order
      }),
    )
  }, [])

  useEffect(() => {
    fetchOrders(initialFilters)
  }, [fetchOrders, initialFilters])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    refreshOrders,
    updateOrderInList,
  }
}
