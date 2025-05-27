<template>
  <v-card class="device-card cyber-device-card" :class="{ 'device-offline': !device.online }">
    <v-card-title class="d-flex align-center">
      <v-icon :icon="deviceIcon" class="mr-2" size="24"></v-icon>
      {{ device.name.toUpperCase() }}
      <v-spacer></v-spacer>
      <v-chip
        :color="device.online ? 'success' : 'error'"
        size="small"
        variant="flat"
        class="cyber-status-chip"
      >
        <v-icon size="12" class="mr-1">{{ device.online ? 'mdi-connection' : 'mdi-close-network' }}</v-icon>
        {{ device.online ? 'LINKED' : 'OFFLINE' }}
      </v-chip>
    </v-card-title>

    <v-card-subtitle class="cyber-subtitle">SECTOR: {{ device.room.toUpperCase() }}</v-card-subtitle>

    <v-card-text>
      <div v-if="device.type === 'light' || device.type === 'switch'">
        <v-switch
          :model-value="device.state.state === 'ON'"
          :disabled="!device.online"
          @update:model-value="toggleDevice"
          hide-details
          :label="device.state.state === 'ON' ? 'POWERED' : 'DORMANT'"
          color="primary"
          class="cyber-switch"
        ></v-switch>
        
        <v-slider
          v-if="device.type === 'light' && device.state.brightness !== undefined"
          :model-value="device.state.brightness || 0"
          :disabled="!device.online || device.state.state !== 'ON'"
          @update:model-value="setBrightness"
          min="1"
          max="254"
          step="1"
          label="LUMINOSITY CONTROL"
          color="primary"
          track-color="surface-variant"
          class="mt-4 cyber-slider"
        ></v-slider>
      </div>

      <div v-else-if="device.type === 'sensor'">
        <div v-for="(value, key) in sensorData" :key="key" class="mb-3 cyber-sensor-data">
          <div class="text-caption cyber-label">{{ formatSensorKey(key) }}</div>
          <div class="text-h6 cyber-value">{{ formatSensorValue(key, value) }}</div>
        </div>
      </div>

      <div v-else>
        <pre class="text-caption">{{ JSON.stringify(device.state, null, 2) }}</pre>
      </div>
    </v-card-text>

    <v-card-actions v-if="device.online">
      <v-btn
        variant="outlined"
        size="small"
        color="secondary"
        @click="showDetails = !showDetails"
        class="cyber-btn"
      >
        <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
        NEURAL DATA
      </v-btn>
    </v-card-actions>

    <v-expand-transition>
      <div v-show="showDetails">
        <v-divider></v-divider>
        <v-card-text class="cyber-details">
          <div class="text-caption mb-2 cyber-label">LAST SYNC: {{ formatDate(device.lastSeen) }}</div>
          <div class="text-caption mb-2 cyber-label">NEURAL ID: {{ device.zigbeeId }}</div>
          <div class="text-caption cyber-label">NODE TYPE: {{ device.type.toUpperCase() }}</div>
        </v-card-text>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Device, DeviceType } from '@shared/types'
import { useDeviceStore } from '@/stores/device'

const props = defineProps<{
  device: Device
}>()

const deviceStore = useDeviceStore()
const showDetails = ref(false)

const deviceIcon = computed(() => {
  switch (props.device.type) {
    case DeviceType.LIGHT:
      return 'mdi-lightbulb'
    case DeviceType.SWITCH:
      return 'mdi-light-switch'
    case DeviceType.SENSOR:
      return 'mdi-thermometer'
    case DeviceType.OUTLET:
      return 'mdi-power-socket-eu'
    case DeviceType.DIMMER:
      return 'mdi-tune'
    default:
      return 'mdi-help-circle'
  }
})

const sensorData = computed(() => {
  const data: Record<string, any> = {}
  Object.entries(props.device.state).forEach(([key, value]) => {
    if (typeof value === 'number' || typeof value === 'string') {
      data[key] = value
    }
  })
  return data
})

const toggleDevice = async (value: boolean) => {
  try {
    await deviceStore.controlDevice(props.device.id, {
      state: value ? 'ON' : 'OFF'
    })
  } catch (error) {
    console.error('Failed to toggle device:', error)
  }
}

const setBrightness = async (value: number) => {
  try {
    await deviceStore.controlDevice(props.device.id, {
      brightness: value
    })
  } catch (error) {
    console.error('Failed to set brightness:', error)
  }
}

const formatSensorKey = (key: string): string => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatSensorValue = (key: string, value: any): string => {
  if (key.includes('temperature')) {
    return `${value}°C`
  } else if (key.includes('humidity')) {
    return `${value}%`
  } else if (key.includes('battery')) {
    return `${value}%`
  }
  return String(value)
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString()
}
</script>

<style scoped>
.device-card {
  transition: opacity 0.3s;
}

.device-offline {
  opacity: 0.6;
}
</style>