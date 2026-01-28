import { request, METHOD } from '@/utils/request'

/**
 * 获取安装状态
 */
export function getInstallStatus() {
  return request('/install/status', METHOD.GET)
}

/**
 * 检查数据库连接
 */
export function checkDatabase(data) {
  return request('/install/check-db', METHOD.POST, data)
}

/**
 * 执行安装
 */
export function doInstall(data) {
  return request('/install/install', METHOD.POST, data)
}
