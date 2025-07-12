import { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const WebSocketContext = createContext();

const useSocket = () => {
  const socket = useContext(WebSocketContext);
  return socket;
};

const SocketProvider = ({ children }) => {
  const token = localStorage.getItem("token");

  const socket = useMemo(() => {
    const ws = io(import.meta.env.VITE_SERVER_URL, {
      transports: ["websocket"],
    });
    return ws;
  }, []);

  // const socket = useMemo(() => {
  //   if (!token) return null;

  //   const ws = io(import.meta.env.VITE_SERVER_URL, {
  //     transports: ["websocket"],
  //     auth: {
  //       token,
  //     },
  //   });
  //   return ws;
  // }, [token]);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export { useSocket, SocketProvider };
