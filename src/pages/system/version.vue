<template>
  <page-layout :noTitle="true">
    <a-card :headStyle="$cardHeadStyle" size="small">
      <a-descriptions bordered>
        <a-descriptions-item :label="$t('zbxtable_version')" :span="3">{{ UIVersion }}</a-descriptions-item>
        <a-descriptions-item :label="$t('buildinfo')">
          Version:{{ BackVersion }}
          <br />
          GitHash:{{ GitHash }}
          <br />
          BuildTime:{{ BuildTime }}
        </a-descriptions-item>
      </a-descriptions>
      
      <!-- 系统更新区域 -->
      <a-divider />
      <div style="margin-top: 24px;">
        <h3 style="margin-bottom: 16px;">
          <a-icon type="cloud-download" style="margin-right: 8px;" />
          {{$t('system_update')}}
        </h3>
        
        <!-- 更新信息 -->
        <a-alert
          v-if="updateInfo.has_update"
          type="info"
          show-icon
          style="margin-bottom: 16px;">
          <template slot="message">
            <span style="font-weight: 500;">{{$t('new_version_found')}}</span>
          </template>
          <template slot="description">
            <div>
              <p>{{$t('current_version')}}：{{ updateInfo.current_version }}</p>
              <p>{{$t('latest_version')}}：{{ updateInfo.latest_version }}</p>
              <p style="margin-bottom: 0;">{{$t('can_update_tip')}}</p>
            </div>
          </template>
        </a-alert>
        
        <a-alert
          v-else-if="updateChecked && !updateInfo.has_update"
          type="success"
          :message="$t('already_latest')"
          show-icon
          style="margin-bottom: 16px;"
        />
        
        <!-- 操作按钮 -->
        <a-space>
          <a-button 
            type="primary" 
            icon="reload"
            :loading="checkingUpdate"
            @click="handleCheckUpdate">
            {{checkingUpdate ? $t('checking_update') : $t('check_update')}}
          </a-button>
          
          <a-button 
            v-if="updateInfo.has_update"
            type="danger" 
            icon="cloud-download"
            :loading="updating"
            @click="handleUpdate">
            {{updating ? $t('updating') : $t('update_now')}}
          </a-button>
        </a-space>
      </div>
    </a-card>
    
    <!-- 更新进度对话框 -->
    <a-modal
      v-model="updateModalVisible"
      :title="updateSuccess ? $t('update_success_title') : $t('system_update')"
      :footer="null"
      :closable="updateSuccess"
      :maskClosable="updateSuccess"
      :keyboard="updateSuccess"
      centered
      width="600px">
      <div v-if="!updateSuccess" style="text-align: center; padding: 24px 0;">
        <a-spin size="large" />
        <p style="margin-top: 24px; font-size: 16px; color: rgba(0, 0, 0, 0.85);">
          {{ updateMessage }}
        </p>
      </div>
      
      <!-- 更新成功提示 -->
      <div v-else style="padding: 12px 0;">
        <a-result
          status="success"
          :title="$t('update_success_title')"
          style="padding: 0;">
          <template slot="subTitle">
            <div style="text-align: left; margin-top: 16px;">
              <p style="font-size: 14px; color: rgba(0, 0, 0, 0.65); margin-bottom: 16px;">
                {{ $t('update_success_message') }}
              </p>
              
              <a-alert
                type="info"
                show-icon
                style="margin-bottom: 16px;">
                <template slot="message">
                  <div style="text-align: center;">
                    <code style="background: #f5f5f5; padding: 10px 16px; border-radius: 4px; font-size: 15px; display: inline-block;">
                      {{ $t('restart_command') }}
                    </code>
                  </div>
                </template>
              </a-alert>
              
              <div style="text-align: center; margin-bottom: 16px;">
                <a-space>
                  <a-button
                    type="primary"
                    icon="copy"
                    @click="copyCommand">
                    {{ $t('copy_command') }}
                  </a-button>
                  <a-button
                    type="default"
                    icon="reload"
                    @click="refreshPage">
                    {{ $t('refresh_page') }}
                  </a-button>
                </a-space>
              </div>
              
              <a-alert
                type="warning"
                show-icon
                style="margin-bottom: 16px;">
                <template slot="message">
                  <span style="font-size: 13px;">
                    {{ $t('refresh_page_tip') }}
                  </span>
                </template>
              </a-alert>
              
              <p style="font-size: 13px; color: rgba(0, 0, 0, 0.45); margin: 0;">
                <a-icon type="info-circle" style="margin-right: 4px;" />
                {{ $t('current_version') }}: {{ updateInfo.current_version }} → {{ $t('latest_version') }}: {{ updateInfo.latest_version }}
              </p>
            </div>
          </template>
        </a-result>
      </div>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import config from "../../../package.json";
import { baseVersion, systemCheckUpdate, systemDoUpdate } from "@/services/admin";
import { removeAuthorization } from "@/utils/request";

export default {
  name: "version",
  i18n: require('./i18n'),
  components: {
    PageLayout,
  },
  data() {
    return {
      UIVersion: "",
      BackVersion: "",
      GitHash: "",
      BuildTime: "",
      
      // 更新相关
      updateInfo: {
        current_version: "",
        latest_version: "",
        has_update: false,
        update_url: ""
      },
      updateChecked: false,
      checkingUpdate: false,
      updating: false,
      updateModalVisible: false,
      updateMessage: "",
      updateSuccess: false,
    };
  },

  created() {
    // 版本号由构建时从 git tag 注入（见 vue.config.js），package.json 作为兜底
    this.UIVersion = process.env.VUE_APP_VERSION || config.version
    this.getversion()
  },
  

  
  methods: {
    getversion() {
      baseVersion().then((resp) => {
        // 适应后端统一返回格式：resp.data.data
        const data = resp.data.data
        this.BackVersion = data.version || ''
        this.GitHash = data.gitHash || ''
        this.BuildTime = data.buildTime || ''
      });
    },
    
    // 检查更新
    handleCheckUpdate() {
      this.checkingUpdate = true
      systemCheckUpdate()
        .then((resp) => {
          const data = resp.data.data
          this.updateInfo = {
            current_version: data.currentVersion,
            latest_version: data.latestVersion,
            has_update: data.hasUpdate,
            update_url: data.updateUrl
          }
          this.updateChecked = true
          
          if (data.hasUpdate) {
            this.$message.success(this.$t('new_version_found') + '：' + data.latestVersion)
          } else {
            this.$message.info(this.$t('already_latest'))
          }
        })
        .catch((error) => {
          this.$message.error(this.$t('check_update_failed') + '：' + (error.message || ''))
        })
        .finally(() => {
          this.checkingUpdate = false
        })
    },
    
    // 执行更新
    handleUpdate() {
      const that = this
      this.$confirm({
        title: this.$t('confirm_update_title'),
        content: this.$t('confirm_update_content', {
          current: this.updateInfo.current_version,
          latest: this.updateInfo.latest_version
        }),
        okText: this.$t('confirm_update_btn'),
        okType: 'danger',
        cancelText: this.$t('cancel'),
        onOk() {
          that.doUpdate()
        }
      })
    },
    
    // 执行更新
    doUpdate() {
      this.updating = true
      this.updateModalVisible = true
      this.updateSuccess = false
      this.updateMessage = this.$t('downloading_update')
      
      systemDoUpdate()
        .then((resp) => {
          const data = resp.data.data
          
          if (data.success) {
            // 更新成功，显示重启提示
            this.updateSuccess = true
            this.updateMessage = this.$t('update_success_title')
          } else {
            this.updateModalVisible = false
            this.$message.success(this.$t('update_complete'))
          }
        })
        .catch((error) => {
          this.updateModalVisible = false
          this.updateSuccess = false
          this.$message.error(this.$t('update_failed') + '：' + (error.message || ''))
        })
        .finally(() => {
          this.updating = false
        })
    },
    
    // 复制重启命令
    copyCommand() {
      const command = this.$t('restart_command')
      
      // 使用现代 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(command)
          .then(() => {
            this.$message.success(this.$t('command_copied'))
          })
          .catch(() => {
            // 降级到旧方法
            this.fallbackCopyCommand(command)
          })
      } else {
        // 降级到旧方法
        this.fallbackCopyCommand(command)
      }
    },
    
    // 降级复制方法
    fallbackCopyCommand(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      
      try {
        document.execCommand('copy')
        this.$message.success(this.$t('command_copied'))
      } catch (err) {
        this.$message.error('复制失败，请手动复制')
      }
      
      document.body.removeChild(textArea)
    },
    
    // 刷新页面：清除登录态并跳转登录页，确保新版本路由生效
    refreshPage() {
      removeAuthorization()
      ;[
        process.env.VUE_APP_ROUTES_KEY,
        process.env.VUE_APP_PERMISSIONS_KEY,
        process.env.VUE_APP_ROLES_KEY,
      ].forEach(key => key && localStorage.removeItem(key))
      this.$router.push('/login')
    }
  },
};
</script>

<style lang="less" scoped>
</style>
