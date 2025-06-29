"use client"

import { useState, useEffect, useCallback } from "react"
import { ProductsService } from "@/services/products"
import type { Product } from "@/lib/types"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ProductsService.getProducts();
      setProducts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}
