import mqtt from 'mqtt';
import { Server } from 'socket.io';
import { DeviceService } from './device';

export class MqttService {
  private client: mqtt.MqttClient | null = null;
  private deviceService: DeviceService;
  private io: Server;

  constructor(deviceService: DeviceService, io: Server) {
    this.deviceService = deviceService;
    this.io = io;
  }

  connect() {
    const host = process.env.MQTT_HOST || 'localhost';
    const port = process.env.MQTT_PORT || 1883;
    const url = `mqtt://${host}:${port}`;

    this.client = mqtt.connect(url, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    });

    this.client.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.subscribeToTopics();
    });

    this.client.on('message', (topic, message) => {
      this.handleMessage(topic, message.toString());
    });

    this.client.on('error', (error) => {
      console.error('MQTT error:', error);
    });
  }

  private subscribeToTopics() {
    if (!this.client) return;

    this.client.subscribe('zigbee2mqtt/+', (err) => {
      if (err) console.error('Failed to subscribe to zigbee2mqtt/+');
    });

    this.client.subscribe('zigbee2mqtt/bridge/devices', (err) => {
      if (err) console.error('Failed to subscribe to bridge/devices');
    });

    this.client.subscribe('zigbee2mqtt/bridge/state', (err) => {
      if (err) console.error('Failed to subscribe to bridge/state');
    });
  }

  private async handleMessage(topic: string, message: string) {
    try {
      const payload = JSON.parse(message);
      
      if (topic === 'zigbee2mqtt/bridge/devices') {
        await this.handleDeviceList(payload);
      } else if (topic.startsWith('zigbee2mqtt/') && !topic.includes('/bridge/')) {
        const deviceName = topic.replace('zigbee2mqtt/', '').split('/')[0];
        await this.handleDeviceUpdate(deviceName, payload);
      }
    } catch (error) {
      console.error('Error handling MQTT message:', error);
    }
  }

  private async handleDeviceList(devices: any[]) {
    for (const device of devices) {
      if (device.type === 'Coordinator') continue;
      
      await this.deviceService.updateDevice({
        zigbeeId: device.ieee_address,
        name: device.friendly_name || device.ieee_address,
        type: this.mapDeviceType(device.definition?.model || 'unknown'),
        online: device.supported,
        state: {}
      });
    }
  }

  private async handleDeviceUpdate(deviceName: string, state: any) {
    const device = await this.deviceService.getDeviceByName(deviceName);
    if (device) {
      await this.deviceService.updateDeviceState(device.id, state);
      this.io.emit('deviceUpdate', { deviceId: device.id, state });
    }
  }

  private mapDeviceType(model: string): string {
    const modelLower = model.toLowerCase();
    if (modelLower.includes('bulb') || modelLower.includes('light')) return 'light';
    if (modelLower.includes('switch')) return 'switch';
    if (modelLower.includes('sensor')) return 'sensor';
    if (modelLower.includes('dimmer')) return 'dimmer';
    if (modelLower.includes('outlet') || modelLower.includes('plug')) return 'outlet';
    return 'switch';
  }

  sendCommand(deviceName: string, command: Record<string, any>) {
    if (!this.client) return;
    
    const topic = `zigbee2mqtt/${deviceName}/set`;
    this.client.publish(topic, JSON.stringify(command));
  }

  enablePairing(enable: boolean) {
    if (!this.client) return;
    
    this.client.publish('zigbee2mqtt/bridge/request/permit_join', JSON.stringify({
      value: enable,
      time: enable ? 60 : 0
    }));
  }
}