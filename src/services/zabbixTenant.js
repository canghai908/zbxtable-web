import { request, METHOD } from '@/utils/request'

export function listZabbixTenantBindings () {
  return request('/v1/zabbix/tenants', METHOD.GET)
}

// upsert by tenant_id
export function upsertZabbixTenantBinding (data) {
  return request('/v1/zabbix/tenants', METHOD.POST, data)
}

export function deleteZabbixTenantBinding (id) {
  return request(`/v1/zabbix/tenants/${id}`, METHOD.DELETE)
}

// 在 Zabbix 中安装 MS-Agent 配置
export function installMSAgent (id) {
  return request(`/v1/zabbix/tenants/${id}/install-msagent`, METHOD.POST)
}

// 获取 MS-Agent 安装脚本
export function getMSAgentScript (id) {
  return request(`/v1/zabbix/tenants/${id}/msagent-script`, METHOD.GET)
}

// 在 Zabbix 中安装 Webhook 配置
export function installWebhook (id) {
  return request(`/v1/zabbix/tenants/${id}/install-webhook`, METHOD.POST)
}

// 获取 Webhook 配置信息
export function getWebhookInfo (id) {
  return request(`/v1/zabbix/tenants/${id}/webhook-info`, METHOD.GET)
}

// 卸载 MS-Agent 配置
export function uninstallMSAgent (id) {
  return request(`/v1/zabbix/tenants/${id}/uninstall-msagent`, METHOD.DELETE)
}

// 卸载 Webhook 配置
export function uninstallWebhook (id) {
  return request(`/v1/zabbix/tenants/${id}/uninstall-webhook`, METHOD.DELETE)
}


