<template>
  <page-layout>
    <div class="config-container">
      <a-card :bordered="false">
        <a-tabs v-model="activeTab" type="card">
          <!-- 系统配置 -->
          <a-tab-pane key="system" tab="系统配置">
            <a-form-model ref="systemForm" :model="systemForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-form-model-item v-for="item in systemConfigs" :key="item.id" :label="item.name">
                <a-select v-if="isBooleanConfig(item.key)" v-model="systemForm[item.key]" :placeholder="item.comment" style="width: 100%">
                  <a-select-option v-for="opt in getBooleanOptions(item.key)" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </a-select-option>
                </a-select>
                <a-input v-else v-model="systemForm[item.key]" :placeholder="item.comment" />
                <div class="config-hint">{{ item.comment }}</div>
              </a-form-model-item>
              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('system')" :loading="saveLoading">保存系统配置</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- 邮件配置 -->
          <a-tab-pane key="email" tab="邮件配置">
            <a-form-model ref="emailForm" :model="emailForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-form-model-item v-for="item in emailConfigs" :key="item.id" :label="item.name">
                <a-select v-if="isBooleanConfig(item.key)" v-model="emailForm[item.key]" :placeholder="item.comment" style="width: 100%">
                  <a-select-option v-for="opt in getBooleanOptions(item.key)" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </a-select-option>
                </a-select>
                <a-input-password v-else-if="item.key === 'email_secret'" v-model="emailForm[item.key]" :placeholder="item.comment" />
                <a-input v-else v-model="emailForm[item.key]" :placeholder="item.comment" />
                <div class="config-hint">{{ item.comment }}</div>
              </a-form-model-item>
              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('email')" :loading="saveLoading">保存邮件配置</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- 企业微信配置 -->
          <a-tab-pane key="wechat" tab="企业微信配置">
            <a-form-model ref="wechatForm" :model="wechatForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-form-model-item v-for="item in wechatConfigs" :key="item.id" :label="item.name">
                <a-select v-if="isBooleanConfig(item.key)" v-model="wechatForm[item.key]" :placeholder="item.comment" style="width: 100%">
                  <a-select-option v-for="opt in getBooleanOptions(item.key)" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </a-select-option>
                </a-select>
                <a-input-password v-else-if="item.key === 'wechat_secret'" v-model="wechatForm[item.key]" :placeholder="item.comment" />
                <a-input v-else v-model="wechatForm[item.key]" :placeholder="item.comment" />
                <div class="config-hint">{{ item.comment }}</div>
              </a-form-model-item>
              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('wechat')" :loading="saveLoading">保存企业微信配置</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- Ollama AI 配置 -->
          <a-tab-pane key="ollama" tab="Ollama AI 配置">
            <a-form-model ref="ollamaForm" :model="ollamaForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-form-model-item v-for="item in ollamaConfigs" :key="item.id" :label="item.name">
                <a-select v-if="isBooleanConfig(item.key)" v-model="ollamaForm[item.key]" :placeholder="item.comment" style="width: 100%">
                  <a-select-option v-for="opt in getBooleanOptions(item.key)" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </a-select-option>
                </a-select>
                <a-input v-else v-model="ollamaForm[item.key]" :placeholder="item.comment" />
                <div class="config-hint">{{ item.comment }}</div>
              </a-form-model-item>
              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('ollama')" :loading="saveLoading">保存 Ollama 配置</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- 安全配置 -->
          <a-tab-pane key="security" tab="安全配置">
            <a-form-model ref="securityForm" :model="securityForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-form-model-item v-for="item in securityConfigs" :key="item.id" :label="item.name">
                <a-input 
                  :value="getDisplayValue(item.key)" 
                  :placeholder="item.comment" 
                  disabled
                  style="font-family: 'Courier New', monospace; background-color: #f5f5f5;">
                  <template slot="suffix">
                    <a-tooltip :title="isKeyVisible ? '隐藏密钥' : '显示完整密钥'">
                      <a-icon 
                        :type="isKeyVisible ? 'eye-invisible' : 'eye'" 
                        style="cursor: pointer; color: #1890ff;" 
                        @click="toggleKeyVisibility" />
                    </a-tooltip>
                  </template>
                </a-input>
                <div class="config-hint">
                  <a-icon type="lock" style="color: #faad14;" /> {{ item.comment }}
                </div>
                <a-alert 
                  v-if="item.key === 'encryption_key'" 
                  message="安全提示" 
                  type="warning" 
                  show-icon 
                  style="margin-top: 12px;">
                  <template slot="description">
                    <div style="font-size: 12px; line-height: 1.6;">
                      <div>• 此密钥用于加密存储 Zabbix 密码和 Token 等敏感信息</div>
                      <div>• 系统初始化时自动生成，不可通过界面修改</div>
                      <div>• 请妥善保管此密钥，丢失将导致已加密数据无法解密</div>
                      <div>• 建议定期备份数据库，包含此密钥配置</div>
                      <div style="margin-top: 8px;">
                        <a-button 
                          size="small" 
                          icon="copy" 
                          @click="copyEncryptionKey"
                          :disabled="!isKeyVisible">
                          复制密钥
                        </a-button>
                        <span v-if="!isKeyVisible" style="margin-left: 8px; color: #999; font-size: 11px;">
                          需要先显示完整密钥才能复制
                        </span>
                      </div>
                    </div>
                  </template>
                </a-alert>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { parseTimeFun } from '@/utils/formatter'
import { configGetList, configUpdate } from '@/services/admin'
export default {
  name: 'edit',
  i18n: require('./i18n'),
  components: { PageLayout },
  data() {
    return {
      loading: false,
      list: [],
      activeTab: 'system',
      systemForm: {},
      emailForm: {},
      wechatForm: {},
      ollamaForm: {},
      securityForm: {},
      saveLoading: false,
      isKeyVisible: false  // 控制密钥是否可见
    }
  },
  computed: {
    systemConfigs() {
      return this.list.filter(item => 
        item.key === 'zbx_dash' || 
        item.key === 'dash_id' || 
        item.key === 'sync_inventory' ||
        item.key === 'webhook_url'
      )
    },
    emailConfigs() {
      return this.list.filter(item => 
        item.key && item.key.startsWith('email_')
      )
    },
    wechatConfigs() {
      return this.list.filter(item => 
        item.key && item.key.startsWith('wechat_')
      )
    },
    ollamaConfigs() {
      return this.list.filter(item => 
        item.key && item.key.startsWith('ollama_')
      )
    },
    securityConfigs() {
      return this.list.filter(item => 
        item.key === 'encryption_key'
      )
    }
  },
  filters: {
    parsetime(v) {
      return parseTimeFun(v)
    }
  },
  created() {
    this.init()
  },
  methods: {
    isBooleanConfig(key) {
      // 判断是否为布尔类型的配置项（开启/关闭）
      const booleanKeys = ['zbx_dash', 'sync_inventory', 'wechat_enabled', 'email_isSSl']
      return booleanKeys.includes(key)
    },
    getBooleanOptions(key) {
      // email_isSSl 使用 true/false，其他使用 1/0
      if (key === 'email_isSSl') {
        return [
          { label: '开启', value: 'true' },
          { label: '关闭', value: 'false' }
        ]
      }
      return [
        { label: '开启', value: '1' },
        { label: '关闭', value: '0' }
      ]
    },
    init() {
      this.loading = true
      configGetList()
        .then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            this.list = res.data.items || []
            this.initForms()
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    initForms() {
      // 初始化各个表单的数据
      this.systemConfigs.forEach(item => {
        this.$set(this.systemForm, item.key, item.value)
      })
      this.emailConfigs.forEach(item => {
        this.$set(this.emailForm, item.key, item.value)
      })
      this.wechatConfigs.forEach(item => {
        this.$set(this.wechatForm, item.key, item.value)
      })
      this.ollamaConfigs.forEach(item => {
        this.$set(this.ollamaForm, item.key, item.value)
      })
      this.securityConfigs.forEach(item => {
        this.$set(this.securityForm, item.key, item.value)
      })
    },
    async saveCategory(category) {
      this.saveLoading = true
      try {
        let configs = []
        let form = {}
        
        switch(category) {
          case 'system':
            configs = this.systemConfigs
            form = this.systemForm
            break
          case 'email':
            configs = this.emailConfigs
            form = this.emailForm
            break
          case 'wechat':
            configs = this.wechatConfigs
            form = this.wechatForm
            break
          case 'ollama':
            configs = this.ollamaConfigs
            form = this.ollamaForm
            break
        }
        
        // 批量更新配置
        const promises = configs.map(item => {
          return configUpdate(item.id, { value: form[item.key] || '' })
        })
        
        await Promise.all(promises)
        this.$message.success('保存成功')
        this.init()
      } catch (error) {
        this.$message.error('保存失败')
      } finally {
        this.saveLoading = false
      }
    },
    // 获取显示的值（加密密钥部分隐藏）
    getDisplayValue(key) {
      if (key === 'encryption_key') {
        const value = this.securityForm[key] || ''
        if (!value) return ''
        
        // 如果密钥可见，显示完整内容
        if (this.isKeyVisible) {
          return value
        }
        
        // 否则只显示前8个和后8个字符，中间用星号代替
        if (value.length <= 16) {
          // 如果密钥太短，显示前后各4个字符
          const showChars = Math.floor(value.length / 4)
          return value.substring(0, showChars) + '***' + value.substring(value.length - showChars)
        }
        
        return value.substring(0, 8) + '************************' + value.substring(value.length - 8)
      }
      return this.securityForm[key] || ''
    },
    // 切换密钥可见性
    toggleKeyVisibility() {
      this.isKeyVisible = !this.isKeyVisible
    },
    // 复制加密密钥
    copyEncryptionKey() {
      const key = this.securityForm['encryption_key']
      if (!key) {
        this.$message.warning('密钥为空')
        return
      }
      
      const textarea = document.createElement('textarea')
      textarea.value = key
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      
      try {
        document.execCommand('copy')
        this.$message.success('加密密钥已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败，请手动复制')
      }
      
      document.body.removeChild(textarea)
    }
  }
}
</script>

<style lang="less" scoped>
.config-container {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 200px);
}

.config-hint {
  color: #999;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.5;
}

/deep/ .ant-card {
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

/deep/ .ant-tabs-card > .ant-tabs-content {
  margin-top: -16px;
}

/deep/ .ant-tabs-card > .ant-tabs-content > .ant-tabs-tabpane {
  background: #fff;
  padding: 24px;
}

/deep/ .ant-tabs-card > .ant-tabs-bar {
  border-color: #fff;
  margin-bottom: 0;
}

/deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
  border-color: transparent;
  background: transparent;
  margin-right: 4px;
}

/deep/ .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active {
  border-color: #fff;
  background: #fff;
  font-weight: 600;
}

/deep/ .ant-form-item {
  margin-bottom: 20px;
}

/deep/ .ant-input,
/deep/ .ant-input-password {
  border-radius: 4px;
}
</style>
