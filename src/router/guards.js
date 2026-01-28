import {hasAuthority} from '@/utils/authority-utils'
import {loginIgnore} from '@/router/index'
import {checkAuthorization} from '@/utils/request'
import {getInstallStatus} from '@/services/install'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false })

// 安装状态缓存
let installStatusChecked = false
let isInstalled = false
export const resetInstallStatusCache = () => {
  installStatusChecked = false
  isInstalled = false
}

/**
 * 安装状态检查守卫
 * @param to
 * @param from
 * @param next
 * @param options
 */
const installGuard = async (to, from, next, options) => {
  // 如果已经在安装页面，直接通过
  if (to.path === '/install') {
    next()
    return
  }

  // 如果已经检查过安装状态，使用缓存
  if (installStatusChecked) {
    if (!isInstalled) {
      next({path: '/install', replace: true})
      return
    }
    next()
    return
  }

  // 检查安装状态
  try {
    const res = await getInstallStatus()
    installStatusChecked = true
    // 兼容多种返回（历史 + 当前统一格式）：
    // 1) 旧：{ installed: true }
    // 2) 旧 axios-like：{ data: { installed: true } }
    // 3) 新统一：{ data: { code, message, data: { installed: true } } }
    // 4) 新统一 axios-like：{ data: { code, message, data: { installed: true } } }（由全局 request.js 返回）
    const biz = (res && res.data) ? res.data : res
    const installed =
      (biz && biz.data && typeof biz.data.installed !== 'undefined' ? biz.data.installed : undefined) ??
      (biz && typeof biz.installed !== 'undefined' ? biz.installed : undefined)
    if (installed) {
      isInstalled = true
      next()
    } else {
      isInstalled = false
      next({path: '/install', replace: true})
    }
  } catch (error) {
    // 如果接口不存在或出错，说明可能未安装，跳转到安装页面
    installStatusChecked = true
    isInstalled = false
    next({path: '/install', replace: true})
  }
}

/**
 * 进度条开始
 * @param to
 * @param form
 * @param next
 */
const progressStart = (to, from, next) => {
  // start progress bar
  if (!NProgress.isStarted()) {
    NProgress.start()
  }
  next()
}

/**
 * 登录守卫
 * @param to
 * @param form
 * @param next
 * @param options
 */
const loginGuard = (to, from, next, options) => {
  const {message} = options
  if (!loginIgnore.includes(to) && !checkAuthorization()) {
    message.warning('登录已失效，请重新登录')
    next({path: '/login'})
  } else {
    next()
  }
}

/**
 * 权限守卫
 * @param to
 * @param form
 * @param next
 * @param options
 */
const authorityGuard = (to, from, next, options) => {
  const {store, message} = options
  const permissions = store.getters['account/permissions']
  const roles = store.getters['account/roles']
  if (!hasAuthority(to, permissions, roles)) {
    message.warning(`对不起，您无权访问页面: ${to.fullPath}，请联系管理员`)
    next({path: '/403'})
    // NProgress.done()
  } else {
    next()
  }
}

/**
 * 混合导航模式下一级菜单跳转重定向
 * @param to
 * @param from
 * @param next
 * @param options
 * @returns {*}
 */
const redirectGuard = (to, from, next, options) => {
  const {store} = options
  const getFirstChild = (routes) => {
    const route = routes[0]
    if (!route.children || route.children.length === 0) {
      return route
    }
    return getFirstChild(route.children)
  }
  if (store.state.setting.layout === 'mix') {
    const firstMenu = store.getters['setting/firstMenu']
    if (firstMenu.find(item => item.fullPath === to.fullPath)) {
      store.commit('setting/setActivatedFirst', to.fullPath)
      const subMenu = store.getters['setting/subMenu']
      if (subMenu.length > 0) {
        const redirect = getFirstChild(subMenu)
        return next({path: redirect.fullPath})
      }
    }
  }
  next()
}

/**
 * 进度条结束
 * @param to
 * @param form
 * @param options
 */
const progressDone = () => {
  // finish progress bar
  NProgress.done()
}

export default {
  beforeEach: [progressStart, installGuard, loginGuard, authorityGuard, redirectGuard],
  afterEach: [progressDone]
}
