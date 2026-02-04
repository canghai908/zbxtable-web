<template>
  <common-layout>
    <div class="top">
      <div class="header">
        <span class="title">{{ systemName }}</span>
        <div>
          <span class="title" style="font-size: 25px;"></span>
        </div>
      </div>
      <div class="desc"></div>
    </div>
    <div class="login">
      <a-form @submit="onSubmit" :form="form">
        <a-tabs size="large" :tabBarStyle="{textAlign: 'center'}" style="padding: 0 2px;">
          <a-tab-pane tab="登录" key="1">
            <a-alert type="error" :closable="true" v-show="error" :message="error" showIcon style="margin-bottom: 24px;" />
            <a-form-item>
              <a-input autocomplete="autocomplete" size="large" v-decorator="['name', {rules: [{ required: true, message: '请输入账户名', whitespace: true}]}]">
                <a-icon slot="prefix" type="user" />
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-input size="large" autocomplete="autocomplete" type="password" v-decorator="['password', {rules: [{ required: true, message: '请输入密码', whitespace: true}]}]">
                <a-icon slot="prefix" type="lock" />
              </a-input>
            </a-form-item>
          </a-tab-pane>
        </a-tabs>
        <a-form-item>
          <a-button :loading="logging" style="width: 100%;margin-top: 24px" size="large" htmlType="submit" type="primary">登录</a-button>
        </a-form-item>
      </a-form>
    </div>
  </common-layout>
</template>

<script>
import CommonLayout from '@/layouts/CommonLayout'
import { login, getRoutesConfig } from '@/services/user'
import { getPublicSystemInfo } from '@/services/admin'
import { setAuthorization } from '@/utils/request'
import { loadRoutes } from '@/utils/routerUtil'
import { mapMutations } from 'vuex'
export default {
  name: 'Login',
  components: { CommonLayout },
  data() {
    return {
      logging: false,
      error: '',
      form: this.$form.createForm(this),
      systemName: 'ZbxTable'
    }
  },
  computed: {
    // systemName() {
    //   return this.$store.state.setting.systemName
    // }
  },
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
          if (infoRes.data.system_logo) {
            this.$store.commit('setting/setSystemLogo', infoRes.data.system_logo)
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
          console.log('用户主题配置已加载:', themeConfig)
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
          const systemNameConfig = configs.find(item => item.key === 'system_name')
          const systemLogoConfig = configs.find(item => item.key === 'system_logo')
          
          if (systemNameConfig && systemNameConfig.value) {
            this.$store.commit('setting/setSystemName', systemNameConfig.value)
          }
          
          if (systemLogoConfig && systemLogoConfig.value) {
            this.$store.commit('setting/setSystemLogo', systemLogoConfig.value)
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
        const { user, permissions, roles } = (loginRes && loginRes.data) || {}
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
            this.$message.success(loginRes.message || '登录成功', 1)
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
.common-layout {
  .top {
    text-align: center;
    .header {
      height: 44px;
      line-height: 44px;
      a {
        text-decoration: none;
      }
      .logo {
        height: 44px;
        vertical-align: top;
        margin-right: 16px;
      }
      .title {
        font-size: 33px;
        color: @title-color;
        font-family: 'Myriad Pro', 'Helvetica Neue', Arial, Helvetica,
          sans-serif;
        font-weight: 600;
        position: relative;
        top: 2px;
      }
    }
    .desc {
      font-size: 14px;
      color: @text-color-second;
      margin-top: 12px;
      margin-bottom: 40px;
    }
  }
  .login {
    width: 368px;
    margin: 0 auto;
    @media screen and (max-width: 576px) {
      width: 95%;
    }
    @media screen and (max-width: 320px) {
      .captcha-button {
        font-size: 14px;
      }
    }
    .icon {
      font-size: 24px;
      color: @text-color-second;
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: @primary-color;
      }
    }
  }
}
</style>
