"use client";

import { useState, useEffect, useCallback } from "react";
import { ClientsService } from "@/services/clients";
import type { Client } from "@/lib/types";

export function useClients(initialFilters?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (filters?: typeof initialFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await ClientsService.getClients(filters);

      setClients(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar clientes");
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshClients = useCallback(() => {
    fetchClients(initialFilters);
  }, [fetchClients, initialFilters]);

  useEffect(() => {
    fetchClients(initialFilters);
  }, [fetchClients, initialFilters]);

  return {
    clients,
    loading,
    error,
    fetchClients,
    refreshClients,
  };
}