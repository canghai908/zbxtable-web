<template>
  <common-layout>
    <div class="top">
      <div class="header">
        <span class="title">ZbxTable</span>
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
      form: this.$form.createForm(this)
    }
  },
  computed: {
    systemName() {
      return this.$store.state.setting.systemName
    }
  },
  mounted() {
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
