<script setup>
// 设备详情页
// props 里的 id 来自路由参数 /devices/:id（因为路由表里写了 props: true）
defineProps({
  id: { type: String, default: '' },
})
// 第 6 步在这里实现：设备信息、巡检记录、故障列表
</script>

<template>
  <section class="page">
    <h2>设备详情</h2>
    <p class="muted">当前设备 ID：{{ id }}（第 6 步接入真实接口）</p>
  </section>
</template>
