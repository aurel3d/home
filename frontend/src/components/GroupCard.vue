<template>
  <v-card class="group-card cyber-device-card" :style="{ borderColor: group.color }">
    <v-card-title class="d-flex align-center">
      <v-icon :icon="group.icon" :color="group.color" class="mr-2" size="24"></v-icon>
      {{ group.name.toUpperCase() }}
      <v-spacer></v-spacer>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon="mdi-dots-vertical" size="small" v-bind="props"></v-btn>
        </template>
        <v-list>
          <v-list-item @click="$emit('edit', group)">
            <template v-slot:prepend>
              <v-icon>mdi-pencil</v-icon>
            </template>
            <v-list-item-title>Edit</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$emit('delete', group)">
            <template v-slot:prepend>
              <v-icon>mdi-delete</v-icon>
            </template>
            <v-list-item-title>Delete</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <v-card-subtitle v-if="group.description" class="cyber-subtitle">
      {{ group.description }}
    </v-card-subtitle>

    <v-card-text>
      <div class="mb-4">
        <div class="text-caption cyber-label">DEVICE COUNT</div>
        <div class="text-h6 cyber-value">{{ group.devices.length }} NODES</div>
      </div>

      <div class="mb-4">
        <div class="text-caption cyber-label">ONLINE STATUS</div>
        <div class="d-flex align-center">
          <div class="text-body-1 cyber-value mr-2">{{ onlineCount }}/{{ group.devices.length }}</div>
          <v-progress-linear
            :model-value="onlinePercentage"
            :color="group.color"
            height="4"
            class="flex-grow-1"
          ></v-progress-linear>
        </div>
      </div>

      <!-- Quick Controls -->
      <div class="d-flex gap-2">
        <v-btn
          color="success"
          variant="outlined"
          size="small"
          @click="controlGroup({ state: 'ON' })"
          :disabled="group.devices.length === 0"
          class="cyber-btn"
        >
          <v-icon size="16" class="mr-1">mdi-power</v-icon>
          ALL ON
        </v-btn>
        <v-btn
          color="error"
          variant="outlined"
          size="small"
          @click="controlGroup({ state: 'OFF' })"
          :disabled="group.devices.length === 0"
          class="cyber-btn"
        >
          <v-icon size="16" class="mr-1">mdi-power-off</v-icon>
          ALL OFF
        </v-btn>
      </div>
    </v-card-text>

    <v-expand-transition>
      <div v-show="showDetails">
        <v-divider></v-divider>
        <v-card-text class="cyber-details">
          <div class="text-caption mb-2 cyber-label">GROUP DEVICES:</div>
          <div v-if="groupDevices.length === 0" class="text-body-2 text-grey">
            No devices in this group
          </div>
          <v-chip
            v-for="device in groupDevices"
            :key="device.id"
            :color="device.online ? 'success' : 'error'"
            size="small"
            class="ma-1"
          >
            <v-icon size="16" class="mr-1">
              {{ device.online ? 'mdi-check-circle' : 'mdi-alert-circle' }}
            </v-icon>
            {{ device.name }}
          </v-chip>
        </v-card-text>
      </div>
    </v-expand-transition>

    <v-card-actions>
      <v-btn
        variant="text"
        size="small"
        @click="showDetails = !showDetails"
        color="secondary"
      >
        <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
        {{ showDetails ? 'HIDE' : 'SHOW' }} DEVICES
      </v-btn>
    </v-card-actions>

    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      :color="snackbarColor"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DeviceGroup } from '@shared/types'
import { useGroupStore } from '@/stores/group'
import { useDeviceStore } from '@/stores/device'

const props = defineProps<{
  group: DeviceGroup
}>()

defineEmits<{
  edit: [group: DeviceGroup]
  delete: [group: DeviceGroup]
}>()

const groupStore = useGroupStore()
const deviceStore = useDeviceStore()
const showDetails = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('info')

const groupDevices = computed(() => 
  deviceStore.devices.filter(device => props.group.devices.includes(device.id))
)

const onlineCount = computed(() => 
  groupDevices.value.filter(device => device.online).length
)

const onlinePercentage = computed(() => 
  props.group.devices.length === 0 ? 0 : (onlineCount.value / props.group.devices.length) * 100
)

const controlGroup = async (command: Record<string, any>) => {
  try {
    await groupStore.controlGroup(props.group.id, command)
    showSnackbar(`Group ${command.state === 'ON' ? 'activated' : 'deactivated'}`, 'success')
  } catch (error) {
    showSnackbar('Failed to control group', 'error')
  }
}

const showSnackbar = (text: string, color: string) => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}
</script>

<style scoped>
.group-card {
  transition: all 0.3s ease;
}

.group-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 255, 255, 0.2);
}

.gap-2 {
  gap: 8px;
}
</style>