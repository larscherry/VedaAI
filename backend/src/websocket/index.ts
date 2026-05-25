import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { URL } from "url";

const clients = new Map<string, Set<WebSocket>>();

export function setupWebSocket(server: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const assignmentId = url.searchParams.get("assignmentId");

    if (!assignmentId) {
      ws.close(4001, "assignmentId required");
      return;
    }

    if (!clients.has(assignmentId)) {
      clients.set(assignmentId, new Set());
    }
    clients.get(assignmentId)!.add(ws);

    ws.send(JSON.stringify({ type: "connected", assignmentId }));

    ws.on("close", () => {
      clients.get(assignmentId)?.delete(ws);
      if (clients.get(assignmentId)?.size === 0) {
        clients.delete(assignmentId);
      }
    });

    ws.on("error", () => {
      // ignore — cleanup handled by close
    });
  });

  return wss;
}

export function sendToAssignment(
  assignmentId: string,
  data: Record<string, unknown>
): void {
  const connectionSet = clients.get(assignmentId);
  if (!connectionSet) return;

  const message = JSON.stringify(data);
  for (const ws of connectionSet) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}
