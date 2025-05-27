import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { io } from 'socket.io-client'
import { Device, DeviceType } from '@shared/types'
import { api } from '@/services/api'

export const useDeviceStore = defineStore('device', () => {
  const devices = ref<Device[]>([])
  const rooms = ref<string[]>([])
  const loading = ref(false)
  const socket = io({
    autoConnect: true,
    transports: ['websocket', 'polling']
  })

  const devicesByRoom = computed(() => {
    const grouped: Record<string, Device[]> = {}
    devices.value.forEach(device => {
      if (!grouped[device.room]) {
        grouped[device.room] = []
      }
      grouped[device.room].push(device)
    })
    return grouped
  })

  const onlineDevices = computed(() => 
    devices.value.filter(device => device.online)
  )

  const offlineDevices = computed(() => 
    devices.value.filter(device => !device.online)
  )

  socket.on('deviceUpdate', (data: { deviceId: string, state: any }) => {
    const device = devices.value.find(d => d.id === data.deviceId)
    if (device) {
      device.state = data.state
      device.online = true
      device.lastSeen = new Date()
    }
  })

  const fetchDevices = async () => {
    loading.value = true
    try {
      const response = await api.get('/devices')
      devices.value = response.data
    } catch (error) {
      console.error('Failed to fetch devices:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms')
      rooms.value = response.data
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    }
  }

  const controlDevice = async (deviceId: string, command: Record<string, any>) => {
    try {
      await api.post(`/devices/${deviceId}/control`, command)
    } catch (error) {
      console.error('Failed to control device:', error)
      throw error
    }
  }

  const updateDeviceRoom = async (deviceId: string, room: string) => {
    try {
      await api.patch(`/devices/${deviceId}/room`, { room })
      const device = devices.value.find(d => d.id === deviceId)
      if (device) {
        device.room = room
      }
    } catch (error) {
      console.error('Failed to update device room:', error)
      throw error
    }
  }

  const enablePairing = async (enable: boolean) => {
    try {
      await api.post('/pairing', { enable })
    } catch (error) {
      console.error('Failed to toggle pairing:', error)
      throw error
    }
  }

  return {
    devices,
    rooms,
    loading,
    devicesByRoom,
    onlineDevices,
    offlineDevices,
    fetchDevices,
    fetchRooms,
    controlDevice,
    updateDeviceRoom,
    enablePairing
  }
})