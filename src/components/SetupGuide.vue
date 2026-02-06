<template>
  <div>
    <!-- 引导遮罩层 -->
    <div v-if="visible" class="setup-guide-overlay" @click.self="handleSkip">
      <!-- 引导步骤指示器 -->
      <div class="guide-steps">
        <a-steps :current="currentStep" size="small">
          <a-step :title="$t('step1_title')" />
          <a-step :title="$t('step2_title')" />
          <a-step :title="$t('step3_title')" />
        </a-steps>
      </div>

      <!-- 引导内容卡片 -->
      <div class="guide-card" :style="cardPosition">
        <div class="guide-header">
          <h3>{{ currentStepConfig.title }}</h3>
          <a-button type="link" size="small" @click="handleSkip" style="color: #999;">
            {{ $t('skip') }}
          </a-button>
        </div>

        <div class="guide-content">
          <div class="guide-icon">
            <a-icon :type="currentStepConfig.icon" :style="{ fontSize: '48px', color: $themeColor }" />
          </div>
          <p class="guide-description">{{ currentStepConfig.description }}</p>

          <!-- 步骤1：欢迎 -->
          <div v-if="currentStep === 0" class="guide-welcome">
            <a-alert :message="$t('welcome_message')" type="info" show-icon style="margin-bottom: 16px;" />
            <ul class="guide-checklist">
              <li><a-icon type="check-circle" :style="{ color: $themeColor }" /> {{ $t('checklist_1') }}</li>
              <li><a-icon type="check-circle" :style="{ color: $themeColor }" /> {{ $t('checklist_2') }}</li>
            </ul>
          </div>

          <!-- 步骤2：配置Webhook -->
          <div v-if="currentStep === 1" class="guide-action">
            <a-alert :message="$t('webhook_hint')" type="warning" show-icon style="margin-bottom: 16px;" />
            <div class="guide-highlight">
              <a-icon type="api" /> {{ $t('webhook_location') }}
            </div>
          </div>

          <!-- 步骤3：添加Zabbix实例 -->
          <div v-if="currentStep === 2" class="guide-action">
            <a-alert :message="$t('zabbix_hint')" type="warning" show-icon style="margin-bottom: 16px;" />
            <div class="guide-highlight">
              <a-icon type="database" /> {{ $t('zabbix_location') }}
            </div>
          </div>
        </div>

        <div class="guide-footer">
          <a-button v-if="currentStep > 0" @click="prevStep">
            <a-icon type="left" /> {{ $t('previous') }}
          </a-button>
          <a-button v-if="currentStep < 2" type="primary" @click="nextStep">
            {{ $t('next') }} <a-icon type="right" />
          </a-button>
          <a-button v-if="currentStep === 2" type="primary" @click="finishGuide">
            <a-icon type="check" /> {{ $t('finish') }}
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SetupGuide',
  i18n: require('./SetupGuide-i18n'),
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentStep: 0,
      cardPosition: {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }
  },
  computed: {
    currentStepConfig() {
      const steps = [
        {
          title: this.$t('step1_title'),
          icon: 'smile',
          description: this.$t('step1_desc')
        },
        {
          title: this.$t('step2_title'),
          icon: 'api',
          description: this.$t('step2_desc')
        },
        {
          title: this.$t('step3_title'),
          icon: 'database',
          description: this.$t('step3_desc')
        }
      ]
      return steps[this.currentStep]
    }
  },
  methods: {
    async navigateTo(step, path) {
      try {
        await this.$router.push(path)
        this.currentStep = step
      } catch (error) {
        const message = error && error.message ? error.message : ''
        const isDuplicated = error && error.name === 'NavigationDuplicated'
        if (isDuplicated || message.includes('Avoided redundant navigation')) {
          this.currentStep = step
        }
      }
    },
    nextStep() {
      if (this.currentStep === 0) {
        // 第一步完成后，跳转到参数配置页面
        this.navigateTo(1, '/system/config')
      } else if (this.currentStep === 1) {
        // 第二步完成后，跳转到Zabbix管理页面
        this.navigateTo(2, '/system/zabbix')
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        if (this.currentStep === 1) {
          this.navigateTo(0, '/dashboard/workplace')
        } else if (this.currentStep === 2) {
          this.navigateTo(1, '/system/config')
        }
      }
    },
    finishGuide() {
      this.$emit('finish')
    },
    handleSkip() {
      this.$confirm({
        title: this.$t('skip_confirm_title'),
        content: this.$t('skip_confirm_content'),
        okText: this.$t('skip_confirm_ok'),
        cancelText: this.$t('skip_confirm_cancel'),
        onOk: () => {
          this.$emit('skip')
        }
      })
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.currentStep = 0
      }
    }
  }
}
</script>

<style scoped>
.setup-guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-steps {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 20px 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 500px;
}

.guide-card {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.guide-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.guide-content {
  padding: 24px;
}

.guide-icon {
  text-align: center;
  margin-bottom: 20px;
}

.guide-description {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  text-align: center;
}

.guide-welcome {
  margin-top: 16px;
}

.guide-checklist {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.guide-checklist li {
  padding: 8px 0;
  font-size: 14px;
  color: #333;
}

.guide-checklist li .anticon {
  margin-right: 8px;
}

.guide-action {
  margin-top: 16px;
}

.guide-highlight {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 4px;
  border-left: 3px solid #1890ff;
  font-size: 14px;
  color: #333;
}

.guide-highlight .anticon {
  margin-right: 8px;
  color: #1890ff;
}

.guide-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.guide-footer .ant-btn {
  flex: 1;
}
</style>
