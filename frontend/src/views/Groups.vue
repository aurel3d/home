<template>
  <div>
    <v-row class="mb-4">
      <v-col>
        <div class="d-flex align-center">
          <h1 class="text-h4">
            <v-icon class="mr-2">mdi-group</v-icon>
            NEURAL GROUPS
          </h1>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="showCreateDialog = true"
            class="cyber-btn"
          >
            <v-icon class="mr-2">mdi-plus</v-icon>
            CREATE GROUP
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="group in groupStore.groups"
        :key="group.id"
        cols="12"
        md="6"
        lg="4"
      >
        <GroupCard :group="group" @edit="editGroup" @delete="deleteGroup" />
      </v-col>
    </v-row>

    <v-row v-if="groupStore.groups.length === 0">
      <v-col cols="12">
        <v-card>
          <v-card-text class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-group-outline</v-icon>
            <div class="text-h6 mt-4">No Neural Groups Found</div>
            <div class="text-body-2 text-grey">
              Create groups to control multiple devices simultaneously
            </div>
            <v-btn
              color="primary"
              @click="showCreateDialog = true"
              class="mt-4"
            >
              Create First Group
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create/Edit Group Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title class="cyber-title">
          <v-icon class="mr-2">{{ editingGroup ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingGroup ? 'MODIFY GROUP' : 'CREATE GROUP' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="groupFormRef" v-model="formValid">
            <v-text-field
              v-model="groupName"
              label="Group Name"
              :rules="[v => !!v || 'Name is required']"
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="groupDescription"
              label="Description (optional)"
              variant="outlined"
              rows="3"
              class="mb-4"
            ></v-textarea>

            <v-row class="mb-4">
              <v-col cols="6">
                <v-select
                  v-model="groupColor"
                  :items="colorOptions"
                  item-title="title"
                  item-value="value"
                  label="Color Theme"
                  variant="outlined"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon :color="item.value">mdi-circle</v-icon>
                      </template>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    <v-icon :color="item.value" class="mr-2">mdi-circle</v-icon>
                    {{ item.title }}
                  </template>
                </v-select>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="groupIcon"
                  :items="iconOptions"
                  item-title="title"
                  item-value="value"
                  label="Icon"
                  variant="outlined"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:prepend>
                        <v-icon>{{ item.value }}</v-icon>
                      </template>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    <v-icon class="mr-2">{{ item.value }}</v-icon>
                    {{ item.title }}
                  </template>
                </v-select>
              </v-col>
            </v-row>

            <v-select
              v-model="selectedDeviceIds"
              :items="deviceOptions"
              item-title="title"
              item-value="value"
              label="Select Devices"
              multiple
              variant="outlined"
              chips
              closable-chips
              @update:model-value="(value) => {
                console.log('Device selection changed:', value)
              }"
            >
              <template v-slot:chip="{ props, item }">
                <v-chip v-bind="props" :color="groupColor">
                  {{ item.title }}
                </v-chip>
              </template>
            </v-select>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!formValid"
            :loading="loading"
            @click="saveGroup"
          >
            {{ editingGroup ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, computed, onMounted } from 'vue'
import { useGroupStore } from '@/stores/group'
import { useDeviceStore } from '@/stores/device'
import { DeviceGroup } from '@shared/types'
import GroupCard from '@/components/GroupCard.vue'

const groupStore = useGroupStore()
const deviceStore = useDeviceStore()

const showCreateDialog = ref(false)
const editingGroup = ref<DeviceGroup | null>(null)
const formValid = ref(false)
const loading = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('info')

const groupFormRef = ref()
const selectedDeviceIds = ref<string[]>([])

// Use separate refs instead of nested object
const groupName = ref('')
const groupDescription = ref('')
const groupColor = ref('#00ffff')
const groupIcon = ref('mdi-group')

const colorOptions = [
  { title: 'Cyan', value: '#00ffff' },
  { title: 'Magenta', value: '#ff00ff' },
  { title: 'Green', value: '#00ff41' },
  { title: 'Orange', value: '#ffaa00' },
  { title: 'Blue', value: '#00aaff' },
  { title: 'Red', value: '#ff0066' }
]

const iconOptions = [
  { title: 'Group', value: 'mdi-group' },
  { title: 'Lightbulb', value: 'mdi-lightbulb-group' },
  { title: 'Home', value: 'mdi-home-group' },
  { title: 'Security', value: 'mdi-security' },
  { title: 'Entertainment', value: 'mdi-television-play' },
  { title: 'Kitchen', value: 'mdi-chef-hat' },
  { title: 'Bedroom', value: 'mdi-bed' },
  { title: 'Office', value: 'mdi-desk' }
]

const deviceOptions = computed(() => {
  const options = deviceStore.devices.map(device => ({
    title: device.name,
    value: device.id
  }))
  console.log('Device options:', options)
  return options
})

const editGroup = (group: DeviceGroup) => {
  editingGroup.value = group
  selectedDeviceIds.value = [...group.devices]
  groupName.value = group.name
  groupDescription.value = group.description || ''
  groupColor.value = group.color
  groupIcon.value = group.icon
  showCreateDialog.value = true
}

const deleteGroup = async (group: DeviceGroup) => {
  if (confirm(`Are you sure you want to delete "${group.name}"?`)) {
    try {
      await groupStore.deleteGroup(group.id)
      showSnackbar('Group deleted successfully', 'success')
    } catch (error) {
      showSnackbar('Failed to delete group', 'error')
    }
  }
}

const saveGroup = async () => {
  loading.value = true
  try {
    console.log('Form data - Name:', groupName.value)
    console.log('Form data - Description:', groupDescription.value)
    console.log('Form data - Color:', groupColor.value)
    console.log('Form data - Icon:', groupIcon.value)
    console.log('Form data - DeviceIds:', selectedDeviceIds.value)
    
    const groupData = {
      name: groupName.value,
      description: groupDescription.value,
      color: groupColor.value,
      icon: groupIcon.value,
      deviceIds: [...selectedDeviceIds.value]
    }
    console.log('Processed groupData:', groupData)
    
    if (editingGroup.value) {
      await groupStore.updateGroup(editingGroup.value.id, groupData)
      showSnackbar('Group updated successfully', 'success')
    } else {
      await groupStore.createGroup(groupData)
      showSnackbar('Group created successfully', 'success')
    }
    
    // Refresh the groups list to ensure we have the latest data
    await groupStore.fetchGroups()
    closeDialog()
  } catch (error) {
    console.error('Save group error:', error)
    showSnackbar('Failed to save group', 'error')
  } finally {
    loading.value = false
  }
}

const closeDialog = () => {
  showCreateDialog.value = false
  editingGroup.value = null
  selectedDeviceIds.value = []
  // Reset form fields
  groupName.value = ''
  groupDescription.value = ''
  groupColor.value = '#00ffff'
  groupIcon.value = 'mdi-group'
  console.log('Form reset')
}

const showSnackbar = (text: string, color: string) => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(() => {
  groupStore.fetchGroups()
  deviceStore.fetchDevices()
})
</script>