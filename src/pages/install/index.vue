<template>
  <div class="install-container">
    <a-card class="install-card" :bordered="false">
      <template slot="title">
        <div class="install-header">
          <h1>ZbxTable 安装向导</h1>
          <p class="subtitle">欢迎使用 ZbxTable，请按照以下步骤完成安装配置</p>
        </div>
      </template>

      <a-steps :current="currentStep" class="install-steps">
        <a-step title="数据库配置" />
        <a-step title="系统配置" />
        <a-step title="确认配置" />
        <a-step title="完成安装" />
      </a-steps>

      <div class="install-content">
        <!-- 步骤 1: 数据库配置 -->
        <div v-show="currentStep === 0" class="step-content">
          <a-form-model ref="dbForm" :model="dbForm" :rules="dbRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
            <a-form-model-item label="数据库类型" prop="dbtype">
              <a-select v-model="dbForm.dbtype" placeholder="请选择数据库类型" @change="handleDbTypeChange">
                <a-select-option value="mysql">MySQL</a-select-option>
                <a-select-option value="postgresql">PostgreSQL</a-select-option>
                <a-select-option value="sqlite">SQLite</a-select-option>
              </a-select>
            </a-form-model-item>

            <!-- SQLite 只显示数据库路径 -->
            <template v-if="dbForm.dbtype === 'sqlite'">
              <a-form-model-item label="数据库路径" prop="dbname">
                <a-input v-model="dbForm.dbname" placeholder="./data/zbxtable.db" />
                <div class="form-help-text">
                  SQLite 数据库文件路径，支持相对路径和绝对路径。例如：./data/zbxtable.db
                </div>
              </a-form-model-item>
            </template>

            <!-- MySQL/PostgreSQL 显示完整配置 -->
            <template v-else>
              <a-form-model-item label="数据库地址" prop="dbhost">
                <a-input v-model="dbForm.dbhost" placeholder="localhost" />
              </a-form-model-item>

              <a-form-model-item label="数据库端口" prop="dbport">
                <a-input-number v-model="dbForm.dbport" :min="1" :max="65535" style="width: 100%" />
              </a-form-model-item>

              <a-form-model-item label="数据库名称" prop="dbname">
                <a-input v-model="dbForm.dbname" placeholder="zbxtable" />
              </a-form-model-item>

              <a-form-model-item label="数据库用户" prop="dbuser">
                <a-input v-model="dbForm.dbuser" placeholder="zbxtable" />
              </a-form-model-item>

              <a-form-model-item label="数据库密码" prop="dbpass">
                <a-input-password v-model="dbForm.dbpass" placeholder="请输入数据库密码" />
              </a-form-model-item>
            </template>

            <a-form-model-item :wrapper-col="{ span: 14, offset: 6 }">
              <a-button type="primary" :loading="dbChecking" @click="checkDatabase">
                测试连接
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
            <a-form-model-item label="HTTP 端口" prop="httpport">
              <a-input-number v-model="systemForm.httpport" :min="1" :max="65535" style="width: 100%" />
            </a-form-model-item>

            <a-form-model-item label="运行模式" prop="runmode">
              <a-select v-model="systemForm.runmode" placeholder="请选择运行模式">
                <a-select-option value="prod">生产环境</a-select-option>
                <a-select-option value="dev">开发环境</a-select-option>
              </a-select>
            </a-form-model-item>

            <a-form-model-item label="会话超时(小时)" prop="timeout">
              <a-input-number v-model="systemForm.timeout" :min="1" :max="24" style="width: 100%" />
            </a-form-model-item>
          </a-form-model>
        </div>

        <!-- 步骤 3: 确认配置 -->
        <div v-show="currentStep === 2" class="step-content">
          <div class="confirm-container">
            <a-alert
              message="请确认以下配置信息"
              description="请仔细检查配置信息，确认无误后点击开始安装按钮进行安装"
              type="info"
              show-icon
              style="margin-bottom: 24px"
            />

            <div class="config-section">
              <h3 class="section-title">
                <a-icon type="database" />
                数据库配置
              </h3>
              <a-descriptions bordered :column="1" size="small">
                <a-descriptions-item label="数据库类型">
                  <a-tag :color="getDbTypeColor(dbForm.dbtype)">
                    {{ getDbTypeName(dbForm.dbtype) }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item v-if="dbForm.dbtype !== 'sqlite'" label="数据库地址">
                  {{ dbForm.dbhost }}
                </a-descriptions-item>
                <a-descriptions-item v-if="dbForm.dbtype !== 'sqlite'" label="数据库端口">
                  {{ dbForm.dbport }}
                </a-descriptions-item>
                <a-descriptions-item label="数据库名称/路径">
                  <span class="config-value">{{ dbForm.dbname }}</span>
                </a-descriptions-item>
                <a-descriptions-item v-if="dbForm.dbtype !== 'sqlite'" label="数据库用户">
                  {{ dbForm.dbuser }}
                </a-descriptions-item>
                <a-descriptions-item v-if="dbForm.dbtype !== 'sqlite'" label="数据库密码">
                  <span class="password-mask">{{ dbForm.dbpass ? '••••••••' : '(未设置)' }}</span>
                </a-descriptions-item>
                <a-descriptions-item label="连接状态">
                  <a-tag v-if="dbCheckResult && dbCheckResult.success" color="green">
                    <a-icon type="check-circle" /> 连接成功
                  </a-tag>
                  <a-tag v-else color="orange">
                    <a-icon type="warning" /> 未测试
                  </a-tag>
                </a-descriptions-item>
              </a-descriptions>
            </div>

            <div class="config-section">
              <h3 class="section-title">
                <a-icon type="setting" />
                系统配置
              </h3>
              <a-descriptions bordered :column="1" size="small">
                <a-descriptions-item label="HTTP 端口">
                  <a-tag :color="$themeColor">{{ systemForm.httpport }}</a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="运行模式">
                  <a-tag :color="systemForm.runmode === 'prod' ? 'green' : 'orange'">
                    {{ systemForm.runmode === 'prod' ? '生产环境' : '开发环境' }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="会话超时">
                  {{ systemForm.timeout }} 小时
                </a-descriptions-item>
              </a-descriptions>
            </div>

            <a-alert
              message="提示"
              description="安装过程将创建数据库表结构并初始化系统数据，请确保数据库配置正确且有足够的权限。"
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
            title="安装完成！" 
            sub-title="配置文件已生成，数据库已初始化，请重启程序以加载配置"
          >
            <template slot="extra">
              <div class="success-instructions">
                <!-- 重启提示 -->
                <a-alert
                  message="请重启程序以加载配置"
                  type="warning"
                  show-icon
                  style="margin-bottom: 24px; text-align: left;"
                >
                  <template slot="description">
                    <div style="line-height: 1.8;">
                      <p style="margin-bottom: 8px;">✅ 配置文件已生成</p>
                      <p style="margin-bottom: 8px;">✅ 数据库已初始化</p>
                      <p v-if="portChanged" style="margin-bottom: 8px;">🔄 HTTP 端口: {{ oldPort }} → {{ newPort }}</p>
                      <p v-else style="margin-bottom: 8px;">🔄 HTTP 端口: {{ newPort || '8088' }}</p>
                      
                      <!-- systemd 重启命令 -->
                      <p style="margin-bottom: 12px; font-weight: 500;">⚠️ 请使用 systemd 重启程序：</p>
                      <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
                        <code style="font-size: 14px; color: #d63031; font-weight: 500;">
                          systemctl restart zbxtable
                        </code>
                      </div>
                      
                      <p style="margin-bottom: 12px; color: #666; font-size: 13px;">
                        重启完成后，点击下方按钮跳转到登录页面
                      </p>
                      <p style="margin: 0; color: #666; font-size: 13px;">
                        💡 提示：默认管理员账号 admin，密码 Zbxtable
                      </p>
                    </div>
                  </template>
                </a-alert>

                <div style="text-align: center;">
                  <a-button type="primary" size="large" icon="login" @click="goToLogin">
                    前往登录页面
                  </a-button>
                  <p style="margin-top: 12px; color: #999; font-size: 13px;">
                    登录地址: http://{{ getHostname() }}:{{ newPort || '8088' }}/login
                  </p>
                </div>
              </div>
            </template>
          </a-result>
        </div>
      </div>

      <div class="install-footer">
        <a-button v-if="currentStep > 0 && currentStep < 3" @click="prevStep">上一步</a-button>
        <a-button v-if="currentStep < 2" type="primary" :loading="installing" @click="nextStep" style="margin-left: 8px">
          下一步
        </a-button>
        <a-button v-if="currentStep === 2" type="primary" :loading="installing" @click="doInstall" style="margin-left: 8px">
          <a-icon type="rocket" /> 开始安装
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script>
import { checkDatabase as checkDatabaseAPI, doInstall as doInstallAPI, getInstallStatus } from '@/services/install'
import { resetInstallStatusCache } from '@/router/guards'

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
      dbForm: {
        dbtype: 'mysql',
        dbhost: 'localhost',
        dbport: 3306,
        dbname: 'zbxtable',
        dbuser: 'zbxtable',
        dbpass: ''
      },
      dbRules: {
        dbtype: [{ required: true, message: '请选择数据库类型', trigger: 'change' }],
        dbhost: [
          { 
            validator: (rule, value, callback) => {
              if (this.dbForm.dbtype !== 'sqlite' && !value) {
                callback(new Error('请输入数据库地址'))
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
                callback(new Error('请输入数据库端口'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ],
        dbname: [{ required: true, message: '请输入数据库名称或文件路径', trigger: 'blur' }],
        dbuser: [
          { 
            validator: (rule, value, callback) => {
              if (this.dbForm.dbtype !== 'sqlite' && !value) {
                callback(new Error('请输入数据库用户'))
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
                callback(new Error('请输入数据库密码'))
              } else {
                callback()
              }
            }, 
            trigger: 'blur' 
          }
        ]
      },
      systemForm: {
        httpport: 8088,
        runmode: 'prod',
        timeout: 12
      },
      systemRules: {
        httpport: [{ required: true, message: '请输入 HTTP 端口', trigger: 'blur' }],
        runmode: [{ required: true, message: '请选择运行模式', trigger: 'change' }],
        timeout: [{ required: true, message: '请输入会话超时时间', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.checkInstallStatus()
  },
  methods: {
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
        console.log('检查安装状态失败，继续安装流程')
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
            this.dbCheckResult = { success: true, message: biz.message || '数据库连接成功' }
          } else {
            this.dbCheckResult = { success: false, message: (biz && biz.message) || '数据库连接失败' }
          }
        } catch (error) {
          // 错误可能是字符串或对象
          const errorMessage = error.message || (typeof error === 'string' ? error : '数据库连接失败')
          this.dbCheckResult = { success: false, message: errorMessage }
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
              this.$message.warning('请先测试数据库连接')
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
          
          this.$message.success('安装成功！请重启程序以加载配置')
          
          resetInstallStatusCache()
          this.currentStep = 3
        } else {
          this.$message.error((biz && biz.message) || '安装失败')
        }
      } catch (error) {
        // 错误可能是字符串或对象
        const errorMessage = error.message || (typeof error === 'string' ? error : '安装失败')
        this.$message.error(errorMessage)
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
.install-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
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
    color: #1890ff;
  }
  .subtitle {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.install-steps {
  margin: 40px 0;
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
    border-bottom: 2px solid #1890ff;
    
    .anticon {
      margin-right: 8px;
      color: #1890ff;
    }
  }
}

.config-value {
  font-family: 'Courier New', monospace;
  color: #1890ff;
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
