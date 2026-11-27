import axios from 'axios'

// axios 实例：所有请求都从这里发，便于统一设置超时、请求头和拦截器
const http = axios.create({
  // 只写 /api，由 Vite 代理转发到后端
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000,
})

// 把后端错误包装成普通 Error，页面里 catch 到的 e.message 可直接展示
function makeError(message, code) {
  const err = new Error(message)
  err.code = code
  return err
}

// 响应拦截器：数据到达页面之前统一"拆包"
http.interceptors.response.use(
  // HTTP 2xx 时进入
  (response) => {
    const body = response.data
    // 契约 1.2：code 为 0 才算成功，把 data 直接交给页面
    if (body && body.code === 0) {
      return body.data
    }
    return Promise.reject(makeError(body?.message || '请求失败', body?.code))
  },
  // HTTP 4xx / 5xx、或网络层失败时进入
  (error) => {
    // 没有 response 说明根本没连上：后端没启动、超时、断网
    if (!error.response) {
      const message =
        error.code === 'ECONNABORTED'
          ? '请求超时，请检查后端服务是否正常'
          : '无法连接服务器，请确认后端已启动（http://127.0.0.1:8000）'
            return Promise.reject(makeError(message, 'NETWORK'))
    }

    // 502/503/504：代理连不上后端，Vite 会自己回 502，这里翻译成人话
    if ([502, 503, 504].includes(error.response.status)) {
      return Promise.reject(
        makeError(`后端服务未启动或暂时不可用（HTTP ${error.response.status}）`, error.response.status),
      )
    }

    // 服务端返回了 400 / 404 / 500，body.message 是后端写好的中文原因

    const body = error.response.data
    return Promise.reject(
      makeError(body?.message || `请求失败（HTTP ${error.response.status}）`, body?.code ?? error.response.status),
    )
  },
)

export default http
