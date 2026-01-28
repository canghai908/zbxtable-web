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


