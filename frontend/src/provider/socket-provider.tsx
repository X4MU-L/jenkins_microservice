"use client";

import { type ReactNode, useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import io, { type Socket } from "socket.io-client";

import { SocketContext } from "@/context";
import { useToast } from "@/hooks/use-toast";

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Create socket connection
    const socketInstance = io("http://localhost:4000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event listeners
    socketInstance.on("connect", () => {
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on("job:update", (updatedJob) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      queryClient.invalidateQueries({ queryKey: ["recentUrls"] });

      // Show notification for completed jobs
      if (updatedJob.status === "completed") {
        toast({
          title: "URL Created",
          description: `Your short URL is ready: ${updatedJob.shortUrl}`,
        });
      } else if (updatedJob.status === "failed") {
        toast({
          variant: "destructive",
          title: "URL Creation Failed",
          description:
            updatedJob.error || "An error occurred while creating your URL",
        });
      }
    });

    socketInstance.on("webhook:received", (data) => {
      // Handle webhook notifications
      toast({
        title: "Webhook Received",
        description: `Received webhook for URL: ${data.shortUrl}`,
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["urls"] });
      queryClient.invalidateQueries({ queryKey: ["urlStats", data.urlId] });
    });

    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [toast, queryClient]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
