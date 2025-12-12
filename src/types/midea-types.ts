// Sub Device Type
export interface SubDeviceType {
  id: string;
  name: string;
  deviceType?: {
    id: string;
    name: string;
  };
}

export interface CreateDevicePayload {
  deviceSn: string;
  name: string;
  type: string;
  idu_fault: string;
  left_right_swing: number;
  up_down_swing: number;
  fan_speed: number;
  is_auto_fan: number,
  inner_board_t1: number,
  set_temperature: number,
  run_mode: number,
  IduMachineMode: number,

  heat_temp_up_lock: number,
  is_heat_temp_up_lock: "lock" | "unlock",

  cool_temp_down_lock: number,
  is_cool_temp_down_lock: "lock" | "unlock",
  
  idu_lock_mode: number,
  idu_lock: number,
  auto_lock: number,
  wind_speed_lock: number,
  switch_lock: number,
  wire_controlock: number,
  remote_control_lock: number,
  off_line: number,
  sub_device_type_id: number
};

// HVAC Device Metadata
export interface HvacMideaDevice {
  id: string;
  name: string;
  deviceSn: string;
  off_line: number; // 0 = online, 1 = offline
  inner_board_t1: number; // Room temp
  set_temperature: number;
  fan_speed: number;
  is_auto_fan: boolean;
  left_right_swing: string;
  up_down_swing: string;
  
  heat_temp_up_lock: number,
  is_heat_temp_up_lock: "lock" | "unlock",

  cool_temp_down_lock: number,
  is_cool_temp_down_lock: "lock" | "unlock",

  subDeviceType?: SubDeviceType;
  run_mode?: number;
  on_off_limit?: number;
  fan_limit?: number;
  mode_limit?: number;
  remote_control_lock?: number;
  wire_controlock?: number;

  tenantRoom?: TenantRoom;
}

// API Response Structure
export interface MideaApiResponse {
  metadata: HvacMideaDevice[];
  message?: string;
  status?: number;
}

export interface TenantRoom {
  id: number;
  name: string;
  building_id: number;
  floor_id: number;
  assigned_code: number;
  assigned_name: string;
  created_at: string;

  floor: FloorInfo;
}

export interface FloorInfo {
  id: number;
  name: string;
  building_id: number;
  assigned_code: number;
  assigned_name: string;
  created_at: string;

  building: BuildingInfo;
}

export interface BuildingInfo {
  id: number;
  name: string;
  assigned_code: number;
  assigned_name: string;
  created_at: string;
}

export interface UpdateDevicePayload {
  device_name: string;
  content: {
    deviceType: number;
    instructions: { command: string; parameter: unknown }[];
  }[];
}

export interface DeviceHistory {
  id: number;
  hvac_device_id: number;
  deviceSn?: string;
  name?: string;
  type?: string;
  idu_fault?: string;
  left_right_swing?: number;
  up_down_swing?: number;
  fan_speed?: number;
  is_auto_fan?: number;
  inner_board_t1?: number;
  set_temperature?: number;
  run_mode?: number;
  IduMachineMode?: number;

  // Heating Temperature Upper Limit Control
  heat_temp_up_lock?: number;
  is_heat_temp_up_lock?: "lock" | "unlock";

  // Cooling Temperature Lower Limit Control
  cool_temp_down_lock?: number;
  is_cool_temp_down_lock?: "lock" | "unlock";

  idu_lock_mode?: number;
  idu_lock?: number;
  auto_lock?: number;
  wind_speed_lock?: number;
  switch_lock?: number;
  wire_controlock?: number;
  remote_control_lock?: number;
  off_line?: number;

  building_id?: number;
  floor_id?: number;
  tenant_id?: number;

  timestamp: string; // ISO date string
  message?: string;
  run_mode_reason_message?: string;
  fan_limit?: number;
  mode_limit?: number;
  on_off_limit?: number;
}

// API response wrapper
export interface DeviceHistoryResponse {
  metadata: DeviceHistory[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

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