import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"

// Tipos para el webhook
interface WebhookOrderUpdate {
  orderId: string
  status: "pending" | "in_transit" | "delivered" | "cancelled" | "delayed"
  timestamp: string
  note?: string
}

interface WebhookPayload {
  event: "order.status.updated" | "order.location.updated" | "order.delivered"
  data: WebhookOrderUpdate
  signature?: string
  timestamp: string
}

// Función para verificar la firma del webhook (opcional pero recomendado)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return true // Skip verification if not configured

  try {
    const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex")

    return `sha256=${expectedSignature}` === signature
  } catch (error) {
    console.error("Error verifying webhook signature:", error)
    return false
  }
}

import { sendSseUpdate } from "../../sse/order-updates/route"

export async function POST(request: NextRequest) {
  try {
    // Obtener el payload del webhook
    const body = await request.text()
    const payload: WebhookPayload = JSON.parse(body)

    // Verificar headers de seguridad
    const headersList = await headers()
    const signature = headersList.get("x-webhook-signature")

    // Verificar que viene del worker (opcional)
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret)
      if (!isValid) {
        console.error("Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // Validar el payload
    if (!payload.event || !payload.data || !payload.data.orderId) {
      return NextResponse.json({ error: "Invalid payload structure" }, { status: 400 })
    }

    // Log del evento recibido
    console.log(`📦 Webhook received: ${payload.event} for order ${payload.data.orderId}`)
    console.log("📍 Update data:", payload.data)

    // Procesar según el tipo de evento
    switch (payload.event) {
      case "order.status.updated":
        console.log(`🔄 Order ${payload.data.orderId} status changed to: ${payload.data.status}`)
        break

      case "order.delivered":
        console.log(`✅ Order ${payload.data.orderId} has been delivered!`)
        break

      default:
        console.log(`❓ Unknown event type: ${payload.event}`)
    }

    // Enviar actualización a todos los clientes conectados
    sendSseUpdate({
      type: "order-update",
      payload: payload.data,
    })

    // Opcional: Guardar en base de datos local para caché
    // await saveOrderUpdateToCache(payload.data)

    // Responder al worker que el webhook fue procesado exitosamente
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
      orderId: payload.data.orderId,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error processing webhook:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Método GET para verificar que el endpoint está funcionando
export async function GET() {
  return NextResponse.json({
    message: "Order status webhook endpoint is active",
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: "/api/webhooks/order-status",
      sse: "/api/sse/order-updates",
    },
  })
}
