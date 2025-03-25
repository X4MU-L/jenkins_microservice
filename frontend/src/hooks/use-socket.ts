"use client";

import { useContext } from "react";

import { SocketContext } from "@/context";

export const useSocket = () => {
  const context = useContext(SocketContext);
  console.log(context);
  if (context === undefined) {
    throw new Error("useSocket must be used within an SocketProvider");
  }
  return context.socket;
};
