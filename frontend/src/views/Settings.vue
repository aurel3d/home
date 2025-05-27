<template>
  <div>
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4">Settings</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>System Information</v-card-title>
          <v-card-text>
            <v-list lines="two">
              <v-list-item
                title="Total Devices"
                :subtitle="deviceStore.devices.length.toString()"
                prepend-icon="mdi-devices"
              ></v-list-item>
              <v-list-item
                title="Online Devices"
                :subtitle="deviceStore.onlineDevices.length.toString()"
                prepend-icon="mdi-check-circle"
              ></v-list-item>
              <v-list-item
                title="Rooms"
                :subtitle="deviceStore.rooms.length.toString()"
                prepend-icon="mdi-home"
              ></v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>MQTT Connection</v-card-title>
          <v-card-text>
            <v-list lines="two">
              <v-list-item
                title="Broker Status"
                subtitle="Connected"
                prepend-icon="mdi-server-network"
              >
                <template v-slot:append>
                  <v-chip color="success" size="small">Online</v-chip>
                </template>
              </v-list-item>
              <v-list-item
                title="Zigbee2MQTT"
                subtitle="Bridge connected"
                prepend-icon="mdi-zigbee"
              >
                <template v-slot:append>
                  <v-chip color="success" size="small">Active</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Device Management</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-btn
                  color="primary"
                  block
                  @click="refreshDevices"
                  :loading="refreshLoading"
                >
                  <v-icon left>mdi-refresh</v-icon>
                  Refresh Devices
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn
                  color="warning"
                  variant="outlined"
                  block
                  @click="togglePairing"
                  :loading="pairingLoading"
                >
                  <v-icon left>mdi-plus</v-icon>
                  {{ isPairing ? 'Stop Pairing' : 'Start Pairing' }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>About</v-card-title>
          <v-card-text>
            <v-list lines="two">
              <v-list-item
                title="Home Automation System"
                subtitle="Custom Vue.js + Node.js solution with Zigbee2MQTT"
                prepend-icon="mdi-information"
              ></v-list-item>
              <v-list-item
                title="Version"
                subtitle="1.0.0"
                prepend-icon="mdi-tag"
              ></v-list-item>
              <v-list-item
                title="Technology Stack"
                subtitle="Vue 3, Vuetify, Node.js, SQLite, MQTT"
                prepend-icon="mdi-code-tags"
              ></v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      :color="snackbarColor"
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeviceStore } from '@/stores/device'

const deviceStore = useDeviceStore()
const refreshLoading = ref(false)
const pairingLoading = ref(false)
const isPairing = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('info')

const refreshDevices = async () => {
  refreshLoading.value = true
  try {
    await deviceStore.fetchDevices()
    await deviceStore.fetchRooms()
    showSnackbar('Devices refreshed successfully', 'success')
  } catch (error) {
    showSnackbar('Failed to refresh devices', 'error')
  } finally {
    refreshLoading.value = false
  }
}

const togglePairing = async () => {
  pairingLoading.value = true
  try {
    await deviceStore.enablePairing(!isPairing.value)
    isPairing.value = !isPairing.value
    showSnackbar(
      isPairing.value ? 'Pairing mode enabled' : 'Pairing mode disabled',
      'info'
    )
    
    if (isPairing.value) {
      setTimeout(() => {
        isPairing.value = false
        showSnackbar('Pairing mode automatically disabled', 'info')
      }, 60000)
    }
  } catch (error) {
    showSnackbar('Failed to toggle pairing mode', 'error')
  } finally {
    pairingLoading.value = false
  }
}

const showSnackbar = (text: string, color: string) => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(() => {
  deviceStore.fetchDevices()
  deviceStore.fetchRooms()
})
</script>