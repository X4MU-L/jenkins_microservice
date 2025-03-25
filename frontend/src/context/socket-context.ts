import { createContext } from "react";

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});
