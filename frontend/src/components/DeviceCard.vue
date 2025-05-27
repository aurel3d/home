<template>
  <v-card class="device-card" :class="{ 'device-offline': !device.online }">
    <v-card-title class="d-flex align-center">
      <v-icon :icon="deviceIcon" class="mr-2"></v-icon>
      {{ device.name }}
      <v-spacer></v-spacer>
      <v-chip
        :color="device.online ? 'success' : 'error'"
        size="small"
        variant="flat"
      >
        {{ device.online ? 'Online' : 'Offline' }}
      </v-chip>
    </v-card-title>

    <v-card-subtitle>{{ device.room }}</v-card-subtitle>

    <v-card-text>
      <div v-if="device.type === 'light' || device.type === 'switch'">
        <v-switch
          :model-value="device.state.state === 'ON'"
          :disabled="!device.online"
          @update:model-value="toggleDevice"
          hide-details
          :label="device.state.state === 'ON' ? 'On' : 'Off'"
        ></v-switch>
        
        <v-slider
          v-if="device.type === 'light' && device.state.brightness !== undefined"
          :model-value="device.state.brightness || 0"
          :disabled="!device.online || device.state.state !== 'ON'"
          @update:model-value="setBrightness"
          min="1"
          max="254"
          step="1"
          label="Brightness"
          class="mt-4"
        ></v-slider>
      </div>

      <div v-else-if="device.type === 'sensor'">
        <div v-for="(value, key) in sensorData" :key="key" class="mb-2">
          <div class="text-caption">{{ formatSensorKey(key) }}</div>
          <div class="text-h6">{{ formatSensorValue(key, value) }}</div>
        </div>
      </div>

      <div v-else>
        <pre class="text-caption">{{ JSON.stringify(device.state, null, 2) }}</pre>
      </div>
    </v-card-text>

    <v-card-actions v-if="device.online">
      <v-btn
        variant="text"
        size="small"
        @click="showDetails = !showDetails"
      >
        Details
      </v-btn>
    </v-card-actions>

    <v-expand-transition>
      <div v-show="showDetails">
        <v-divider></v-divider>
        <v-card-text>
          <div class="text-caption mb-2">Last seen: {{ formatDate(device.lastSeen) }}</div>
          <div class="text-caption mb-2">Zigbee ID: {{ device.zigbeeId }}</div>
          <div class="text-caption">Type: {{ device.type }}</div>
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