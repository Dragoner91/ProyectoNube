"use client"

import type React from "react"

import { useState } from "react"
import { Modal } from "./Modal"
import { Button } from "./Button"
import { Input } from "./Input"
import { Select, SelectItem } from "./Select"
import { Card, CardContent } from "./Card"
import { Plus, Minus, Trash2, Package } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  phone: string
}

interface Product {
  id: string
  name: string
  price: number
  weight: number
  stock: number
}

interface OrderItem {
  productId: string
  quantity: number
}

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateOrder: (orderData: any) => void
}

// Datos de ejemplo
const clients: Client[] = [
  { id: "CLI-001", name: "María González", email: "maria@email.com", phone: "+34 600 123 456" },
  { id: "CLI-002", name: "Carlos Rodríguez", email: "carlos@email.com", phone: "+34 600 234 567" },
  { id: "CLI-003", name: "Ana Martín", email: "ana@email.com", phone: "+34 600 345 678" },
  { id: "CLI-004", name: "Luis Fernández", email: "luis@email.com", phone: "+34 600 456 789" },
  { id: "CLI-005", name: "Elena Ruiz", email: "elena@email.com", phone: "+34 600 567 890" },
]

const products: Product[] = [
  { id: "PROD-001", name: "Smartphone Samsung Galaxy", price: 329.99, weight: 0.2, stock: 15 },
  { id: "PROD-002", name: "Auriculares Bluetooth", price: 87.99, weight: 0.3, stock: 25 },
  { id: "PROD-003", name: "Tablet iPad Air", price: 659.99, weight: 0.5, stock: 8 },
  { id: "PROD-004", name: "Cargador Inalámbrico", price: 43.99, weight: 0.2, stock: 30 },
  { id: "PROD-005", name: "Funda Protectora", price: 21.99, weight: 0.1, stock: 50 },
  { id: "PROD-006", name: "Powerbank 10000mAh", price: 32.99, weight: 0.4, stock: 20 },
]

export function CreateOrderModal({ isOpen, onClose, onCreateOrder }: CreateOrderModalProps) {
  const [selectedClient, setSelectedClient] = useState("")
  const [address, setAddress] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")

  const addProduct = () => {
    if (selectedProduct && !orderItems.find((item) => item.productId === selectedProduct)) {
      setOrderItems([...orderItems, { productId: selectedProduct, quantity: 1 }])
      setSelectedProduct("")
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProduct(productId)
      return
    }

    const product = products.find((p) => p.id === productId)
    if (product && newQuantity <= product.stock) {
      setOrderItems(
        orderItems.map((item) => (item.productId === productId ? { ...item, quantity: newQuantity } : item)),
      )
    }
  }

  const removeProduct = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId))
  }

  const calculateTotals = () => {
    let totalValue = 0
    let totalWeight = 0

    orderItems.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        totalValue += product.price * item.quantity
        totalWeight += product.weight * item.quantity
      }
    })

    return { totalValue, totalWeight }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClient || !address || orderItems.length === 0) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    const client = clients.find((c) => c.id === selectedClient)
    const { totalValue, totalWeight } = calculateTotals()

    const orderData = {
      client: client?.name,
      address,
      items: orderItems,
      totalValue,
      totalWeight,
    }

    onCreateOrder(orderData)

    // Reset form
    setSelectedClient("")
    setAddress("")
    setOrderItems([])
    setSelectedProduct("")
    onClose()
  }

  const { totalValue, totalWeight } = calculateTotals()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Pedido" className="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
          <Select value={selectedClient} onValueChange={setSelectedClient} className="w-full">
            <SelectItem value="default">Seleccionar cliente...</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name} - {client.email}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Entrega *</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, número, ciudad, código postal..."
            className="w-full"
          />
        </div>

        {/* Productos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>

          {/* Agregar producto */}
          <div className="flex gap-2 mb-4">
            <Select value={selectedProduct} onValueChange={setSelectedProduct} className="flex-1">
              <SelectItem value="default">Seleccionar producto...</SelectItem>
              {products
                .filter((product) => !orderItems.find((item) => item.productId === product.id))
                .map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - ${product.price} (Stock: {product.stock})
                  </SelectItem>
                ))}
            </Select>
            {/* Botón verde para agregar producto */}
            <button
              type="button"
              onClick={addProduct}
              disabled={!selectedProduct}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>

          {/* Lista de productos agregados */}
          <div className="space-y-3">
            {orderItems.map((item) => {
              const product = products.find((p) => p.id === item.productId)
              if (!product) return null

              return (
                <Card key={item.productId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                        <p className="text-sm text-gray-500">
                          ${product.price} c/u • {product.weight}kg c/u • Stock: {product.stock}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-150"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>

                          <span className="w-12 text-center font-medium text-lg">{item.quantity}</span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Totales del producto */}
                        <div className="text-right min-w-[100px]">
                          <p className="font-semibold text-lg">${(product.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-gray-500">{(product.weight * item.quantity).toFixed(1)}kg</p>
                        </div>

                        {/* Botón eliminar */}
                        <button
                          type="button"
                          onClick={() => removeProduct(item.productId)}
                          className="w-8 h-8 flex items-center justify-center border border-red-300 rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-150"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {orderItems.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No hay productos agregados</p>
              <p className="text-sm">Selecciona productos de la lista superior</p>
            </div>
          )}
        </div>

        {/* Resumen */}
        {orderItems.length > 0 && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Resumen del Pedido</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Total de productos:</span>
                  <span className="font-medium">
                    {orderItems.reduce((sum, item) => sum + item.quantity, 0)} unidades
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Peso total:</span>
                  <span className="font-medium">{totalWeight.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold mt-3 pt-3 border-t border-gray-300">
                  <span>Total:</span>
                  <span className="text-green-600">${totalValue.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="px-6 py-2">
            Cancelar
          </Button>
          {/* Botón verde para crear pedido */}
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors duration-200 shadow-sm"
          >
            Crear Pedido
          </button>
        </div>
      </form>
    </Modal>
  )
}
