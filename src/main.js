import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Vant from 'vant'
import 'vant/lib/index.css'
import './style.css'
import App from './App.vue'
import router from './router/index'

const app = createApp(App)
const pinia = createPinia()

// 挂载全局router、pinia和UI组件库
app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.use(Vant)
app.mount('#app')