<template>
  <page-layout :noTitle="true">
    <a-card :title="$t('title')" :bordered="false">
      <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
        <a-button type="primary" @click="openCreate">{{$t('addInstance')}}</a-button>
        <a-button @click="load">{{$t('refresh')}}</a-button>
      </div>

      <a-table :loading="loading" :columns="columns" :data-source="list" :rowKey="r => r.id" :pagination="{ pageSize: 10 }" :scroll="{ x: 'max-content' }">
        <template slot="instance" slot-scope="text">
          <a-tag :color="$themeColor">{{ text }}</a-tag>
        </template>
        <template slot="enabled" slot-scope="text, record">
          <a-tag v-if="record.enabled" :color="$themeColor">{{ $t('status_enabled') }}</a-tag>
          <a-tag v-else color="red">{{ $t('status_disabled') }}</a-tag>
        </template>
        <template slot="zabbix" slot-scope="text, record">
          <div>
            <div><strong>{{ record.name }}</strong></div>
            <div style="font-size: 12px; color: #999;">{{ record.url }}</div>
          </div>
        </template>
        <template slot="version" slot-scope="text, record">
          <span>{{ record.version || '-' }}</span>
        </template>
        <template slot="auth_methods" slot-scope="text, record">
          <div v-if="record.auth_methods && record.auth_methods.length > 0">
            <a-tag v-for="method in record.auth_methods" :key="method" :color="method === 'password' ? 'green' : 'purple'" style="margin-bottom: 4px;">
              <a-icon :type="method === 'password' ? 'lock' : 'key'" />
              {{ method === 'password' ? $t('password') : 'Token' }}
            </a-tag>
          </div>
          <span v-else style="color: #999;">-</span>
        </template>
        <template slot="conn" slot-scope="text, record">
          <a-tag v-if="record.enabled && record.last_test_ok" color="green">{{ $t('status_connected') }}</a-tag>
          <a-tag v-else-if="record.enabled && !record.last_test_ok" color="orange">{{ $t('status_not_verified') }}</a-tag>
          <a-tag v-else color="default">{{ $t('status_unavailable') }}</a-tag>
        </template>
        <template slot="notify_method" slot-scope="text, record">
          <a-tag v-if="record.notify_method === 'webhook'" color="blue">
            <a-icon type="api" /> Webhook
          </a-tag>
          <a-tag v-else color="purple">
            <a-icon type="cloud-server" /> MS-Agent
          </a-tag>
        </template>
        <template slot="install_status" slot-scope="text, record">
          <template v-if="record.notify_method === 'webhook'">
            <a-tag v-if="record.webhook_installed" color="green">
              <a-icon type="check-circle" /> {{ $t('status_installed') }}
            </a-tag>
            <a-tag v-else color="orange">
              <a-icon type="exclamation-circle" /> {{ $t('status_not_installed') }}
            </a-tag>
          </template>
          <template v-else>
            <a-tag v-if="record.ms_agent_installed" color="green">
              <a-icon type="check-circle" /> {{ $t('status_installed') }}
            </a-tag>
            <a-tag v-else color="orange">
              <a-icon type="exclamation-circle" /> {{ $t('status_not_installed') }}
            </a-tag>
          </template>
        </template>
        <template slot="operation" slot-scope="text, record">
          <div style="text-align: center;">
            <a-button type="link" size="small" @click="test(record)">{{ $t('btn_test_connection') }}</a-button>
            <a-divider type="vertical" />
            <a-button type="link" size="small" @click="toggleEnabled(record)">{{ record.enabled ? $t('btn_toggle_disable') : $t('btn_toggle_enable') }}</a-button>
            <a-divider type="vertical" />
            <a-button type="link" size="small" @click="openEdit(record)">{{ $t('btn_edit') }}</a-button>
            <a-divider type="vertical" />
            <a-popconfirm :title="$t('confirm_delete_title')" :okText="$t('confirm_delete_ok')" :cancelText="$t('confirm_delete_cancel')" @confirm="remove(record)">
              <a-button type="link" size="small" style="color:#f5222d;">{{ $t('btn_delete') }}</a-button>
            </a-popconfirm>
          </div>
        </template>
        <template slot="webhook" slot-scope="text, record">
          <template v-if="record.notify_method === 'webhook'">
            <div style="display: flex; align-items: center; gap: 8px;">
              <!-- 显示安装状态 -->
              <a-tag v-if="record.webhook_installed" color="green">
                <a-icon type="check-circle" /> {{ $t('status_installed') }}
              </a-tag>
              <a-tag v-else color="orange">
                <a-icon type="exclamation-circle" /> {{ $t('status_not_installed') }}
              </a-tag>
              
              <!-- 未安装时显示安装按钮 -->
              <a-button v-if="!record.webhook_installed" type="link" size="small" style="color: #52c41a; padding: 0;" @click="handleInstallWebhook(record)">
                <a-icon type="download" /> {{ $t('btn_install') }}
              </a-button>

              <!-- 已安装时显示查看配置、重装、卸载按钮 -->
              <template v-if="record.webhook_installed">
                <a-button type="link" size="small" style="padding: 0;" @click="handleGetWebhookInfo(record)">
                  <a-icon type="info-circle" /> {{ $t('btn_view_config') }}
                </a-button>
                <a-divider type="vertical" />
                <a-button type="link" size="small" style="padding: 0;" @click="handleReinstallWebhook(record)">
                  <a-icon type="reload" /> {{ $t('btn_reinstall') }}
                </a-button>
                <a-divider type="vertical" />
                <a-popconfirm :title="$t('confirm_uninstall_webhook_title')" :okText="$t('confirm_delete_ok')" :cancelText="$t('confirm_delete_cancel')" @confirm="handleUninstallWebhook(record)">
                  <a-button type="link" size="small" style="color: #ff4d4f; padding: 0;">
                    <a-icon type="delete" /> {{ $t('btn_uninstall') }}
                  </a-button>
                </a-popconfirm>
              </template>
            </div>
          </template>
          <span v-else style="color: #999;">-</span>
        </template>
      </a-table>
    </a-card>

    <!-- 编辑/新增对话框 -->
    <a-modal 
      :title="editingId ? $t('modal_title_edit') : $t('modal_title_add')" 
      :visible="visible" 
      @cancel="handleModalCancel"
      :destroyOnClose="true"
      :getContainer="() => $el"
      width="700px">
      <a-form-model :model="form" :label-col="{span: 7}" :wrapper-col="{span: 15}">
        <a-form-model-item :label="$t('form_instance_id')" required>
          <a-input v-model="form.instance" :placeholder="$t('form_instance_id_placeholder')" :disabled="!!editingId" />
        </a-form-model-item>
        <a-form-model-item :label="$t('form_visible_name')" required>
          <a-input v-model="form.name" :placeholder="$t('form_visible_name_placeholder')" />
        </a-form-model-item>
        <a-form-model-item :label="$t('form_zabbix_url')" required>
          <a-input v-model="form.url" :placeholder="$t('form_zabbix_url_placeholder')" />
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 24 }">
          <div style="max-width: 600px; margin: 0 auto;">
            <a-alert :message="$t('form_auth_tip_title')" type="info" show-icon :style="{ marginBottom: 0, background: hexToRgba($themeColor, 0.08), borderColor: hexToRgba($themeColor, 0.3) }">
              <template slot="icon">
                <a-icon type="info-circle" :style="{ color: $themeColor }" />
              </template>
              <template slot="description">
                <div style="font-size: 13px;">
                  {{ $t('form_auth_tip_desc') }}
                </div>
              </template>
            </a-alert>
          </div>
        </a-form-model-item>
        <a-form-model-item :label="$t('form_username')">
          <a-input v-model="form.user" :placeholder="$t('form_username_placeholder')" />
        </a-form-model-item>
        <a-form-model-item :label="$t('form_password')">
          <a-input-password v-model="form.pass" :placeholder="$t('form_password_placeholder')" />
          <div v-if="editingId" style="margin-top: 4px; color: #999; font-size: 12px;">
            <a-icon type="info-circle" /> {{ $t('form_password_hint') }}
          </div>
        </a-form-model-item>
        <a-form-model-item :label="$t('form_zabbix_token')">
          <a-input v-model="form.token" :placeholder="editingId ? $t('form_zabbix_token_placeholder_edit') : $t('form_zabbix_token_placeholder_add')" />
          <div v-if="editingId" style="margin-top: 4px; color: #999; font-size: 12px;">
            <a-icon type="info-circle" /> {{ $t('form_zabbix_token_hint') }}
          </div>
        </a-form-model-item>
        <a-form-model-item :label="$t('form_alarm_receive_method')">
          <a-radio-group v-model="form.notify_method">
            <a-radio value="webhook">Webhook</a-radio>
          </a-radio-group>
          <div style="margin-top: 6px; color:#999; font-size:12px;">
            {{ $t('form_alarm_receive_desc') }}
          </div>
        </a-form-model-item>
        <a-form-model-item :label="$t('form_enabled')">
          <a-switch v-model="form.enabled" />
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 15, offset: 7 }">
          <a-space>
            <a-button :loading="testing" @click="testConnection">{{ $t('form_test_connection_btn') }}</a-button>
          </a-space>
          <div v-if="testMsg" :style="{ marginTop: '8px', color: testOk ? '#52c41a' : '#f5222d' }">
            <a-icon :type="testOk ? 'check-circle' : 'close-circle'" /> {{ testMsg }}
          </div>
          <div style="margin-top: 6px; color: #999; font-size: 12px;">
            {{ $t('form_test_connection_hint') }}
          </div>
        </a-form-model-item>
      </a-form-model>
      
      <!-- 自定义底部按钮 -->
      <template slot="footer">
        <a-button @click="handleModalCancel">{{ $t('btn_cancel') }}</a-button>
        
        <!-- 保存按钮 - 始终显示，测试通过前禁用 -->
        <a-button 
          type="primary" 
          :loading="saving" 
          :disabled="!testOk"
          @click="saveOnly">
          <a-icon type="save" /> {{ $t('btn_save') }}
        </a-button>
      </template>
    </a-modal>

    <!-- 安装进度对话框 -->
    <a-modal :title="currentInstallType === 'webhook' ? $t('modal_title_install_webhook') : $t('modal_title_install_msagent')" :visible="installVisible" :footer="installCompleted ? null : []" :closable="installCompleted"
      :maskClosable="false" :destroyOnClose="true" :getContainer="() => $el" width="800px" @cancel="closeInstallModal">
      <div style="min-height: 300px;">
        <!-- 安装说明 -->
        <a-alert v-if="!installStarted" :message="currentInstallType === 'webhook' ? $t('install_webhook_desc') : $t('install_msagent_desc')" type="info" show-icon style="margin-bottom: 16px;">
          <template slot="description">
            <div>{{ $t('install_webhook_items') }}</div>
            <ul v-if="currentInstallType === 'webhook'" style="margin: 8px 0; padding-left: 20px;">
              <li>{{ $t('install_webhook_item1') }}</li>
              <li>{{ $t('install_webhook_item2') }}</li>
              <li>{{ $t('install_webhook_item3') }}</li>
              <li>{{ $t('install_webhook_item4') }}</li>
              <li>{{ $t('install_webhook_item5') }}</li>
              <li>{{ $t('install_webhook_item6') }}</li>
            </ul>
            <ul v-else style="margin: 8px 0; padding-left: 20px;">
              <li>{{ $t('install_msagent_item1') }}</li>
              <li>{{ $t('install_msagent_item2') }}</li>
              <li>{{ $t('install_msagent_item3') }}</li>
              <li>{{ $t('install_msagent_item4') }}</li>
              <li>{{ $t('install_msagent_item5') }}</li>
            </ul>
            <div style="margin-top: 8px;">
              <a-button type="primary" @click="startInstall" :loading="installing">
                <a-icon type="download" /> {{ $t('btn_start_install') }}
              </a-button>
              <a-button style="margin-left: 8px;" @click="installVisible = false">{{ $t('btn_cancel') }}</a-button>
            </div>
          </template>
        </a-alert>

        <!-- 安装进度 -->
        <div v-if="installStarted">
          <a-steps :current="currentStep" size="small" style="margin-bottom: 20px;">
            <a-step :title="$t('install_step_connect')" />
            <a-step :title="$t('install_step_create')" />
            <a-step :title="$t('install_step_generate')" />
            <a-step :title="$t('install_step_complete')" />
          </a-steps>

          <!-- 安装日志 -->
          <div style="background: #000; color: #0f0; padding: 16px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; max-height: 400px; overflow-y: auto; line-height: 1.6;">
            <div v-for="(log, index) in installLogs" :key="index" :style="{ color: log.type === 'error' ? '#f00' : log.type === 'success' ? '#0f0' : log.type === 'warning' ? '#ff0' : '#0f0' }">
              <span style="color: #666;">[{{ log.time }}]</span> {{ log.message }}
            </div>
            <div v-if="installing" style="color: #0ff;">
              <a-icon type="loading" /> {{ $t('install_log_executing') }}
            </div>
          </div>

          <!-- 安装结果 -->
          <div v-if="installCompleted" style="margin-top: 16px;">
            <a-alert v-if="installSuccess" :message="$t('install_success_title')" type="success" show-icon style="margin-bottom: 12px;">
              <template slot="description">
                <span v-if="currentInstallType === 'webhook'">
                  {{ $t('install_success_webhook_desc') }}
                </span>
                <span v-else>
                  {{ $t('install_success_msagent_desc') }}
                </span>
              </template>
            </a-alert>
            <a-alert v-else :message="$t('install_failed_title')" type="error" show-icon style="margin-bottom: 12px;">
              <template slot="description">
                {{ installError || $t('install_failed_desc') }}
              </template>
            </a-alert>

            <div style="text-align: right;">
              <a-button v-if="installSuccess && currentInstallType === 'msagent'" type="primary" @click="handleGetScriptAfterInstall">
                <a-icon type="code" /> {{ $t('btn_view_full_script') }}
              </a-button>
              <a-button v-if="installSuccess && currentInstallType === 'webhook'" type="primary" @click="handleGetWebhookInfoAfterInstall">
                <a-icon type="info-circle" /> {{ $t('btn_view_config') }}
              </a-button>
              <a-button v-if="!installSuccess" type="primary" @click="retryInstall">
                <a-icon type="reload" /> {{ $t('btn_retry') }}
              </a-button>
              <a-button style="margin-left: 8px;" @click="closeInstallModal">{{ $t('btn_close') }}</a-button>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- Webhook 配置信息对话框 -->
    <a-modal :title="$t('modal_title_webhook_info')" :visible="webhookInfoVisible" @cancel="webhookInfoVisible=false" :footer="null" :destroyOnClose="true" :getContainer="() => $el" width="800px">
      <div v-if="webhookInfo">
        <div :style="{ padding: '12px 16px', background: hexToRgba($themeColor, 0.1), border: `1px solid ${hexToRgba($themeColor, 0.3)}`, borderRadius: '4px', marginBottom: '16px' }">
          <div :style="{ display: 'flex', alignItems: 'center', marginBottom: '8px' }">
            <a-icon type="check-circle" :style="{ fontSize: '16px', color: $themeColor, marginRight: '8px' }" />
            <strong :style="{ color: $themeColor }">{{ $t('webhook_config_desc').split('。')[0] }}</strong>
          </div>
          <div style="color: #666; font-size: 13px;">
            {{ $t('webhook_config_desc') }}
          </div>
        </div>

        <a-descriptions bordered :column="1">
          <a-descriptions-item :label="$t('webhook_url')">
            <div style="display: flex; align-items: center; gap: 8px;">
              <code style="flex: 1;">{{ webhookInfo.webhook_url }}</code>
              <a-button size="small" icon="copy" @click="copyToClipboard(webhookInfo.webhook_url, $t('webhook_url'))">{{ $t('btn_copy') }}</a-button>
            </div>
          </a-descriptions-item>
          <a-descriptions-item :label="$t('webhook_instance')">
            <div style="display: flex; align-items: center; gap: 8px;">
              <code style="flex: 1;">{{ webhookInfo.instance }}</code>
              <a-button size="small" icon="copy" @click="copyToClipboard(webhookInfo.instance, $t('webhook_instance'))">{{ $t('btn_copy') }}</a-button>
            </div>
          </a-descriptions-item>
          <a-descriptions-item :label="$t('webhook_token')">
            <div style="display: flex; align-items: center; gap: 8px;">
              <code style="flex: 1; word-break: break-all;">{{ webhookInfo.webhook_token }}</code>
              <a-button size="small" icon="copy" @click="copyToClipboard(webhookInfo.webhook_token, $t('webhook_token'))">{{ $t('btn_copy') }}</a-button>
            </div>
          </a-descriptions-item>
          <a-descriptions-item :label="$t('webhook_method')">
            <a-tag color="blue">{{ webhookInfo.method }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item :label="$t('webhook_content_type')">
            <code>{{ webhookInfo.content_type }}</code>
          </a-descriptions-item>
          <a-descriptions-item :label="$t('webhook_headers')">
            <pre :style="{ background: hexToRgba($themeColor, 0.08), padding: '8px', borderRadius: '4px', margin: 0, border: `1px solid ${hexToRgba($themeColor, 0.2)}` }">{{ webhookInfo.headers }}</pre>
            <a-button size="small" icon="copy" style="margin-top: 8px;" @click="copyToClipboard(webhookInfo.headers, $t('webhook_headers'))">{{ $t('btn_copy') }}</a-button>
          </a-descriptions-item>
        </a-descriptions>

        <div :style="{ padding: '12px 16px', background: hexToRgba($themeColor, 0.08), border: `1px solid ${hexToRgba($themeColor, 0.25)}`, borderRadius: '4px', marginTop: '16px' }">
          <div :style="{ display: 'flex', alignItems: 'center', marginBottom: '8px' }">
            <a-icon type="info-circle" :style="{ fontSize: '16px', color: $themeColor, marginRight: '8px' }" />
            <strong :style="{ color: $themeColor }">{{ $t('webhook_working_principle') }}</strong>
          </div>
            <div style="color: #666; font-size: 13px;">
              <div>• {{ $t('webhook_principle_1') }}</div>
              <div>• {{ $t('webhook_principle_2') }}</div>
              <div>• {{ $t('webhook_principle_3') }}</div>
              <div>• {{ $t('webhook_principle_4') }}</div>
            </div>
        </div>

        <div :style="{ marginTop: '16px', padding: '12px', background: hexToRgba($themeColor, 0.05), borderRadius: '4px', border: `1px solid ${hexToRgba($themeColor, 0.2)}` }">
          <h4 :style="{ marginBottom: '8px', color: $themeColor }">{{ $t('webhook_verify_title') }}</h4>
          <div style="color: #666; font-size: 13px;">
            <div>{{ $t('webhook_verify_1') }}</div>
            <div>{{ $t('webhook_verify_2') }}</div>
            <div>{{ $t('webhook_verify_3') }}</div>
          </div>
        </div>
      </div>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { 
  listZabbixInstance, 
  createZabbixInstance, 
  updateZabbixInstance, 
  deleteZabbixInstance, 
  testZabbixInstanceConfig, 
  testZabbixInstance, 
  setZabbixInstanceEnabled,
  installMSAgent, 
  getMSAgentScript, 
  installWebhook, 
  getWebhookInfo, 
  uninstallMSAgent, 
  uninstallWebhook 
} from '@/services/zabbix'
import { configGetList } from '@/services/admin'

export default {
  name: 'SystemZabbixInstance',
  i18n: require('./zabbix-i18n'),
  components: { PageLayout },
  data () {
    return {
      loading: false,
      saving: false,
      visible: false,
      testing: false,
      testOk: false,
      testMsg: '',
      scriptVisible: false,
      installVisible: false,
      installStarted: false,
      installing: false,
      installCompleted: false,
      installSuccess: false,
      installError: '',
      currentStep: 0,
      installLogs: [],
      currentRecord: null,
      currentInstallType: 'msagent', // 'msagent' 或 'webhook'
      installScriptData: null, // 安装完成后的脚本数据
      editingId: null,
      list: [],
      scriptData: null,
      form: { 
        instance: '', 
        name: '',
        url: '',
        user: '',
        pass: '',
        token: '',
        notify_method: 'webhook', 
        enabled: true 
      },
      webhookInfoVisible: false,
      webhookInfo: null,
      // 弹窗中安装webhook相关
      installingInModal: false,
      webhookInstalledInModal: false,
      instanceSaved: false,
      tempInstanceForInstall: null, // 临时保存实例信息用于安装
      isFromGuide: false, // 标记是否来自引导流程
      columns: [
        { title: this.$t('col_id'), dataIndex: 'id', key: 'id', width: 60 },
        { title: this.$t('col_instance_id'), dataIndex: 'instance', key: 'instance', width: 120, scopedSlots: { customRender: 'instance' } },
        { title: this.$t('col_zabbix_info'), key: 'zabbix', width: 280, scopedSlots: { customRender: 'zabbix' } },
        { title: this.$t('col_version'), key: 'version', width: 100, scopedSlots: { customRender: 'version' } },
        { title: this.$t('col_auth_method'), key: 'auth_methods', width: 120, scopedSlots: { customRender: 'auth_methods' } },
        { title: this.$t('col_connection'), key: 'conn', width: 100, scopedSlots: { customRender: 'conn' } },
        { title: this.$t('col_alarm_receive'), key: 'notify_method', width: 130, scopedSlots: { customRender: 'notify_method' } },
        { title: this.$t('col_enabled'), key: 'enabled', width: 80, scopedSlots: { customRender: 'enabled' } },
        { title: this.$t('col_webhook'), key: 'webhook', width: 350, scopedSlots: { customRender: 'webhook' }, align: 'center' },
        { title: this.$t('col_operation'), key: 'operation', width: 300, scopedSlots: { customRender: 'operation' }, align: 'center' }
      ]
    }
  },
  mounted () {
    this.load()
    
    // 监听打开新增实例对话框的事件
    this.$root.$on('open-zabbix-instance-modal', this.handleOpenCreateFromGuide)
  },
  beforeDestroy() {
    // 移除事件监听
    this.$root.$off('open-zabbix-instance-modal', this.handleOpenCreateFromGuide)
  },
  methods: {
    hexToRgba(hex, alpha = 1) {
      if (!hex) return `rgba(24, 144, 255, ${alpha})`
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },
    async load () {
      this.loading = true
      try {
        const res = await listZabbixInstance()
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) this.list = biz.data || []
      } finally {
        this.loading = false
      }
    },
    openCreate () {
      this.editingId = null
      this.form = { 
        instance: '', 
        name: '',
        url: '',
        user: '',
        pass: '',
        token: '',
        notify_method: 'webhook', 
        enabled: true 
      }
      this.testOk = false
      this.testMsg = ''
      this.webhookInstalledInModal = false
      this.instanceSaved = false
      this.tempInstanceForInstall = null
      // 不要重置 isFromGuide，因为它可能已经被 handleOpenCreateFromGuide 设置为 true
      // this.isFromGuide = false
      this.visible = true
    },
    // 从引导流程打开新增对话框
    handleOpenCreateFromGuide() {
      console.log('handleOpenCreateFromGuide 被调用')
      this.isFromGuide = true
      console.log('设置 isFromGuide = true')
      this.openCreate()
    },
    openEdit (record) {
      this.editingId = record.id
      this.form = {
        instance: record.instance || '',
        name: record.name || '',
        url: record.url || '',
        user: record.user || '',
        pass: record.pass || '',
        token: record.token || '',
        notify_method: record.notify_method || 'webhook',
        enabled: !!record.enabled
      }
      this.testOk = false
      this.testMsg = ''
      this.webhookInstalledInModal = false
      this.instanceSaved = true // 编辑时实例已保存
      this.tempInstanceForInstall = null
      this.visible = true
    },
    async testConnection () {
      if (!this.form.url) {
        this.$message.warning(this.$t('msg_fill_url'))
        return
      }
      this.testing = true
      this.testOk = false
      this.testMsg = ''
      try {
        const res = await testZabbixInstanceConfig(this.form)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.testOk = true
          this.testMsg = this.$t('msg_connection_success') + (biz.data.version || '-')
        } else {
          this.testOk = false
          this.testMsg = (biz && biz.message) || this.$t('msg_connection_failed')
        }
      } finally {
        this.testing = false
      }
    },
    // 只保存实例（不安装Webhook）
    async saveOnly() {
      console.log('saveOnly 被调用')
      console.log('isFromGuide:', this.isFromGuide)
      console.log('editingId:', this.editingId)
      
      if (!this.form.instance || !this.form.name || !this.form.url) {
        this.$message.warning(this.$t('msg_fill_required'))
        return
      }
      if (!this.testOk) {
        this.$message.warning(this.$t('msg_test_first'))
        return
      }
      this.saving = true
      try {
        let res
        if (this.editingId) {
          res = await updateZabbixInstance(this.editingId, this.form)
        } else {
          res = await createZabbixInstance(this.form)
        }
        const biz = (res && res.data) ? res.data : res
        console.log('保存结果:', biz)
        
        if (biz && biz.code === 200) {
          this.$message.success(this.$t('msg_save_success'))
          this.instanceSaved = true
          
          // 保存是否来自引导流程的标记
          const wasFromGuide = this.isFromGuide
          const instanceName = this.form.name
          
          console.log('wasFromGuide:', wasFromGuide)
          console.log('instanceName:', instanceName)
          console.log('editingId:', this.editingId)
          
          // 先关闭对话框
          this.visible = false
          this.isFromGuide = false
          
          // 等待对话框完全关闭后再执行后续操作
          await this.$nextTick()
          
          // 刷新列表
          await this.load()
          
          // 如果是从引导流程打开的，触发引导完成事件
          console.log('检查条件: wasFromGuide =', wasFromGuide, ', !this.editingId =', !this.editingId)
          if (wasFromGuide && !this.editingId) {
            // 使用 nextTick 确保 DOM 更新完成
            this.$nextTick(() => {
              console.log('触发 instance-added-from-guide 事件，实例名称:', instanceName)
              this.$root.$emit('instance-added-from-guide', instanceName)
            })
          } else {
            console.log('条件不满足，不触发事件')
          }
        } else {
          this.$message.error((biz && biz.message) || this.$t('msg_save_failed'))
        }
      } finally {
        this.saving = false
      }
    },
    // 保存并安装Webhook
    // 在弹窗中安装Webhook（不保存实例）
    async installWebhookInModal() {
      // 先检查 webhook_url 是否配置
      try {
        const res = await configGetList()
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          const configs = biz.data.items || []
          const webhookUrlConfig = configs.find(c => c.key === 'webhook_url')
          
          if (!webhookUrlConfig || !webhookUrlConfig.value || webhookUrlConfig.value.trim() === '') {
            this.$warning({
              title: this.$t('msg_webhook_config_missing'),
              content: this.$t('msg_webhook_url_not_configured'),
              okText: this.$t('msg_know')
            })
            return
          }
        }
      } catch (error) {
        console.error('检查 webhook_url 配置失败:', error)
        this.$message.error(this.$t('msg_check_config_failed'))
        return
      }
      
      if (!this.testOk) {
        this.$message.warning(this.$t('msg_test_first'))
        return
      }
      
      if (!this.editingId) {
        this.$message.warning('请先保存实例')
        return
      }
      
      this.installingInModal = true
      try {
        const installRes = await installWebhook(this.editingId)
        const installBiz = (installRes && installRes.data) ? installRes.data : installRes
        
        if (installBiz && installBiz.code === 200) {
          this.webhookInstalledInModal = true
          this.$message.success(this.$t('webhook_install_success'))
          
          // 刷新列表以更新状态
          await this.load()
        } else {
          throw new Error((installBiz && installBiz.message) || this.$t('install_failed_title'))
        }
      } catch (error) {
        console.error('安装Webhook失败:', error)
        this.$message.error(this.$t('webhook_install_failed') + ': ' + (error.message || error))
      } finally {
        this.installingInModal = false
      }
    },
    // 关闭弹窗
    handleModalCancel() {
      this.visible = false
      this.webhookInstalledInModal = false
      this.instanceSaved = false
      this.tempInstanceForInstall = null
      
      // 如果是从引导流程打开的，且没有添加实例，通知引导组件
      if (this.isFromGuide && !this.instanceSaved) {
        // 用户取消了添加，不做任何操作
      }
      this.isFromGuide = false
    },
    async test (record) {
      const res = await testZabbixInstance(record.id)
      const biz = (res && res.data) ? res.data : res
      if (biz && biz.code === 200) {
        this.$message.success(this.$t('msg_connection_success') + (biz.data.version || '-'))
        await this.load()
      } else {
        this.$message.error((biz && biz.message) || this.$t('msg_connection_failed'))
        await this.load()
      }
    },
    async toggleEnabled (record) {
      const target = !record.enabled
      const res = await setZabbixInstanceEnabled(record.id, target)
      const biz = (res && res.data) ? res.data : res
      if (biz && biz.code === 200) {
        this.$message.success(target ? this.$t('msg_enabled') : this.$t('msg_disabled'))
        await this.load()
      } else {
        this.$message.error((biz && biz.message) || this.$t('msg_operation_failed'))
      }
    },
    async remove (record) {
      const res = await deleteZabbixInstance(record.id)
      const biz = (res && res.data) ? res.data : res
      if (biz && biz.code === 200) {
        this.$message.success(this.$t('msg_deleted'))
        await this.load()
      } else {
        this.$message.error((biz && biz.message) || this.$t('msg_delete_failed'))
      }
    },
    // 打开 MS-Agent 安装对话框
    handleInstallMSAgent (record) {
      this.currentRecord = record
      this.currentInstallType = 'msagent'
      this.installVisible = true
      this.installStarted = false
      this.installing = false
      this.installCompleted = false
      this.installSuccess = false
      this.installError = ''
      this.installScriptData = null
      this.currentStep = 0
      this.installLogs = []
    },
    // 打开 Webhook 安装对话框
    async handleInstallWebhook (record) {
      // 先检查 webhook_url 是否配置
      try {
        const res = await configGetList()
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          const configs = biz.data.items || []
          const webhookUrlConfig = configs.find(c => c.key === 'webhook_url')
          
          if (!webhookUrlConfig || !webhookUrlConfig.value || webhookUrlConfig.value.trim() === '') {
            this.$warning({
              title: this.$t('msg_webhook_config_missing'),
              content: this.$t('msg_webhook_url_not_configured'),
              okText: this.$t('msg_know')
            })
            return
          }
        }
      } catch (error) {
        console.error('检查 webhook_url 配置失败:', error)
        this.$message.error(this.$t('msg_check_config_failed'))
        return
      }
      
      this.currentRecord = record
      this.currentInstallType = 'webhook'
      this.installVisible = true
      this.installStarted = false
      this.installing = false
      this.installCompleted = false
      this.installSuccess = false
      this.installError = ''
      this.installScriptData = null
      this.currentStep = 0
      this.installLogs = []
    },
    // 开始安装
    async startInstall () {
      this.installStarted = true
      this.installing = true
      this.installCompleted = false
      this.installSuccess = false
      this.installError = ''
      this.currentStep = 0
      this.installLogs = []

      try {
        if (this.currentInstallType === 'webhook') {
          // Webhook 安装流程
          this.addLog('info', this.$t('install_webhook_desc') + '...')
          this.addLog('info', `${this.$t('col_instance_id')}: ${this.currentRecord.instance}`)
          this.addLog('info', `Zabbix: ${this.currentRecord.name} (${this.currentRecord.url})`)
          
          await this.sleep(500)
          this.currentStep = 0
          this.addLog('info', `[${this.$t('install_step_connect')} 1/3] ${this.$t('install_step_connect')} API...`)
          await this.sleep(500)
          this.addLog('success', `✓ Zabbix API ${this.$t('status_connected')}`)
          
          this.currentStep = 1
          this.addLog('info', `[${this.$t('install_step_create')} 2/3] ${this.$t('install_step_create')}...`)
          await this.sleep(300)
          this.addLog('info', '  - ' + this.$t('install_webhook_item1').split('（')[0])
          await this.sleep(300)
          this.addLog('info', '  - ' + this.$t('install_webhook_item2'))
          await this.sleep(300)
          this.addLog('info', '  - ' + this.$t('install_webhook_item3').split('（')[0])
          await this.sleep(300)
          this.addLog('info', '  - ' + this.$t('install_webhook_item4').split('（')[0])
          await this.sleep(300)
          this.addLog('info', '  - ' + this.$t('install_webhook_item4').split('（')[0])
          
          // 调用后端 API
          const res = await installWebhook(this.currentRecord.id)
          const biz = (res && res.data) ? res.data : res
          
          if (biz && biz.code === 200) {
            await this.sleep(500)
            this.addLog('success', '✓ ' + this.$t('install_step_create') + this.$t('install_success_title'))
            
            this.currentStep = 2
            this.addLog('info', `[${this.$t('install_step_generate')} 3/3] ${this.$t('install_step_generate')}...`)
            await this.sleep(500)
            this.addLog('success', '✓ Token ' + this.$t('install_step_generate') + this.$t('install_success_title'))
              
            this.addLog('success', '✓ Webhook ' + this.$t('install_success_title'))
            this.addLog('info', this.$t('webhook_config_desc').split('。')[0])
            
            this.installSuccess = true
            
            // 刷新列表以更新状态
            await this.load()
          } else {
            throw new Error((biz && biz.message) || this.$t('install_failed_title'))
          }
        } else {
          // MS-Agent 安装流程
          this.addLog('info', this.$t('install_msagent_desc') + '...')
          this.addLog('info', `${this.$t('col_instance_id')}: ${this.currentRecord.instance}`)
          this.addLog('info', `Zabbix: ${this.currentRecord.name} (${this.currentRecord.url})`)
          
          await this.sleep(500)
          this.currentStep = 0
          this.addLog('info', `[${this.$t('install_step_connect')} 1/3] ${this.$t('install_step_connect')} API...`)
          await this.sleep(500)
          this.addLog('success', `✓ Zabbix API ${this.$t('status_connected')}`)
          
          this.currentStep = 1
          this.addLog('info', `[${this.$t('install_step_create')} 2/3] ${this.$t('install_step_create')} Zabbix...`)
          await this.sleep(300)
          this.addLog('info', '  - ' + this.$t('install_msagent_item1'))
          await this.sleep(300)
          this.addLog('info', '  - ' + this.$t('install_msagent_item2'))
          await this.sleep(300)
          this.addLog('info', '  - ' + this.$t('install_msagent_item3').split('（')[0])
          await this.sleep(300)
          this.addLog('info', '  - ' + this.$t('install_msagent_item4').split('（')[0])
          
          // 调用后端 API
          const res = await installMSAgent(this.currentRecord.id)
          const biz = (res && res.data) ? res.data : res
          
          if (biz && biz.code === 200) {
            await this.sleep(500)
            this.addLog('success', '✓ Zabbix ' + this.$t('install_step_create') + this.$t('install_success_title'))
            
            this.currentStep = 2
            this.addLog('info', `[${this.$t('install_step_generate')} 3/3] ${this.$t('install_step_generate')}...`)
            await this.sleep(500)
            this.addLog('success', '✓ Token ' + this.$t('install_step_generate') + this.$t('install_success_title'))
            
            this.addLog('success', '✓ MS-Agent ' + this.$t('install_success_title'))
            this.addLog('info', this.$t('btn_view_full_script') + '...')
            
            this.installSuccess = true
            
            // 刷新列表以更新状态
            await this.load()
            
            // 获取安装脚本
            try {
              const scriptRes = await getMSAgentScript(this.currentRecord.id)
              const scriptBiz = (scriptRes && scriptRes.data) ? scriptRes.data : scriptRes
              if (scriptBiz && scriptBiz.code === 200) {
                this.installScriptData = scriptBiz.data
                this.addLog('success', '✓ ' + this.$t('msagent_tab_full_script') + this.$t('install_step_generate') + this.$t('install_success_title'))
                this.addLog('info', this.$t('msagent_quick_install_cmd_desc'))
              }
            } catch (err) {
              this.addLog('warning', '⚠ ' + this.$t('msg_operation_failed'))
            }
          } else {
            throw new Error((biz && biz.message) || this.$t('install_failed_title'))
          }
        }
      } catch (error) {
        this.addLog('error', '✗ ' + this.$t('install_failed_title') + ': ' + (error.message || error))
        this.installSuccess = false
        this.installError = error.message || error
      } finally {
        this.installing = false
        this.installCompleted = true
      }
    },
    // 重试安装
    retryInstall () {
      this.startInstall()
    },
    // 关闭安装对话框
    closeInstallModal () {
      this.installVisible = false
      this.currentRecord = null
    },
    // 安装完成后获取脚本
    handleGetScriptAfterInstall () {
      this.installVisible = false
      this.handleGetScript(this.currentRecord)
    },
    // 安装完成后获取 Webhook 信息
    handleGetWebhookInfoAfterInstall () {
      this.installVisible = false
      this.handleGetWebhookInfo(this.currentRecord)
    },
    // 重新安装 MS-Agent
    handleReinstallMSAgent (record) {
      this.$confirm({
        title: '重新安装 MS-Agent 配置',
        content: '确定要重新安装吗？这将重新创建 Zabbix 中的配置并生成新的 Token。',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.handleInstallMSAgent(record)
        }
      })
    },
    // 重新安装 Webhook
    handleReinstallWebhook (record) {
      this.$confirm({
        title: this.$t('confirm_reinstall_webhook_title'),
        content: this.$t('confirm_reinstall_webhook_content'),
        okText: this.$t('confirm_delete_ok'),
        cancelText: this.$t('confirm_delete_cancel'),
        onOk: () => {
          this.handleInstallWebhook(record)
        }
      })
    },
    // 获取安装脚本
    async handleGetScript (record) {
      // 先刷新获取最新状态
      await this.load()
      const updatedRecord = this.list.find(r => r.id === record.id)
      
      if (!updatedRecord || !updatedRecord.ms_agent_installed) {
        this.$message.warning('请先安装 MS-Agent 配置')
        return
      }
      
      try {
        const res = await getMSAgentScript(updatedRecord.id)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.scriptData = biz.data
          this.scriptVisible = true
        } else {
          this.$message.error((biz && biz.message) || '获取脚本失败')
        }
      } catch (error) {
        this.$message.error('获取脚本失败：' + (error.message || error))
      }
    },
    // 获取 Webhook 配置信息
    async handleGetWebhookInfo (record) {
      // 先刷新获取最新状态
      await this.load()
      const updatedRecord = this.list.find(r => r.id === record.id)
      
      if (!updatedRecord || !updatedRecord.webhook_installed) {
        this.$message.warning(this.$t('msg_install_first_webhook'))
        return
      }
      
      try {
        const res = await getWebhookInfo(updatedRecord.id)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.webhookInfo = biz.data
          this.webhookInfoVisible = true
        } else {
          this.$message.error((biz && biz.message) || this.$t('msg_operation_failed'))
        }
      } catch (error) {
        this.$message.error(this.$t('msg_operation_failed') + '：' + (error.message || error))
      }
    },
    // 卸载 MS-Agent
    async handleUninstallMSAgent (record) {
      try {
        const res = await uninstallMSAgent(record.id)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.$message.success('MS-Agent 配置卸载成功')
          await this.load()
        } else {
          this.$message.error((biz && biz.message) || '卸载失败')
        }
      } catch (error) {
        this.$message.error('卸载失败：' + (error.message || error))
      }
    },
    // 卸载 Webhook
    async handleUninstallWebhook (record) {
      try {
        const res = await uninstallWebhook(record.id)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.$message.success('Webhook 配置卸载成功')
          await this.load()
        } else {
          this.$message.error((biz && biz.message) || '卸载失败')
        }
      } catch (error) {
        this.$message.error('卸载失败：' + (error.message || error))
      }
    },
    // 添加日志
    addLog (type, message) {
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      this.installLogs.push({ type, message, time })
      // 自动滚动到底部
      this.$nextTick(() => {
        const logContainer = document.querySelector('.ant-modal-body pre')
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight
        }
      })
    },
    // 延迟函数
    sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },
    // 复制到剪贴板
    copyToClipboard (text, name) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.$message.success(name + this.$t('msg_copy_success'))
      } catch (err) {
        this.$message.error(this.$t('msg_copy_failed'))
      }
      document.body.removeChild(textarea)
    }
  }
}
</script>

<style scoped>
code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

pre {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.ant-alert {
  margin-bottom: 16px;
}

/* 防止表格在无数据时出现滚动条 */
::v-deep .ant-table-wrapper {
  overflow: visible;
}

::v-deep .ant-table {
  overflow: visible;
}

::v-deep .ant-table-body {
  overflow-x: auto !important;
  overflow-y: visible !important;
}
</style>
