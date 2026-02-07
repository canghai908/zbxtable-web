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
            <!-- Webhook配置表单 -->
            <div class="webhook-config-form">
              <a-form-model :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
                <a-form-model-item label="Webhook URL">
                  <a-input-group compact style="display: flex;">
                    <a-input v-model="webhookUrl" placeholder="http://your-domain:8088" style="flex: 1;" />
                    <a-button type="primary" @click="getCurrentWebUrl" :loading="gettingUrl">
                      <a-icon type="link" /> {{ $t('get_current_url') }}
                    </a-button>
                  </a-input-group>
                  <div class="form-hint">{{ $t('webhook_url_hint') }}</div>
                </a-form-model-item>
                
                <a-form-model-item :wrapper-col="{ span: 16, offset: 8 }">
                  <a-button type="primary" @click="saveWebhookUrl" :loading="savingWebhook" :disabled="!webhookUrl">
                    <a-icon type="save" /> {{ $t('save_config') }}
                  </a-button>
                  <a-tag v-if="webhookSaved" color="green" style="margin-left: 8px;">
                    <a-icon type="check-circle" /> {{ $t('config_saved') }}
                  </a-tag>
                </a-form-model-item>
              </a-form-model>
            </div>
          </div>

          <!-- 步骤3：添加Zabbix实例 -->
          <div v-if="currentStep === 2" class="guide-action">
            <!-- 实例添加状态 -->
            <div v-if="!instanceAdded" class="instance-add-prompt">
              <a-button type="primary" size="large" @click="openZabbixInstanceModal">
                <a-icon type="plus" /> {{ $t('btn_add_instance') }}
              </a-button>
            </div>
            
            <!-- 实例添加成功提示 -->
            <a-alert 
              v-if="instanceAdded"
              :message="$t('instance_added_success')"
              type="success"
              show-icon
              style="margin-bottom: 16px;">
              <template slot="description">
                <div>{{ $t('instance_added_desc') }}</div>
                <div style="margin-top: 8px;">
                  <a-tag :color="$themeColor">{{ addedInstanceName }}</a-tag>
                </div>
              </template>
            </a-alert>
          </div>
        </div>

        <div class="guide-footer">
          <a-button v-if="currentStep > 0" @click="prevStep">
            <a-icon type="left" /> {{ $t('previous') }}
          </a-button>
          <a-button v-if="currentStep < 2" type="primary" @click="nextStep" :disabled="currentStep === 1 && !webhookSaved">
            {{ $t('next') }} <a-icon type="right" />
          </a-button>
          <a-button v-if="currentStep === 2" type="primary" @click="finishGuide" :disabled="!instanceAdded">
            <a-icon type="check" /> {{ $t('finish') }}
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { configGetList, configUpdate } from '@/services/admin'

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
      },
      webhookUrl: '',
      gettingUrl: false,
      savingWebhook: false,
      webhookSaved: false,
      instanceAdded: false,
      addedInstanceName: ''
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
    // 获取当前URL
    getCurrentWebUrl() {
      this.gettingUrl = true
      try {
        const protocol = window.location.protocol
        const hostname = window.location.hostname
        const port = window.location.port
        this.webhookUrl = `${protocol}//${hostname}${port ? ':' + port : ''}`
        this.$message.success(this.$t('get_url_success'))
      } catch (error) {
        this.$message.error(this.$t('get_url_failed'))
      } finally {
        this.gettingUrl = false
      }
    },
    // 保存Webhook URL
    async saveWebhookUrl() {
      if (!this.webhookUrl) {
        this.$message.warning(this.$t('please_input_webhook_url'))
        return
      }
      
      this.savingWebhook = true
      try {
        // 先获取配置列表找到webhook_url的ID
        const listRes = await configGetList()
        const listBiz = (listRes && listRes.data) ? listRes.data : listRes
        
        if (listBiz && listBiz.code === 200) {
          const configs = listBiz.data.items || []
          const webhookConfig = configs.find(c => c.key === 'webhook_url')
          
          if (webhookConfig) {
            // 更新配置
            const updateRes = await configUpdate(webhookConfig.id, {
              key: 'webhook_url',
              value: this.webhookUrl,
              name: webhookConfig.name,
              comment: webhookConfig.comment,
              category: webhookConfig.category
            })
            
            const updateBiz = (updateRes && updateRes.data) ? updateRes.data : updateRes
            if (updateBiz && updateBiz.code === 200) {
              this.webhookSaved = true
              this.$message.success(this.$t('save_success'))
            } else {
              this.$message.error((updateBiz && updateBiz.message) || this.$t('save_failed'))
            }
          } else {
            this.$message.error(this.$t('webhook_config_not_found'))
          }
        } else {
          this.$message.error((listBiz && listBiz.message) || this.$t('get_config_failed'))
        }
      } catch (error) {
        console.error('保存Webhook配置失败:', error)
        this.$message.error(this.$t('save_failed'))
      } finally {
        this.savingWebhook = false
      }
    },
    nextStep() {
      if (this.currentStep === 0) {
        // 第一步完成后，进入第二步（在引导中配置webhook）
        this.currentStep = 1
        // 自动获取当前URL
        this.getCurrentWebUrl()
      } else if (this.currentStep === 1) {
        // 第二步完成后，进入第三步（添加Zabbix实例）
        this.currentStep = 2
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    // 打开Zabbix实例添加对话框
    openZabbixInstanceModal() {
      // 通知父组件打开Zabbix实例对话框
      this.$emit('open-zabbix-modal')
    },
    // 实例添加成功的回调
    onInstanceAdded(instanceName) {
      console.log('SetupGuide.onInstanceAdded 被调用，实例名称:', instanceName)
      this.instanceAdded = true
      this.addedInstanceName = instanceName
      this.$message.success(this.$t('instance_add_success'))
      
      // 立即完成引导并关闭，不等待
      console.log('调用 finishGuide')
      this.finishGuide()
    },
    async finishGuide() {
      console.log('SetupGuide.finishGuide 被调用，触发 finish 事件')
      // 先关闭引导界面
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
        this.webhookUrl = ''
        this.webhookSaved = false
        this.instanceAdded = false
        this.addedInstanceName = ''
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
  z-index: 999;
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

.webhook-config-form {
  background: #fafafa;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.form-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
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

.instance-add-prompt {
  text-align: center;
  padding: 32px 16px;
}

.prompt-icon {
  margin-bottom: 16px;
}

.prompt-text {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}
</style>
