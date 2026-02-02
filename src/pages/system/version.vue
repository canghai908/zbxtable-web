<template>
  <page-layout :noTitle="true">
    <a-card :headStyle="{background: '#FAFBFC'}" size="small">
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
          系统更新
        </h3>
        
        <!-- 更新信息 -->
        <a-alert
          v-if="updateInfo.has_update"
          type="info"
          show-icon
          style="margin-bottom: 16px;">
          <template slot="message">
            <span style="font-weight: 500;">发现新版本</span>
          </template>
          <template slot="description">
            <div>
              <p>当前版本：{{ updateInfo.current_version }}</p>
              <p>最新版本：{{ updateInfo.latest_version }}</p>
              <p style="margin-bottom: 0;">可以更新到最新版本以获得新功能和安全更新</p>
            </div>
          </template>
        </a-alert>
        
        <a-alert
          v-else-if="updateChecked && !updateInfo.has_update"
          type="success"
          message="当前已是最新版本"
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
            检查更新
          </a-button>
          
          <a-button 
            v-if="updateInfo.has_update"
            type="danger" 
            icon="cloud-download"
            :loading="updating"
            @click="handleUpdate">
            立即更新
          </a-button>
        </a-space>
      </div>
    </a-card>
    
    <!-- 更新进度对话框 -->
    <a-modal
      v-model="updateModalVisible"
      title="系统更新"
      :footer="null"
      :closable="false"
      :maskClosable="false"
      :keyboard="false"
      centered>
      <div style="text-align: center; padding: 24px 0;">
        <a-spin size="large" />
        <p style="margin-top: 24px; font-size: 16px; color: rgba(0, 0, 0, 0.85);">
          {{ updateMessage }}
        </p>
        <p v-if="countdown > 0" style="font-size: 14px; color: rgba(0, 0, 0, 0.65);">
          系统将在 {{ countdown }} 秒后重启...
        </p>
        <a-progress 
          v-if="countdown > 0"
          :percent="Math.round((1 - countdown / 3) * 100)"
          :show-info="false"
          status="active"
          style="margin-top: 16px;"
        />
      </div>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import config from "../../../package.json";
import { baseVersion, systemCheckUpdate, systemDoUpdate } from "@/services/admin";

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
      countdown: 0,
      countdownTimer: null,
    };
  },

  created() {
    this.UIVersion = config.version
    this.getversion()
  },
  
  beforeDestroy() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer)
    }
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
            this.$message.success('发现新版本：' + data.latestVersion)
          } else {
            this.$message.info('当前已是最新版本')
          }
        })
        .catch((error) => {
          this.$message.error('检查更新失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.checkingUpdate = false
        })
    },
    
    // 执行更新
    handleUpdate() {
      const that = this
      this.$confirm({
        title: '确认更新',
        content: `确定要从 ${this.updateInfo.current_version} 更新到 ${this.updateInfo.latest_version} 吗？更新过程中系统将会重启，请确保已保存所有工作。`,
        okText: '确定更新',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          that.doUpdate()
        }
      })
    },
    
    // 执行更新
    doUpdate() {
      this.updating = true
      this.updateModalVisible = true
      this.updateMessage = '正在下载更新...'
      
      systemDoUpdate()
        .then((resp) => {
          const data = resp.data.data
          
          if (data.success && data.needRestart) {
            this.updateMessage = '更新成功！系统即将重启...'
            this.countdown = data.restartDelay || 3
            
            // 开始倒计时
            this.countdownTimer = setInterval(() => {
              this.countdown--
              if (this.countdown <= 0) {
                clearInterval(this.countdownTimer)
                this.updateMessage = '系统正在重启，请稍候...'
                
                // 5 秒后刷新页面
                setTimeout(() => {
                  window.location.reload()
                }, 5000)
              }
            }, 1000)
          } else {
            this.updateModalVisible = false
            this.$message.success('更新完成')
          }
        })
        .catch((error) => {
          this.updateModalVisible = false
          this.$message.error('更新失败：' + (error.message || '未知错误'))
        })
        .finally(() => {
          this.updating = false
        })
    }
  },
};
</script>

<style lang="less" scoped>
</style>
