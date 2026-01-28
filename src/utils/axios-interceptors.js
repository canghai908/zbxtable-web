import Cookie from 'js-cookie'
// 401拦截
const resp401 = {
  /**
   * 响应数据之前做点什么
   * @param response 响应对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(response, options) {
    const {message} = options
    // response 现在已经是 response.data 了
    if (response && response.code === 401) {
      message.error('无此权限')
    }
    return response
  },
  /**
   * 响应出错时执行
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const {message} = options
    const {response} = error
    // 检查 response 是否存在，避免访问 undefined 的属性
    if (response && response.status === 401) {
      message.error('无此权限')
    }
    return Promise.reject(error)
  }
}

const resp403 = {
  onFulfilled(response, options) {
    const {message} = options
    // response 现在已经是 response.data 了
    if (response && response.code === 403) {
      message.error('请求被拒绝')
    }
    return response
  },
  onRejected(error, options) {
    const {message} = options
    const {response} = error
    // 检查 response 是否存在，避免访问 undefined 的属性
    if (response && response.status === 403) {
      message.error('请求被拒绝')
    }
    return Promise.reject(error)
  }
}

const reqCommon = {
  /**
   * 发送请求之前做些什么
   * @param config axios config
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {*}
   */
  onFulfilled(config, options) {
    const {message} = options
    const {url, xsrfCookieName} = config
    // 确保每次请求都带上 token（后端默认从 X-Token 读取）
    // 仅依赖 axios 的 xsrf 机制在某些跨域/代理场景下不稳定，这里显式注入一次。
    const token = xsrfCookieName ? Cookie.get(xsrfCookieName) : undefined
    if (token) {
      config.headers = config.headers || {}
      if (!config.headers['X-Token']) {
        config.headers['X-Token'] = token
      }
      // 兼容部分后端/中间件可能读取 Authorization
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    // 安装相关的 API 不需要 token 验证
    const isInstallAPI = url && (url.indexOf('/install') !== -1)
    const isLoginAPI = url && (url.indexOf('login') !== -1)
    // 如果不是登录或安装 API，且没有 token，则提示
    if (!isLoginAPI && !isInstallAPI && xsrfCookieName && !Cookie.get(xsrfCookieName)) {
      message.warning('认证 token 已过期，请重新登录')
    }
    return config
  },
  /**
   * 请求出错时做点什么
   * @param error 错误对象
   * @param options 应用配置 包含: {router, i18n, store, message}
   * @returns {Promise<never>}
   */
  onRejected(error, options) {
    const {message} = options
    message.error(error.message)
    return Promise.reject(error)
  }
}

export default {
  request: [reqCommon], // 请求拦截
  response: [resp401, resp403] // 响应拦截
}
