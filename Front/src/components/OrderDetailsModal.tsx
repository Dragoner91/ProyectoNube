"use client"
import { Modal } from "./Modal"
import { Card, CardContent, CardHeader, CardTitle } from "./Card"
import { Package, ShoppingCart } from "lucide-react"

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  weight: number
}

interface OrderDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  customerName: string
  orderItems: OrderItem[]
  totalValue: number
  totalWeight: number
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  orderId,
  customerName,
  orderItems,
  totalValue,
  totalWeight,
}: OrderDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles del Pedido ${orderId}`} className="max-w-3xl">
      <div className="space-y-6">
        {/* Información del pedido */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <ShoppingCart className="w-5 h-5" />
              Información del Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">ID del Pedido</p>
                <p className="font-semibold text-lg">{orderId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="font-semibold text-lg">{customerName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de productos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Productos ({orderItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                    <p className="text-sm text-gray-500">
                      €{item.price.toFixed(2)} c/u • {item.weight}kg c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Cantidad</p>
                      <p className="font-semibold text-lg">{item.quantity}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-500">Peso Total</p>
                      <p className="font-medium">{(item.weight * item.quantity).toFixed(2)}kg</p>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p className="text-sm text-gray-500">Subtotal</p>
                      <p className="font-semibold text-lg text-blue-600">€{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumen totales */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <h4 className="font-semibold text-green-800 mb-4 text-lg">Resumen del Pedido</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total de productos:</span>
                <span className="font-medium">{orderItems.reduce((sum, item) => sum + item.quantity, 0)} unidades</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Peso total:</span>
                <span className="font-medium">{totalWeight.toFixed(2)} kg</span>
              </div>
              <div className="border-t border-green-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-green-800">Total del Pedido:</span>
                  <span className="text-2xl font-bold text-green-600">€{totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  )
}
