<script setup>
// 根组件：顶部导航 + 路由出口
// RouterLink / RouterView 由 vue-router 全局注册，不需要 import
</script>

<template>
  <header class="app-header">
    <RouterLink class="brand" to="/">实验室设备巡检平台</RouterLink>
    <nav class="nav">
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/devices">设备列表</RouterLink>
    </nav>
  </header>

  <main class="app-main">
    <!-- 这里就是“路由出口”：URL 匹配到哪个组件，就渲染在这里 -->
    <RouterView />
  </main>
</template>
