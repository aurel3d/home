<template>
  <v-app>
    <v-app-bar :elevation="0" class="cyberpunk-bar">
      <v-app-bar-nav-icon @click="drawer = !drawer" color="primary"></v-app-bar-nav-icon>
      <v-app-bar-title class="cyberpunk-title">⚡ NEURAL HOME CONTROL ⚡</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme" color="secondary">
        <v-icon>{{ isCyberpunk ? 'mdi-lightbulb-outline' : 'mdi-creation' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme()
const drawer = ref(false)

const isCyberpunk = computed(() => theme.global.name.value === 'cyberpunk')

const navigationItems = [
  { title: 'NEURAL CORE', icon: 'mdi-brain', to: '/' },
  { title: 'TECH MATRIX', icon: 'mdi-wifi', to: '/devices' },
  { title: 'SECTORS', icon: 'mdi-lan', to: '/rooms' },
  { title: 'SYS CONFIG', icon: 'mdi-cog-outline', to: '/settings' },
]

const toggleTheme = () => {
  theme.global.name.value = isCyberpunk.value ? 'light' : 'cyberpunk'
}
</script>