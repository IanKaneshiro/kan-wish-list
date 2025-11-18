"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin,
        {
          path: "/api/socket",
        }
      );

      socket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  return { socket, isConnected };
}

export function joinWishlist(wishlistId: string) {
  if (socket) {
    socket.emit("join-wishlist", wishlistId);
  }
}

export function leaveWishlist(wishlistId: string) {
  if (socket) {
    socket.emit("leave-wishlist", wishlistId);
  }
}

export function joinGroup(groupId: string) {
  if (socket) {
    socket.emit("join-group", groupId);
  }
}

export { socket };
