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
