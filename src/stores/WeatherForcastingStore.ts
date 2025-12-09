import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { WeatherArray } from "@/lib/type";

interface StoreState {
  socket: Socket | null;
  isSocketLoading: boolean;
  weatherData: WeatherArray | null;
  initSocket: (params?: { search?: string; latitude?: number; longitude?: number }) => void;
}

export const useWeatherSocketStore = create<StoreState>((set, get) => ({
  socket: null,
  isSocketLoading: false,
  weatherData: null,

  initSocket: (params?: { search?: string; latitude?: number; longitude?: number }) => {
    if (get().socket) return;

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      toast.success(`Socket connected: ${socket.id}`);
      set({ isSocketLoading: true });

      // emit with optional params
      socket.emit("get_realtime_weather", params || {});
    });

    socket.on("WEATHER:GET_REALTIME", (response) => {      
      const { metadata } = response || {};
      // console.log(`[WEATHER] :> ${JSON.stringify(metadata, null, 4)}`);

      set({
        weatherData: metadata || null,
        isSocketLoading: false,
      });
    });

    socket.on("disconnect", () => toast.error(`Socket disconnected`));

    socket.onAny((event, data) => {
      // console.log("Socket event:", event, data)
    });

    set({ socket });
  },
}));
