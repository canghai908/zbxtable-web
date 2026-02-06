import { request, METHOD } from '@/utils/request'

/**
 * 获取所有菜单
 */
export async function getMenus() {
  return request('/v1/menu', METHOD.GET)
}

/**
 * 获取父菜单列表
 */
export async function getParentMenus() {
  return request('/v1/menu/parents', METHOD.GET)
}

/**
 * 根据父菜单ID获取子菜单
 */
export async function getMenusByParentId(parentId) {
  return request(`/v1/menu/children/${parentId}`, METHOD.GET)
}

/**
 * 根据ID获取菜单
 */
export async function getMenuById(id) {
  return request(`/v1/menu/${id}`, METHOD.GET)
}

/**
 * 创建菜单
 */
export async function createMenu(data) {
  return request('/v1/menu', METHOD.POST, data)
}

/**
 * 更新菜单
 */
export async function updateMenu(id, data) {
  return request(`/v1/menu/${id}`, METHOD.PUT, data)
}

/**
 * 删除菜单
 */
export async function deleteMenu(id) {
  return request(`/v1/menu/${id}`, METHOD.DELETE)
}
