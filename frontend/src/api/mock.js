// 成员 C 的 GET /api/devices 尚未实现，这里按 docs/api.md 5.1 的契约造一份假数据，
// 让列表页先跑通搜索、筛选、分页。C 的接口合并后，把 .env.local 里的开关关掉即可。
const RAW = [
  ['数字示波器 DS1104Z', 'DS1104Z', 'A-101', 'normal'],
  ['函数信号发生器 DG1022Z', 'DG1022Z', 'A-101', 'normal'],
  ['直流稳压电源 DP832', 'DP832', 'A-102', 'faulty'],
  ['数字万用表 34461A', '34461A', 'A-102', 'normal'],
  ['频谱分析仪 DSA815', 'DSA815', 'A-103', 'normal'],
  ['逻辑分析仪 LA1016', 'LA1016', 'A-103', 'faulty'],
  ['电子负载 IT8512+', 'IT8512+', 'B-201', 'normal'],
  ['恒温焊台 936', '936', 'B-201', 'normal'],
  ['热风枪 858D', '858D', 'B-201', 'faulty'],
  ['LCR 数字电桥 TH2822', 'TH2822', 'B-202', 'normal'],
  ['直流电源 E3631A', 'E3631A', 'B-202', 'normal'],
  ['示波器探头套件 PP215', 'PP215', 'A-101', 'normal'],
  ['任意波形发生器 AFG3102', 'AFG3102', 'A-104', 'normal'],
  ['数据采集卡 USB-6363', 'USB-6363', 'C-301', 'normal'],
  ['温湿度记录仪 TH20R', 'TH20R', 'C-301', 'faulty'],
  ['变频电源 61501', '61501', 'C-302', 'normal'],
  ['交流电源 AC6801', 'AC6801', 'C-302', 'normal'],
  ['电机测试台 MC-200', 'MC-200', 'D-401', 'normal'],
  ['扭矩传感器 T40B', 'T40B', 'D-401', 'normal'],
  ['激光测距仪 GLM50', 'GLM50', 'D-402', 'normal'],
  ['红外热像仪 E8', 'E8', 'D-402', 'faulty'],
  ['单片机开发板 STM32F407', 'STM32F407', 'E-501', 'normal'],
  ['嵌入式仿真器 J-Link V11', 'J-Link V11', 'E-501', 'normal'],
  ['网络分析仪 E5071C', 'E5071C', 'E-502', 'normal'],
  ['绝缘电阻测试仪 1508', '1508', 'E-502', 'normal'],
  ['钳形表 F319', 'F319', 'E-503', 'faulty'],
]

const DEVICES = RAW.map(([name, model, location, status], i) => ({
  id: i + 1,
  name,
  model,
  location,
  status,
  created_at: `2026-11-${String((i % 28) + 1).padStart(2, '0')}T08:30:00+00:00`,
}))

// 返回结构与契约 5.1 完全一致：{ items, total, page, page_size }
export async function mockGetDevices({ keyword = '', status = '', page = 1, page_size = 20 } = {}) {
  // 加一点延迟，方便看清"加载中"状态
  await new Promise((resolve) => setTimeout(resolve, 250))

  let list = DEVICES
  const kw = String(keyword).trim().toLowerCase()
  // 契约 5.1：keyword 模糊匹配 name、model、location，不区分大小写
  if (kw) {
    list = list.filter(
      (d) =>
        d.name.toLowerCase().includes(kw) ||
        d.model.toLowerCase().includes(kw) ||
        d.location.toLowerCase().includes(kw),
    )
  }
  if (status) {
    list = list.filter((d) => d.status === status)
  }

  const total = list.length
  const start = (page - 1) * page_size
  return {
    items: list.slice(start, start + page_size),
    total,
    page,
    page_size,
  }
}

const INSPECTORS = ['李同学', '张同学', '王同学', '赵同学']
const REMARK_NORMAL = ['自检通过', '外观完好，运行正常', '开机自检正常']
const REMARK_ABNORMAL = ['带载后电压不稳', '散热风扇有异响', '读数漂移偏大']
const FAULT_DESC = ['带载后输出电压不稳定，掉压明显', '开机自检不通过，报警灯常亮']

// 生成 UTC 时间的 ISO 字符串，和契约 1.5 的格式保持一致
function iso(day, hour, minute) {
  return new Date(Date.UTC(2026, 10, day, hour, minute)).toISOString()
}

// 故障状态的"持久化"：{ [faultId]: 'processing' }
const FAULT_KEY = 'mock-fault-status'

function loadFaultStatus() {
  try {
    return JSON.parse(sessionStorage.getItem(FAULT_KEY)) || {}
  } catch {
    return {}
  }
}

// 故障列表：id 末位区分两条记录，状态用 sessionStorage 覆盖，改动才留得住
function buildFaults(device) {
  if (device.status !== 'faulty') return []
  const overrides = loadFaultStatus()
  const base = [
    {
      id: device.id * 10 + 1,
      device_id: device.id,
      description: FAULT_DESC[device.id % FAULT_DESC.length],
      status: 'pending',
      updated_at: iso(24, 9, 20),
    },
    {
      id: device.id * 10 + 2,
      device_id: device.id,
      description: '按键接触不良，已更换前面板',
      status: 'resolved',
      updated_at: iso(12, 14, 5),
    },
  ]
  return base.map((f) => (overrides[f.id] ? { ...f, status: overrides[f.id] } : f))
}

// 详情接口的假数据：device + inspections + faults
export async function mockGetDeviceDetail(id) {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const device = DEVICES.find((d) => d.id === Number(id))
  // 契约 3.1：设备不存在返回 404，这里抛错让上层走 catch
  if (!device) {
    const err = new Error(`设备不存在：id=${id}`)
    err.code = 404
    throw err
  }

  // 每台设备 3 条巡检记录，故障设备的最新一条是 abnormal
  const inspections = Array.from({ length: 3 }, (_, k) => {
    const abnormal = device.status === 'faulty' && k === 0
    return {
      id: device.id * 100 + k,
      device_id: device.id,
      result: abnormal ? 'abnormal' : 'normal',
      remark: abnormal
        ? REMARK_ABNORMAL[device.id % REMARK_ABNORMAL.length]
        : REMARK_NORMAL[device.id % REMARK_NORMAL.length],
      inspector: INSPECTORS[(device.id + k) % INSPECTORS.length],
      created_at: iso(25 - k * 4, 9 + k, 30),
    }
  })

  // 故障设备给两条：一条待处理、一条已解决（后面第 8 步正好有东西可改状态）
  const faults = buildFaults(device)

  // 把本次会话中新登记的巡检合并到最前面
  const extra = loadExtra()[device.id] || []
  return { device, inspections: [...extra, ...inspections], faults }
}

function mockError(message, code) {
  const err = new Error(message)
  err.code = code
  return err
}

// 假数据的"持久化"：新登记的巡检存到 sessionStorage，刷新后还在
const EXTRA_KEY = 'mock-extra-inspections'

function loadExtra() {
  try {
    return JSON.parse(sessionStorage.getItem(EXTRA_KEY)) || {}
  } catch {
    return {}
  }
}

// 3.2 登记巡检：校验规则照契约实现，错误文案也照抄
export async function mockCreateInspection(deviceId, payload = {}) {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const device = DEVICES.find((d) => d.id === Number(deviceId))
  if (!device) throw mockError(`设备不存在：id=${deviceId}`, 404)

  const { result, inspector = '', remark = '' } = payload
  const name = String(inspector).trim()

  if (!['normal', 'abnormal'].includes(result)) {
    throw mockError("参数校验失败：result 只能是 'normal' or 'abnormal' 之一", 400)
  }
  if (!name) throw mockError('参数校验失败：inspector 不能为空', 400)
  if (name.length > 32) throw mockError('参数校验失败：inspector 长度不能超过 32 个字符', 400)
  if (String(remark).length > 200) throw mockError('参数校验失败：remark 长度不能超过 200 个字符', 400)

  const record = {
    id: Date.now(),
    device_id: device.id,
    result,
    remark: String(remark).trim(),
    inspector: name,
    created_at: new Date().toISOString(),
  }

  const map = loadExtra()
  const list = map[device.id] || []
  list.unshift(record) // 最新的放最前面，符合契约"按时间倒序"
  map[device.id] = list
  sessionStorage.setItem(EXTRA_KEY, JSON.stringify(map))

  return record
}

// 3.3 更新故障状态
export async function mockUpdateFaultStatus(faultId, status) {
  await new Promise((resolve) => setTimeout(resolve, 150))

  if (!['pending', 'processing', 'resolved'].includes(status)) {
    throw mockError("参数校验失败：status 只能是 'pending', 'processing' or 'resolved' 之一", 400)
  }

  const id = Number(faultId)
  const fault = DEVICES.filter((d) => d.status === 'faulty')
    .flatMap(buildFaults)
    .find((f) => f.id === id)

  if (!fault) throw mockError(`故障不存在：id=${faultId}`, 404)

  const map = loadFaultStatus()
  map[id] = status
  sessionStorage.setItem(FAULT_KEY, JSON.stringify(map))

  return { ...fault, status, updated_at: new Date().toISOString() }
}

// 5.2 首页统计
export async function mockGetStats() {
  await new Promise((resolve) => setTimeout(resolve, 150))

  const faultyDevices = DEVICES.filter((d) => d.status === 'faulty')
  const faults = faultyDevices.flatMap(buildFaults)
  const countBy = (s) => faults.filter((f) => f.status === s).length

  return {
    device_total: DEVICES.length,
    device_normal: DEVICES.length - faultyDevices.length,
    device_faulty: faultyDevices.length,
    fault_pending: countBy('pending'),
    fault_processing: countBy('processing'),
    fault_resolved: countBy('resolved'),
  }
}

