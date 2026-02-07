<template>
  <page-layout>
    <div class="config-container">
      <a-card :bordered="false">
        <a-tabs v-model="activeTab" type="card">
          <!-- 系统配置 -->
          <a-tab-pane key="system" :tab="$t('systemTab')">
            <a-form-model ref="systemForm" :model="systemForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <!-- 外观配置部分 -->
              <a-divider orientation="left">{{$t('appearanceConfig')}}</a-divider>
              
              <a-form-model-item :label="$t('systemName')">
                <a-input v-model="systemForm.system_name" :placeholder="$t('systemNamePlaceholder')" />
                <div class="config-hint">{{$t('systemNameHint')}}</div>
              </a-form-model-item>
              
              <a-form-model-item :label="$t('systemLogo')">
                <div class="logo-upload-container">
                  <div class="logo-preview">
                    <img v-if="systemForm.system_logo" :src="systemForm.system_logo" :alt="$t('logoPreview')" />
                    <div v-else class="logo-placeholder">
                      <a-icon type="picture" style="font-size: 48px; color: #ccc;" />
                    </div>
                  </div>
                  <div class="logo-upload-actions">
                    <a-upload
                      name="file"
                      :show-upload-list="false"
                      :before-upload="beforeLogoUpload"
                      :custom-request="handleLogoUpload"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml">
                      <a-button :loading="logoUploading">
                        <a-icon type="upload" /> {{logoUploading ? $t('logoUploading') : $t('uploadLogo')}}
                      </a-button>
                    </a-upload>
                    <div class="upload-hint">
                      <a-icon type="info-circle" /> {{$t('logoUploadHint')}}
                    </div>
                  </div>
                </div>
              </a-form-model-item>
              
              <!-- 系统配置部分 -->
              <a-divider orientation="left">{{$t('systemSettings')}}</a-divider>
              
              <a-form-model-item v-for="item in systemOnlyConfigs" :key="item.id" :label="item.name">
                <a-select v-if="isBooleanConfig(item.key)" v-model="systemForm[item.key]" :placeholder="item.comment" style="width: 100%">
                  <a-select-option v-for="opt in getBooleanOptions(item.key)" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </a-select-option>
                </a-select>
                <a-input-group v-else-if="item.key === 'webhook_url'" compact style="display: flex;">
                  <a-input v-model="systemForm[item.key]" :placeholder="item.comment" style="flex: 1;" />
                  <a-button type="primary" @click="getCurrentWebUrl" :loading="gettingUrl">
                    <a-icon type="link" /> {{gettingUrl ? $t('gettingUrl') : $t('getCurrentUrl')}}
                  </a-button>
                </a-input-group>
                <a-input v-else v-model="systemForm[item.key]" :placeholder="item.comment" />
                <div class="config-hint">{{ item.comment }}</div>
              </a-form-model-item>
              
              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('system')" :loading="saveLoading">{{$t('save')}}</a-button>
                <a-button style="margin-left: 10px;" @click="previewAppearance">{{$t('previewEffect')}}</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- 邮件配置 -->
          <a-tab-pane key="email" :tab="$t('emailTab')">
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
                <a-space>
                  <a-button type="primary" @click="saveCategory('email')" :loading="saveLoading">{{$t('save')}}</a-button>
                  <a-button @click="showTestEmailModal">
                    <a-icon type="mail" /> {{$t('testEmail')}}
                  </a-button>
                </a-space>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- 企业微信配置 -->
          <a-tab-pane key="wechat" :tab="$t('wechatTab')">
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
                <a-space>
                  <a-button type="primary" @click="saveCategory('wechat')" :loading="saveLoading">{{$t('save')}}</a-button>
                  <a-button @click="showTestWechatModal">
                    <a-icon type="wechat" /> {{$t('testWechat')}}
                  </a-button>
                </a-space>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- AI 配置 -->
          <a-tab-pane key="ai" :tab="$t('aiTab')">
            <a-form-model ref="aiForm" :model="aiForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <!-- AI 类型选择 -->
              <a-form-model-item :label="getConfigName('ai_type')">
                <a-select v-model="aiForm.ai_type" :placeholder="getConfigComment('ai_type')" style="width: 100%" @change="onAiTypeChange">
                  <a-select-option value="ollama">Ollama</a-select-option>
                  <a-select-option value="deepseek">Deepseek</a-select-option>
                </a-select>
                <div class="config-hint">{{ getConfigComment('ai_type') }}</div>
              </a-form-model-item>

              <!-- Ollama 配置项 -->
              <template v-if="aiForm.ai_type === 'ollama'">
                <a-form-model-item v-for="item in ollamaConfigs" :key="item.id" :label="item.name">
                  <a-input v-model="aiForm[item.key]" :placeholder="item.comment" />
                  <div class="config-hint">{{ item.comment }}</div>
                </a-form-model-item>
              </template>

              <!-- Deepseek 配置项 -->
              <template v-if="aiForm.ai_type === 'deepseek'">
                <a-form-model-item v-for="item in deepseekConfigs" :key="item.id" :label="item.name">
                  <a-input-password v-if="item.key === 'deepseek_api_key'" v-model="aiForm[item.key]" :placeholder="item.comment" />
                  <a-input v-else v-model="aiForm[item.key]" :placeholder="item.comment" />
                  <div class="config-hint">{{ item.comment }}</div>
                </a-form-model-item>
              </template>

              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('ai')" :loading="saveLoading">{{$t('save')}}</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-tab-pane>

          <!-- 安全配置 -->
          <a-tab-pane key="security" :tab="$t('securityTab')">
            <a-form-model ref="securityForm" :model="securityForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <a-form-model-item v-for="item in securityConfigs" :key="item.id" :label="item.name">
                <a-input 
                  :value="getDisplayValue(item.key)" 
                  :placeholder="item.comment" 
                  disabled
                  style="font-family: 'Courier New', monospace; background-color: #f5f5f5;">
                  <template slot="suffix">
                    <a-tooltip :title="isKeyVisible ? $t('hideKey') : $t('showKey')">
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
                  :message="$t('securityWarning')" 
                  type="warning" 
                  show-icon 
                  style="margin-top: 12px;">
                  <template slot="description">
                    <div style="font-size: 12px; line-height: 1.6;">
                      <div>• {{$t('keyDesc1', {defaultMessage: '此密钥用于加密存储 Zabbix 密码和 Token 等敏感信息'})}}</div>
                      <div>• {{$t('keyDesc2', {defaultMessage: '系统初始化时自动生成，不可通过界面修改'})}}</div>
                      <div>• {{$t('keyDesc3', {defaultMessage: '请妥善保管此密钥，丢失将导致已加密数据无法解密'})}}</div>
                      <div>• {{$t('keyDesc4', {defaultMessage: '建议定期备份数据库，包含此密钥配置'})}}</div>
                      <div style="margin-top: 8px;">
                        <a-button 
                          size="small" 
                          icon="copy" 
                          @click="copyEncryptionKey"
                          :disabled="!isKeyVisible">
                          {{ $t('copyKey') }}
                        </a-button>
                        <span v-if="!isKeyVisible" style="margin-left: 8px; color: #999; font-size: 11px;">
                          {{ $t('needShowKeyFirst') }}
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

    <!-- 测试邮件对话框 -->
    <a-modal
      :title="$t('testEmailTitle')"
      :visible="testEmailVisible"
      :confirm-loading="testingEmail"
      @ok="handleTestEmail"
      @cancel="testEmailVisible = false">
      <div>
        <a-input v-model="testEmailAddress" :placeholder="$t('testEmailPlaceholder')" size="large" />
        <div class="config-hint" style="margin-top: 8px;">
          <a-icon type="info-circle" /> {{$t('testEmailHint')}}
        </div>
      </div>
    </a-modal>

    <!-- 测试企业微信对话框 -->
    <a-modal
      :title="$t('testWechatTitle')"
      :visible="testWechatVisible"
      :confirm-loading="testingWechat"
      @ok="handleTestWechat"
      @cancel="testWechatVisible = false">
      <div>
        <a-input v-model="testWechatUserId" :placeholder="$t('testWechatPlaceholder')" size="large" />
        <div class="config-hint" style="margin-top: 8px;">
          <a-icon type="info-circle" /> {{$t('testWechatHint')}}
        </div>
      </div>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { parseTimeFun } from '@/utils/formatter'
import { configGetList, configUpdate } from '@/services/admin'
export default {
  name: 'edit',
  i18n: require('./config-i18n'),
  components: { PageLayout },
  data() {
    return {
      loading: false,
      list: [],
      activeTab: 'system',
      systemForm: {},
      emailForm: {},
      wechatForm: {},
      aiForm: {},
      securityForm: {},
      saveLoading: false,
      logoUploading: false,
      isKeyVisible: false,  // 控制密钥是否可见
      gettingUrl: false,  // 控制获取地址按钮的加载状态
      testEmailVisible: false,  // 测试邮件对话框
      testEmailAddress: '',  // 测试邮箱地址
      testingEmail: false,  // 测试邮件加载状态
      testWechatVisible: false,  // 测试企业微信对话框
      testWechatUserId: '',  // 测试企业微信用户ID
      testingWechat: false  // 测试企业微信加载状态
    }
  },
  computed: {
    systemOnlyConfigs() {
      return this.list.filter(item => 
        item.key === 'zbx_dash' || 
        item.key === 'dash_id' || 
        item.key === 'sync_inventory' ||
        item.key === 'webhook_url'
      )
    },
    allSystemConfigs() {
      return this.list.filter(item => 
        item.key === 'system_name' || 
        item.key === 'system_logo' ||
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
    aiConfigs() {
      return this.list.filter(item => 
        item.key && (item.key.startsWith('ollama_') || item.key.startsWith('deepseek_') || item.key === 'ai_type')
      )
    },
    ollamaConfigs() {
      return this.list.filter(item => 
        item.key && item.key.startsWith('ollama_')
      )
    },
    deepseekConfigs() {
      return this.list.filter(item => 
        item.key && item.key.startsWith('deepseek_')
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
  watch: {
    // 监听语言变化，重新翻译配置项
    '$i18n.locale'() {
      this.translateConfigItems()
    },
    // 监听配置列表变化，进行翻译
    list: {
      handler() {
        this.translateConfigItems()
      },
      deep: true
    }
  },
  methods: {
    // 翻译配置项的 name 和 comment
    translateConfigItems() {
      const locale = this.$i18n.locale || 'CN'
      const translations = this.$options.i18n.configItemTranslations[locale]
      
      if (!translations) return
      
      this.list.forEach(item => {
        if (item.key && translations[item.key]) {
          item.name = translations[item.key].name
          item.comment = translations[item.key].comment
        }
      })
    },
    isBooleanConfig(key) {
      // 判断是否为布尔类型的配置项（开启/关闭）
      const booleanKeys = ['zbx_dash', 'sync_inventory', 'wechat_enabled', 'email_isSSl']
      return booleanKeys.includes(key)
    },
    getBooleanOptions(key) {
      // email_isSSl 使用 true/false，其他使用 1/0
      const enabledText = this.$t('enabled')
      const disabledText = this.$t('disabled')
      
      if (key === 'email_isSSl') {
        return [
          { label: enabledText, value: 'true' },
          { label: disabledText, value: 'false' }
        ]
      }
      return [
        { label: enabledText, value: '1' },
        { label: disabledText, value: '0' }
      ]
    },
    init() {
      this.loading = true
      configGetList()
        .then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            this.list = res.data.items || []
            // 获取数据后立即翻译
            this.translateConfigItems()
            this.initForms()
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    initForms() {
      // 初始化各个表单的数据
      this.allSystemConfigs.forEach(item => {
        this.$set(this.systemForm, item.key, item.value)
      })
      this.emailConfigs.forEach(item => {
        this.$set(this.emailForm, item.key, item.value)
      })
      this.wechatConfigs.forEach(item => {
        this.$set(this.wechatForm, item.key, item.value)
      })
      this.aiConfigs.forEach(item => {
        this.$set(this.aiForm, item.key, item.value)
      })
      // 如果没有设置 ai_type，默认为 ollama
      if (!this.aiForm.ai_type) {
        this.$set(this.aiForm, 'ai_type', 'ollama')
      }
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
            configs = this.allSystemConfigs
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
          case 'ai':
            configs = this.aiConfigs
            form = this.aiForm
            break
        }
        
        // 批量更新配置
        const promises = configs.map(item => {
          return configUpdate(item.id, { value: form[item.key] || '' })
        })
        
        await Promise.all(promises)
        this.$message.success(this.$t('saveSuccess'))
        
        // 如果是系统配置，更新 Vuex 中的系统名称和Logo
        if (category === 'system') {
          this.$store.commit('setting/setSystemName', form.system_name || 'ZbxTable')
          this.$store.commit('setting/setSystemLogo', form.system_logo || '/static/img/logo.png')
        }
        
        this.init()
      } catch (error) {
        this.$message.error(this.$t('saveFailed'))
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
        this.$message.warning(this.$t('keyEmpty'))
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
        this.$message.success(this.$t('keyCopied'))
      } catch (err) {
        this.$message.error(this.$t('copyFailed'))
      }
      
      document.body.removeChild(textarea)
    },
    // Logo上传前的验证
    beforeLogoUpload(file) {
      const isImage = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/svg+xml'
      if (!isImage) {
        this.$message.error(this.$t('logoFormatError'))
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error(this.$t('logoSizeError'))
        return false
      }
      return true
    },
    // 自定义Logo上传
    async handleLogoUpload({ file }) {
      this.logoUploading = true
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        // 使用 axios 直接发送请求
        const axios = require('axios')
        const response = await axios.post('/v1/system/upload-logo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        if (response.data.code === 200) {
          this.systemForm.system_logo = response.data.data.url
          this.$message.success(this.$t('logoUploadSuccess'))
        } else {
          this.$message.error(response.data.message || this.$t('logoUploadFailed'))
        }
      } catch (error) {
        this.$message.error(this.$t('logoUploadFailed') + ': ' + (error.message || this.$t('unknownError')))
      } finally {
        this.logoUploading = false
      }
    },
    // 预览外观效果
    previewAppearance() {
      this.$message.info(this.$t('previewHint'))
    },
    // AI 类型切换
    onAiTypeChange(value) {
      // 当切换 AI 类型时，可以在这里做一些额外的处理
      console.log('AI type changed to:', value)
    },
    // 获取配置项的名称（用于动态获取翻译）
    getConfigName(key) {
      const item = this.list.find(item => item.key === key)
      return item ? item.name : key
    },
    // 获取配置项的注释（用于动态获取翻译）
    getConfigComment(key) {
      const item = this.list.find(item => item.key === key)
      return item ? item.comment : ''
    },
    // 获取当前 Web 访问地址
    getCurrentWebUrl() {
      this.gettingUrl = true
      try {
        // 获取当前浏览器的协议、主机名和端口
        const protocol = window.location.protocol // http: 或 https:
        const hostname = window.location.hostname // 域名或IP
        const port = window.location.port // 端口号
        
        // 构建完整的 URL
        let baseUrl = `${protocol}//${hostname}`
        
        // 如果端口不是默认端口（80或443），则添加端口号
        if (port && port !== '80' && port !== '443') {
          baseUrl += `:${port}`
        }
        
        // 设置到 webhook_url 字段
        this.systemForm.webhook_url = baseUrl
        
        this.$message.success(this.$t('urlGetSuccess'))
      } catch (error) {
        this.$message.error(this.$t('urlGetFailed') + ': ' + error.message)
      } finally {
        this.gettingUrl = false
      }
    },
    // 显示测试邮件对话框
    showTestEmailModal() {
      this.testEmailAddress = ''
      this.testEmailVisible = true
    },
    // 处理测试邮件
    async handleTestEmail() {
      if (!this.testEmailAddress) {
        this.$message.warning(this.$t('pleaseInputTestEmail'))
        return
      }
      
      // 简单的邮箱格式验证
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.testEmailAddress)) {
        this.$message.warning('请输入有效的邮箱地址')
        return
      }
      
      this.testingEmail = true
      try {
        const axios = require('axios')
        const response = await axios.post('/v1/system/test-email', {
          test_email: this.testEmailAddress
        })
        
        if (response.data.code === 200) {
          this.$message.success(this.$t('testEmailSuccess'))
          this.testEmailVisible = false
        } else {
          this.$message.error(response.data.message || this.$t('testFailed'))
        }
      } catch (error) {
        this.$message.error(this.$t('testFailed') + ': ' + (error.response?.data?.message || error.message))
      } finally {
        this.testingEmail = false
      }
    },
    // 显示测试企业微信对话框
    showTestWechatModal() {
      this.testWechatUserId = ''
      this.testWechatVisible = true
    },
    // 处理测试企业微信
    async handleTestWechat() {
      if (!this.testWechatUserId) {
        this.$message.warning(this.$t('pleaseInputTestUserId'))
        return
      }
      
      this.testingWechat = true
      try {
        const axios = require('axios')
        const response = await axios.post('/v1/system/test-wechat', {
          test_user_id: this.testWechatUserId
        })
        
        if (response.data.code === 200) {
          this.$message.success(this.$t('testWechatSuccess'))
          this.testWechatVisible = false
        } else {
          this.$message.error(response.data.message || this.$t('testFailed'))
        }
      } catch (error) {
        this.$message.error(this.$t('testFailed') + ': ' + (error.response?.data?.message || error.message))
      } finally {
        this.testingWechat = false
      }
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

/deep/ .ant-divider-horizontal.ant-divider-with-text-left {
  margin: 32px 0 24px 0;
  font-weight: 600;
  font-size: 14px;
}

/deep/ .ant-divider-horizontal.ant-divider-with-text-left:first-of-type {
  margin-top: 0;
}

/deep/ .ant-input,
/deep/ .ant-input-password {
  border-radius: 4px;
}

.logo-upload-container {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.logo-preview {
  width: 80px;
  height: 80px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fafafa;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.logo-upload-actions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.upload-hint {
  color: #999;
  font-size: 12px;
  line-height: 1.5;
}

/deep/ .ant-input-group {
  display: flex;
  
  .ant-input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  
  .ant-btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    white-space: nowrap;
  }
}
</style>
