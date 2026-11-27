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
export async function mockGetDevices({ keyword = '', status = '', page = 1, page_size = 10 } = {}) {
  // 加一点延迟，方便看清"加载中"状态
  await new Promise((resolve) => setTimeout(resolve, 250))

  let list = DEVICES
  const kw = String(keyword).trim().toLowerCase()
  // 契约规定：只按 name 或 model 模糊搜索，不区分大小写
  if (kw) {
    list = list.filter(
      (d) => d.name.toLowerCase().includes(kw) || d.model.toLowerCase().includes(kw),
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
  const faults =
    device.status === 'faulty'
      ? [
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
      : []

  return { device, inspections, faults }
}
