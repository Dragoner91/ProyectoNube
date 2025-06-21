import type { NextRequest } from "next/server"

// Definir tipo para el cliente SSE
type SSEClient = {
  write: (data: string) => void
  close: () => void
}

// Almacenar clientes conectados globalmente
declare global {
  var sseClients: Set<SSEClient> | undefined
}

if (!global.sseClients) {
  global.sseClients = new Set()
}

export async function GET(request: NextRequest) {
  // Crear un stream para Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Configurar headers para SSE
      const encoder = new TextEncoder()

      // Función para enviar datos
      const send = (data: string) => {
        controller.enqueue(encoder.encode(data))
      }

      // Enviar mensaje inicial de conexión
      send(
        `data: ${JSON.stringify({
          type: "connection",
          message: "Connected to order updates",
          timestamp: new Date().toISOString(),
        })}\n\n`,
      )

      // Crear un writer para este cliente
      const writer = {
        write: (data: string) => {
          try {
            send(data)
          } catch (error) {
            console.error("Error sending SSE data:", error)
            // Remover cliente si hay error
            global.sseClients?.delete(writer)
          }
        },
        close: () => {
          global.sseClients?.delete(writer)
          controller.close()
        },
      }

      // Agregar cliente a la lista global
      global.sseClients?.add(writer)

      // Enviar ping cada 30 segundos para mantener la conexión
      const pingInterval = setInterval(() => {
        try {
          send(
            `data: ${JSON.stringify({
              type: "ping",
              timestamp: new Date().toISOString(),
            })}\n\n`,
          )
        } catch (error) {
          clearInterval(pingInterval)
          global.sseClients?.delete(writer)
        }
      }, 30000)

      // Cleanup cuando se cierra la conexión
      request.signal.addEventListener("abort", () => {
        clearInterval(pingInterval)
        global.sseClients?.delete(writer)
        controller.close()
      })
    },
  })

  // Retornar respuesta con headers apropiados para SSE
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}
