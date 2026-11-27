<script setup>
import { computed, onMounted, ref } from 'vue'
import { getStats } from '../api'

const stats = ref(null)
const loading = ref(true)
const errorMessage = ref('')

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    stats.value = await getStats()
  } catch (e) {
    errorMessage.value = e.message
    stats.value = null
  } finally {
    loading.value = false
  }
}

// 契约 5.2 的 6 个字段，全部 ?? 0 兜底
const cards = computed(() => {
  const s = stats.value || {}
  return [
    { label: '设备总数', value: s.device_total ?? 0, tone: 'plain' },
    { label: '正常设备', value: s.device_normal ?? 0, tone: 'success' },
    { label: '故障设备', value: s.device_faulty ?? 0, tone: 'danger' },
    { label: '待处理故障', value: s.fault_pending ?? 0, tone: 'danger' },
    { label: '处理中故障', value: s.fault_processing ?? 0, tone: 'warning' },
    { label: '已解决故障', value: s.fault_resolved ?? 0, tone: 'success' },
  ]
})

onMounted(load)
</script>

<template>
  <section class="page">
    <div class="head">
      <h2>运行概览</h2>
      <button class="btn" :disabled="loading" @click="load">刷新</button>
    </div>

    <p v-if="loading" class="hint">正在加载…</p>
    <p v-else-if="errorMessage" class="alert">{{ errorMessage }}</p>

    <div v-else class="cards">
      <div v-for="card in cards" :key="card.label" class="card" :class="card.tone">
        <span class="card-value">{{ card.value }}</span>
        <span class="card-label">{{ card.label }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.head h2 {
  margin: 0;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-left: 3px solid #d0d5dd;
  border-radius: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  line-height: 1.1;
}

.card-label {
  font-size: 13px;
  color: #6b7280;
}

.card.danger {
  border-left-color: #d92d20;
}
.card.danger .card-value {
  color: #b42318;
}

.card.warning {
  border-left-color: #f0b429;
}
.card.warning .card-value {
  color: #8a5a00;
}

.card.success {
  border-left-color: #12b76a;
}
.card.success .card-value {
  color: #0f7b3f;
}
</style>
