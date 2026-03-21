import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 1. 引入插件
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// 2. 讓 pinia 使用插件
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')