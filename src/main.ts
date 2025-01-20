import { createApp } from 'vue'
// import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import '@/assets/css/icon.css'
import '@/assets/css/all.min.css'
import '@/assets/css/font-awesome.min.css'
import '@/assets/css/bootstrap.min.css'
import '@/assets/css/owl.carousel.css'
import '@/assets/css/slick-theme.min.css'
import '@/assets/css/slick.min.css'
import '@/assets/css/aos.css'
import '@/assets/css/styles.css'
import '@/assets/css/responsive.css'
// import './assets/main.css'
import 'swiper/css'
// 如果需要其他swiper样式，也需要导入
import 'swiper/css/pagination'
import 'swiper/css/autoplay'

// import './assets/main.css'

const app = createApp(App)

// app.use(createPinia())
app.use(router)

app.mount('#app')
