import { LOGIN, ROUTES } from "@/services/api";
import { request, METHOD, removeAuthorization } from "@/utils/request";

/**
 * 登录服务
 * @param name 账户名
 * @param password 账户密码
 * @returns {Promise<AxiosResponse<T>>}
 */
export async function login(name, password) {
  return request(LOGIN, METHOD.POST, {
    username: name,
    password: password,
  });
}

export async function getRoutesConfig() {
  return request(ROUTES, METHOD.GET);
}

/**
 * 退出登录
 */
export function logout() {
  removeAuthorization();
  [
    process.env.VUE_APP_USER_KEY,
    process.env.VUE_APP_PERMISSIONS_KEY,
    process.env.VUE_APP_ROLES_KEY,
    process.env.VUE_APP_ROUTES_KEY
  ].filter(Boolean).forEach((key) => localStorage.removeItem(key))
}

export default {
  login,
  logout,
  getRoutesConfig,
};
