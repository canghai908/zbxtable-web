import Cookie from 'js-cookie'
import axios from 'axios'

const TOKEN_COOKIE = 'X-Token'
const REFRESH_BEFORE_MS = 5 * 60 * 1000   // 过期前 5 分钟刷新
const MIN_SCHEDULE_MS   = 30 * 1000        // 最短调度间隔
const RETRY_INTERVAL_MS = 60 * 1000        // 网络失败重试间隔
const MAX_RETRIES       = 3                // 最多重试次数

let _timer      = null
let _retryCount = 0
let _active     = false   // 标记刷新器是否应当运行，stop 后不再调度

function getTokenExpiry() {
  const token = Cookie.get(TOKEN_COOKIE)
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ? payload.exp * 1000 : null
  } catch (_) {
    return null
  }
}

async function doRefresh() {
  if (!_active) return

  const token = Cookie.get(TOKEN_COOKIE)
  if (!token) return

  try {
    const res = await axios.get('/v1/token/refresh', {
      headers: { 'X-Token': token }
    })
    const newToken = res && res.data && res.data.data && res.data.data.token
    if (newToken && _active) {
      Cookie.set(TOKEN_COOKIE, newToken)
      _retryCount = 0
      schedule()
    }
  } catch (_) {
    // 只对网络抖动（非 auth 失败）重试
    // auth 失败时响应拦截器已调用 stopTokenRefresher()，此时 _active=false
    if (_active && _retryCount < MAX_RETRIES) {
      _retryCount++
      _timer = setTimeout(doRefresh, RETRY_INTERVAL_MS)
    }
  }
}

function schedule() {
  if (_timer) {
    clearTimeout(_timer)
    _timer = null
  }
  if (!_active) return

  const expiry = getTokenExpiry()
  if (!expiry) return

  const delay = Math.max(expiry - Date.now() - REFRESH_BEFORE_MS, MIN_SCHEDULE_MS)
  _timer = setTimeout(doRefresh, delay)
}

export function startTokenRefresher() {
  _active = true
  _retryCount = 0
  schedule()
}

export function stopTokenRefresher() {
  _active = false
  _retryCount = 0
  if (_timer) {
    clearTimeout(_timer)
    _timer = null
  }
}
