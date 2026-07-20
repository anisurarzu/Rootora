import type { Server } from "socket.io";
import type { SupportRealtimeEvent } from "@/features/support/types";

declare global {
  // eslint-disable-next-line no-var
  var __ROOTORA_SUPPORT_IO__: Server | undefined;
}

export function getSupportIo(): Server | undefined {
  return globalThis.__ROOTORA_SUPPORT_IO__;
}

export function publishSupportRealtime(event: SupportRealtimeEvent) {
  const io = getSupportIo();
  if (!io) return;

  if (event.visitorId) {
    io.to(`visitor:${event.visitorId}`).emit("support:event", event);
  }
  io.to(`conversation:${event.conversationId}`).emit("support:event", event);
  io.to("admin:support").emit("support:event", event);
}
