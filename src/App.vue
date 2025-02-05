<template>
  <div class="app">
    <!-- 返回顶部 -->
    <BackTop v-if="!$route.meta.hideNavbar" />
    <!-- 导航栏 -->
    <NavigationBar v-if="!$route.meta.hideNavbar" />
    <!-- 内容 -->
    <main class="main-content">
      <router-view />
    </main>
    <!-- 页脚 -->
    <footer class="footer" v-if="!$route.meta.hideFooter">
      <FooterBar />
    </footer>
  </div>
</template>

<script setup lang="ts" name="App">
import NavigationBar from '@/components/NavigationBar.vue'
import FooterBar from '@/components/FooterBar.vue'
import BackTop from '@/components/BackTop.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 添加调试信息
console.log('当前路由meta信息:', route.meta)
</script>

<style>
.app {
  position: relative;
}
</style>
