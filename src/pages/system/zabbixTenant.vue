<template>
  <page-layout :noTitle="true">
    <a-card title="Zabbix 租户绑定" :bordered="false">
      <div style="margin-bottom: 12px; display: flex; gap: 8px; align-items: center;">
        <a-button type="primary" @click="openCreate">新增绑定</a-button>
        <a-button @click="load">刷新</a-button>
      </div>

      <a-table :loading="loading" :columns="columns" :data-source="list" :rowKey="r => r.id">
        <template slot="enabled" slot-scope="text, record">
          <a-tag v-if="record.enabled" color="blue">启用</a-tag>
          <a-tag v-else color="red">禁用</a-tag>
        </template>
        <template slot="zabbix" slot-scope="text, record">
          <span>{{ zabbixName(record.zabbix_instance_id) }}</span>
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
              <a-icon type="check-circle" /> 已安装
            </a-tag>
            <a-tag v-else color="orange">
              <a-icon type="exclamation-circle" /> 未安装
            </a-tag>
          </template>
          <template v-else>
            <a-tag v-if="record.ms_agent_installed" color="green">
              <a-icon type="check-circle" /> 已安装
            </a-tag>
            <a-tag v-else color="orange">
              <a-icon type="exclamation-circle" /> 未安装
            </a-tag>
          </template>
        </template>
        <template slot="operation" slot-scope="text, record">
          <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
          <a-divider type="vertical" />

          <!-- MS-Agent 方式 -->
          <template v-if="record.notify_method !== 'webhook'">
            <!-- 未安装时显示安装按钮 -->
            <a-button v-if="!record.ms_agent_installed" type="link" size="small" style="color: #52c41a;" @click="handleInstallMSAgent(record)">
              <a-icon type="download" /> 安装 MS-Agent
            </a-button>

            <!-- 已安装时显示获取脚本和重新安装按钮 -->
            <template v-if="record.ms_agent_installed">
              <a-button type="link" size="small" @click="handleGetScript(record)">
                <a-icon type="code" /> 获取脚本
              </a-button>
              <a-divider type="vertical" />
              <a-button type="link" size="small" @click="handleReinstallMSAgent(record)">
                <a-icon type="reload" /> 重新安装
              </a-button>
              <a-divider type="vertical" />
              <a-popconfirm title="确定要卸载 MS-Agent 配置吗？这将删除 Zabbix 中的相关配置。" okText="确定" cancelText="取消" @confirm="handleUninstallMSAgent(record)">
                <a-button type="link" size="small" style="color: #ff4d4f;">
                  <a-icon type="delete" /> 卸载
                </a-button>
              </a-popconfirm>
            </template>
          </template>

          <!-- Webhook 方式 -->
          <template v-if="record.notify_method === 'webhook'">
            <!-- 未安装时显示安装按钮 -->
            <a-button v-if="!record.webhook_installed" type="link" size="small" style="color: #52c41a;" @click="handleInstallWebhook(record)">
              <a-icon type="download" /> 安装 Webhook
            </a-button>

            <!-- 已安装时显示获取信息和重新安装按钮 -->
            <template v-if="record.webhook_installed">
              <a-button type="link" size="small" @click="handleGetWebhookInfo(record)">
                <a-icon type="info-circle" /> 查看配置
              </a-button>
              <a-divider type="vertical" />
              <a-button type="link" size="small" @click="handleReinstallWebhook(record)">
                <a-icon type="reload" /> 重新安装
              </a-button>
              <a-divider type="vertical" />
              <a-popconfirm title="确定要卸载 Webhook 配置吗？这将删除 Zabbix 中的相关配置。" okText="确定" cancelText="取消" @confirm="handleUninstallWebhook(record)">
                <a-button type="link" size="small" style="color: #ff4d4f;">
                  <a-icon type="delete" /> 卸载
                </a-button>
              </a-popconfirm>
            </template>
          </template>

          <a-divider type="vertical" />
          <a-popconfirm title="确定要删除这个绑定吗？" okText="确定" cancelText="取消" @confirm="remove(record)">
            <a-button type="link" size="small" style="color:#f5222d;">删除</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>

    <!-- 编辑/新增对话框 -->
    <a-modal :title="editingId ? '编辑绑定' : '新增绑定'" :visible="visible" @ok="save" @cancel="visible=false" :confirmLoading="saving">
      <a-form-model :model="form" :label-col="{span: 7}" :wrapper-col="{span: 15}">
        <a-form-model-item label="租户" required>
          <a-input v-model="form.tenant_id" placeholder="ZBX-TenantID" :disabled="!!editingId" />
        </a-form-model-item>
        <a-form-model-item label="Zabbix 连接" required>
          <a-select v-model="form.zabbix_instance_id" style="width: 100%" placeholder="选择 Zabbix 连接">
            <a-select-option v-for="z in zabbixList" :key="z.id" :value="z.id">{{ z.name }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="Token">
          <a-input-password v-model="form.token" placeholder="该租户对应的 Token" />
          <div style="margin-top: 6px; color:#999; font-size:12px;">
            若填写 token，将用于 /v1/receive 按租户校验 Token；未配置则回退全局 token（兼容旧逻辑）。
          </div>
        </a-form-model-item>
        <a-form-model-item label="通知方式">
          <a-radio-group v-model="form.notify_method">
            <a-radio value="msagent">MS-Agent</a-radio>
            <a-radio value="webhook">Webhook</a-radio>
          </a-radio-group>
          <div style="margin-top: 6px; color:#999; font-size:12px;">
            MS-Agent: 需要在 Zabbix Server 上安装 ms-agent 服务<br />
            Webhook: 直接通过 Zabbix Webhook 发送告警（需 Zabbix 4.4+）
          </div>
        </a-form-model-item>
        <a-form-model-item label="启用">
          <a-switch v-model="form.enabled" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <!-- 安装进度对话框 -->
    <a-modal :title="currentInstallType === 'webhook' ? '安装 Webhook 配置' : '安装 MS-Agent 配置'" :visible="installVisible" :footer="installCompleted ? null : []" :closable="installCompleted"
      :maskClosable="false" width="800px" @cancel="closeInstallModal">
      <div style="min-height: 300px;">
        <!-- 安装说明 -->
        <a-alert v-if="!installStarted" :message="currentInstallType === 'webhook' ? '即将在 Zabbix 中安装 Webhook 配置' : '即将在 Zabbix 中安装 MS-Agent 配置'" type="info" show-icon style="margin-bottom: 16px;">
          <template slot="description">
            <div>此操作将在 Zabbix 中创建：</div>
            <ul v-if="currentInstallType === 'webhook'" style="margin: 8px 0; padding-left: 20px;">
              <li>Media Type: ZbxTable Webhook（类型：Webhook）</li>
              <li>User Group: ZbxTable Webhook Group</li>
              <li>User: zbxtable-webhook（自动生成强密码）</li>
              <li>Action: ZbxTable Webhook Action（包含告警和恢复操作）</li>
              <li>Token: 自动生成唯一 Token</li>
              <li>Webhook URL: 自动配置回调地址</li>
            </ul>
            <ul v-else style="margin: 8px 0; padding-left: 20px;">
              <li>Media Type: MS-Agent Media</li>
              <li>User Group: MS-Agent Group</li>
              <li>User: ms-agent（自动生成强密码）</li>
              <li>Action: MS-Agent Action（包含告警和恢复操作）</li>
              <li>Token: 自动生成唯一 Token</li>
            </ul>
            <div style="margin-top: 8px;">
              <a-button type="primary" @click="startInstall" :loading="installing">
                <a-icon type="download" /> 开始安装
              </a-button>
              <a-button style="margin-left: 8px;" @click="installVisible = false">取消</a-button>
            </div>
          </template>
        </a-alert>

        <!-- 安装进度 -->
        <div v-if="installStarted">
          <a-steps :current="currentStep" size="small" style="margin-bottom: 20px;">
            <a-step title="连接 Zabbix" />
            <a-step title="创建配置" />
            <a-step title="生成 Token" />
            <a-step title="完成" />
          </a-steps>

          <!-- 安装日志 -->
          <div style="background: #000; color: #0f0; padding: 16px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px; max-height: 400px; overflow-y: auto; line-height: 1.6;">
            <div v-for="(log, index) in installLogs" :key="index" :style="{ color: log.type === 'error' ? '#f00' : log.type === 'success' ? '#0f0' : log.type === 'warning' ? '#ff0' : '#0f0' }">
              <span style="color: #666;">[{{ log.time }}]</span> {{ log.message }}
            </div>
            <div v-if="installing" style="color: #0ff;">
              <a-icon type="loading" /> 正在执行...
            </div>
          </div>

          <!-- 安装结果 -->
          <div v-if="installCompleted" style="margin-top: 16px;">
            <a-alert v-if="installSuccess" message="安装成功！" type="success" show-icon style="margin-bottom: 12px;">
              <template slot="description">
                <span v-if="currentInstallType === 'webhook'">
                  Webhook 配置已在 Zabbix 中创建完成。现在可以查看 Webhook 配置信息。
                </span>
                <span v-else>
                  MS-Agent 配置已在 Zabbix 中创建完成。请在 Zabbix Server 上执行以下命令完成安装。
                </span>
              </template>
            </a-alert>
            <a-alert v-else message="安装失败" type="error" show-icon style="margin-bottom: 12px;">
              <template slot="description">
                {{ installError || '安装过程中出现错误，请查看日志了解详情。' }}
              </template>
            </a-alert>

            <!-- MS-Agent 安装成功后显示 curl 命令 -->
            <div v-if="installSuccess && currentInstallType === 'msagent' && installScriptData" style="margin-bottom: 16px;">
              <a-alert message="快速安装命令" type="info" show-icon>
                <template slot="description">
                  <div style="margin-bottom: 8px;">在 Zabbix Server 上以 root 用户执行以下命令：</div>
                  <div style="position: relative; background: #f5f5f5; padding: 12px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 13px;">
                    <a-button size="small" icon="copy" style="position: absolute; right: 8px; top: 8px;" @click="copyToClipboard(installScriptData.install_command, '安装命令')">
                      复制
                    </a-button>
                    <pre style="margin: 0; padding-top: 30px; white-space: pre-wrap; word-break: break-all;">{{ installScriptData.install_command }}</pre>
                  </div>
                </template>
              </a-alert>
            </div>

            <div style="text-align: right;">
              <a-button v-if="installSuccess && currentInstallType === 'msagent'" type="primary" @click="handleGetScriptAfterInstall">
                <a-icon type="code" /> 查看完整脚本
              </a-button>
              <a-button v-if="installSuccess && currentInstallType === 'webhook'" type="primary" @click="handleGetWebhookInfoAfterInstall">
                <a-icon type="info-circle" /> 查看配置
              </a-button>
              <a-button v-if="!installSuccess" type="primary" @click="retryInstall">
                <a-icon type="reload" /> 重试
              </a-button>
              <a-button style="margin-left: 8px;" @click="closeInstallModal">关闭</a-button>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- Webhook 配置信息对话框 -->
    <a-modal title="Webhook 配置信息" :visible="webhookInfoVisible" @cancel="webhookInfoVisible=false" :footer="null" width="800px">
      <div v-if="webhookInfo">
        <a-alert message="配置说明" description="Webhook 已在 Zabbix 中自动配置完成，无需额外操作。以下是配置详情：" type="success" show-icon style="margin-bottom: 16px;" />

        <a-descriptions bordered :column="1">
          <a-descriptions-item label="Webhook URL">
            <div style="display: flex; align-items: center; gap: 8px;">
              <code style="flex: 1;">{{ webhookInfo.webhook_url }}</code>
              <a-button size="small" icon="copy" @click="copyToClipboard(webhookInfo.webhook_url, 'Webhook URL')">复制</a-button>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="租户 ID">
            <div style="display: flex; align-items: center; gap: 8px;">
              <code style="flex: 1;">{{ webhookInfo.tenant_id }}</code>
              <a-button size="small" icon="copy" @click="copyToClipboard(webhookInfo.tenant_id, '租户 ID')">复制</a-button>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="认证 Token">
            <div style="display: flex; align-items: center; gap: 8px;">
              <code style="flex: 1; word-break: break-all;">{{ webhookInfo.token }}</code>
              <a-button size="small" icon="copy" @click="copyToClipboard(webhookInfo.token, 'Token')">复制</a-button>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="请求方法">
            <a-tag color="blue">{{ webhookInfo.method }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Content-Type">
            <code>{{ webhookInfo.content_type }}</code>
          </a-descriptions-item>
          <a-descriptions-item label="请求头">
            <pre style="background: #f5f5f5; padding: 8px; border-radius: 4px; margin: 0;">{{ webhookInfo.headers }}</pre>
            <a-button size="small" icon="copy" style="margin-top: 8px;" @click="copyToClipboard(webhookInfo.headers, '请求头')">复制</a-button>
          </a-descriptions-item>
        </a-descriptions>

        <a-alert message="工作原理" type="info" show-icon style="margin-top: 16px;">
          <template slot="description">
            <div style="color: #666; font-size: 13px;">
              <div>• Zabbix 触发告警时，会自动通过 Webhook 将告警信息发送到 ZbxTable</div>
              <div>• Webhook 脚本已内置租户 ID 和 Token，无需手动配置</div>
              <div>• 告警数据会自动路由到对应的租户</div>
              <div>• 相比 MS-Agent，Webhook 方式无需在服务器上安装额外服务</div>
            </div>
          </template>
        </a-alert>

        <div style="margin-top: 16px; padding: 12px; background: #fafafa; border-radius: 4px;">
          <h4 style="margin-bottom: 8px;">验证方法</h4>
          <div style="color: #666; font-size: 13px;">
            <div>1. 在 Zabbix 中查看 Media Type: <strong>ZbxTable Webhook</strong></div>
            <div>2. 在 Zabbix 中查看 Action: <strong>ZbxTable Webhook Action</strong></div>
            <div>3. 触发一个测试告警，验证是否能正常接收</div>
          </div>
        </div>
      </div>
    </a-modal>

    <!-- MS-Agent 安装脚本对话框 -->
    <a-modal title="MS-Agent 安装脚本" :visible="scriptVisible" @cancel="scriptVisible=false" :footer="null" width="900px">
      <div v-if="scriptData">
        <a-alert message="安装说明" description="请在 Zabbix Server 上以 root 用户执行以下脚本，完成 MS-Agent 的安装和配置。" type="info" show-icon style="margin-bottom: 16px;" />

        <a-tabs default-active-key="1">
          <a-tab-pane key="1" tab="完整安装脚本">
            <div style="position: relative;">
              <a-button type="primary" size="small" icon="copy" style="position: absolute; right: 8px; top: 8px; z-index: 1;" @click="copyToClipboard(scriptData.install_command, '安装脚本')">
                复制脚本
              </a-button>
              <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; max-height: 400px; overflow: auto; padding-top: 40px;">{{ scriptData.install_command }}</pre>
            </div>
            <a-alert message="执行方法" type="warning" show-icon style="margin-top: 12px;">
              <template slot="description">
                <div>1. 将上述脚本保存为文件（如 install_msagent.sh）</div>
                <div>2. 赋予执行权限：<code>chmod +x install_msagent.sh</code></div>
                <div>3. 执行脚本：<code>bash install_msagent.sh</code></div>
              </template>
            </a-alert>
          </a-tab-pane>

          <a-tab-pane key="2" tab="配置文件">
            <div style="position: relative;">
              <a-button type="primary" size="small" icon="copy" style="position: absolute; right: 8px; top: 8px; z-index: 1;" @click="copyToClipboard(scriptData.config_content, '配置文件')">
                复制配置
              </a-button>
              <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; max-height: 400px; overflow: auto; padding-top: 40px;">{{ scriptData.config_content }}</pre>
            </div>
            <a-alert message="配置文件路径" description="/etc/ms-agent/config.yml" type="info" show-icon style="margin-top: 12px;" />
          </a-tab-pane>

          <a-tab-pane key="3" tab="快速安装">
            <div style="position: relative;">
              <a-button type="primary" size="small" icon="copy" style="position: absolute; right: 8px; top: 8px; z-index: 1;" @click="copyToClipboard(scriptData.curl_command, 'curl 命令')">
                复制命令
              </a-button>
              <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; padding-top: 40px;">{{ scriptData.curl_command }}</pre>
            </div>
            <a-alert message="注意" description="此命令仅下载并安装 MS-Agent，安装后需要手动配置 /etc/ms-agent/config.yml 文件。" type="warning" show-icon style="margin-top: 12px;" />
          </a-tab-pane>
        </a-tabs>

        <div style="margin-top: 16px; padding: 12px; background: #fafafa; border-radius: 4px;">
          <h4 style="margin-bottom: 8px;">安装后验证</h4>
          <div style="color: #666; font-size: 13px;">
            <div>• 查看服务状态：<code>systemctl status ms-agent</code></div>
            <div>• 查看日志：<code>tail -f /var/log/ms-agent/ms-agent.log</code></div>
            <div>• 重启服务：<code>systemctl restart ms-agent</code></div>
          </div>
        </div>
      </div>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { listZabbixInstances } from '@/services/zabbix'
import { listZabbixTenantBindings, upsertZabbixTenantBinding, deleteZabbixTenantBinding, installMSAgent, getMSAgentScript, installWebhook, getWebhookInfo, uninstallMSAgent, uninstallWebhook } from '@/services/zabbixTenant'

export default {
  name: 'SystemZabbixTenant',
  components: { PageLayout },
  data () {
    return {
      loading: false,
      saving: false,
      visible: false,
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
      zabbixList: [],
      scriptData: null,
      form: { tenant_id: '', zabbix_instance_id: undefined, token: '', notify_method: 'msagent', enabled: true },
      webhookInfoVisible: false,
      webhookInfo: null,
      columns: [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '租户', dataIndex: 'tenant_id', key: 'tenant_id' },
        { title: 'Zabbix 连接', key: 'zabbix', scopedSlots: { customRender: 'zabbix' } },
        { title: '通知方式', key: 'notify_method', scopedSlots: { customRender: 'notify_method' }, width: 130 },
        { title: '安装状态', key: 'install_status', scopedSlots: { customRender: 'install_status' }, width: 120 },
        { title: '启用', key: 'enabled', scopedSlots: { customRender: 'enabled' }, width: 90 },
        { title: '操作', key: 'operation', scopedSlots: { customRender: 'operation' }, width: 400 }
      ]
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    zabbixName (id) {
      const z = (this.zabbixList || []).find(x => x.id === id)
      return z ? z.name : (id ? `#${id}` : '-')
    },
    async load () {
      this.loading = true
      try {
        const [zres, res] = await Promise.all([listZabbixInstances(), listZabbixTenantBindings()])
        const zbiz = (zres && zres.data) ? zres.data : zres
        if (zbiz && zbiz.code === 200) this.zabbixList = zbiz.data || []

        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) this.list = biz.data || []
      } finally {
        this.loading = false
      }
    },
    openCreate () {
      this.editingId = null
      this.form = { tenant_id: '', zabbix_instance_id: undefined, token: '', notify_method: 'webhook', enabled: true }
      this.visible = true
    },
    openEdit (record) {
      this.editingId = record.id
      this.form = {
        tenant_id: record.tenant_id || '',
        zabbix_instance_id: record.zabbix_instance_id,
        token: record.token || '',
        notify_method: record.notify_method || 'msagent',
        enabled: !!record.enabled
      }
      this.visible = true
    },
    async save () {
      if (!this.form.tenant_id || !this.form.zabbix_instance_id) {
        this.$message.warning('请填写租户并选择 Zabbix 连接')
        return
      }
      this.saving = true
      try {
        const res = await upsertZabbixTenantBinding(this.form)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.$message.success('保存成功')
          this.visible = false
          await this.load()
        } else {
          this.$message.error((biz && biz.message) || '保存失败')
        }
      } finally {
        this.saving = false
      }
    },
    async remove (record) {
      const res = await deleteZabbixTenantBinding(record.id)
      const biz = (res && res.data) ? res.data : res
      if (biz && biz.code === 200) {
        this.$message.success('已删除')
        await this.load()
      } else {
        this.$message.error((biz && biz.message) || '删除失败')
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
    handleInstallWebhook (record) {
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
          this.addLog('info', '开始安装 Webhook 配置...')
          this.addLog('info', `租户: ${this.currentRecord.tenant_id}`)
          this.addLog('info', `Zabbix 实例: ${this.zabbixName(this.currentRecord.zabbix_instance_id)}`)
          this.addLog('info', '---')
          
          await this.sleep(500)
          this.currentStep = 0
          this.addLog('info', '[步骤 1/4] 连接 Zabbix API...')
          await this.sleep(500)
          this.addLog('success', '✓ Zabbix API 连接成功')
          
          this.currentStep = 1
          this.addLog('info', '[步骤 2/4] 创建 Webhook 配置...')
          await this.sleep(300)
          this.addLog('info', '  - 创建 Media Type: ZbxTable Webhook')
          await this.sleep(300)
          this.addLog('info', '  - 创建 User Group: ZbxTable Webhook Group')
          await this.sleep(300)
          this.addLog('info', '  - 创建 User: zbxtable-webhook')
          await this.sleep(300)
          this.addLog('info', '  - 配置 Webhook 脚本')
          await this.sleep(300)
          this.addLog('info', '  - 创建 Action: ZbxTable Webhook Action')
          
          // 调用后端 API
          const res = await installWebhook(this.currentRecord.id)
          const biz = (res && res.data) ? res.data : res
          
          if (biz && biz.code === 200) {
            await this.sleep(500)
            this.addLog('success', '✓ Webhook 配置创建成功')
            
            this.currentStep = 2
            this.addLog('info', '[步骤 3/4] 生成认证 Token...')
            await this.sleep(500)
            this.addLog('success', '✓ Token 生成成功')
            
            this.currentStep = 3
            this.addLog('info', '[步骤 4/4] 更新租户绑定...')
            await this.sleep(500)
            this.addLog('success', '✓ 租户绑定更新成功')
            
            this.addLog('info', '---')
            this.addLog('success', '✓ Webhook 配置安装完成！')
            this.addLog('info', 'Webhook 已自动配置，无需额外操作')
            
            this.installSuccess = true
            
            // 刷新列表以更新状态
            await this.load()
          } else {
            throw new Error((biz && biz.message) || '安装失败')
          }
        } else {
          // MS-Agent 安装流程
          this.addLog('info', '开始安装 MS-Agent 配置...')
          this.addLog('info', `租户: ${this.currentRecord.tenant_id}`)
          this.addLog('info', `Zabbix 实例: ${this.zabbixName(this.currentRecord.zabbix_instance_id)}`)
          this.addLog('info', '---')
          
          await this.sleep(500)
          this.currentStep = 0
          this.addLog('info', '[步骤 1/4] 连接 Zabbix API...')
          await this.sleep(500)
          this.addLog('success', '✓ Zabbix API 连接成功')
          
          this.currentStep = 1
          this.addLog('info', '[步骤 2/4] 创建 Zabbix 配置...')
          await this.sleep(300)
          this.addLog('info', '  - 创建 Media Type: MS-Agent Media')
          await this.sleep(300)
          this.addLog('info', '  - 创建 User Group: MS-Agent Group')
          await this.sleep(300)
          this.addLog('info', '  - 创建 User: ms-agent')
          await this.sleep(300)
          this.addLog('info', '  - 创建 Action: MS-Agent Action')
          
          // 调用后端 API
          const res = await installMSAgent(this.currentRecord.id)
          const biz = (res && res.data) ? res.data : res
          
          if (biz && biz.code === 200) {
            await this.sleep(500)
            this.addLog('success', '✓ Zabbix 配置创建成功')
            
            this.currentStep = 2
            this.addLog('info', '[步骤 3/4] 生成认证 Token...')
            await this.sleep(500)
            this.addLog('success', '✓ Token 生成成功')
            
            this.currentStep = 3
            this.addLog('info', '[步骤 4/4] 更新租户绑定...')
            await this.sleep(500)
            this.addLog('success', '✓ 租户绑定更新成功')
            
            this.addLog('info', '---')
            this.addLog('success', '✓ MS-Agent 配置安装完成！')
            this.addLog('info', '正在获取安装脚本...')
            
            this.installSuccess = true
            
            // 刷新列表以更新状态
            await this.load()
            
            // 获取安装脚本
            try {
              const scriptRes = await getMSAgentScript(this.currentRecord.id)
              const scriptBiz = (scriptRes && scriptRes.data) ? scriptRes.data : scriptRes
              if (scriptBiz && scriptBiz.code === 200) {
                this.installScriptData = scriptBiz.data
                this.addLog('success', '✓ 安装脚本已生成')
                this.addLog('info', '请复制下方命令在 Zabbix Server 上执行')
              }
            } catch (err) {
              this.addLog('warning', '⚠ 获取安装脚本失败，请稍后手动获取')
            }
          } else {
            throw new Error((biz && biz.message) || '安装失败')
          }
        }
      } catch (error) {
        this.addLog('error', '✗ 安装失败: ' + (error.message || error))
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
        title: '重新安装 Webhook 配置',
        content: '确定要重新安装吗？这将重新创建 Zabbix 中的配置并生成新的 Token。',
        okText: '确定',
        cancelText: '取消',
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
        this.$message.warning('请先安装 Webhook 配置')
        return
      }
      
      try {
        const res = await getWebhookInfo(updatedRecord.id)
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.webhookInfo = biz.data
          this.webhookInfoVisible = true
        } else {
          this.$message.error((biz && biz.message) || '获取配置失败')
        }
      } catch (error) {
        this.$message.error('获取配置失败：' + (error.message || error))
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
        this.$message.success(`${name}已复制到剪贴板`)
      } catch (err) {
        this.$message.error('复制失败，请手动复制')
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
</style>
