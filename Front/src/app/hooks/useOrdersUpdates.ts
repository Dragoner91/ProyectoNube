"use client"

import { useEffect, useRef, useCallback } from "react"
import type { Order } from "@/lib/types"

interface OrderUpdateEvent {
  type: "order-update" | "connection" | "ping"
  payload?: {
    orderId: string
    status: Order["status"]
    timestamp: string
    note?: string
  }
  message?: string
  timestamp: string
}

interface UseOrderUpdatesOptions {
  onOrderUpdate?: (update: OrderUpdateEvent["payload"]) => void
  onConnectionChange?: (connected: boolean) => void
  autoReconnect?: boolean
}

export function useOrderUpdates({
  onOrderUpdate,
  onConnectionChange,
  autoReconnect = true,
}: UseOrderUpdatesOptions = {}) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    // Cerrar conexión existente si existe
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const eventSource = new EventSource("/api/sse/order-updates")
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log("🔗 SSE Connected to order updates")
        reconnectAttemptsRef.current = 0
        onConnectionChange?.(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data: OrderUpdateEvent = JSON.parse(event.data)

          switch (data.type) {
            case "order-update":
              console.log("📦 Order update received:", data.payload)
              if (data.payload) {
                onOrderUpdate?.(data.payload)
              }
              break

            case "connection":
              console.log("✅ SSE Connection established:", data.message)
              break

            case "ping":
              // Ping para mantener conexión viva
              break

            default:
              console.log("📨 SSE Message:", data)
          }
        } catch (error) {
          console.error("Error parsing SSE message:", error)
        }
      }

      eventSource.onerror = (error) => {
        console.error("❌ SSE Error:", error)
        onConnectionChange?.(false)

        // Intentar reconectar automáticamente
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          console.log(
            `🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`,
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        }
      }
    } catch (error) {
      console.error("Error creating EventSource:", error)
      onConnectionChange?.(false)
    }
  }, [onOrderUpdate, onConnectionChange, autoReconnect])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    onConnectionChange?.(false)
  }, [onConnectionChange])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect, disconnect])

  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    reconnect,
    disconnect,
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
  }
}
