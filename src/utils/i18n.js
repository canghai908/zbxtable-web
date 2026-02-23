import Vue from 'vue'
import VueI18n from 'vue-i18n'
import routesI18n from '@/router/i18n'
import './Objects'
import {getI18nKey} from '@/utils/routerUtil'
import locales from '@/locales'

/**
 * 创建 i18n 配置
 * @param locale 本地化语言
 * @param fallback 回退语言
 * @returns {VueI18n}
 */
function initI18n(locale, fallback) {
  Vue.use(VueI18n)
  
  // 语言映射：CN -> zh-CN, HK -> zh-TW, US -> en-US
  const localeMap = {
    'CN': 'zh-CN',
    'HK': 'zh-TW',
    'US': 'en-US'
  }
  
  const actualLocale = localeMap[locale] || locale
  const actualFallback = localeMap[fallback] || fallback
  
  let i18nOptions = {
    locale: actualLocale,
    fallbackLocale: actualFallback,
    silentFallbackWarn: true,
    messages: {}
  }
  
  // 加载语言包
  Object.keys(locales).forEach(lang => {
    i18nOptions.messages[lang] = locales[lang]
    // 同时也映射到简写 key 以确保兼容性
    if (lang === 'zh-CN') i18nOptions.messages['CN'] = locales[lang]
    if (lang === 'zh-TW') i18nOptions.messages['HK'] = locales[lang]
    if (lang === 'en-US') i18nOptions.messages['US'] = locales[lang]
  })
  
  return new VueI18n(i18nOptions)
}

/**
 * 根据 router options 配置生成 国际化语言
 * @param lang
 * @param routes
 * @param valueKey
 * @returns {*}
 */
function generateI18n(lang, routes, valueKey) {
  routes.forEach(route => {
    let keys = getI18nKey(route.fullPath).split('.')
    const raw = route && route[valueKey]
    let value = valueKey === 'path'
      ? (typeof raw === 'string' ? raw.split('/').filter(item => !item.startsWith(':') && item != '').join('.') : '')
      : (raw == null ? '' : raw)
    lang.assignProps(keys, value)
    if (route.children) {
      generateI18n(lang, route.children, valueKey)
    }
  })
  return lang
}

/**
 * 格式化 router.options.routes，生成 fullPath
 * @param routes
 * @param parentPath
 */
function formatFullPath(routes, parentPath = '') {
  routes.forEach(route => {
    let isFullPath = route.path.substring(0, 1) === '/'
    route.fullPath = isFullPath ? route.path : (parentPath === '/' ? parentPath + route.path : parentPath + '/' + route.path)
    if (route.children) {
      formatFullPath(route.children, route.fullPath)
    }
  })
}

/**
 * 从路由提取国际化数据
 * @param i18n
 * @param routes
 */
function mergeI18nFromRoutes(i18n, routes) {
  formatFullPath(routes)
  const CN = generateI18n(new Object(), routes, 'name')
  const US = generateI18n(new Object(), routes, 'path')
  const HK = generateI18n(new Object(), routes, 'name') // 繁体使用与简体相同的name
  
  // 映射到新的locale key
  i18n.mergeLocaleMessage('zh-CN', CN)
  i18n.mergeLocaleMessage('en-US', US)
  i18n.mergeLocaleMessage('zh-TW', HK)
  
  // 兼容旧的locale key
  i18n.mergeLocaleMessage('CN', CN)
  i18n.mergeLocaleMessage('US', US)
  i18n.mergeLocaleMessage('HK', HK)
  
  const messages = routesI18n.messages
  Object.keys(messages).forEach(lang => {
    // 映射旧的locale key到新的
    const localeMap = {
      'CN': 'zh-CN',
      'HK': 'zh-TW',
      'US': 'en-US'
    }
    const newLang = localeMap[lang] || lang
    i18n.mergeLocaleMessage(newLang, messages[lang])
    // 同时保留旧的key以兼容
    i18n.mergeLocaleMessage(lang, messages[lang])
  })
}

export {
  initI18n,
  mergeI18nFromRoutes,
  formatFullPath
}
