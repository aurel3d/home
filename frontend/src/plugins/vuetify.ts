import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'cyberpunk',
    themes: {
      cyberpunk: {
        dark: true,
        colors: {
          background: '#0a0a0a',
          surface: '#111111',
          'surface-bright': '#1a1a1a',
          'surface-light': '#222222',
          'surface-variant': '#1e1e1e',
          'on-surface-variant': '#00ffff',
          primary: '#00ffff',
          'primary-darken-1': '#00d4d4',
          secondary: '#ff00ff',
          'secondary-darken-1': '#d400d4',
          accent: '#00ff41',
          error: '#ff0066',
          info: '#00aaff',
          success: '#00ff41',
          warning: '#ffaa00',
          'on-background': '#00ffff',
          'on-surface': '#00ffff',
          'on-primary': '#000000',
          'on-secondary': '#000000',
          'on-error': '#000000',
          'on-info': '#000000',
          'on-success': '#000000',
          'on-warning': '#000000',
        },
      },
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
    },
  },
})