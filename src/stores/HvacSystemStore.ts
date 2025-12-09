// stores/hvacSystemStore.ts
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosHvacInstance } from "@/lib/axiosHvac";
import { indoorUnitInformationTypes } from "@/types/IndoorUnitInformationTypes";

interface IndoorDevice {
  deviceSn: string;
  name: string;
  type: string;
}

interface HvacData {
  created_at: string;
  deleted_at: { time: string; valid: boolean };
  indoorDevices: IndoorDevice[]; // corrected name + array
  id: number;
  name: string;
  pid: number;
  updated_at: string;
}

interface StoreState {
  hvacData: HvacData | null;
  indoorDevices: IndoorDevice[];
  isHvacLoading: boolean;

  // Actions
  setHvacData: (data: HvacData) => void;
  resetHvacData: () => void;
  fetchHvacData: (deviceSns: string[]) => Promise<void>;
  getHvacData: () => Promise<void>;

  // individual Indoor Devices
  indoorUnitInformationTypes: indoorUnitInformationTypes[];
  getIndividualDevice: (device_sn_list: string[]) => Promise<void>;
}

export const useHvacSystemStore = create<StoreState>((set) => ({
  hvacData: null,
  indoorDevices: [],
  isHvacLoading: false,
  indoorUnitInformationTypes: [],

  setHvacData: (data) => {
    set({ hvacData: data, indoorDevices: data.indoorDevices ?? [] });
  },

  resetHvacData: () => {
    set({ hvacData: null, indoorDevices: [] });
    toast("HVAC data reset");
  },

  fetchHvacData: async (deviceSns: string[]) => {
    set({ isHvacLoading: true });
    try {
      const body = {
        device_sns: deviceSns,
        fan_power: 0,
        heat_power: 0,
      };

      const res = await axiosHvacInstance.put("/power/group/deviceSetting", body, {
        headers: {
          sign: process.env.NEXT_PUBLIC_HVAC_MIDEA_API_TOKEN_KEY,
        },
      });

      console.log(res.data);

      set({
        hvacData: res.data,
        indoorDevices: res.data.indoorDevices ?? [],
      });
      toast.success("HVAC data updated");
    } catch (error: unknown) {
      toast.error("Error fetching HVAC data");
      console.error("❌ HVAC Fetch Error:", error);
    } finally {
      set({ isHvacLoading: false });
    }
  },

  getHvacData: async () => {
    set({ isHvacLoading: true });
    try {
      const res = await axiosHvacInstance.get("/device", {
        headers: {
          "sign": process.env.NEXT_PUBLIC_HVAC_MIDEA_API_TOKEN_KEY,
        },
      });

      console.log("🔥 Full API Response:", res.data);

      // ✅ Extract only the devices
      set({ indoorDevices: res.data.data });
      toast.success("Midea data fetched");
    } catch (error: unknown) {
      toast.error("Error fetching HVAC data");
      console.error("❌ HVAC Fetch Error:", error);
    } finally {
      set({ isHvacLoading: false });
    }
  },

  getIndividualDevice: async (device_sn_list) => {
    set({ isHvacLoading: true });
    console.log("device_sn_list in getIndividualDevice", device_sn_list);

    try {
      // body
      const body = {
        device_sn_list: device_sn_list,
      };

      const res = await axiosHvacInstance.post("/iduProp", {
        body: body,
        headers: {
          "sign": process.env.NEXT_PUBLIC_HVAC_MIDEA_API_TOKEN_KEY,
        },
      });

      console.log("Full API Response getIndividualDevice:", res.data);

      // Extract only the devices
      set({ indoorUnitInformationTypes: res.data.data });
      toast.success("Midea data fetched");
    } catch (error: unknown) {
      toast.error("Error fetching HVAC data");
      console.error("❌ HVAC Fetch Error:", error);
    } finally {
      set({ isHvacLoading: false });
    }
  },
}));

