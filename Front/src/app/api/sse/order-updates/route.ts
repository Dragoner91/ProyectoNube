import { NextRequest, NextResponse } from 'next/server';

// This is a simple in-memory store for SSE clients.
// In a production environment, you would use a more robust solution like Redis or a message queue.
export const sseClients: Set<ReadableStreamDefaultController> = new Set();

export async function GET(req: NextRequest) {
  const response = new NextResponse(
    new ReadableStream({
      start(controller) {
        sseClients.add(controller);

        // Handle client disconnect
        req.signal.addEventListener('abort', () => {
          sseClients.delete(controller);
          controller.close();
        });
      },
      cancel(controller) {
        sseClients.delete(controller);
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    }
  );

  return response;
}

// Function to send data to all connected SSE clients
export function sendSseUpdate(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach((controller: ReadableStreamDefaultController) => {
    try {
      // Use controller.enqueue to send data
      controller.enqueue(new TextEncoder().encode(message));
    } catch (error) {
      console.error('Error sending SSE update to client:', error);
      // If there's an error, it might mean the client has disconnected
      // We should remove the client if enqueue fails
      sseClients.delete(controller);
    }
  });
}