import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Import global styles
import '../themes/light.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Mount when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const mountPoint = document.getElementById('app')
  if (mountPoint) {
    app.mount('#app')
  }
})

export default app
