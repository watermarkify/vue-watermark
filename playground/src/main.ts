import Watermark from '@watermarkify/vue-watermark'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import 'virtual:windi.css'

const app = createApp(App)
app.use(Watermark())
app.mount('#app')
