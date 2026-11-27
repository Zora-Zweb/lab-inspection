<script setup>
import { computed } from 'vue'

// kind 区分是哪套枚举：device（normal/faulty）、fault（pending/processing/resolved）
// inspection（normal/abnormal）。详情页复用同一个组件。
const props = defineProps({
  kind: { type: String, default: 'device' },
  status: { type: String, default: '' },
})

const MAP = {
  device: {
    normal: { text: '正常', cls: 'ok' },
    faulty: { text: '故障', cls: 'bad' },
  },
  fault: {
    pending: { text: '待处理', cls: 'bad' },
    processing: { text: '处理中', cls: 'warn' },
    resolved: { text: '已解决', cls: 'ok' },
  },
  inspection: {
    normal: { text: '正常', cls: 'ok' },
    abnormal: { text: '异常', cls: 'warn' },
  },
}

// 遇到契约里没定义的取值时不崩溃，原样显示
const info = computed(
  () => MAP[props.kind]?.[props.status] || { text: props.status || '未知', cls: 'muted' },
)
</script>

<template>
  <span class="tag" :class="info.cls">{{ info.text }}</span>
</template>

<style scoped>
.tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 18px;
  border-radius: 10px;
}
.ok {
  color: #0f7b3f;
  background: #e8f7ee;
}
.bad {
  color: #b42318;
  background: #fdecea;
}
.warn {
  color: #8a5300;
  background: #fff4e5;
}
.muted {
  color: #6b7280;
  background: #f3f4f6;
}
</style>
