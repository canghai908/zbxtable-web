<template>
  <div class="login-container">
    <!-- GitHub 开源项目链接 - 右上角（仅演示模式显示） -->
    <a
      v-if="demoMode"
      href="https://github.com/canghai908/zbxtable"
      target="_blank"
      class="github-corner"
      aria-label="View source on GitHub"
    >
      <svg width="80" height="80" viewBox="0 0 250 250" class="github-corner-svg" aria-hidden="true">
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" class="octo-background"></path>
        <path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" class="octo-arm"></path>
        <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path>
      </svg>
      <div class="github-tooltip">
        <span class="tooltip-text">{{$t('githubTooltip')}}</span>
      </div>
    </a>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="grid-pattern"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo和标题区域 -->
      <div class="logo-section">
        <div class="logo-wrapper">
          <img :src="logoUrl" alt="Logo" class="logo-image" />
        </div>
        <h1 class="system-title">{{ systemName }}</h1>
        <p class="system-subtitle">{{ systemSubtitle }}</p>
      </div>

      <!-- 登录表单 -->
      <div class="form-section">
        <a-form @submit="onSubmit" :form="form">
          <a-alert 
            type="error" 
            :closable="true" 
            v-show="error" 
            :message="error" 
            showIcon 
            class="error-alert"
          />
          
          <a-form-item class="form-item">
            <a-input 
              autocomplete="autocomplete" 
              size="large" 
              :placeholder="$t('pleaseInputUsername')"
              v-decorator="['name', {rules: [{ required: true, message: $t('pleaseInputUsername'), whitespace: true}]}]"
              class="custom-input"
            >
              <a-icon slot="prefix" type="user" class="input-icon" />
            </a-input>
          </a-form-item>
          
          <a-form-item class="form-item">
            <a-input 
              size="large" 
              autocomplete="autocomplete" 
              type="password" 
              :placeholder="$t('pleaseInputPassword')"
              v-decorator="['password', {rules: [{ required: true, message: $t('pleaseInputPassword'), whitespace: true}]}]"
              class="custom-input"
            >
              <a-icon slot="prefix" type="lock" class="input-icon" />
            </a-input>
          </a-form-item>

          <a-form-item class="submit-item">
            <a-button 
              :loading="logging" 
              size="large" 
              htmlType="submit" 
              type="primary"
              class="submit-button"
              block
            >
              <span v-if="!logging">{{$t('login')}}</span>
              <span v-else>{{$t('loggingIn')}}</span>
            </a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 页脚信息 -->
      <div class="footer-section">
        <p class="footer-text">{{$t('copyright')}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { login, getRoutesConfig } from '@/services/user'
import { getPublicSystemInfo } from '@/services/admin'
import { setAuthorization } from '@/utils/request'
import { loadRoutes } from '@/utils/routerUtil'
import { mapMutations } from 'vuex'
import { startTokenRefresher } from '@/utils/tokenRefresher'
export default {
  name: 'Login',
  i18n: require('./i18n'),
  data() {
    return {
      logging: false,
      error: '',
      form: this.$form.createForm(this),
      systemName: 'ZbxTable',
      systemSubtitle: this.$t('systemSubtitle'),
      logoUrl: require('@/assets/img/logo.png'),
      demoMode: false
    }
  },
  // computed: {
  //   systemName() {
  //     return this.$store.state.setting.systemName
  //   }
  // },

  mounted() {
    // 加载系统公开信息
    this.loadPublicSystemInfo()
    
    // 开发模式下自动填充账号密码
    if (process.env.NODE_ENV === 'development') {
      this.$nextTick(() => {
        this.form.setFieldsValue({
          name: 'admin',
          password: 'Zbxtable'
        })
      })
    }

    // 添加入场动画
    this.$nextTick(() => {
      const card = document.querySelector('.login-card')
      if (card) {
        card.style.animation = 'slideInUp 0.6s ease-out'
      }
    })
  },
  methods: {
    ...mapMutations('account', ['setUser', 'setPermissions', 'setRoles']),
    async loadPublicSystemInfo() {
      try {
        const res = await getPublicSystemInfo()
        const infoRes = (res && res.data && typeof res.data.code !== 'undefined') ? res.data : res
        
        if (infoRes && infoRes.code === 200 && infoRes.data) {
          if (infoRes.data.system_name) {
            this.systemName = infoRes.data.system_name
            this.$store.commit('setting/setSystemName', infoRes.data.system_name)
          }
          if (infoRes.data.system_subtitle) {
            this.systemSubtitle = infoRes.data.system_subtitle
            this.$store.commit('setting/setSystemSubtitle', infoRes.data.system_subtitle)
          }
          if (infoRes.data.system_logo) {
            this.logoUrl = infoRes.data.system_logo
            this.$store.commit('setting/setSystemLogo', infoRes.data.system_logo)
          }
          // 识别演示模式并自动填充账号密码
          if (infoRes.data.demo_mode) {
            this.demoMode = true
            this.$store.commit('setting/setDemoMode', true)
            this.$nextTick(() => {
              this.form.setFieldsValue({
                name: 'admin',
                password: 'Zbxtable'
              })
            })
          } else {
            this.demoMode = false
            this.$store.commit('setting/setDemoMode', false)
          }
        }
      } catch (error) {
        console.warn('加载系统公开信息失败，使用默认配置:', error)
        // 加载失败不影响登录页面显示
      }
    },
    loadUserTheme(user) {
      try {
        // 从用户信息中读取主题配置
        if (user && user.theme) {
          let themeConfig
          // 如果是字符串，需要解析
          if (typeof user.theme === 'string') {
            themeConfig = JSON.parse(user.theme)
          } else {
            themeConfig = user.theme
          }
          
          // 保存到 localStorage，这样刷新页面时会自动加载
          localStorage.setItem(process.env.VUE_APP_SETTING_KEY, JSON.stringify(themeConfig))
          
          // 立即应用主题配置到 Vuex store
          if (themeConfig.theme) {
            this.$store.commit('setting/setTheme', themeConfig.theme)
            // 应用主题颜色
            const themeUtil = require('@/utils/themeUtil')
            themeUtil.changeThemeColor(themeConfig.theme.color, themeConfig.theme.mode)
          }
          
          // 应用动画配置
          if (themeConfig.animate) {
            this.$store.commit('setting/setAnimate', themeConfig.animate)
          }
          
          // 应用其他配置
          if (themeConfig.layout) {
            this.$store.commit('setting/setLayout', themeConfig.layout)
          }
          if (themeConfig.multiPage !== undefined) {
            this.$store.commit('setting/setMultiPage', themeConfig.multiPage)
          }
          if (themeConfig.weekMode !== undefined) {
            this.$store.commit('setting/setWeekMode', themeConfig.weekMode)
          }
          if (themeConfig.fixedHeader !== undefined) {
            this.$store.commit('setting/setFixedHeader', themeConfig.fixedHeader)
          }
          if (themeConfig.fixedSideBar !== undefined) {
            this.$store.commit('setting/setFixedSideBar', themeConfig.fixedSideBar)
          }
          if (themeConfig.hideSetting !== undefined) {
            this.$store.commit('setting/setHideSetting', themeConfig.hideSetting)
          }
          if (themeConfig.pageWidth) {
            this.$store.commit('setting/setPageWidth', themeConfig.pageWidth)
          }
          
          console.log('用户主题配置已加载并应用:', themeConfig)
        }
      } catch (error) {
        console.warn('加载用户主题配置失败，使用默认配置:', error)
        // 加载失败不影响登录流程
      }
    },
    async loadSystemConfig() {
      try {
        const { configGetList } = require('@/services/admin')
        const res = await configGetList()
        const configRes = (res && res.data && typeof res.data.code !== 'undefined') ? res.data : res
        
        if (configRes && configRes.code === 200 && configRes.data && configRes.data.items) {
          const configs = configRes.data.items
          const systemNameConfig = configs.find(item => item.config_key === 'system_name')
          const systemSubtitleConfig = configs.find(item => item.config_key === 'system_subtitle')
          const systemLogoConfig = configs.find(item => item.config_key === 'system_logo')
          
          if (systemNameConfig && systemNameConfig.config_value) {
            this.systemName = systemNameConfig.config_value
            this.$store.commit('setting/setSystemName', systemNameConfig.config_value)
          }
          if (systemSubtitleConfig && systemSubtitleConfig.config_value) {
            this.systemSubtitle = systemSubtitleConfig.config_value
            this.$store.commit('setting/setSystemSubtitle', systemSubtitleConfig.config_value)
          }
          
          if (systemLogoConfig && systemLogoConfig.config_value) {
            this.logoUrl = systemLogoConfig.config_value
            this.$store.commit('setting/setSystemLogo', systemLogoConfig.config_value)
          }
        }
      } catch (error) {
        console.warn('加载系统配置失败，使用默认配置:', error)
        // 加载失败不影响登录流程
      }
    },
    onSubmit(e) {
      e.preventDefault()
      this.form.validateFields((err) => {
        if (!err) {
          this.logging = true
          const name = this.form.getFieldValue('name')
          const password = this.form.getFieldValue('password')
          
          login(name, password)
            .then(this.afterLogin)
            .catch((error) => {
              this.logging = false
              // 兼容 axios error / 自定义 error 对象
              if (error && typeof error === 'object') {
                const msg =
                  error.message ||
                  (error.data && error.data.message) ||
                  (error.response && error.response.data && error.response.data.message)
                this.error = msg || '登录失败'
              } else {
                this.error = '登录失败'
              }
            })
        }
      })
    },
    afterLogin(res) {
      this.logging = false
      // 兼容两种形态：
      // 1) 全局 request.js 返回 axios-like：{ data: { code, message, data } }
      // 2) 极端情况下直接返回业务对象：{ code, message, data }
      const loginRes =
        (res && res.data && typeof res.data.code !== 'undefined')
          ? res.data
          : res

      const code = loginRes && loginRes.code
      // 兼容历史 mock 返回 code = 0，以及当前后端返回 code = 200
      if (loginRes && (code === 200 || code === 0 || code === '200' || code === '0')) {
        const { user, roles } = (loginRes && loginRes.data) || {}
        // let premissions = [{ id: "queryForm", operation: ["add", "edit", 'delete'] }]
        // roles = [{ id: "admin", operation: ["add", "edit", "delete"] }],
        // user = {
        //   name: "admin",
        //   avatar:
        //     "https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png",
        //   address: "武汉",
        // };
        this.setUser(user)
        // this.setPermissions(premissions);
        this.setRoles(roles)
        setAuthorization({ token: loginRes && loginRes.data && loginRes.data.token })
        startTokenRefresher()

        // 加载用户主题配置
        this.loadUserTheme(user)
        
        // 获取路由配置
        getRoutesConfig().then((result) => {
          try {
            const routesRes =
              (result && result.data && typeof result.data.code !== 'undefined')
                ? result.data
                : result
            const routesConfig =
              routesRes && routesRes.data && routesRes.data ? routesRes.data : []
            loadRoutes(routesConfig)

            // 加载系统配置（名称和Logo）
            this.loadSystemConfig()
            
            this.$router.push('/dashboard/workplace')
            this.$message.success(loginRes.message || this.$t('loginSuccess'), 1)
          } catch (e) {
            // 路由加载失败时也至少完成登录并进入首页
            this.$router.push('/dashboard/workplace')
            this.$message.success(loginRes && loginRes.message ? loginRes.message : '登录成功', 1)
          }
        }).catch(() => {
          // 路由配置接口异常时，至少完成基本登录跳转
          this.$router.push('/dashboard/workplace')
          this.$message.success(loginRes && loginRes.message ? loginRes.message : '登录成功', 1)
        })
      } else {
        this.error = (loginRes && loginRes.message) ? loginRes.message : '登录失败'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

// GitHub 右上角标识
.github-corner {
  position: fixed;
  top: 0;
  right: 0;
  width: 80px;
  height: 80px;
  z-index: 1000;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    color: #ffffff;

    .octo-background {
      fill: rgba(255, 255, 255, 0.15);
    }

    .octo-arm {
      animation: octocat-wave 560ms ease-in-out;
    }

    .github-tooltip {
      opacity: 1;
      transform: translateX(-10px);
    }
  }

  .github-corner-svg {
    width: 80px;
    height: 80px;
    display: block;
    fill: rgba(255, 255, 255, 0.9);
  }

  .octo-background {
    fill: rgba(255, 255, 255, 0.08);
    transition: fill 0.3s ease;
  }

  .octo-arm {
    transform-origin: 130px 106px;
  }

  .octo-body {
    fill: currentColor;
  }

  .github-tooltip {
    position: absolute;
    top: 50%;
    right: 90px;
    transform: translateY(-50%) translateX(0);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 10px 18px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    opacity: 0;
    pointer-events: none;
    transition: all 0.3s ease;
    white-space: nowrap;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: -6px;
      transform: translateY(-50%) rotate(45deg);
      width: 12px;
      height: 12px;
      background: rgba(255, 255, 255, 0.95);
    }

    .tooltip-text {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
  }
}

@keyframes octocat-wave {
  0%, 100% {
    transform: rotate(0);
  }
  20%, 60% {
    transform: rotate(-25deg);
  }
  40%, 80% {
    transform: rotate(10deg);
  }
}

@media screen and (max-width: 768px) {
  .github-corner {
    width: 60px;
    height: 60px;

    .github-corner-svg {
      width: 60px;
      height: 60px;
    }

    .github-tooltip {
      display: none;
    }
  }
}

// 背景装饰
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;

  .circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.03);
    animation: float 20s infinite ease-in-out;

    &.circle-1 {
      width: 500px;
      height: 500px;
      top: -250px;
      right: -100px;
      animation-delay: 0s;
      background: radial-gradient(circle, rgba(100, 200, 255, 0.1) 0%, transparent 70%);
    }

    &.circle-2 {
      width: 350px;
      height: 350px;
      bottom: -150px;
      left: -100px;
      animation-delay: 5s;
      background: radial-gradient(circle, rgba(150, 100, 255, 0.08) 0%, transparent 70%);
    }

    &.circle-3 {
      width: 250px;
      height: 250px;
      top: 50%;
      left: 10%;
      animation-delay: 10s;
      background: radial-gradient(circle, rgba(255, 150, 100, 0.06) 0%, transparent 70%);
    }
  }

  .grid-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: gridMove 30s linear infinite;
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes gridMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 登录卡片
.login-card {
  position: relative;
  z-index: 1;
  width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  animation: slideInUp 0.6s ease-out;

  @media screen and (max-width: 576px) {
    width: 90%;
    padding: 36px 24px;
    border-radius: 20px;
  }
}

// Logo区域
.logo-section {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeIn 0.8s ease-out 0.2s both;

  .logo-wrapper {
    display: inline-block;
    margin-bottom: 24px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      opacity: 0.1;
      animation: pulse 2s ease-in-out infinite;
    }

    .logo-image {
      width: 80px;
      height: 80px;
      object-fit: contain;
      position: relative;
      z-index: 1;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.05) rotate(5deg);
      }
    }
  }

  .system-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .system-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    font-weight: 400;
    letter-spacing: 0.3px;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.1;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.15;
  }
}

// 表单区域
.form-section {
  animation: fadeIn 0.8s ease-out 0.4s both;

  .error-alert {
    margin-bottom: 24px;
    border-radius: 12px;
    animation: shake 0.5s ease;
  }

  .form-item {
    margin-bottom: 20px;

    /deep/ .ant-form-item-control {
      line-height: 1;
    }
  }

  .custom-input {
    border-radius: 12px;
    border: 2px solid #e5e7eb;
    transition: all 0.3s ease;
    font-size: 15px;

    &:hover {
      border-color: #9ca3af;
    }

    &:focus,
    &.ant-input-focused {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    /deep/ input {
      font-size: 15px;
      
      &::placeholder {
        color: #9ca3af;
      }
    }

    .input-icon {
      color: #9ca3af;
      font-size: 16px;
    }
  }

  .submit-item {
    margin-bottom: 0;
    margin-top: 32px;
  }

  .submit-button {
    height: 48px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      background: #d1d5db;
      box-shadow: none;
    }
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

// 页脚
.footer-section {
  margin-top: 32px;
  text-align: center;
  animation: fadeIn 0.8s ease-out 0.6s both;

  .footer-text {
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
  }
}

// 响应式调整
@media screen and (max-width: 576px) {
  .logo-section {
    margin-bottom: 32px;

    .logo-wrapper .logo-image {
      width: 64px;
      height: 64px;
    }

    .system-title {
      font-size: 28px;
    }

    .system-subtitle {
      font-size: 13px;
    }
  }

  .form-section {
    .submit-item {
      margin-top: 24px;
    }

    .submit-button {
      height: 44px;
      font-size: 15px;
    }
  }

  .footer-section {
    margin-top: 24px;
  }
}
</style>
