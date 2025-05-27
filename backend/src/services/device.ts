import { PrismaClient } from '@prisma/client';
import { Device, DeviceType } from '../../../shared/types';

const prisma = new PrismaClient();

export class DeviceService {
  async getAllDevices(): Promise<Device[]> {
    const devices = await prisma.device.findMany();
    return devices.map(this.mapPrismaDevice);
  }

  async getDeviceById(id: string): Promise<Device | null> {
    const device = await prisma.device.findUnique({ where: { id } });
    return device ? this.mapPrismaDevice(device) : null;
  }

  async getDeviceByName(name: string): Promise<Device | null> {
    const device = await prisma.device.findFirst({ where: { name } });
    return device ? this.mapPrismaDevice(device) : null;
  }

  async updateDevice(data: {
    zigbeeId: string;
    name: string;
    type: string;
    online: boolean;
    state: Record<string, any>;
    room?: string;
  }): Promise<Device> {
    const device = await prisma.device.upsert({
      where: { zigbeeId: data.zigbeeId },
      update: {
        name: data.name,
        type: data.type,
        online: data.online,
        state: JSON.stringify(data.state),
        lastSeen: new Date(),
        room: data.room || 'Default'
      },
      create: {
        zigbeeId: data.zigbeeId,
        name: data.name,
        type: data.type,
        online: data.online,
        state: JSON.stringify(data.state),
        room: data.room || 'Default'
      }
    });

    return this.mapPrismaDevice(device);
  }

  async updateDeviceState(id: string, state: Record<string, any>): Promise<Device | null> {
    const device = await prisma.device.update({
      where: { id },
      data: {
        state: JSON.stringify(state),
        online: true,
        lastSeen: new Date()
      }
    });

    await this.logDeviceAction(id, 'state_update', state);
    return this.mapPrismaDevice(device);
  }

  async updateDeviceRoom(id: string, room: string): Promise<Device | null> {
    const device = await prisma.device.update({
      where: { id },
      data: { room }
    });

    return device ? this.mapPrismaDevice(device) : null;
  }

  async deleteDevice(id: string): Promise<boolean> {
    try {
      await prisma.device.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getRooms(): Promise<string[]> {
    const rooms = await prisma.device.findMany({
      select: { room: true },
      distinct: ['room']
    });
    return rooms.map(r => r.room);
  }

  async getDevicesByRoom(room: string): Promise<Device[]> {
    const devices = await prisma.device.findMany({ where: { room } });
    return devices.map(this.mapPrismaDevice);
  }

  private async logDeviceAction(deviceId: string, action: string, payload: any) {
    await prisma.deviceLog.create({
      data: {
        deviceId,
        action,
        payload: JSON.stringify(payload)
      }
    });
  }

  private mapPrismaDevice(device: any): Device {
    return {
      id: device.id,
      name: device.name,
      type: device.type as DeviceType,
      room: device.room,
      online: device.online,
      state: JSON.parse(device.state || '{}'),
      lastSeen: device.lastSeen,
      zigbeeId: device.zigbeeId
    };
  }
}