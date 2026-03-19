import { createApp } from 'vue'
import { createPinia } from 'pinia' // 引入大腦工廠
import './style.css'
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia() // 創建大腦實例

app.use(pinia) // 告訴 App：你要使用這個大腦
app.mount('#app')