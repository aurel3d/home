<template>
  <div>
    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text>
            <div class="text-h6">Total Devices</div>
            <div class="text-h4">{{ deviceStore.devices.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text>
            <div class="text-h6">Online</div>
            <div class="text-h4 text-success">{{ deviceStore.onlineDevices.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text>
            <div class="text-h6">Offline</div>
            <div class="text-h4 text-error">{{ deviceStore.offlineDevices.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Rooms Overview</v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="(roomDevices, roomName) in deviceStore.devicesByRoom"
                :key="roomName"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card variant="outlined">
                  <v-card-title>{{ roomName }}</v-card-title>
                  <v-card-text>
                    <div class="d-flex justify-space-between">
                      <span>Devices: {{ roomDevices.length }}</span>
                      <span>Online: {{ roomDevices.filter(d => d.online).length }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="(roomDevices.filter(d => d.online).length / roomDevices.length) * 100"
                      color="primary"
                      class="mt-2"
                    ></v-progress-linear>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Recent Devices</v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="device in recentDevices"
                :key="device.id"
                cols="12"
                md="6"
                lg="4"
              >
                <DeviceCard :device="device" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDeviceStore } from '@/stores/device'
import DeviceCard from '@/components/DeviceCard.vue'

const deviceStore = useDeviceStore()

const recentDevices = computed(() =>
  deviceStore.devices
    .slice()
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())
    .slice(0, 6)
)

onMounted(() => {
  deviceStore.fetchDevices()
  deviceStore.fetchRooms()
})
</script>