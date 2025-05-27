<template>
  <div>
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center">
          <h1 class="text-h4">Devices</h1>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="togglePairing"
            :loading="pairingLoading"
          >
            {{ isPairing ? 'Stop Pairing' : 'Start Pairing' }}
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search devices"
          variant="outlined"
          hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedRoom"
          :items="roomOptions"
          label="Filter by room"
          variant="outlined"
          hide-details
          clearable
        ></v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedType"
          :items="typeOptions"
          label="Filter by type"
          variant="outlined"
          hide-details
          clearable
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="device in filteredDevices"
        :key="device.id"
        cols="12"
        md="6"
        lg="4"
      >
        <DeviceCard :device="device" />
      </v-col>
    </v-row>

    <v-row v-if="filteredDevices.length === 0">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-devices</v-icon>
            <div class="text-h6 mt-4">No devices found</div>
            <div class="text-body-2 text-grey">
              {{ deviceStore.devices.length === 0 
                 ? 'No devices are currently paired with your system.' 
                 : 'Try adjusting your search filters.' }}
            </div>
            <v-btn
              v-if="deviceStore.devices.length === 0"
              color="primary"
              @click="togglePairing"
              class="mt-4"
            >
              Start Pairing Devices
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="pairingSnackbar"
      :timeout="5000"
      color="info"
    >
      {{ isPairing ? 'Pairing mode enabled. Put your device in pairing mode.' : 'Pairing mode disabled.' }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useDeviceStore } from '@/stores/device'
import { DeviceType } from '@shared/types'
import DeviceCard from '@/components/DeviceCard.vue'

const deviceStore = useDeviceStore()
const search = ref('')
const selectedRoom = ref<string | null>(null)
const selectedType = ref<string | null>(null)
const isPairing = ref(false)
const pairingLoading = ref(false)
const pairingSnackbar = ref(false)

const roomOptions = computed(() => 
  ['All Rooms', ...deviceStore.rooms]
)

const typeOptions = computed(() => [
  'All Types',
  ...Object.values(DeviceType).map(type => 
    type.charAt(0).toUpperCase() + type.slice(1)
  )
])

const filteredDevices = computed(() => {
  let devices = deviceStore.devices

  if (search.value) {
    devices = devices.filter(device =>
      device.name.toLowerCase().includes(search.value.toLowerCase()) ||
      device.room.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  if (selectedRoom.value && selectedRoom.value !== 'All Rooms') {
    devices = devices.filter(device => device.room === selectedRoom.value)
  }

  if (selectedType.value && selectedType.value !== 'All Types') {
    const type = selectedType.value.toLowerCase()
    devices = devices.filter(device => device.type === type)
  }

  return devices
})

const togglePairing = async () => {
  pairingLoading.value = true
  try {
    await deviceStore.enablePairing(!isPairing.value)
    isPairing.value = !isPairing.value
    pairingSnackbar.value = true
    
    if (isPairing.value) {
      setTimeout(() => {
        isPairing.value = false
        pairingSnackbar.value = true
      }, 60000)
    }
  } catch (error) {
    console.error('Failed to toggle pairing:', error)
  } finally {
    pairingLoading.value = false
  }
}

onMounted(() => {
  deviceStore.fetchDevices()
  deviceStore.fetchRooms()
})
</script>