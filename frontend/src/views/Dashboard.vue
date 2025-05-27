<template>
  <div>
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="cyber-stat-card">
          <v-card-text class="text-center">
            <v-icon size="40" color="primary" class="mb-2">mdi-chip</v-icon>
            <div class="text-h6 cyber-label">NEURAL NODES</div>
            <div class="text-h3 cyber-value">{{ deviceStore.devices.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="cyber-stat-card">
          <v-card-text class="text-center">
            <v-icon size="40" color="success" class="mb-2">mdi-access-point</v-icon>
            <div class="text-h6 cyber-label">ACTIVE LINKS</div>
            <div class="text-h3 cyber-value status-online">{{ deviceStore.onlineDevices.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="cyber-stat-card">
          <v-card-text class="text-center">
            <v-icon size="40" color="error" class="mb-2">mdi-access-point-off</v-icon>
            <div class="text-h6 cyber-label">OFFLINE NODES</div>
            <div class="text-h3 cyber-value status-offline">{{ deviceStore.offlineDevices.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-lan</v-icon>
            SECTOR GRID STATUS
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col
                v-for="(roomDevices, roomName) in deviceStore.devicesByRoom"
                :key="roomName"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card variant="outlined" class="cyber-room-card">
                  <v-card-title class="text-center">
                    <v-icon class="mr-2">mdi-home-city</v-icon>
                    {{ roomName.toUpperCase() }}
                  </v-card-title>
                  <v-card-text>
                    <div class="d-flex justify-space-between mb-3">
                      <span class="cyber-label">NODES: {{ roomDevices.length }}</span>
                      <span class="cyber-label status-online">LIVE: {{ roomDevices.filter(d => d.online).length }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="(roomDevices.filter(d => d.online).length / roomDevices.length) * 100"
                      color="primary"
                      height="6"
                      class="mt-2 cyber-progress"
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
          <v-card-title>
            <v-icon class="mr-2">mdi-history</v-icon>
            RECENT NEURAL ACTIVITY
          </v-card-title>
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