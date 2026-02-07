<template>
  <div class="install-container">
    <!-- 语言切换器 -->
    <div class="language-switcher">
      <a-dropdown :trigger="['click']">
        <a class="ant-dropdown-link" @click="e => e.preventDefault()">
          <a-icon type="global" />
          {{ currentLanguageName }}
          <a-icon type="down" />
        </a>
        <a-menu slot="overlay" @click="handleLanguageChange">
          <a-menu-item key="zh-CN">
            <span>{{ t('language.zhCN') }}</span>
          </a-menu-item>
          <a-menu-item key="en-US">
            <span>{{ t('language.enUS') }}</span>
          </a-menu-item>
          <a-menu-item key="zh-TW">
            <span>{{ t('language.zhTW') }}</span>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>

    <a-card class="install-card" :bordered="false">
      <template slot="title">
        <div class="install-header">
          <h1>{{ t('title') }}</h1>
          <p class="subtitle">{{ t('subtitle') }}</p>
        </div>
      </template>

      <a-steps :current="currentStep" class="install-steps">
        <a-step :title="t('steps.database')" />
        <a-step :title="t('steps.system')" />
        <a-step :title="t('steps.confirm')" />
        <a-step :title="t('steps.complete')" />
      </a-steps>

      <div class="install-content">
        <!-- 步骤 1: 数据库配置 -->
        <div v-show="currentStep === 0" class="step-content">
          <a-form-model ref="dbForm" :model="dbForm" :rules="dbRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-form-model-item :label="t('database.type')" prop="dbtype">
              <a-select v-model="dbForm.dbtype" :placeholder="t('database.typePlaceholder')" @change="handleDbTypeChange">
                <a-select-option value="mysql">MySQL</a-select-option>
                <a-select-option value="postgresql">PostgreSQL</a-select-option>
                <a-select-option value="sqlite">SQLite</a-select-option>
              </a-select>
            </a-form-model-item>

            <!-- SQLite 只显示数据库路径 -->
            <template v-if="dbForm.dbtype === 'sqlite'">
              <a-form-model-item :label="t('database.path')" prop="dbname">
                <a-input v-model="dbForm.dbname" :placeholder="t('database.pathPlaceholder')" />
                <div class="form-help-text">
                  {{ t('database.pathHint') }}
                </div>
              </a-form-model-item>
            </template>

            <!-- MySQL/PostgreSQL 显示完整配置 -->
            <template v-else>
              <a-form-model-item :label="t('database.host')" prop="dbhost">
                <a-input v-model="dbForm.dbhost" :placeholder="t('database.hostPlaceholder')" />
              </a-form-model-item>

              <a-form-model-item :label="t('database.port')" prop="dbport">
                <a-input-number v-model="dbForm.dbport" :min="1" :max="65535" style="width: 100%" />
              </a-form-model-item>

              <a-form-model-item :label="t('database.name')" prop="dbname">
                <a-input v-model="dbForm.dbname" :placeholder="t('database.namePlaceholder')" />
              </a-form-model-item>

              <a-form-model-item :label="t('database.user')" prop="dbuser">
                <a-input v-model="dbForm.dbuser" :placeholder="t('database.userPlaceholder')" />
              </a-form-model-item>

              <a-form-model-item :label="t('database.password')" prop="dbpass">
                <a-input-password v-model="dbForm.dbpass" :placeholder="t('database.passwordPlaceholder')" />
              </a-form-model-item>
            </template>

            <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
              <a-button type="primary" :loading="dbChecking" @click="checkDatabase" class="theme-button">
                {{ t('database.testConnection') }}
              </a-button>
              <span v-if="dbCheckResult" :class="dbCheckResult.success ? 'success-text' : 'error-text'" style="margin-left: 16px">
                {{ dbCheckResult.message }}
              </span>
            </a-form-model-item>
          </a-form-model>
        </div>

        <!-- 步骤 2: 系统配置 -->
        <div v-show="currentStep === 1" class="step-content">
          <a-form-model ref="systemForm" :model="systemForm" :rules="systemRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-form-model-item :label="t('system.httpPort')" prop="httpport">
              <a-input-number v-model="systemForm.httpport" :min="1" :max="65535" style="width: 100%" />
            </a-form-model-item>

            <a-form-model-item :label="t('system.runMode')" prop="runmode">
              <a-select v-model="systemForm.runmode" :placeholder="t('system.runModePlaceholder')">
                <a-select-option value="prod">{{ t('system.runModeProd') }}</a-select-option>
                <a-select-option value="dev">{{ t('system.runModeDev') }}</a-select-option>
              </a-select>
            </a-form-model-item>

            <a-form-model-item :label="t('system.sessionTimeout')" prop="timeout">
              <a-input-number v-model="systemForm.timeout" :min="1" :max="24" style="width: 100%" />
            </a-form-model-item>
          </a-form-model>
        </div>

        <!-- 步骤 3: 确认配置 -->
        <div v-show="currentStep === 2" class="step-content">
          <div class="confirm-container">
            <a-alert
              :message="t('confirm.title')"
              :description="t('confirm.description')"
              type="info"
              show-icon
              style="margin-bottom: 24px"
            />

            <div class="config-section">
              <h3 class="section-title">
                <a-icon type="database" />
                {{ t('confirm.databaseConfig') }}
              </h3>
              <a-descriptions bordered :column="1" size="small">
                <a-descriptions-item :label="t('confirm.dbType')">
                  <a-tag :color="getDbTypeColor(dbForm.dbtype)">
                    {{ getDbTypeName(dbForm.dbtype) }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item v-if="dbForm.dbtype !== 'sqlite'" :label="t('confirm.dbHost')">
                  {{ dbForm.dbhost }}
                </a-descriptions-item>
                <a-descriptions-item v-if="dbForm.dbtype !== 'sqlite'" :label="t('confirm.dbPort')">
                  {{ dbForm.dbport }}
                </a-descriptions-item>
                <a-descriptions-item :label="t('confirm.dbName')">
                  <span class="config-value">{{ dbForm.dbname }}</span>
                </a-descriptions-item>
                <a-descriptions-item v-if="dbForm.dbtype !== 'sqlite'" :label="t('confirm.dbUser')">
                  {{ dbForm.dbuser }}
                </a-descriptions-item>
                <a-descriptions-item v-if="dbForm.dbtype !== 'sqlite'" :label="t('confirm.dbPassword')">
                  <span class="password-mask">{{ dbForm.dbpass ? '••••••••' : '(' + t('confirm.notTested') + ')' }}</span>
                </a-descriptions-item>
                <a-descriptions-item :label="t('confirm.connectionStatus')">
                  <a-tag v-if="dbCheckResult && dbCheckResult.success" color="green">
                    <a-icon type="check-circle" /> {{ t('confirm.connected') }}
                  </a-tag>
                  <a-tag v-else color="orange">
                    <a-icon type="warning" /> {{ t('confirm.notTested') }}
                  </a-tag>
                </a-descriptions-item>
              </a-descriptions>
            </div>

            <div class="config-section">
              <h3 class="section-title">
                <a-icon type="setting" />
                {{ t('confirm.systemConfig') }}
              </h3>
              <a-descriptions bordered :column="1" size="small">
                <a-descriptions-item :label="t('confirm.httpPort')">
                  <a-tag :color="themeColor">{{ systemForm.httpport }}</a-tag>
                </a-descriptions-item>
                <a-descriptions-item :label="t('confirm.runMode')">
                  <a-tag :color="systemForm.runmode === 'prod' ? 'green' : 'orange'">
                    {{ systemForm.runmode === 'prod' ? t('system.runModeProd') : t('system.runModeDev') }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item :label="t('confirm.sessionTimeout')">
                  {{ systemForm.timeout }} {{ t('confirm.hours') }}
                </a-descriptions-item>
              </a-descriptions>
            </div>

            <a-alert
              :message="t('confirm.warning')"
              :description="t('confirm.warningMessage')"
              type="warning"
              show-icon
              style="margin-top: 24px"
            />
          </div>
        </div>

        <!-- 步骤 4: 完成安装 -->
        <div v-show="currentStep === 3" class="step-content">
          <a-result 
            status="success" 
            :title="t('complete.title')" 
            :sub-title="t('complete.subtitle')"
          >
            <template slot="extra">
              <div class="success-instructions">
                <!-- 重启提示 -->
                <a-alert
                  :message="t('complete.restartTitle')"
                  type="warning"
                  show-icon
                  style="margin-bottom: 24px; text-align: left;"
                >
                  <template slot="description">
                    <div style="line-height: 1.8;">
                      <p style="margin-bottom: 8px;">✅ {{ t('complete.configGenerated') }}</p>
                      <p style="margin-bottom: 8px;">✅ {{ t('complete.databaseInitialized') }}</p>
                      <p v-if="portChanged" style="margin-bottom: 8px;">🔄 {{ t('complete.portChanged') }}: {{ oldPort }} → {{ newPort }}</p>
                      <p v-else style="margin-bottom: 8px;">🔄 {{ t('complete.portChanged') }}: {{ newPort || '8088' }}</p>
                      
                      <!-- systemd 重启命令 -->
                      <p style="margin-bottom: 12px; font-weight: bold; color: #d63031; font-size: 15px;">⚠️ {{ t('complete.restartCommand') }}</p>
                      <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; margin-bottom: 12px; text-align: center;">
                        <code style="font-size: 16px; color: #d63031; font-weight: bold;">
                          systemctl restart zbxtable
                        </code>
                      </div>
                      
                      <p style="margin-bottom: 12px; color: #666; font-size: 13px;">
                        {{ t('complete.restartHint') }}
                      </p>
                      <p style="margin: 0; color: #666; font-size: 13px;">
                        💡 {{ t('complete.defaultAccount') }}
                      </p>
                    </div>
                  </template>
                </a-alert>

                <div style="text-align: center;">
                  <a-button type="primary" size="large" icon="login" @click="goToLogin" class="theme-button">
                    {{ t('complete.goToLogin') }}
                  </a-button>
                  <p style="margin-top: 12px; color: #999; font-size: 13px;">
                    {{ t('complete.loginAddress') }}: http://{{ getHostname() }}:{{ newPort || '8088' }}/login
                  </p>
                </div>
              </div>
            </template>
          </a-result>
        </div>
      </div>

      <div class="install-footer">
        <a-button v-if="currentStep > 0 && currentStep < 3" @click="prevStep">{{ t('buttons.previous') }}</a-button>
        <a-button v-if="currentStep < 2" type="primary" :loading="installing" @click="nextStep" style="margin-left: 8px" class="theme-button">
          {{ t('buttons.next') }}
        </a-button>
        <a-button v-if="currentStep === 2" type="primary" :loading="installing" @click="doInstall" style="margin-left: 8px" class="theme-button">
          <a-icon type="rocket" /> {{ t('buttons.install') }}
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script>
import { checkDatabase as checkDatabaseAPI, doInstall as doInstallAPI, getInstallStatus } from '@/services/install'
import { resetInstallStatusCache } from '@/router/guards'
import i18nMessages from './i18n'

export default {
  name: 'Install',
  data() {
    return {
      currentStep: 0,
      installing: false,
      dbChecking: false,
      dbCheckResult: null,
      portChanged: false,
      oldPort: '',
      newPort: '',
      themeColor: '#722ed1', // 默认主题颜色
      currentLocale: 'zh-CN', // 当前语言
      dbForm: {
        dbtype: 'mysql',
        dbhost: 'localhost',
        dbport: 3306,
        dbname: 'zbxtable',
        dbuser: 'zbxtable',
        dbpass: ''
      },
      dbRules: {},
      systemForm: {
        httpport: 8088,
        runmode: 'prod',
        timeout: 12
      },
      systemRules: {}
    }
  },
  computed: {
    currentLanguageName() {
      const langMap = {
        'zh-CN': this.t('language.zhCN'),
        'en-US': this.t('language.enUS'),
        'zh-TW': this.t('language.zhTW')
      }
      return langMap[this.currentLocale] || this.t('language.zhCN')
    },
    // 本地翻译函数
    i18n() {
      return i18nMessages[this.currentLocale] || i18nMessages['zh-CN']
    }
  },
  mounted() {
    this.checkInstallStatus()
    // 设置默认主题颜色
    document.documentElement.style.setProperty('--install-theme-color', this.themeColor)
    // 初始化语言 - 优先从 localStorage 读取，否则根据浏览器语言自动选择
    this.initLanguage()
    // 初始化验证规则
    this.initValidationRules()
  },
  methods: {
    // 本地翻译方法
    t(key) {
      const keys = key.split('.')
      let value = this.i18n
      for (const k of keys) {
        value = value[k]
        if (!value) return key
      }
      return value
    },
    // 初始化语言
    initLanguage() {
      // 1. 优先使用用户之前选择的语言
      const savedLocale = localStorage.getItem('install_locale')
      if (savedLocale) {
        this.currentLocale = savedLocale
        this.$i18n.locale = savedLocale
        return
      }
      
      // 2. 根据浏览器语言自动选择
      const browserLang = navigator.language || navigator.userLanguage
      let detectedLocale = 'zh-CN' // 默认简体中文
      
      // 浏览器语言映射
      if (browserLang) {
        const lang = browserLang.toLowerCase()
        if (lang.startsWith('zh-tw') || lang.startsWith('zh-hk') || lang.startsWith('zh-mo')) {
          // 繁体中文（台湾、香港、澳门）
          detectedLocale = 'zh-TW'
        } else if (lang.startsWith('zh')) {
          // 其他中文默认为简体
          detectedLocale = 'zh-CN'
        } else if (lang.startsWith('en')) {
          // 英文
          detectedLocale = 'en-US'
        } else {
          // 其他语言默认使用英文
          detectedLocale = 'en-US'
        }
      }
      
      this.currentLocale = detectedLocale
      this.$i18n.locale = detectedLocale
    },
    // 语言切换
    handleLanguageChange({ key }) {
      this.currentLocale = key
      this.$i18n.locale = key
      // 保存到 localStorage
      localStorage.setItem('install_locale', key)
      // 重新初始化验证规则（因为验证消息需要更新）
      this.initValidationRules()
      // 强制更新组件以刷新翻译
      this.$forceUpdate()
    },
    
    // 初始化验证规则
    initValidationRules() {
      this.dbRules = {
        dbtype: [{ required: true, message: this.t('validation.dbTypeRequired'), trigger: 'change' }],
        dbhost: [
          { 
            validator: (rule, value, callback) => {
              if (this.dbForm.dbtype !== 'sqlite' && !value) {
                callback(new Error(this.t('validation.dbHostRequired')))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        dbport: [
          { 
            validator: (rule, value, callback) => {
              if (this.dbForm.dbtype !== 'sqlite' && !value) {
                callback(new Error(this.t('validation.dbPortRequired')))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        dbname: [{ required: true, message: this.t('validation.dbNameRequired'), trigger: 'blur' }],
        dbuser: [
          { 
            validator: (rule, value, callback) => {
              if (this.dbForm.dbtype !== 'sqlite' && !value) {
                callback(new Error(this.t('validation.dbUserRequired')))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        dbpass: [
          { 
            validator: (rule, value, callback) => {
              if (this.dbForm.dbtype !== 'sqlite' && !value) {
                callback(new Error(this.t('validation.dbPasswordRequired')))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ]
      }
      
      this.systemRules = {
        httpport: [{ required: true, message: this.t('validation.httpPortRequired'), trigger: 'blur' }],
        runmode: [{ required: true, message: this.t('validation.runModeRequired'), trigger: 'change' }],
        timeout: [{ required: true, message: this.t('validation.sessionTimeoutRequired'), trigger: 'blur' }]
      }
    },
    async checkInstallStatus() {
      try {
        const res = await getInstallStatus()
        // 兼容两种返回：
        // 1) axios-like: { data: { code, message, data } } 或 { data: { installed: true } }
        // 2) 直接业务对象
        const biz = (res && res.data) ? res.data : res
        const installed =
          (biz && biz.data && typeof biz.data.installed !== 'undefined' ? biz.data.installed : undefined) ??
          (biz && typeof biz.installed !== 'undefined' ? biz.installed : undefined)
        if (installed) {
          this.$router.push('/login')
        }
      } catch (error) {
        // 如果接口不存在或出错，说明可能未安装，继续安装流程
        console.log(this.t('messages.checkingStatus'))
      }
    },
    handleDbTypeChange(value) {
      // 清空之前的检查结果
      this.dbCheckResult = null
      
      if (value === 'mysql') {
        this.dbForm.dbport = 3306
        this.dbForm.dbhost = 'localhost'
        this.dbForm.dbuser = 'root'
        this.dbForm.dbname = 'zbxtable'
        this.dbForm.dbpass = ''
      } else if (value === 'postgresql') {
        this.dbForm.dbport = 5432
        this.dbForm.dbhost = 'localhost'
        this.dbForm.dbuser = 'postgres'
        this.dbForm.dbname = 'zbxtable'
        this.dbForm.dbpass = ''
      } else if (value === 'sqlite') {
        // SQLite 不需要端口、主机、用户和密码
        this.dbForm.dbport = null
        this.dbForm.dbhost = ''
        this.dbForm.dbuser = ''
        this.dbForm.dbpass = ''
        this.dbForm.dbname = './data/zbxtable.db'
      }
    },
    async checkDatabase() {
      this.$refs.dbForm.validate(async (valid) => {
        if (!valid) return

        this.dbChecking = true
        this.dbCheckResult = null

        try {
          const dbData = {
            dbtype: this.dbForm.dbtype,
            dbname: this.dbForm.dbname
          }
          // SQLite 不需要这些字段
          if (this.dbForm.dbtype !== 'sqlite') {
            dbData.dbhost = this.dbForm.dbhost
            dbData.dbport = String(this.dbForm.dbport)
            dbData.dbuser = this.dbForm.dbuser
            dbData.dbpass = this.dbForm.dbpass
          } else {
            // SQLite 使用空值
            dbData.dbhost = ''
            dbData.dbport = ''
            dbData.dbuser = ''
            dbData.dbpass = ''
          }
          const res = await checkDatabaseAPI(dbData)
          const biz = (res && res.data) ? res.data : res
          const ok = biz && (biz.code === 200 || biz.code === 0 || biz.code === '200' || biz.code === '0')
          const success =
            (biz && biz.data && typeof biz.data.success !== 'undefined' ? biz.data.success : undefined) ??
            (biz && typeof biz.success !== 'undefined' ? biz.success : undefined)

          if (ok && success) {
            // 始终使用 i18n 翻译，不使用后端返回的中文消息
            this.dbCheckResult = { success: true, message: this.t('database.testSuccess') }
          } else {
            // 始终使用 i18n 翻译，不使用后端返回的中文消息
            this.dbCheckResult = { success: false, message: this.t('database.testFailed') }
          }
        } catch (error) {
          // 始终使用 i18n 翻译
          this.dbCheckResult = { success: false, message: this.t('database.testFailed') }
        } finally {
          this.dbChecking = false
        }
      })
    },
    nextStep() {
      if (this.currentStep === 0) {
        this.$refs.dbForm.validate((valid) => {
          if (valid) {
            if (!this.dbCheckResult || !this.dbCheckResult.success) {
              this.$message.warning(this.t('database.testRequired'))
              return
            }
            this.currentStep++
          }
        })
      } else if (this.currentStep === 1) {
        this.$refs.systemForm.validate((valid) => {
          if (valid) {
            this.currentStep++
          }
        })
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    async doInstall() {
      this.installing = true

      try {
        const installData = {
          ...this.systemForm,
          httpport: String(this.systemForm.httpport),
          timeout: String(this.systemForm.timeout)
        }
        // 数据库配置
        installData.dbtype = this.dbForm.dbtype
        installData.dbname = this.dbForm.dbname
        if (this.dbForm.dbtype !== 'sqlite') {
          installData.dbhost = this.dbForm.dbhost
          installData.dbport = String(this.dbForm.dbport)
          installData.dbuser = this.dbForm.dbuser
          installData.dbpass = this.dbForm.dbpass
        } else {
          // SQLite 使用空值
          installData.dbhost = ''
          installData.dbport = ''
          installData.dbuser = ''
          installData.dbpass = ''
        }

        const res = await doInstallAPI(installData)
        const biz = (res && res.data) ? res.data : res
        const ok = biz && (biz.code === 200 || biz.code === 0 || biz.code === '200' || biz.code === '0')
        const success =
          (biz && biz.data && typeof biz.data.success !== 'undefined' ? biz.data.success : undefined) ??
          (biz && typeof biz.success !== 'undefined' ? biz.success : undefined)

        if (ok && success) {
          // 获取端口信息
          const portChanged = 
            (biz && biz.data && biz.data.port_changed) || 
            (biz && biz.port_changed) || 
            false
          
          const oldPort = 
            (biz && biz.data && biz.data.old_port) || 
            (biz && biz.old_port) || 
            '8088'
          
          const newPort = 
            (biz && biz.data && biz.data.new_port) || 
            (biz && biz.new_port) || 
            '8088'
          
          this.portChanged = portChanged
          this.oldPort = oldPort
          this.newPort = newPort
          
          // 始终使用 i18n 翻译，不使用后端返回的中文消息
          this.$message.success(this.t('messages.installSuccess'))
          
          resetInstallStatusCache()
          this.currentStep = 3
        } else {
          // 始终使用 i18n 翻译，不使用后端返回的中文消息
          this.$message.error(this.t('messages.installFailed'))
        }
      } catch (error) {
        // 始终使用 i18n 翻译
        this.$message.error(this.t('messages.installFailed'))
      } finally {
        this.installing = false
      }
    },
    getHostname() {
      return window.location.hostname
    },
    goToLogin() {
      resetInstallStatusCache()
      // 安装完成后，刷新页面以重新检查安装状态
      // 这样路由守卫会检测到已安装，自动跳转到登录页
      window.location.href = '/login'
    },
    getDbTypeName(type) {
      const names = {
        mysql: 'MySQL',
        postgresql: 'PostgreSQL',
        sqlite: 'SQLite'
      }
      return names[type] || type
    },
    getDbTypeColor(type) {
      const colors = {
        mysql: 'blue',
        postgresql: 'cyan',
        sqlite: 'green'
      }
      return colors[type] || 'default'
    }
  }
}
</script>

<style scoped lang="less">
:root {
  --install-theme-color: #722ed1;
}

.install-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.language-switcher {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  
  .ant-dropdown-link {
    color: #fff;
    font-size: 14px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    
    .anticon {
      font-size: 16px;
    }
  }
}

.install-card {
  width: 100%;
  max-width: 900px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.install-header {
  text-align: center;
  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    color: var(--install-theme-color, #722ed1);
  }
  .subtitle {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

// 主题按钮样式
.theme-button {
  background-color: var(--install-theme-color, #722ed1) !important;
  border-color: var(--install-theme-color, #722ed1) !important;
  
  &:hover,
  &:focus {
    background-color: var(--install-theme-color, #722ed1) !important;
    border-color: var(--install-theme-color, #722ed1) !important;
    opacity: 0.8;
  }
  
  &:active {
    background-color: var(--install-theme-color, #722ed1) !important;
    border-color: var(--install-theme-color, #722ed1) !important;
    opacity: 0.9;
  }
}

.install-steps {
  margin: 40px 0;
  
  // 覆盖 Ant Design Steps 组件的主题色
  /deep/ .ant-steps-item-process .ant-steps-item-icon {
    background-color: var(--install-theme-color, #722ed1);
    border-color: var(--install-theme-color, #722ed1);
  }
  
  /deep/ .ant-steps-item-finish .ant-steps-item-icon {
    border-color: var(--install-theme-color, #722ed1);
    
    > .ant-steps-icon {
      color: var(--install-theme-color, #722ed1);
    }
  }
  
  /deep/ .ant-steps-item-finish > .ant-steps-item-content > .ant-steps-item-title::after {
    background-color: var(--install-theme-color, #722ed1);
  }
  
  /deep/ .ant-steps-item-process > .ant-steps-item-content > .ant-steps-item-title {
    color: var(--install-theme-color, #722ed1);
  }
}

.install-content {
  min-height: 400px;
  padding: 20px 0;
}

.step-content {
  padding: 20px 0;
}

.install-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.form-help-text {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.success-text {
  color: #52c41a;
}

.error-text {
  color: #f5222d;
}

// 确认配置页面样式
.confirm-container {
  max-width: 700px;
  margin: 0 auto;
}

.config-section {
  margin-bottom: 32px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #262626;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--install-theme-color, #722ed1);
    
    .anticon {
      margin-right: 8px;
      color: var(--install-theme-color, #722ed1);
    }
  }
}

.config-value {
  font-family: 'Courier New', monospace;
  color: var(--install-theme-color, #722ed1);
  font-weight: 500;
}

.password-mask {
  color: #999;
  letter-spacing: 2px;
}

.success-instructions {
  max-width: 600px;
  margin: 0 auto;
  
  p {
    font-size: 14px;
  }
}
</style>
