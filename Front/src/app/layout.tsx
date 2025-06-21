import type React from "react"
import type { Metadata } from "next"
import "./index.css"

export const metadata: Metadata = {
  title: "Panel de Envíos",
  description: "Sistema de gestión de envíos y pedidos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  )
}
