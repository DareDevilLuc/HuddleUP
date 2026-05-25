
import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { createPinia } from 'pinia'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'


import App from './App.vue'
import router from './router'

const MyTheme = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
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
    }
 });
app.mount('#app')
