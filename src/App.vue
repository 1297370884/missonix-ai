<template>
  <div class="app">
    <!-- 返回顶部 -->
    <BackTop />
    <!-- 导航栏 -->
    <NavigationBar />
    <!-- 内容 -->
    <main class="main-content">
      <router-view />
    </main>
    <!-- 页脚 -->
    <footer class="footer">
      <FooterBar />
    </footer>
  </div>
</template>

<script setup lang="ts" name="App">
import NavigationBar from '@/components/NavigationBar.vue'
import FooterBar from '@/components/FooterBar.vue'
import BackTop from '@/components/BackTop.vue'
</script>

<style>
.app {
  position: relative;
}
</style>
