import { create } from "zustand";
import toast from "react-hot-toast";
import { 
  CreateDevicePayload,
  DeviceHistoryResponse,
  HvacMideaDevice,
  MideaApiResponse,
  UpdateDevicePayload,
 } from "@/types/midea-types";

import { io, Socket } from "socket.io-client";
import HvacAxiosInstance from "@/lib/HvacAxiosInstance";

export interface StoreState {
  data: MideaApiResponse | null;
  isLoading: boolean;
  getMideaData: () => Promise<void>;

  // socket
  socket: Socket | null;
  isSocketLoading: boolean;
  initSocket: () => void;
  updatingIds: string[];
  isUpdating: boolean;
  updateDevice: (device_sn: string, payload: UpdateDevicePayload) => Promise<void>;
  
  deletingIds: number[];
  deleteDevice: (midea_id: number) => Promise<void>;
  
  createDevice: (payload: CreateDevicePayload) => Promise<void>;

  isMasterPowerOn: boolean;
  masterPowerOnOff: () => Promise<void>;
  isDevicePowerOnLoading: boolean;

  updatedData: HvacMideaDevice | null;
  devicePowerOnOff: (device_sn: string) => Promise<void>

  // Device History
  deviceHistory: DeviceHistoryResponse | null;
  isDeviceHistoryLoading: boolean;
  getDeviceHistory: (search: string, page?: number) => Promise<void>

  // Unlock
  isUnlockLoading: boolean;
  unlockAllDevices: () => Promise<void>
}

export const useMideaStore = create<StoreState>((set, get) => ({
  data: null,
  updatedData: null,
  deviceHistory: null,
  isDeviceHistoryLoading: false,
  isUnlockLoading: false,
  isLoading: false,
  isSocketLoading: false,
  isMasterPowerOn: false,
  deletingIds: [],
  updatingIds: [],
  socket: null,
  isDevicePowerOnLoading: false,
  isUpdating: false,

  getMideaData: async () => {
    set({ isLoading: true });
    try {
      const response = await HvacAxiosInstance.get("/hvacs/midea/nastp?device_type=idu&page=1&limit=30");

      // console.log(`Response: ${JSON.stringify(response.data)}`);

      set({ data: response.data.data });
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      set({ isLoading: false });
    }
  },

  updateDevice: async (device_sn: string, payload: UpdateDevicePayload) => {
    set((state) => ({ 
      updatingIds: [...state.updatingIds, device_sn],
      isUpdating: true
     }));
    try {
      const response = await HvacAxiosInstance.put(
        "/hvacs/midea-control-by-device-sn",
        payload
      );
      
      if (response.data.status === 500) {
        toast.error(`${response.data.message}`);
        return;
      }
      // console.log(`Response: ${JSON.stringify(response.data)}`);
      toast.success(`${response.data.data.messages} of '${payload.device_name}'.`);
    } catch (error: unknown) {
      toast.error(`${error}` || "Failed to update device");
    } finally {
      set((state) => ({
        updatingIds: state.updatingIds.filter((id) => id !== device_sn),
        isUpdating: false
      }));
    }
  },

  masterPowerOnOff: async () => {
    set({isMasterPowerOn: true});
    try {
      await HvacAxiosInstance.put(
        "/hvacs/midea-control-all-devices",
          [
            {
                /* Mode control
                • 0 for shutdown,
                • 65 for supply air,
                • 66 for cooling,
                • 67 for heating,
                • 70 for dehumidification, 
                • 192 for automatic
                */
                "command": "IduMode",
                "parameter": 0 ? 192 : 0
            }
        ]
      );
      // console.log(`Response: ${JSON.stringify(response.data)}`);
      toast.success(`All devices are powered on/off.`);
    } catch (error: unknown) {
      toast.error(`${error}` || "Failed to power");
    } finally {
      set({isMasterPowerOn: false});
    }
  },

  unlockAllDevices: async () => {
    set({isUnlockLoading: true});
    try {
      await HvacAxiosInstance.put("/hvacs/midea/all-unlock");
      // console.log(`Response: ${JSON.stringify(response.data)}`);
      toast.success(`All devices are unlocked.`);
    } catch (error: unknown) {
      toast.error(`${error}` || "Failed to unlock");
    } finally {
      set({isUnlockLoading: false});
    }
  },

  devicePowerOnOff: async (device_sn: string) => {
    set((state) => ({ 
      updatingIds: [...state.updatingIds, device_sn],
      isDevicePowerOnLoading: true
    }));
    try {
      
      const response = await HvacAxiosInstance.put(
        `hvacs/midea/power-on-off?device_sn=${device_sn}`,
      );

      const data = response.data.data;

      console.log(`devicePowerOnOff Response: ${JSON.stringify(data, null, 4)}`);

      toast.success(`Device '${device_sn}' is powered ${data.run_mode === 0 ? 'off' : 'on'}.`);
    } catch (error: unknown) {
      toast.error(`${error}` || "Failed to power");
    } finally {
      set((state) => ({
        updatingIds: state.updatingIds.filter((id) => id !== device_sn),
        isDevicePowerOnLoading: false
      }));
    }
  },

  deleteDevice: async (midea_id: number) => {
    set((state) => ({ deletingIds: [...state.deletingIds, midea_id] }));
    try {
      const response = await HvacAxiosInstance.delete(
        `/hvacs/delete-midea?midea_id=${midea_id}`
      );
      // console.log(`Response: ${JSON.stringify(response.data)}`);
      toast.success(`${response.data.message}.`);
    } catch (error: unknown) {
      toast.error(`${error}` || "Failed to delete device");
    } finally {
      set((state) => ({
        deletingIds: state.deletingIds.filter((id) => id !== midea_id),
      }));
    }
  },

  // Socket initialization
  initSocket: () => {
    if (get().socket) return; // prevent multiple connections

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_BASE_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      toast.success(`Socket connected: ${socket.id}`);
      // console.log(`Socket connected: ${socket.id}`);
      
      // show loading while fetching all devices
      set({ isSocketLoading: true });
      socket.emit("getAllMideaData", { search: "" });
    });

    socket.on("disconnect", () => toast.error(`Socket disconnected`));

    socket.on("mideaDevicesUpdated", (data: { success: boolean; count: number }) => {
      // console.log("Midea devices updated from backend sync:", data);
    
      // Notify the user once
      toast.success(`Synced ${data.count} Midea devices from host.`);
    
      // Refresh current UI data (only if user is on that view)
      // You can either refetch via API OR re-emit socket request for fresh data
      socket.emit("getAllMideaData", { search: "" });
    });
    
    // all devices response
    socket.on("hvacMidea:getAllMideaData", (allDevices: HvacMideaDevice[]) => {
      // console.log("Received all devices via socket:", JSON.stringify(allDevices, null, 4));
      set({
        data: { metadata: allDevices },
        isSocketLoading: false,   // Stop loading
      });
    });

    socket.on("hvacMidea:new", (newDevice: HvacMideaDevice) => {
      // console.log("Socket New HVAC device received:", newDevice);
      set((state) => ({
        data: state.data
          ? { ...state.data, metadata: [...state.data.metadata, newDevice] }
          : { metadata: [newDevice] },
      }));
    });

    socket.on("hvacMideaNastp:deviceUpdatedByDeviceSN", (payload: {
      deviceSn: string;
      updates: Partial<HvacMideaDevice>;
      message: string[];
    }) => {
      
      // toast.success(`Device updated by button: ${payload}`);

      set((state) => ({
        data: state.data
          ? {
              ...state.data,
              metadata: state.data.metadata.map((d) =>
                d.deviceSn === payload.deviceSn
                  ? { ...d, ...payload.updates } // merge updates into existing device
                  : d
              ),
            }
          : state.data,
      }));
    });

    socket.on("HvacMidea:deviceUpdatedAllDevices", (payload: {
      deviceSn: string;
      updates: Partial<HvacMideaDevice>;
      timestamp: string;
    }) => {
      // console.log("Device updated:", payload);

      set((state) => {
        if (!state.data) return state;

        const updatedMetadata = state.data.metadata.map((d) =>
          d.deviceSn === payload.deviceSn
            ? { ...d, ...payload.updates } // merge update for this device
            : d
        );

        return {
          data: { ...state.data, metadata: updatedMetadata },
        };
      });
    });

    socket.on("HvacMidea:AllDevicesUnlocked", (payload: {
      deviceSn: string;
      updates: Partial<HvacMideaDevice>;
      timestamp: string;
    }) => {
      // console.log("Device updated:", payload);

      set((state) => {
        if (!state.data) return state;

        const updatedMetadata = state.data.metadata.map((d) =>
          d.deviceSn === payload.deviceSn
            ? { ...d, ...payload.updates } // merge update for this device
            : d
        );

        return {
          data: { ...state.data, metadata: updatedMetadata },
        };
      });
    });

    socket.on("hvacMidea:delete", (deletedDevice: HvacMideaDevice) => {
      // console.log("HVAC deleted:", deletedDevice);
      set((state) => ({
        data: state.data
          ? {
            ...state.data,
            metadata: state.data.metadata.filter((d) => d.deviceSn !== deletedDevice.deviceSn),
          }
          : { metadata: [] },
      }));

    });

    // socket.onAny((event, data) => {
    //   console.log("Socket event:", event, data);
    // });

    set({ socket });
  },

  createDevice: async (payload: CreateDevicePayload) => {
    
    // console.log("Final Payload:", JSON.stringify(payload, null, 2));

    set({isLoading: true});

    try {
      const response = await HvacAxiosInstance.post("/hvacs/midea", payload);
      
      // console.log(`Create Device Response: ${JSON.stringify(response.data)}`);

      toast.success(`Device ${response.data.data.deviceSn} created successfully`);
      // No need to manually update store; socket emits the new device
    } catch (error: unknown) {
      toast.error(`${error}` || "Failed to create device");
    } finally {
      set({isLoading: false});
    }
  },

  getDeviceHistory: async (search: string, page = 1) => {
    set({ isDeviceHistoryLoading: true });
    try {
      const response = await HvacAxiosInstance.get(
        `hvacs/midea-history?page=${page}&limit=10&search=${search}`
      );

      const { metadata, pagination } = response.data.data;

      set((state) => ({
        deviceHistory: {
          pagination,
          metadata:
            page === 1
              ? metadata // fresh load
              : [...(state.deviceHistory?.metadata || []), ...metadata], // append
        },
        isDeviceHistoryLoading: false,
      }));
    } catch (error) {
      console.error(error);
      set({ isDeviceHistoryLoading: false });
    }
  },

}));

