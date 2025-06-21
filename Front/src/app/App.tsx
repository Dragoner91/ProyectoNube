"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Badge } from "./components/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "./components/Card"
import { Input } from "./components/Input"
import { Select, SelectItem } from "./components/Select"
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  History,
  Plus,
  ShoppingCart,
} from "lucide-react"
import { CreateOrderModal } from "./components/CreateOrderModal"
import { OrderDetailsModal } from "./components/OrderDetailsModal"

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  weight: number
}

interface Order {
  id: string
  customer: string
  status: "pending" | "in_transit" | "delivered" | "cancelled" | "delayed"
  createdAt: string
  weight: number
  value: number
  statusHistory: StatusHistoryItem[]
  items: OrderItem[]
}

interface StatusHistoryItem {
  status: "pending" | "in_transit" | "delivered" | "cancelled" | "delayed"
  timestamp: string
  note?: string
}

const statusConfig = {
  pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  in_transit: { label: "En Tránsito", color: "bg-blue-100 text-blue-800", icon: Truck },
  delivered: { label: "Entregado", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800", icon: AlertCircle },
  delayed: { label: "Retrasado", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
}

// Datos de ejemplo con productos incluidos
const initialOrders: Order[] = [
  {
    id: "ORD-001",
    customer: "María González",
    status: "in_transit",
    createdAt: "2024-01-15T10:30:00Z",
    weight: 2.5,
    value: 165.0,
    statusHistory: [
      { status: "pending", timestamp: "2024-01-15T10:30:00Z", note: "Pedido creado" },
      { status: "in_transit", timestamp: "2024-01-15T14:20:00Z", note: "Enviado desde almacén" },
    ],
    items: [
      { productId: "PROD-001", productName: "Smartphone Samsung Galaxy", quantity: 1, price: 329.99, weight: 0.2 },
      { productId: "PROD-002", productName: "Auriculares Bluetooth", quantity: 2, price: 87.99, weight: 0.3 },
    ],
  },
  {
    id: "ORD-002",
    customer: "Carlos Rodríguez",
    status: "pending",
    createdAt: "2024-01-15T11:15:00Z",
    weight: 1.2,
    value: 99.99,
    statusHistory: [{ status: "pending", timestamp: "2024-01-15T11:15:00Z", note: "Pedido recibido" }],
    items: [{ productId: "PROD-004", productName: "Cargador Inalámbrico", quantity: 1, price: 43.99, weight: 0.2 }],
  },
  {
    id: "ORD-003",
    customer: "Ana Martín",
    status: "delivered",
    createdAt: "2024-01-14T09:20:00Z",
    weight: 3.8,
    value: 329.99,
    statusHistory: [
      { status: "pending", timestamp: "2024-01-14T09:20:00Z", note: "Pedido creado" },
      { status: "in_transit", timestamp: "2024-01-14T15:30:00Z", note: "En camino" },
      { status: "delivered", timestamp: "2024-01-15T11:45:00Z", note: "Entregado exitosamente" },
    ],
    items: [
      { productId: "PROD-003", productName: "Tablet iPad Air", quantity: 1, price: 659.99, weight: 0.5 },
      { productId: "PROD-005", productName: "Funda Protectora", quantity: 3, price: 21.99, weight: 0.1 },
    ],
  },
  {
    id: "ORD-004",
    customer: "Luis Fernández",
    status: "delayed",
    createdAt: "2024-01-13T14:45:00Z",
    weight: 5.2,
    value: 495.0,
    statusHistory: [
      { status: "pending", timestamp: "2024-01-13T14:45:00Z", note: "Pedido creado" },
      { status: "in_transit", timestamp: "2024-01-14T08:00:00Z", note: "Enviado" },
      { status: "delayed", timestamp: "2024-01-15T16:30:00Z", note: "Retraso por condiciones climáticas" },
    ],
    items: [
      { productId: "PROD-001", productName: "Smartphone Samsung Galaxy", quantity: 2, price: 329.99, weight: 0.2 },
      { productId: "PROD-006", productName: "Powerbank 10000mAh", quantity: 1, price: 32.99, weight: 0.4 },
    ],
  },
  {
    id: "ORD-005",
    customer: "Elena Ruiz",
    status: "in_transit",
    createdAt: "2024-01-15T08:00:00Z",
    weight: 0.8,
    value: 49.99,
    statusHistory: [
      { status: "pending", timestamp: "2024-01-15T08:00:00Z", note: "Pedido recibido" },
      { status: "in_transit", timestamp: "2024-01-15T12:15:00Z", note: "En ruta de entrega" },
    ],
    items: [
      { productId: "PROD-005", productName: "Funda Protectora", quantity: 1, price: 21.99, weight: 0.1 },
      { productId: "PROD-004", productName: "Cargador Inalámbrico", quantity: 1, price: 43.99, weight: 0.2 },
    ],
  },
  {
    id: "ORD-006",
    customer: "Pedro Sánchez",
    status: "cancelled",
    createdAt: "2024-01-12T16:20:00Z",
    weight: 1.5,
    value: 82.99,
    statusHistory: [
      { status: "pending", timestamp: "2024-01-12T16:20:00Z", note: "Pedido creado" },
      { status: "cancelled", timestamp: "2024-01-13T09:10:00Z", note: "Cancelado por el cliente" },
    ],
    items: [{ productId: "PROD-002", productName: "Auriculares Bluetooth", quantity: 1, price: 87.99, weight: 0.3 }],
  },
]

export default function ShippingDashboard() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null)

  // Simulación de actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.map((order) => {
          // Simular cambios aleatorios de estado
          if (Math.random() < 0.15) {
            // 15% de probabilidad de cambio
            const statuses: Order["status"][] = ["pending", "in_transit", "delivered", "delayed"]
            const currentIndex = statuses.indexOf(order.status)
            let nextStatus = order.status

            // Lógica más realista de transición de estados
            if (order.status === "pending") {
              nextStatus = Math.random() < 0.7 ? "in_transit" : "delayed"
            } else if (order.status === "in_transit") {
              nextStatus = Math.random() < 0.8 ? "delivered" : "delayed"
            } else if (order.status === "delayed") {
              nextStatus = Math.random() < 0.6 ? "in_transit" : "delivered"
            }

            return {
              ...order,
              status: nextStatus,
              statusHistory: [
                ...order.statusHistory,
                { status: nextStatus, timestamp: new Date().toISOString(), note: "Cambio de estado automático" },
              ],
            }
          }
          return order
        })
        return updatedOrders
      })
      setLastUpdate(new Date())
    }, 8000) // Actualizar cada 8 segundos

    return () => clearInterval(interval)
  }, [])

  // Filtrar pedidos
  useEffect(() => {
    let filtered = orders

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter])

  // Estadísticas
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    in_transit: orders.filter((o) => o.status === "in_transit").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    delayed: orders.filter((o) => o.status === "delayed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const StatusBadge = ({ status }: { status: Order["status"] }) => {
    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const refreshData = () => {
    setLastUpdate(new Date())
    // Aquí podrías hacer una llamada a tu API para obtener datos frescos
    console.log("Actualizando datos...")
  }

  const toggleRowExpansion = (orderId: string) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(orderId)) {
      newExpandedRows.delete(orderId)
    } else {
      newExpandedRows.add(orderId)
    }
    setExpandedRows(newExpandedRows)
  }

  const handleCreateOrder = (orderData: any) => {
    // Simular productos para el nuevo pedido
    const mockItems: OrderItem[] = [
      {
        productId: "PROD-001",
        productName: "Producto Ejemplo",
        quantity: 1,
        price: orderData.totalValue,
        weight: orderData.totalWeight,
      },
    ]

    const newOrder: Order = {
      id: `ORD-${String(orders.length + 1).padStart(3, "0")}`,
      customer: orderData.client,
      status: "pending",
      createdAt: new Date().toISOString(),
      weight: orderData.totalWeight,
      value: orderData.totalValue,
      items: mockItems,
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date().toISOString(),
          note: "Pedido creado desde el panel administrativo",
        },
      ],
    }

    setOrders([newOrder, ...orders])
    console.log("Nuevo pedido creado:", newOrder)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Envíos</h1>
            <p className="text-gray-600 mt-1">Última actualización: {lastUpdate.toLocaleTimeString("es-ES")}</p>
          </div>
          <div className="flex gap-2">
            {/* Botón verde para crear pedido */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Crear Pedido
            </button>
            {/* Botón azul para actualizar */}
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-colors duration-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Package className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.in_transit}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retrasados</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.delayed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por ID, cliente, seguimiento o destino..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-48">
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="in_transit">En Tránsito</SelectItem>
                <SelectItem value="delivered">Entregados</SelectItem>
                <SelectItem value="delayed">Retrasados</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 text-sm">ID PEDIDO</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 text-sm">CLIENTE</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 text-sm">ESTADO</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 text-sm">
                      FECHA CREACIÓN
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 text-sm">PESO</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 text-sm">VALOR</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 text-sm w-48">
                      ACCIONES
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 align-middle font-medium">{order.id}</td>
                        <td className="p-4 align-middle">{order.customer}</td>
                        <td className="p-4 align-middle">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="p-4 align-middle">{formatDate(order.createdAt)}</td>
                        <td className="p-4 align-middle">{order.weight} kg</td>
                        <td className="p-4 align-middle">${order.value.toFixed(2)}</td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => toggleRowExpansion(order.id)}
                              className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 min-w-[100px]"
                            >
                              {expandedRows.has(order.id) ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Ocultar
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Historial
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => setSelectedOrderForDetails(order)}
                              className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-cyan-600 text-white rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors duration-200 shadow-sm min-w-[100px]"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Productos
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(order.id) && (
                        <tr>
                          <td colSpan={7} className="p-0 bg-gray-50">
                            <div className="p-6 border-t">
                              <h4 className="font-semibold text-sm text-gray-700 mb-4 flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Historial de Estados - {order.id}
                              </h4>
                              <div className="space-y-3">
                                {order.statusHistory.map((historyItem, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
                                  >
                                    <div className="flex items-center gap-3">
                                      <StatusBadge status={historyItem.status} />
                                      <span className="text-sm text-gray-700">{historyItem.note}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                      {formatDate(historyItem.timestamp)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron pedidos que coincidan con los filtros.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <CreateOrderModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateOrder={handleCreateOrder}
        />

        {selectedOrderForDetails && (
          <OrderDetailsModal
            isOpen={!!selectedOrderForDetails}
            onClose={() => setSelectedOrderForDetails(null)}
            orderId={selectedOrderForDetails.id}
            customerName={selectedOrderForDetails.customer}
            orderItems={selectedOrderForDetails.items}
            totalValue={selectedOrderForDetails.value}
            totalWeight={selectedOrderForDetails.weight}
          />
        )}
      </div>
    </div>
  )
}
