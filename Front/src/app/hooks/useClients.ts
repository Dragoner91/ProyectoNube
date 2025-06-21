"use client"

import { useState, useEffect, useCallback } from "react"
import { ClientsService } from "@/services/clients"
import type { Client } from "@/lib/types"

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await ClientsService.getClients({ limit: 100 })
      setClients(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar clientes")
      console.error("Error fetching clients:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
  }
}
