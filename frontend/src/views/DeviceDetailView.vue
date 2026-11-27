<script setup>
import { onMounted, ref, watch } from 'vue'
import { getDeviceDetail } from '../api'
import StatusTag from '../components/StatusTag.vue'
import { formatDateTime } from '../utils/format'

const props = defineProps({
  id: { type: String, default: '' },
})

const device = ref(null)
const inspections = ref([])
const faults = ref([])
const loading = ref(true)
const errorMessage = ref('')

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await getDeviceDetail(props.id)
    device.value = data.device
    inspections.value = data.inspections
    faults.value = data.faults
  } catch (e) {
    errorMessage.value = e.message
    device.value = null
    inspections.value = []
    faults.value = []
  } finally {
    loading.value = false
  }
}

// 关键：从 /devices/3 点"返回列表"再点另一台时，路由变了但组件会被复用，
// onMounted 不会重新执行，所以必须监听 id 变化重新拉数据
watch(() => props.id, load)

onMounted(load)
</script>

<template>
  <section class="page">
    <RouterLink class="back" to="/devices">← 返回设备列表</RouterLink>

    <p v-if="loading" class="hint">正在加载…</p>
    <p v-else-if="errorMessage" class="alert">{{ errorMessage }}</p>

    <template v-else-if="device">
      <!-- 设备基本信息 -->
      <header class="head">
        <h2>{{ device.name }}</h2>
        <StatusTag :status="device.status" />
      </header>

      <dl class="info">
        <div>
          <dt>设备编号</dt>
          <dd>#{{ device.id }}</dd>
        </div>
        <div>
          <dt>型号</dt>
          <dd class="mono">{{ device.model }}</dd>
        </div>
        <div>
          <dt>存放位置</dt>
          <dd>{{ device.location }}</dd>
        </div>
        <div>
          <dt>建档时间</dt>
          <dd>{{ formatDateTime(device.created_at) }}</dd>
        </div>
      </dl>

      <!-- 故障记录 -->
      <h3 class="section-title">故障记录 <span class="badge">{{ faults.length }}</span></h3>
      <ul v-if="faults.length" class="fault-list">
        <li v-for="fault in faults" :key="fault.id" class="fault">
          <div class="fault-main">
            <p class="fault-desc">{{ fault.description }}</p>
            <p class="fault-meta">最近更新：{{ formatDateTime(fault.updated_at) }}</p>
          </div>
          <StatusTag kind="fault" :status="fault.status" />
        </li>
      </ul>
      <p v-else class="hint">暂无故障记录。</p>

      <!-- 巡检记录 -->
      <h3 class="section-title">巡检记录 <span class="badge">{{ inspections.length }}</span></h3>
      <ul v-if="inspections.length" class="timeline">
        <li v-for="item in inspections" :key="item.id" class="timeline-item">
          <div class="timeline-head">
            <StatusTag kind="inspection" :status="item.result" />
            <span class="timeline-time">{{ formatDateTime(item.created_at) }}</span>
          </div>
          <p class="timeline-remark">{{ item.remark || '（无备注）' }}</p>
          <p class="timeline-meta">巡检人：{{ item.inspector }}</p>
        </li>
      </ul>
      <p v-else class="hint">暂无巡检记录。</p>
    </template>
  </section>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 14px;
  font-size: 14px;
  color: #2563eb;
  text-decoration: none;
}
.back:hover {
  text-decoration: underline;
}

.head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.head h2 {
  margin: 0;
}

.info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  padding: 16px;
  margin: 0 0 24px;
  background: #fafbfc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.info dt {
  font-size: 12px;
  color: #6b7280;
}
.info dd {
  margin: 4px 0 0;
  font-size: 14px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  font-size: 15px;
}
.badge {
  padding: 0 7px;
  font-size: 12px;
  line-height: 18px;
  color: #4b5563;
  background: #f0f1f3;
  border-radius: 9px;
}

.fault-list,
.timeline {
  padding: 0;
  margin: 0 0 24px;
  list-style: none;
}

.fault {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-left: 3px solid #f0b429;
  border-radius: 6px;
}
.fault-desc {
  margin: 0 0 4px;
  font-size: 14px;
}
.fault-meta {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.timeline-item {
  padding: 12px 14px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}
.timeline-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.timeline-time {
  font-size: 12px;
  color: #6b7280;
}
.timeline-remark {
  margin: 0 0 4px;
  font-size: 14px;
}
.timeline-meta {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}

.alert {
  padding: 10px 12px;
  margin: 0;
  color: #b42318;
  background: #fdecea;
  border: 1px solid #f5c2c0;
  border-radius: 6px;
}

.hint {
  padding: 20px 0;
  margin: 0 0 20px;
  color: #6b7280;
  text-align: center;
}
</style>
