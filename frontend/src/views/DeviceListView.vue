<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDevices } from '../api'
import StatusTag from '../components/StatusTag.vue'

const router = useRouter()

// 查询条件：内部用驼峰命名，发请求时再转成契约里的 page_size
const query = reactive({
  keyword: '',
  status: '',
  page: 1,
  pageSize: 10,
})

const items = ref([])
const total = ref(0)
const loading = ref(false)
const errorMessage = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / query.pageSize)))

async function load() {
  loading.value = true
  errorMessage.value = ''
  try {
    // 空字符串传过去会变成 keyword=，用 undefined 才能让这个参数不出现在 URL 上
    const data = await getDevices({
      keyword: query.keyword.trim() || undefined,
      status: query.status || undefined,
      page: query.page,
      page_size: query.pageSize,
    })
    items.value = data.items
    total.value = data.total
  } catch (e) {
    // e.message 是请求层翻译好的中文，可以直接展示
    errorMessage.value = e.message
    items.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 换了搜索条件必须回到第 1 页，否则可能停在一个不存在的页码上
function search() {
  query.page = 1
  load()
}

function reset() {
  query.keyword = ''
  query.status = ''
  query.page = 1
  load()
}

function goPage(page) {
  if (page < 1 || page > totalPages.value || page === query.page) return
  query.page = page
  load()
}

function openDetail(id) {
  router.push({ name: 'device-detail', params: { id } })
}

onMounted(load)
</script>

<template>
  <section class="page">
    <header class="page-head">
      <h2>设备列表</h2>
      <span class="count">共 {{ total }} 台</span>
    </header>

    <div class="toolbar">
      <input
        v-model="query.keyword"
        class="input"
        type="search"
        placeholder="搜索设备名称或型号"
        @keyup.enter="search"
      />
      <select v-model="query.status" class="input select">
        <option value="">全部状态</option>
        <option value="normal">正常</option>
        <option value="faulty">故障</option>
      </select>
      <button class="btn primary" :disabled="loading" @click="search">搜索</button>
      <button class="btn" :disabled="loading" @click="reset">重置</button>
    </div>

    <!-- 请求失败时把后端/请求层的提示展示出来 -->
    <p v-if="errorMessage" class="alert">{{ errorMessage }}</p>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>设备名称</th>
            <th>型号</th>
            <th>位置</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id" class="row" @click="openDetail(item.id)">
            <td>{{ item.name }}</td>
            <td class="mono">{{ item.model }}</td>
            <td>{{ item.location }}</td>
            <td>
              <StatusTag :status="item.status" />
            </td>
            <td>
              <button class="btn link" @click.stop="openDetail(item.id)">查看</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="loading" class="hint">正在加载…</p>
      <p v-else-if="!items.length" class="hint">没有符合条件的设备，试试调整搜索条件。</p>
    </div>

    <div class="pager">
      <button class="btn" :disabled="query.page <= 1 || loading" @click="goPage(query.page - 1)">
        上一页
      </button>
      <span class="pager-info">第 {{ query.page }} / {{ totalPages }} 页</span>
      <button
        class="btn"
        :disabled="query.page >= totalPages || loading"
        @click="goPage(query.page + 1)"
      >
        下一页
      </button>
    </div>
  </section>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
}
.page-head h2 {
  margin: 0;
}
.count {
  color: #6b7280;
  font-size: 14px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.input {
  height: 34px;
  padding: 0 10px;
  font-size: 14px;
  color: #1f2328;
  background: #fff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
}
.input:focus {
  border-color: #2563eb;
  outline: none;
}
.select {
  min-width: 120px;
}

.btn {
  height: 34px;
  padding: 0 14px;
  font-size: 14px;
  color: #1f2328;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d0d7de;
  border-radius: 6px;
}
.btn:hover:not(:disabled) {
  background: #f6f7f9;
}
.btn:disabled {
  color: #9ca3af;
  cursor: not-allowed;
}
.btn.primary {
  color: #fff;
  background: #2563eb;
  border-color: #2563eb;
}
.btn.primary:hover:not(:disabled) {
  background: #1d4ed8;
}
.btn.link {
  height: auto;
  padding: 0;
  color: #2563eb;
  background: none;
  border: none;
}

.alert {
  padding: 10px 12px;
  margin: 0 0 12px;
  color: #b42318;
  background: #fdecea;
  border: 1px solid #f5c2c0;
  border-radius: 6px;
}

.table-wrap {
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.table th,
.table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #f0f1f3;
}
.table th {
  font-weight: 600;
  color: #4b5563;
  background: #fafbfc;
}
.row {
  cursor: pointer;
}
.row:hover {
  background: #f8fafc;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
}

.hint {
  padding: 24px;
  margin: 0;
  color: #6b7280;
  text-align: center;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}
.pager-info {
  font-size: 14px;
  color: #4b5563;
}
</style>
