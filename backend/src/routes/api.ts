import { Router } from 'express';
import { DeviceService } from '../services/device';
import { MqttService } from '../services/mqtt';
import { ApiResponse } from '../../../shared/types';

export function apiRouter(deviceService: DeviceService, mqttService: MqttService) {
  const router = Router();

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

  return router;
}