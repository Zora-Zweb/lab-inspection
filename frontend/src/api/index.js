import http from './http'
import {
  mockCreateInspection,
  mockGetDeviceDetail,
  mockGetDevices,
  mockGetStats,
  mockUpdateFaultStatus,
} from './mock'

// 开发开关：.env.local 里写 VITE_USE_MOCK=true 时走本地假数据
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// 3.4 健康检查：确认前后端是否连通
export function getHealth() {
  return http.get('/health')
}

// 5.1 设备列表（成员 C）：keyword 搜索、status 筛选、分页
export function getDevices(params = {}) {
  if (USE_MOCK) return mockGetDevices(params)
  return http.get('/devices', { params })
}

// 3.1 设备详情（成员 A）：返回 { device, inspections, faults }
export function getDeviceDetail(id) {
  if (USE_MOCK) return mockGetDeviceDetail(id)
  return http.get(`/devices/${id}`)
}

// 3.2 登记巡检（成员 A）
export function createInspection(deviceId, payload) {
  if (USE_MOCK) return mockCreateInspection(deviceId, payload)
  return http.post(`/devices/${deviceId}/inspections`, payload)
}

// 3.3 更新故障状态（成员 A）
export function updateFaultStatus(faultId, status) {
  if (USE_MOCK) return mockUpdateFaultStatus(faultId, status)
  return http.patch(`/faults/${faultId}/status`, { status })
}

// 5.2 首页统计（成员 C）
export function getStats() {
  if (USE_MOCK) return mockGetStats()
  return http.get('/stats')
}
