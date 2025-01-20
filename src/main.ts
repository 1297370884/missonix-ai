import { createApp } from 'vue'
// import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 基础样式
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// Font Awesome (建议通过npm安装)
import '@fortawesome/fontawesome-free/css/all.min.css'

// Swiper样式
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'

// AOS动画
import 'aos/dist/aos.css'

// 自定义样式
import '@/assets/css/styles.css'
import '@/assets/css/responsive.css'

// import './assets/main.css'

const app = createApp(App)

// app.use(createPinia())
app.use(router)

app.mount('#app')
