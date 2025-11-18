import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function initializeSocket(server: HTTPServer) {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join wishlist room
    socket.on("join-wishlist", (wishlistId: string) => {
      socket.join(`wishlist:${wishlistId}`);
      console.log(`Socket ${socket.id} joined wishlist:${wishlistId}`);
    });

    // Leave wishlist room
    socket.on("leave-wishlist", (wishlistId: string) => {
      socket.leave(`wishlist:${wishlistId}`);
      console.log(`Socket ${socket.id} left wishlist:${wishlistId}`);
    });

    // Join group room
    socket.on("join-group", (groupId: string) => {
      socket.join(`group:${groupId}`);
      console.log(`Socket ${socket.id} joined group:${groupId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

// Emit events
export function emitItemClaimed(
  wishlistId: string,
  itemId: string,
  userId: string
) {
  if (io) {
    io.to(`wishlist:${wishlistId}`).emit("item-claimed", { itemId, userId });
  }
}

export function emitItemUnclaimed(
  wishlistId: string,
  itemId: string,
  userId: string
) {
  if (io) {
    io.to(`wishlist:${wishlistId}`).emit("item-unclaimed", { itemId, userId });
  }
}

export function emitItemUpdated(wishlistId: string, itemId: string) {
  if (io) {
    io.to(`wishlist:${wishlistId}`).emit("item-updated", { itemId });
  }
}

export function emitItemsReordered(wishlistId: string) {
  if (io) {
    io.to(`wishlist:${wishlistId}`).emit("items-reordered", { wishlistId });
  }
}

export function emitFundingUpdated(wishlistId: string, itemId: string) {
  if (io) {
    io.to(`wishlist:${wishlistId}`).emit("funding-updated", { itemId });
  }
}
