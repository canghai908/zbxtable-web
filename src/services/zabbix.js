import { request, METHOD } from '@/utils/request'

export function listZabbixInstances() {
  return request('/v1/zabbix/instances', METHOD.GET)
}

export function createZabbixInstance(data) {
  return request('/v1/zabbix/instances', METHOD.POST, data)
}

// 新增前测试连接
export function testZabbixConfig(data) {
  return request('/v1/zabbix/instances/test', METHOD.POST, data)
}

// 测试已保存实例（并刷新版本/状态）
export function testZabbixInstance(id) {
  return request(`/v1/zabbix/instances/${id}/test`, METHOD.POST)
}

// 启用/禁用实例
export function setZabbixInstanceEnabled(id, enabled) {
  return request(`/v1/zabbix/instances/${id}/enabled`, METHOD.PUT, { enabled })
}

export function updateZabbixInstance(id, data) {
  return request(`/v1/zabbix/instances/${id}`, METHOD.PUT, data)
}

export function deleteZabbixInstance(id) {
  return request(`/v1/zabbix/instances/${id}`, METHOD.DELETE)
}

export function activateZabbixInstance(id) {
  return request(`/v1/zabbix/instances/${id}/activate`, METHOD.PUT)
}

export function getActiveZabbixInstance() {
  return request('/v1/zabbix/active', METHOD.GET)
}

