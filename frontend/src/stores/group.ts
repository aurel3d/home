import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DeviceGroup } from '@shared/types'
import { api } from '@/services/api'

export const useGroupStore = defineStore('group', () => {
  const groups = ref<DeviceGroup[]>([])
  const loading = ref(false)

  const fetchGroups = async () => {
    loading.value = true
    try {
      const response = await api.get('/groups')
      groups.value = response.data
    } catch (error) {
      console.error('Failed to fetch groups:', error)
    } finally {
      loading.value = false
    }
  }

  const createGroup = async (groupData: {
    name: string
    description?: string
    color?: string
    icon?: string
    deviceIds?: string[]
  }) => {
    try {
      console.log('Frontend: Creating group with data:', groupData)
      const response = await api.post('/groups', groupData)
      console.log('Frontend: Group creation response:', response.data)
      groups.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to create group:', error)
      throw error
    }
  }

  const updateGroup = async (groupId: string, groupData: {
    name?: string
    description?: string
    color?: string
    icon?: string
    deviceIds?: string[]
  }) => {
    try {
      const response = await api.patch(`/groups/${groupId}`, groupData)
      const index = groups.value.findIndex(g => g.id === groupId)
      if (index !== -1) {
        groups.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Failed to update group:', error)
      throw error
    }
  }

  const deleteGroup = async (groupId: string) => {
    try {
      await api.delete(`/groups/${groupId}`)
      groups.value = groups.value.filter(g => g.id !== groupId)
    } catch (error) {
      console.error('Failed to delete group:', error)
      throw error
    }
  }

  const controlGroup = async (groupId: string, command: Record<string, any>) => {
    try {
      await api.post(`/groups/${groupId}/control`, command)
    } catch (error) {
      console.error('Failed to control group:', error)
      throw error
    }
  }

  const addDeviceToGroup = async (groupId: string, deviceId: string) => {
    try {
      const response = await api.post(`/groups/${groupId}/devices/${deviceId}`)
      const index = groups.value.findIndex(g => g.id === groupId)
      if (index !== -1) {
        groups.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Failed to add device to group:', error)
      throw error
    }
  }

  const removeDeviceFromGroup = async (groupId: string, deviceId: string) => {
    try {
      const response = await api.delete(`/groups/${groupId}/devices/${deviceId}`)
      const index = groups.value.findIndex(g => g.id === groupId)
      if (index !== -1) {
        groups.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Failed to remove device from group:', error)
      throw error
    }
  }

  return {
    groups,
    loading,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    controlGroup,
    addDeviceToGroup,
    removeDeviceFromGroup
  }
})