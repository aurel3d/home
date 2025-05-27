import { Router } from 'express';
import { DeviceService } from '../services/device';
import { MqttService } from '../services/mqtt';
import { GroupService } from '../services/group';
import { ApiResponse } from '../../../shared/types';

export function apiRouter(deviceService: DeviceService, mqttService: MqttService) {
  const router = Router();
  const groupService = new GroupService();

  // Get all devices
  router.get('/devices', async (req, res) => {
    try {
      const devices = await deviceService.getAllDevices();
      const response: ApiResponse = { success: true, data: devices };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to get devices' };
      res.status(500).json(response);
    }
  });

  // Get device by ID
  router.get('/devices/:id', async (req, res) => {
    try {
      const device = await deviceService.getDeviceById(req.params.id);
      if (!device) {
        const response: ApiResponse = { success: false, error: 'Device not found' };
        return res.status(404).json(response);
      }
      const response: ApiResponse = { success: true, data: device };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to get device' };
      res.status(500).json(response);
    }
  });

  // Control device
  router.post('/devices/:id/control', async (req, res) => {
    try {
      const device = await deviceService.getDeviceById(req.params.id);
      if (!device) {
        const response: ApiResponse = { success: false, error: 'Device not found' };
        return res.status(404).json(response);
      }

      mqttService.sendCommand(device.name, req.body);
      const response: ApiResponse = { success: true };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to control device' };
      res.status(500).json(response);
    }
  });

  // Update device room
  router.patch('/devices/:id/room', async (req, res) => {
    try {
      const { room } = req.body;
      const device = await deviceService.updateDeviceRoom(req.params.id, room);
      if (!device) {
        const response: ApiResponse = { success: false, error: 'Device not found' };
        return res.status(404).json(response);
      }
      const response: ApiResponse = { success: true, data: device };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to update device room' };
      res.status(500).json(response);
    }
  });

  // Get rooms
  router.get('/rooms', async (req, res) => {
    try {
      const rooms = await deviceService.getRooms();
      const response: ApiResponse = { success: true, data: rooms };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to get rooms' };
      res.status(500).json(response);
    }
  });

  // Get devices by room
  router.get('/rooms/:room/devices', async (req, res) => {
    try {
      const devices = await deviceService.getDevicesByRoom(req.params.room);
      const response: ApiResponse = { success: true, data: devices };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to get room devices' };
      res.status(500).json(response);
    }
  });

  // Enable/disable pairing
  router.post('/pairing', (req, res) => {
    try {
      const { enable } = req.body;
      mqttService.enablePairing(enable);
      const response: ApiResponse = { success: true };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to toggle pairing' };
      res.status(500).json(response);
    }
  });

  // Group endpoints
  
  // Get all groups
  router.get('/groups', async (req, res) => {
    try {
      const groups = await groupService.getAllGroups();
      const response: ApiResponse = { success: true, data: groups };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to get groups' };
      res.status(500).json(response);
    }
  });

  // Get group by ID
  router.get('/groups/:id', async (req, res) => {
    try {
      const group = await groupService.getGroupById(req.params.id);
      if (!group) {
        const response: ApiResponse = { success: false, error: 'Group not found' };
        return res.status(404).json(response);
      }
      const response: ApiResponse = { success: true, data: group };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to get group' };
      res.status(500).json(response);
    }
  });

  // Create group
  router.post('/groups', async (req, res) => {
    try {
      const { name, description, color, icon, deviceIds } = req.body;
      console.log('Backend: Received group creation request:', { name, description, color, icon, deviceIds });
      const group = await groupService.createGroup({
        name,
        description,
        color,
        icon,
        deviceIds
      });
      console.log('Backend: Created group:', group);
      const response: ApiResponse = { success: true, data: group };
      res.json(response);
    } catch (error) {
      console.error('Backend: Group creation error:', error);
      const response: ApiResponse = { success: false, error: 'Failed to create group' };
      res.status(500).json(response);
    }
  });

  // Update group
  router.patch('/groups/:id', async (req, res) => {
    try {
      const { name, description, color, icon, deviceIds } = req.body;
      const group = await groupService.updateGroup(req.params.id, {
        name,
        description,
        color,
        icon,
        deviceIds
      });
      if (!group) {
        const response: ApiResponse = { success: false, error: 'Group not found' };
        return res.status(404).json(response);
      }
      const response: ApiResponse = { success: true, data: group };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to update group' };
      res.status(500).json(response);
    }
  });

  // Delete group
  router.delete('/groups/:id', async (req, res) => {
    try {
      const success = await groupService.deleteGroup(req.params.id);
      if (!success) {
        const response: ApiResponse = { success: false, error: 'Group not found' };
        return res.status(404).json(response);
      }
      const response: ApiResponse = { success: true };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to delete group' };
      res.status(500).json(response);
    }
  });

  // Control all devices in group
  router.post('/groups/:id/control', async (req, res) => {
    try {
      const deviceIds = await groupService.getDevicesInGroup(req.params.id);
      if (deviceIds.length === 0) {
        const response: ApiResponse = { success: false, error: 'Group not found or empty' };
        return res.status(404).json(response);
      }

      // Control each device in the group
      const results = await Promise.allSettled(
        deviceIds.map(async (deviceId) => {
          const device = await deviceService.getDeviceById(deviceId);
          if (device) {
            mqttService.sendCommand(device.name, req.body);
          }
        })
      );

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const response: ApiResponse = { 
        success: true, 
        data: { 
          controlled: successCount, 
          total: deviceIds.length 
        } 
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to control group' };
      res.status(500).json(response);
    }
  });

  // Add device to group
  router.post('/groups/:groupId/devices/:deviceId', async (req, res) => {
    try {
      const group = await groupService.addDeviceToGroup(req.params.groupId, req.params.deviceId);
      if (!group) {
        const response: ApiResponse = { success: false, error: 'Group or device not found' };
        return res.status(404).json(response);
      }
      const response: ApiResponse = { success: true, data: group };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to add device to group' };
      res.status(500).json(response);
    }
  });

  // Remove device from group
  router.delete('/groups/:groupId/devices/:deviceId', async (req, res) => {
    try {
      const group = await groupService.removeDeviceFromGroup(req.params.groupId, req.params.deviceId);
      if (!group) {
        const response: ApiResponse = { success: false, error: 'Group or device not found' };
        return res.status(404).json(response);
      }
      const response: ApiResponse = { success: true, data: group };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = { success: false, error: 'Failed to remove device from group' };
      res.status(500).json(response);
    }
  });

  return router;
}