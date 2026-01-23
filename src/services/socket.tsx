import { io, type Socket } from "socket.io-client";

export const socket: Socket = io("https://taskme-backend-wt4m.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});
