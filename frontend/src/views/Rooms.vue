<template>
  <div>
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4">Rooms</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="(roomDevices, roomName) in deviceStore.devicesByRoom"
        :key="roomName"
        cols="12"
      >
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-home</v-icon>
            {{ roomName }}
            <v-spacer></v-spacer>
            <v-chip color="primary" variant="outlined">
              {{ roomDevices.length }} devices
            </v-chip>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col
                v-for="device in roomDevices"
                :key="device.id"
                cols="12"
                md="6"
                lg="4"
              >
                <DeviceCard :device="device" />
              </v-col>
            </v-row>

            <div v-if="roomDevices.length === 0" class="text-center py-8">
              <v-icon size="48" color="grey-lighten-1">mdi-devices-off</v-icon>
              <div class="text-body-1 mt-2">No devices in this room</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="Object.keys(deviceStore.devicesByRoom).length === 0">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-home-outline</v-icon>
            <div class="text-h6 mt-4">No rooms found</div>
            <div class="text-body-2 text-grey">
              Add some devices to get started
            </div>
            <v-btn
              color="primary"
              to="/devices"
              class="mt-4"
            >
              Go to Devices
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDeviceStore } from '@/stores/device'
import DeviceCard from '@/components/DeviceCard.vue'

const deviceStore = useDeviceStore()

onMounted(() => {
  deviceStore.fetchDevices()
  deviceStore.fetchRooms()
})
</script>