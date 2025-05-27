export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  room: string;
  online: boolean;
  state: Record<string, any>;
  lastSeen: Date;
  zigbeeId: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}