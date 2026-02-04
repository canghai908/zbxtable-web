<template>
  <page-layout>
    <div class="config-container">
      <a-card :bordered="false">
        <a-tabs v-model="activeTab" type="card">
          <!-- 系统配置 -->
          <a-tab-pane key="system" tab="系统配置">
            <a-form-model ref="systemForm" :model="systemForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
              <!-- 外观配置部分 -->
              <a-divider orientation="left">外观配置</a-divider>
              
              <a-form-model-item label="系统名称">
                <a-input v-model="systemForm.system_name" placeholder="请输入系统名称" />
                <div class="config-hint">系统显示的名称，将在页面标题和导航栏中显示</div>
              </a-form-model-item>
              
              <a-form-model-item label="系统Logo">
                <div class="logo-upload-container">
                  <div class="logo-preview">
                    <img v-if="systemForm.system_logo" :src="systemForm.system_logo" alt="Logo预览" />
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
                        <a-icon type="upload" /> 上传Logo
                      </a-button>
                    </a-upload>
                    <div class="upload-hint">
                      <a-icon type="info-circle" /> 支持 PNG、JPG、SVG 格式，建议尺寸 32x32px，大小不超过2MB
                    </div>
                  </div>
                </div>
              </a-form-model-item>
              
              <!-- 系统配置部分 -->
              <a-divider orientation="left">系统配置</a-divider>
              
              <a-form-model-item v-for="item in systemOnlyConfigs" :key="item.id" :label="item.name">
                <a-select v-if="isBooleanConfig(item.key)" v-model="systemForm[item.key]" :placeholder="item.comment" style="width: 100%">
                  <a-select-option v-for="opt in getBooleanOptions(item.key)" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </a-select-option>
                </a-select>
                <a-input-group v-else-if="item.key === 'webhook_url'" compact style="display: flex;">
                  <a-input v-model="systemForm[item.key]" :placeholder="item.comment" style="flex: 1;" />
                  <a-button type="primary" @click="getCurrentWebUrl" :loading="gettingUrl">
                    <a-icon type="link" /> 获取当前地址
                  </a-button>
                </a-input-group>
                <a-input v-else v-model="systemForm[item.key]" :placeholder="item.comment" />
                <div class="config-hint">{{ item.comment }}</div>
              </a-form-model-item>
              
              <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
                <a-button type="primary" @click="saveCategory('system')" :loading="saveLoading">保存</a-button>
                <a-button style="margin-left: 10px;" @click="previewAppearance">预览效果</a-button>
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
                <a-button type="primary" @click="saveCategory('email')" :loading="saveLoading">保存</a-button>
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
                <a-button type="primary" @click="saveCategory('wechat')" :loading="saveLoading">保存</a-button>
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
                <a-button type="primary" @click="saveCategory('ollama')" :loading="saveLoading">保存</a-button>
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
      logoUploading: false,
      isKeyVisible: false,  // 控制密钥是否可见
      gettingUrl: false  // 控制获取地址按钮的加载状态
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
      this.allSystemConfigs.forEach(item => {
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
        
        // 如果是系统配置，更新 Vuex 中的系统名称和Logo
        if (category === 'system') {
          this.$store.commit('setting/setSystemName', form.system_name || 'ZbxTable')
          this.$store.commit('setting/setSystemLogo', form.system_logo || '/static/img/logo.png')
        }
        
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
    },
    // Logo上传前的验证
    beforeLogoUpload(file) {
      const isImage = file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/svg+xml'
      if (!isImage) {
        this.$message.error('只支持 PNG、JPG、JPEG 或 SVG 格式的图片')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB')
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
          this.$message.success('Logo上传成功')
        } else {
          this.$message.error(response.data.message || 'Logo上传失败')
        }
      } catch (error) {
        this.$message.error('Logo上传失败: ' + (error.message || '未知错误'))
      } finally {
        this.logoUploading = false
      }
    },
    // 预览外观效果
    previewAppearance() {
      this.$message.info('保存后刷新页面即可看到效果')
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
        
        this.$message.success('已获取当前访问地址')
      } catch (error) {
        this.$message.error('获取地址失败: ' + error.message)
      } finally {
        this.gettingUrl = false
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
