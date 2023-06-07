import { createApp } from 'vue'
import Watermark from '@watermarkify/vue-watermark'
import './style.css'
import App from './App.vue'

const app = createApp(App)
app.use(Watermark())
app.mount('#app')
