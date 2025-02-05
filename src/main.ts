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

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 添加Element Plus样式
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

const app = createApp(App)

// app.use(createPinia())
app.use(router)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 在应用配置中添加
app.use(ElementPlus)

app.mount('#app')
