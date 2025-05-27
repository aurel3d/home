export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  room: string;
  online: boolean;
  state: Record<string, any>;
  lastSeen: Date;
  zigbeeId: string;
  groups?: DeviceGroup[];
}

export enum DeviceType {
  LIGHT = 'light',
  SWITCH = 'switch',
  SENSOR = 'sensor',
  DIMMER = 'dimmer',
  OUTLET = 'outlet',
  THERMOSTAT = 'thermostat'
}

export interface Room {
  id: string;
  name: string;
  devices: string[];
}

export interface DeviceCommand {
  deviceId: string;
  command: string;
  value?: any;
}

export interface MqttMessage {
  topic: string;
  payload: any;
  timestamp: Date;
}

export interface DeviceGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  devices: string[]; // Device IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupCommand {
  groupId: string;
  command: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}