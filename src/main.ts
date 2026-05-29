
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { createPinia } from 'pinia'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import ToastService from 'primevue/toastservice'

import App from './App.vue'
import router from './router'

const MyTheme = definePreset(Aura, {
  semantic: {
    /* 1. Custom Brand Primary Scale (Based on #7ab342 Green) */
    primary: {
      50: '#f4f8ef',
      100: '#e5f0dc',
      200: '#cae0b8',
      300: '#a7cb8d',
      400: '#87b366',
      500: '#7ab342', // Main Brand Green
      600: '#6a9c39', // Hover Green
      700: '#527c2a',
      800: '#436324',
      900: '#385320',
      950: '#1d2e0f'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}'
        },
        highlight: {
          background: '{primary.500}',
          focusBackground: '{primary.600}',
          color: '#ffffff',
          focusColor: '#ffffff'
        },
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}'
        },
        formField: {
          background: '#ffffff',
          borderColor: 'transparent',
          hoverBorderColor: 'rgba(255, 255, 255, 0.4)',
          focusBorderColor: 'rgba(255, 255, 255, 0.8)',
          color: '{surface.900}',
          placeholderColor: '{surface.400}'
        }
      },
      dark: {
        primary: {
          color: '{primary.400}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.300}',
          activeColor: '{primary.200}'
        },
        highlight: {
          background: '{primary.400}',
          focusBackground: '{primary.300}',
          color: '#ffffff',
          focusColor: '#ffffff'
        },
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}'
        },
        formField: {
          background: 'rgba(255, 255, 255, 0.1)', // Frosty white for dark mode inputs
          borderColor: 'transparent',
          hoverBorderColor: 'rgba(255, 255, 255, 0.3)',
          focusBorderColor: 'rgba(255, 255, 255, 0.5)',
          color: '{surface.0}',
          placeholderColor: 'rgba(255, 255, 255, 0.6)'
        }
      }
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: 'rgba(255, 255, 255, 0.6)',
      offset: '0',
      shadow: 'none'
    }
  },
  components: {
    inputtext: {
      root: {
        borderRadius: '2rem',
        paddingY: '0.8rem',
        paddingX: '1.5rem'
      }
    },
    button: {
      root: {
        borderRadius: '2rem',
        paddingY: '0.75rem',
        paddingX: '3rem'
      }
    },
    card: {
      root: {
        borderRadius: '1.5rem',
        shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
      },
      colorScheme: {
        light: {
          root: {
            background: 'rgba(255, 255, 255, 0.15)',
            color: '#ffffff'
          },
          subtitle: {
            color: '#e2e8f0'
          }
        },
        dark: {
          root: {
            background: 'rgba(0, 0, 0, 0.25)',
            color: '#ffffff'
          },
          subtitle: {
            color: '#cbd5e1'
          }
        }
      }
    },
    divider: {
      colorScheme: {
        light: {
          root: {
            borderColor: '{surface.700}'
          }
        }
      }
    },
    menu: {
      submenuLabel: {
        fontWeight: 'bold',
        color: 'black'
      },
      colorScheme: {
        light: {
          root: {
            background: '{surface.300}',
            color: 'black'
          }
        }
      }
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: MyTheme,
    options: {
      darkModeSelector: '.my-app-dark'
    }
  }
});
app.use(ToastService)
app.mount('#app')
