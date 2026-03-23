import { createApp } from 'vue'
import { createPinia } from 'pinia'
// 1. 引入插件
import './style.css' // 或者是你存放 Tailwind 指令的檔案路徑
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './assets/theme.css'

const app = createApp(App)
const pinia = createPinia()

// 2. 讓 pinia 使用插件
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')