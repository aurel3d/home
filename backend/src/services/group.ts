import { PrismaClient } from '@prisma/client';
import { DeviceGroup } from '../../../shared/types';

const prisma = new PrismaClient();

export class GroupService {
  async getAllGroups(): Promise<DeviceGroup[]> {
    const groups = await prisma.deviceGroup.findMany({
      include: {
        devices: {
          include: {
            device: true
          }
        }
      }
    });
    return groups.map(this.mapPrismaGroup);
  }

  async getGroupById(id: string): Promise<DeviceGroup | null> {
    const group = await prisma.deviceGroup.findUnique({ 
      where: { id },
      include: {
        devices: {
          include: {
            device: true
          }
        }
      }
    });
    return group ? this.mapPrismaGroup(group) : null;
  }

  async createGroup(data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    deviceIds?: string[];
  }): Promise<DeviceGroup> {
    console.log('GroupService: Creating group with data:', data);
    
    const group = await prisma.deviceGroup.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || '#00ffff',
        icon: data.icon || 'mdi-group',
        devices: data.deviceIds && data.deviceIds.length > 0 ? {
          create: data.deviceIds.map(deviceId => {
            console.log('GroupService: Creating device relationship for deviceId:', deviceId);
            return { deviceId };
          })
        } : undefined
      },
      include: {
        devices: {
          include: {
            device: true
          }
        }
      }
    });

    console.log('GroupService: Created group from Prisma:', JSON.stringify(group, null, 2));
    const result = this.mapPrismaGroup(group);
    console.log('GroupService: Mapped group result:', result);
    return result;
  }

  async updateGroup(id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    deviceIds?: string[];
  }): Promise<DeviceGroup | null> {
    // If deviceIds provided, replace all device relationships
    if (data.deviceIds !== undefined) {
      // Delete existing relationships
      await prisma.deviceGroupMember.deleteMany({
        where: { groupId: id }
      });

      // Create new relationships
      if (data.deviceIds.length > 0) {
        await prisma.deviceGroupMember.createMany({
          data: data.deviceIds.map(deviceId => ({
            groupId: id,
            deviceId
          }))
        });
      }
    }

    // Update group data
    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.color && { color: data.color }),
      ...(data.icon && { icon: data.icon })
    };

    const group = await prisma.deviceGroup.update({
      where: { id },
      data: updateData,
      include: {
        devices: {
          include: {
            device: true
          }
        }
      }
    });

    return this.mapPrismaGroup(group);
  }

  async deleteGroup(id: string): Promise<boolean> {
    try {
      await prisma.deviceGroup.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async addDeviceToGroup(groupId: string, deviceId: string): Promise<DeviceGroup | null> {
    try {
      await prisma.deviceGroupMember.create({
        data: {
          groupId,
          deviceId
        }
      });

      const group = await prisma.deviceGroup.findUnique({
        where: { id: groupId },
        include: {
          devices: {
            include: {
              device: true
            }
          }
        }
      });
      return group ? this.mapPrismaGroup(group) : null;
    } catch {
      return null;
    }
  }

  async removeDeviceFromGroup(groupId: string, deviceId: string): Promise<DeviceGroup | null> {
    try {
      await prisma.deviceGroupMember.delete({
        where: {
          deviceId_groupId: {
            deviceId,
            groupId
          }
        }
      });

      const group = await prisma.deviceGroup.findUnique({
        where: { id: groupId },
        include: {
          devices: {
            include: {
              device: true
            }
          }
        }
      });
      return group ? this.mapPrismaGroup(group) : null;
    } catch {
      return null;
    }
  }

  async getDevicesInGroup(groupId: string): Promise<string[]> {
    const members = await prisma.deviceGroupMember.findMany({
      where: { groupId },
      select: { deviceId: true }
    });

    return members.map((m: any) => m.deviceId);
  }

  private mapPrismaGroup(group: any): DeviceGroup {
    // The devices array contains DeviceGroupMember objects with deviceId property
    const deviceIds = group.devices ? group.devices.map((member: any) => member.deviceId) : [];
    
    return {
      id: group.id,
      name: group.name,
      description: group.description || '',
      color: group.color,
      icon: group.icon,
      devices: deviceIds,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt
    };
  }
}