<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { createInspection, getDeviceDetail, updateFaultStatus } from '../api'
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
// ---------- 登记巡检 ----------
const formOpen = ref(false)
const submitting = ref(false)
const formError = ref('')
const successMessage = ref('')
const form = reactive({ result: 'normal', inspector: '', remark: '' })

function resetForm() {
  form.result = 'normal'
  form.inspector = ''
  form.remark = ''
  formError.value = ''
}

function toggleForm() {
  if (formOpen.value) {
    formOpen.value = false
    resetForm()
  } else {
    formOpen.value = true
  }
}

async function submit() {
  formError.value = ''
  successMessage.value = ''

  // 前端先挡一遍明显错误，减少无效请求；后端仍会校验
  const inspector = form.inspector.trim()
  if (!inspector) {
    formError.value = '请填写巡检人'
    return
  }
  if (inspector.length > 32) {
    formError.value = '巡检人最多 32 个字符'
    return
  }
  if (form.remark.length > 200) {
    formError.value = '备注最多 200 个字符'
    return
  }

  submitting.value = true
  try {
    const created = await createInspection(props.id, {
      result: form.result,
      inspector,
      remark: form.remark.trim(),
    })
    // 契约 3.1：巡检按时间倒序，新记录插到最前面
    inspections.value = [created, ...inspections.value]
    successMessage.value = '巡检记录已保存'
    formOpen.value = false
    resetForm()
    // 3 秒后自动收起提示
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (e) {
    // 后端返回的 400 中文原因，直接展示在表单里
    formError.value = e.message
  } finally {
    submitting.value = false
  }
}
// ---------- 更新故障状态 ----------
// 契约 1.4：三个状态，3.3 说明暂不限制流转方向，可任意互改
const FAULT_STATUS_OPTIONS = [
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
]

const savingFaultId = ref(null)
const faultError = ref('')

async function changeFaultStatus(fault, nextStatus) {
  if (nextStatus === fault.status) return

  const prevStatus = fault.status
  fault.status = nextStatus // 乐观更新：先让界面立刻响应
  savingFaultId.value = fault.id
  faultError.value = ''

  try {
    const updated = await updateFaultStatus(fault.id, nextStatus)
    // 以服务端返回的为准，updated_at 会变
    fault.status = updated.status
    fault.updated_at = updated.updated_at
  } catch (e) {
    fault.status = prevStatus // 失败必须回滚，否则界面和后端说的不是一回事
    faultError.value = e.message
  } finally {
    savingFaultId.value = null
  }
}

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
            <select
            class="status-select"
            :value="fault.status"
            :disabled="savingFaultId === fault.id"
            @change="changeFaultStatus(fault, $event.target.value)"
          >
            <option v-for="opt in FAULT_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </li>
      </ul>
      <p v-else class="hint">暂无故障记录。</p>
            <p v-if="faultError" class="form-error">{{ faultError }}</p>

            <!-- 巡检记录 -->
      <div class="section-head">
        <h3 class="section-title">巡检记录 <span class="badge">{{ inspections.length }}</span></h3>
        <button class="btn" @click="toggleForm">{{ formOpen ? '收起' : '登记巡检' }}</button>
      </div>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <!-- 登记巡检表单 -->
      <form v-if="formOpen" class="inspection-form" @submit.prevent="submit">
        <div class="field">
          <span class="label">巡检结果</span>
          <div class="radios">
            <label><input v-model="form.result" type="radio" value="normal" /> 正常</label>
            <label><input v-model="form.result" type="radio" value="abnormal" /> 异常</label>
          </div>
        </div>

        <div class="field">
          <label class="label" for="inspector">巡检人</label>
          <input
            id="inspector"
            v-model="form.inspector"
            class="input"
            maxlength="32"
            placeholder="例如：张同学"
          />
          <span class="hint-inline">{{ form.inspector.length }}/32</span>
        </div>

        <div class="field">
          <label class="label" for="remark">备注</label>
          <textarea
            id="remark"
            v-model="form.remark"
            class="input textarea"
            rows="3"
            maxlength="200"
            placeholder="选填，例如：带载后电压不稳"
          ></textarea>
          <span class="hint-inline">{{ form.remark.length }}/200</span>
        </div>

        <p v-if="formError" class="form-error">{{ formError }}</p>

        <div class="actions">
          <button class="btn primary" type="submit" :disabled="submitting">
            {{ submitting ? '提交中…' : '提交' }}
          </button>
          <button class="btn" type="button" :disabled="submitting" @click="toggleForm">取消</button>
        </div>
      </form>
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
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 12px;
}
.section-head .section-title {
  margin: 0;
}

.success {
  padding: 8px 12px;
  margin: 0 0 12px;
  font-size: 14px;
  color: #0f7b3f;
  background: #e8f7ee;
  border: 1px solid #cdebd8;
  border-radius: 6px;
}

.inspection-form {
  padding: 16px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.field {
  margin-bottom: 14px;
}
.label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}
.radios {
  display: flex;
  gap: 18px;
  font-size: 14px;
}
.radios label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}
.textarea {
  display: block;
  width: 100%;
  height: auto;
  padding: 8px 10px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
}
.hint-inline {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
}
.form-error {
  padding: 8px 12px;
  margin: 0 0 12px;
  font-size: 14px;
  color: #b42318;
  background: #fdecea;
  border-radius: 6px;
}
.actions {
  display: flex;
  gap: 8px;
}
.status-select {
  padding: 4px 8px;
  font-size: 13px;
  color: #1f2328;
  background: #fff;
  border: 1px solid #d0d5dd;
  border-radius: 6px;
  cursor: pointer;
}
.status-select:disabled {
  color: #9ca3af;
  cursor: progress;
}
</style>
