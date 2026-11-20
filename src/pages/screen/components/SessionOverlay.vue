<template>
  <div class="session-overlay" v-if="visible">
    <div class="session-box">
      <div class="session-icon">
        <a-icon type="lock" />
      </div>
      <div class="session-title">会话已过期</div>
      <div class="session-desc">登录凭证已失效，请重新输入密码以继续大屏展示</div>
      <a-form class="session-form" @submit.prevent="submit">
        <a-form-item>
          <a-input
            v-model="username"
            prefix="user"
            placeholder="用户名"
            :disabled="loading"
            class="session-input"
          />
        </a-form-item>
        <a-form-item>
          <a-input-password
            v-model="password"
            prefix="lock"
            placeholder="密码"
            :disabled="loading"
            class="session-input"
            @pressEnter="submit"
          />
        </a-form-item>
        <div class="session-error" v-if="error">{{ error }}</div>
        <a-button
          type="primary"
          block
          :loading="loading"
          class="session-btn"
          @click="submit"
        >
          重新登录并继续
        </a-button>
      </a-form>
    </div>
  </div>
</template>

<script>
import { login } from '@/services/user'
import { setAuthorization } from '@/utils/request'

export default {
  name: 'SessionOverlay',
  props: {
    visible: { type: Boolean, default: false },
    defaultUsername: { type: String, default: '' }
  },
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: ''
    }
  },
  watch: {
    visible(v) {
      if (v) {
        this.username = this.defaultUsername
        this.password = ''
        this.error = ''
      }
    }
  },
  methods: {
    async submit() {
      if (!this.username || !this.password) {
        this.error = '请输入用户名和密码'
        return
      }
      this.loading = true
      this.error = ''
      try {
        const res = await login(this.username, this.password)
        const token = res && res.data && res.data.token
        if (token) {
          setAuthorization({ token })
          this.$emit('success')
        } else {
          this.error = '登录失败，请检查用户名或密码'
        }
      } catch (e) {
        this.error = '登录失败，请检查用户名或密码'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.session-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(8, 12, 16, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
}

.session-box {
  width: min(360px, calc(100vw - 32px));
  background: #151b22;
  border: 1px solid rgba(215, 221, 228, 0.18);
  border-radius: 8px;
  padding: 32px 24px 24px;
  text-align: center;
  position: relative;

}

.session-icon {
  font-size: 36px;
  color: #ffc859;
  margin-bottom: 12px;
}

.session-title {
  font-size: 18px;
  font-weight: 500;
  color: #d7dde4;
  letter-spacing: 0;
  margin-bottom: 8px;
}

.session-desc {
  font-size: 12px;
  color: #9ba5b1;
  margin-bottom: 24px;
  line-height: 1.6;
}

.session-form {
  text-align: left;

  /deep/ .ant-input {
    background: #10151b;
    border-color: rgba(215, 221, 228, 0.2);
    color: #d7dde4;

    &:focus {
      border-color: #70bfd0;
      box-shadow: 0 0 0 2px rgba(112, 191, 208, 0.22);
    }
  }

  /deep/ .ant-input-prefix {
    color: #9ba5b1;
  }

  /deep/ .ant-form-item {
    margin-bottom: 12px;
  }
}

.session-error {
  font-size: 12px;
  color: #ff4d6d;
  margin-bottom: 10px;
  text-align: center;
}

.session-btn {
  background: #70bfd0;
  color: #10151b;
  border: none;
  height: 38px;
  font-size: 14px;
  letter-spacing: 0;
  font-weight: 500;
  transition: background-color 160ms ease;
  margin-top: 4px;

  &:hover {
    background: #8bc9d7;
  }
}
</style>
