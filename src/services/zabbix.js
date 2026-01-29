import { request, METHOD } from '@/utils/request'

// ============================================
// Zabbix 租户管理（合并后的统一接口）
// 整合了原 zabbix.js 和 zabbixTenant.js 的所有功能
// ============================================

// ========== 租户管理（CRUD）==========

/**
 * 获取租户列表
 */
export function listZabbixTenants() {
  return request('/v1/zabbix/tenants', METHOD.GET)
}

/**
 * 获取单个租户
 * @param {number} id - 租户ID
 */
export function getZabbixTenant(id) {
  return request(`/v1/zabbix/tenants/${id}`, METHOD.GET)
}

/**
 * 创建租户
 * @param {object} data - 租户数据
 */
export function createZabbixTenant(data) {
  return request('/v1/zabbix/tenants', METHOD.POST, data)
}

/**
 * 更新租户
 * @param {number} id - 租户ID
 * @param {object} data - 租户数据
 */
export function updateZabbixTenant(id, data) {
  return request(`/v1/zabbix/tenants/${id}`, METHOD.PUT, data)
}

/**
 * 删除租户
 * @param {number} id - 租户ID
 */
export function deleteZabbixTenant(id) {
  return request(`/v1/zabbix/tenants/${id}`, METHOD.DELETE)
}

// ========== 连接测试 ==========

/**
 * 测试连接配置（创建前）
 * @param {object} data - 连接配置
 */
export function testZabbixTenantConfig(data) {
  return request('/v1/zabbix/tenants/test', METHOD.POST, data)
}

/**
 * 测试已保存租户的连接（并刷新版本/状态）
 * @param {number} id - 租户ID
 */
export function testZabbixTenant(id) {
  return request(`/v1/zabbix/tenants/${id}/test`, METHOD.POST)
}

// ========== 状态管理 ==========

/**
 * 启用/禁用租户
 * @param {number} id - 租户ID
 * @param {boolean} enabled - 是否启用
 */
export function setZabbixTenantEnabled(id, enabled) {
  return request(`/v1/zabbix/tenants/${id}/enabled`, METHOD.PUT, { enabled })
}

/**
 * 激活租户（设为当前使用的 Zabbix）
 * @param {number} id - 租户ID
 */
export function activateZabbixTenant(id) {
  return request(`/v1/zabbix/tenants/${id}/activate`, METHOD.PUT)
}

/**
 * 获取当前激活的租户
 */
export function getActiveZabbixTenant() {
  return request('/v1/zabbix/active', METHOD.GET)
}

// ========== MS-Agent 相关 ==========

/**
 * 在 Zabbix 中安装 MS-Agent 配置
 * @param {number} id - 租户ID
 */
export function installMSAgent(id) {
  return request(`/v1/zabbix/tenants/${id}/install-msagent`, METHOD.POST)
}

/**
 * 获取 MS-Agent 安装脚本
 * @param {number} id - 租户ID
 */
export function getMSAgentScript(id) {
  return request(`/v1/zabbix/tenants/${id}/msagent-script`, METHOD.GET)
}

/**
 * 卸载 MS-Agent 配置
 * @param {number} id - 租户ID
 */
export function uninstallMSAgent(id) {
  return request(`/v1/zabbix/tenants/${id}/uninstall-msagent`, METHOD.DELETE)
}

// ========== Webhook 相关 ==========

/**
 * 在 Zabbix 中安装 Webhook 配置
 * @param {number} id - 租户ID
 */
export function installWebhook(id) {
  return request(`/v1/zabbix/tenants/${id}/install-webhook`, METHOD.POST)
}

/**
 * 获取 Webhook 配置信息
 * @param {number} id - 租户ID
 */
export function getWebhookInfo(id) {
  return request(`/v1/zabbix/tenants/${id}/webhook-info`, METHOD.GET)
}

/**
 * 卸载 Webhook 配置
 * @param {number} id - 租户ID
 */
export function uninstallWebhook(id) {
  return request(`/v1/zabbix/tenants/${id}/uninstall-webhook`, METHOD.DELETE)
}

// ============================================
// 兼容性别名（保持向后兼容）
// ============================================

// 旧的 zabbix.js 接口别名
export const listZabbixInstances = listZabbixTenants
export const createZabbixInstance = createZabbixTenant
export const testZabbixConfig = testZabbixTenantConfig
export const testZabbixInstance = testZabbixTenant
export const setZabbixInstanceEnabled = setZabbixTenantEnabled
export const updateZabbixInstance = updateZabbixTenant
export const deleteZabbixInstance = deleteZabbixTenant
export const activateZabbixInstance = activateZabbixTenant
export const getActiveZabbixInstance = getActiveZabbixTenant

