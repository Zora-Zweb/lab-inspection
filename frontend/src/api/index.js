import http from './http'

// 3.4 健康检查：确认前后端是否连通
export function getHealth() {
  return http.get('/health')
}

// 5.1 设备列表（成员 C）：keyword 搜索、status 筛选、分页
export function getDevices(params = {}) {
  return http.get('/devices', { params })
}

// 3.1 设备详情（成员 A）：返回 { device, inspections, faults }
export function getDeviceDetail(id) {
  return http.get(`/devices/${id}`)
}

// 3.2 登记巡检（成员 A）
export function createInspection(deviceId, payload) {
  return http.post(`/devices/${deviceId}/inspections`, payload)
}

// 3.3 更新故障状态（成员 A）
export function updateFaultStatus(faultId, status) {
  return http.patch(`/faults/${faultId}/status`, { status })
}

// 5.2 首页统计（成员 C，字段待定，先透传）
export function getStats() {
  return http.get('/stats')
}
