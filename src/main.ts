
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { createPinia } from 'pinia'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'


import App from './App.vue'
import router from './router'

const MyTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '{green.50}',
      100: '{green.100}',
      200: '{green.200}',
      300: '{green.300}',
      400: '{green.400}',
      500: '{green.500}',
      600: '{green.600}',
      700: '{green.700}',
      800: '{green.800}',
      900: '{green.900}',
      950: '{green.950}'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{green.900}',
          contrastColor: '#ffffff',
          hoverColor: '{green.600}',
          activeColor: '{green.700}'
        },
        highlight: {
          background: '{green.500}',
          focusBackground: '{green.600}',
          color: '#ffffff',
          focusColor: '#ffffff'
        },
        surface: {
          0:   '#ffffff',
          50:  '{zinc.50}',
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
          borderColor: '{surface.400}',
          hoverBorderColor: '{indigo.500}',
          focusBorderColor: '{indigo.700}',
          color: '{indigo.700}',
          placeholderColor: '{indigo.300}',
        }
      },
      dark: {
        primary: {
          color: '{green.400}',
          contrastColor: '#ffffff',
          hoverColor: '{green.300}',
          activeColor: '{green.200}'
        },
        highlight: {
          background: '{green.400}',
          focusBackground: '{green.300}',
          color: '#ffffff',
          focusColor: '#ffffff'
        },
        surface: {
          0:   '#ffffff',
          50:  '{slate.50}',
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
          borderColor: '{indigo.400}',
          hoverBorderColor: '{indigo.300}',
          focusBorderColor: '{indigo.300}',
          color: '{indigo.200}',
          placeholderColor: '{indigo.400}',
        }
      }
    },
    focusRing: {
      width: '0',
      style: 'none',
      color: 'transparent',
      offset: '0',
      shadow: 'none'
    }
  },
  components: {
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
    },

    card: {
      colorScheme: {
        light: {
          root: {
            background: '{surface.300}',
            color: '{surface.0}'
          },
          subtitle: {
            color: '{surface.300}'
          }
        },
        dark: {
          root: {
            background: '{surface.200}',
            color: '{surface.900}'
          },
          subtitle: {
            color: '{surface.500}'
          }
        }
      }
    },
    floatlabel: {
      colorScheme: {
        light: {
          root: {
            color: '{surface.900}',
            focusColor: '{indigo.600}',
            activeColor: '{indigo.700}',
          }
        },
        dark: {
          root: {
            color: '{surface.400}',
            focusColor: '{indigo.300}',
            activeColor: '{indigo.300}',
          }
        }
      }
    }
  },
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
app.mount('#app')
