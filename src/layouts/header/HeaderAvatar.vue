<template>
  <div class="header-avatar-wrap">
    <a-dropdown :trigger="['click']" v-model="dropdownVisible">
      <div class="header-avatar" style="cursor: pointer">
        <a-avatar class="avatar" size="small" shape="circle" :src="avatarUrl" />
        <span class="name">{{user.name}}</span>
      </div>
      <a-menu :class="['avatar-menu']" slot="overlay" @click="handleMenuClick">
        <a-menu-item key="change-password">
          <a-icon style="margin-right: 8px;" type="lock" />
          <span>{{ $t('change_password_title') }}</span>
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item key="logout">
          <a-icon style="margin-right: 8px;" type="poweroff" />
          <span>{{ $t('logout_btn') }}</span>
        </a-menu-item>
      </a-menu>
    </a-dropdown>
    <a-modal
      :visible="changePasswordVisible"
      :title="$t('change_password_title')"
      :footer="null"
      :destroyOnClose="true"
      @cancel="closeChangePassword"
      width="680px"
    >
      <change-password-form
        modal-mode
        @cancel="closeChangePassword"
        @success="handlePasswordChanged"
      />
    </a-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { logout } from '@/services/user'
import { stopTokenRefresher } from '@/utils/tokenRefresher'
import ChangePasswordForm from '@/pages/system/components/ChangePasswordForm.vue'

export default {
  name: 'HeaderAvatar',
  version: '',
  i18n: require('@/pages/system/i18n'),
  components: { ChangePasswordForm },
  data() {
    return {
      dropdownVisible: false,
      changePasswordVisible: false
    }
  },
  computed: {
    ...mapGetters('account', ['user']),
    avatarUrl() {
      // 如果用户头像为空或未定义，使用默认头像
      if (!this.user.avatar || this.user.avatar.trim() === '') {
        return require('@/assets/img/avatar.gif')
      }
      return this.user.avatar
    }
  },
  methods: {
    handleMenuClick({ key }) {
      if (key === 'change-password') {
        this.openChangePassword()
        return
      }
      if (key === 'logout') {
        this.logout()
      }
    },
    openChangePassword() {
      this.dropdownVisible = false
      const activeElement = typeof document !== 'undefined' ? document.activeElement : null
      if (activeElement && typeof activeElement.blur === 'function') {
        activeElement.blur()
      }
      window.setTimeout(() => {
        this.changePasswordVisible = true
      }, 80)
    },
    closeChangePassword() {
      this.changePasswordVisible = false
    },
    handlePasswordChanged() {
      this.$message.success(this.$t('password_change_success_relogin'))
      this.changePasswordVisible = false
      this.logout()
    },
    logout() {
      stopTokenRefresher()
      logout()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less">
.header-avatar {
  display: inline-flex;
  .avatar,
  .name {
    align-self: center;
  }
  .avatar {
    margin-right: 8px;
  }
  .name {
    font-weight: 500;
  }
}
.avatar-menu {
  width: 150px;
}
</style>
