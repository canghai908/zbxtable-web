<template>
  <div class="change-password-shell" :class="{ 'is-modal': modalMode }">
    <div v-if="!modalMode" class="hero">
      <div>
        <div class="hero-title">{{ $t('change_password_title') }}</div>
        <div class="hero-desc">{{ $t('change_password_desc') }}</div>
      </div>
      <div class="hero-badge">
        <a-icon type="safety-certificate" />
      </div>
    </div>

    <a-alert
      type="info"
      show-icon
      :message="$t('change_password_logout_notice')"
      class="logout-alert"
    />

    <a-form-model
      ref="passwordForm"
      :model="password"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
      class="password-form"
    >
      <a-form-model-item :label="$t('pass_cur')" prop="old">
        <a-input-password
          v-model.trim="password.old"
          :placeholder="$t('placeholder_current_password')"
          allow-clear
        />
      </a-form-model-item>

      <a-form-model-item :label="$t('pass_new')" prop="new">
        <a-input-password
          v-model.trim="password.new"
          :placeholder="$t('placeholder_new_password')"
          allow-clear
        />
      </a-form-model-item>

      <a-form-model-item :label="$t('pass_confirm')" prop="confirm">
        <a-input-password
          v-model.trim="password.confirm"
          :placeholder="$t('placeholder_confirm_password')"
          allow-clear
        />
      </a-form-model-item>

      <a-form-model-item :wrapper-col="actionWrapperCol" class="actions">
        <a-button type="primary" :loading="submitting" @click="submit">
          {{ $t('save') }}
        </a-button>
        <a-button style="margin-left: 12px;" @click="resetForm">
          {{ modalMode ? $t('cancel_btn') : $t('reset_btn') }}
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script>
import { managerChpwd } from "@/services/admin";

export default {
  name: 'ChangePasswordForm',
  i18n: require('../i18n'),
  props: {
    modalMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const validateConfirm = (rule, value, callback) => {
      if (!value) {
        callback(new Error(this.$t('placeholder_confirm_password')))
        return
      }
      if (value !== this.password.new) {
        callback(new Error(this.$t('password_confirm_mismatch')))
        return
      }
      callback()
    }

    return {
      submitting: false,
      password: {
        old: '',
        new: '',
        confirm: '',
      },
      rules: {
        old: [
          { required: true, message: this.$t('placeholder_current_password'), trigger: 'blur' }
        ],
        new: [
          { required: true, message: this.$t('placeholder_new_password'), trigger: 'blur' }
        ],
        confirm: [
          { required: true, validator: validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    labelCol() {
      return this.modalMode ? { span: 7 } : { span: 6 }
    },
    wrapperCol() {
      return this.modalMode ? { span: 15 } : { span: 14 }
    },
    actionWrapperCol() {
      return this.modalMode ? { span: 15, offset: 7 } : { span: 14, offset: 6 }
    }
  },
  methods: {
    resetForm() {
      this.password = {
        old: '',
        new: '',
        confirm: ''
      }
      if (this.$refs.passwordForm) {
        this.$refs.passwordForm.clearValidate()
      }
      if (this.modalMode) {
        this.$emit('cancel')
      }
    },
    submit() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (!valid) {
          return false
        }

        this.submitting = true
        try {
          const resp = await managerChpwd({
            old: this.password.old,
            new: this.password.new
          })
          const res = resp.data
          if (res.code == 200) {
            this.$emit('success')
            return
          }
          this.$message.warn(res.message)
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 28px 28px 22px;
  border-radius: 16px;
  background:
    radial-gradient(circle at top left, rgba(110, 75, 255, 0.16), transparent 34%),
    linear-gradient(135deg, #f8fbff 0%, #f5f2ff 100%);
}

.hero-title {
  font-size: 24px;
  line-height: 1.3;
  font-weight: 600;
  color: #1f2a44;
}

.hero-desc {
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(31, 42, 68, 0.68);
}

.hero-badge {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  color: #6b45ff;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: inset 0 0 0 1px rgba(107, 69, 255, 0.08);
}

.logout-alert {
  margin-bottom: 24px;
  border-radius: 12px;
}

.password-form {
  padding: 4px 12px 12px 0;
}

.actions {
  margin-top: 30px;
}

.is-modal {
  padding-top: 4px;
}

.is-modal .password-form {
  padding-right: 0;
}

@media (max-width: 768px) {
  .hero {
    padding: 22px 18px;
    align-items: flex-start;
  }

  .hero-badge {
    width: 52px;
    height: 52px;
    font-size: 24px;
    margin-left: 16px;
  }

  .password-form {
    padding-right: 0;
  }
}
</style>
