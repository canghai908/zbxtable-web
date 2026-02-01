<template>
  <page-layout>
    <div slot="headerContent">
      <div class="header-section">
        
        <div class="header-actions">
          <a-button type="primary" @click="showCreateDialog">新建映射配置</a-button>
        </div>
      </div>
    </div>

    <a-table :loading="loading" :columns="columns" :data-source="mappings" :pagination="false" :rowKey="record => record.id">
      <span slot="zid" slot-scope="text, record">
        <a-tag color="blue">{{ getInstanceName(text) }}</a-tag>
      </span>
      <span slot="system_type" slot-scope="text">
        <a-tag :color="getSystemTypeColor(text)">{{ getSystemTypeName(text) }}</a-tag>
      </span>
      <span slot="auto_init" slot-scope="text">
        <a-tag :color="text === 1 ? 'green' : 'default'">{{ text === 1 ? '启用' : '禁用' }}</a-tag>
      </span>
      <span slot="status" slot-scope="text">
        <a-tag :color="getStatusColor(text)">{{ getStatusName(text) }}</a-tag>
      </span>
      <span slot="last_success_at" slot-scope="text">
        {{ text ? formatTime(text) : '-' }}
      </span>
      <span slot="operation" slot-scope="text, record">
        <a-button size="small" type="primary" @click="executeMapping(record)">立即执行</a-button>
        <a-divider type="vertical" />
        <a-button size="small" @click="showEditDialog(record)">编辑</a-button>
        <a-divider type="vertical" />
        <a-button size="small" type="link" @click="showHistory(record)">历史</a-button>
        <a-divider type="vertical" />
        <a-button size="small" type="danger" @click="deleteMapping(record)">删除</a-button>
      </span>
    </a-table>

    <a-modal :title="dialogTitle" :visible="dialogVisible" width="900px" @ok="submitForm" @cancel="handleCancel">
      <a-form-model ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-model-item label="实例" prop="zid">
          <a-select v-model="form.zid" placeholder="请选择实例" @change="handleInstanceChange">
            <a-select-option v-for="instance in instances" :key="instance.id" :value="instance.id">
              {{ instance.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item label="系统类型" prop="system_type">
          <a-select v-model="form.system_type" placeholder="请选择系统类型" @change="handleSystemTypeChange">
            <a-select-option value="linux">Linux</a-select-option>
            <a-select-option value="windows">Windows</a-select-option>
            <a-select-option value="network">网络设备</a-select-option>
            <a-select-option value="server">服务器</a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item label="主机组" prop="host_group_ids">
          <a-select v-model="selectedGroups" mode="multiple" placeholder="请选择主机组" @change="updateGroupIds">
            <a-select-option v-for="group in hostGroups" :key="group.groupid" :value="group.groupid">
              {{ group.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-divider orientation="left">指标配置</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="运行时间" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" placeholder="选择模板" @change="val => handleTemplateChange(val, 'uptime')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="监控项" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.uptime" placeholder="选择监控项" @change="val => handleItemChange(val, 'uptime')">
                <a-select-option v-for="item in itemLists.uptime" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16" v-if="form.system_type === 'linux' || form.system_type === 'windows'">
          <a-col :span="12">
            <a-form-model-item label="CPU核心数" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" placeholder="选择模板" @change="val => handleTemplateChange(val, 'cpu_core')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="监控项" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.cpu_core" placeholder="选择监控项" @change="val => handleItemChange(val, 'cpu_core')">
                <a-select-option v-for="item in itemLists.cpu_core" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="CPU使用率" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" placeholder="选择模板" @change="val => handleTemplateChange(val, 'cpu_utilization')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="监控项" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.cpu_utilization" placeholder="选择监控项" @change="val => handleItemChange(val, 'cpu_utilization')">
                <a-select-option v-for="item in itemLists.cpu_utilization" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="内存使用率" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" placeholder="选择模板" @change="val => handleTemplateChange(val, 'memory_utilization')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="监控项" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.memory_utilization" placeholder="选择监控项" @change="val => handleItemChange(val, 'memory_utilization')">
                <a-select-option v-for="item in itemLists.memory_utilization" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="内存总量" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" placeholder="选择模板" @change="val => handleTemplateChange(val, 'memory_total')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="监控项" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.memory_total" placeholder="选择监控项" @change="val => handleItemChange(val, 'memory_total')">
                <a-select-option v-for="item in itemLists.memory_total" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item label="内存已用" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" placeholder="选择模板" @change="val => handleTemplateChange(val, 'memory_used')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="监控项" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.memory_used" placeholder="选择监控项" @change="val => handleItemChange(val, 'memory_used')">
                <a-select-option v-for="item in itemLists.memory_used" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16" v-if="form.system_type === 'network' || form.system_type === 'server'">
          <a-col :span="12">
            <a-form-model-item label="设备型号" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" placeholder="选择模板" @change="val => handleTemplateChange(val, 'model')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="监控项" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.model" placeholder="选择监控项" @change="val => handleItemChange(val, 'model')">
                <a-select-option v-for="item in itemLists.model" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-form-model-item label="ICMP模板">
          <a-select v-model="metricConfig.ping_template_id" show-search option-filter-prop="label" placeholder="选择ICMP Ping模板">
            <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
              {{ tpl.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-divider orientation="left">自动化配置</a-divider>

        <a-form-model-item label="启用自动初始化">
          <a-switch v-model="autoInitSwitch" @change="updateAutoInit" />
        </a-form-model-item>

        <a-form-model-item label="Cron表达式" v-if="autoInitSwitch">
          <a-input v-model="form.init_cron" placeholder="例如: 0 0 2 * * * (每天凌晨2点)" />
          <span class="form-tip">格式：秒 分 时 日 月 周</span>
        </a-form-model-item>

        <a-form-model-item label="新主机自动初始化" v-if="autoInitSwitch">
          <a-switch v-model="initOnNewHostSwitch" @change="updateInitOnNewHost" />
        </a-form-model-item>

        <a-form-model-item label="最大重试次数">
          <a-input-number v-model="form.max_retry" :min="0" :max="10" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal title="执行历史" :visible="historyDialogVisible" width="1000px" @cancel="historyDialogVisible = false" :footer="null">
      <a-table :loading="historyLoading" :columns="historyColumns" :data-source="historyList" :pagination="historyPagination" @change="handleHistoryPageChange" :rowKey="record => record.id">
        <span slot="exec_type" slot-scope="text">
          <a-tag :color="getExecTypeColor(text)">{{ getExecTypeName(text) }}</a-tag>
        </span>
        <span slot="start_time" slot-scope="text">
          {{ formatTime(text) }}
        </span>
        <span slot="status" slot-scope="text">
          <a-tag :color="getHistoryStatusColor(text)">{{ text }}</a-tag>
        </span>
      </a-table>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { listZabbixInstance } from '@/services/zabbix'
import { 
  hostgroupList, 
  templateList, 
  templateGetItemList,
  metricMappingList,
  metricMappingGet,
  metricMappingCreate,
  metricMappingUpdate,
  metricMappingDelete,
  metricMappingExecute,
  metricMappingHistory
} from '@/services/admin'

export default {
  name: 'MetricMapping',
  components: { PageLayout },
  data() {
    return {
      loading: false,
      mappings: [],
      instances: [],
      hostGroups: [],
      templateList: [],
      itemLists: {
        uptime: [],
        cpu_core: [],
        cpu_utilization: [],
        memory_utilization: [],
        memory_total: [],
        memory_used: [],
        model: []
      },
      selectedItems: {
        uptime: '',
        cpu_core: '',
        cpu_utilization: '',
        memory_utilization: '',
        memory_total: '',
        memory_used: '',
        model: ''
      },
      columns: [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '实例名称', dataIndex: 'zid', width: 200, scopedSlots: { customRender: 'zid' } },
        { title: '系统类型', dataIndex: 'system_type', width: 120, scopedSlots: { customRender: 'system_type' } },
        { title: '自动初始化', dataIndex: 'auto_init', width: 120, scopedSlots: { customRender: 'auto_init' } },
        { title: '状态', dataIndex: 'status', width: 120, scopedSlots: { customRender: 'status' } },
        { title: '最后成功时间', dataIndex: 'last_success_at', width: 180, scopedSlots: { customRender: 'last_success_at' } },
        { title: '操作', key: 'operation', width: 300, fixed: 'right', scopedSlots: { customRender: 'operation' } }
      ],
      dialogVisible: false,
      dialogTitle: '新建映射配置',
      form: {
        id: '',
        zid: '',
        system_type: '',
        host_group_ids: '',
        metric_config: '',
        auto_init: 0,
        init_cron: '0 0 2 * * *',
        init_on_new_host: 0,
        max_retry: 3
      },
      metricConfig: {
        host_type: '',
        metrics: {
          uptime: '',
          cpu_core: '',
          cpu_utilization: '',
          memory_utilization: '',
          memory_total: '',
          memory_used: '',
          model: ''
        },
        ping_template_id: ''
      },
      selectedGroups: [],
      autoInitSwitch: false,
      initOnNewHostSwitch: false,
      rules: {
        zid: [{ required: true, message: '请选择实例', trigger: 'change' }],
        system_type: [{ required: true, message: '请选择系统类型', trigger: 'change' }]
      },
      historyDialogVisible: false,
      historyLoading: false,
      historyList: [],
      currentMappingId: 0,
      historyColumns: [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '执行类型', dataIndex: 'exec_type', width: 100, scopedSlots: { customRender: 'exec_type' } },
        { title: '开始时间', dataIndex: 'start_time', width: 180, scopedSlots: { customRender: 'start_time' } },
        { title: '耗时(秒)', dataIndex: 'duration', width: 100 },
        { title: '状态', dataIndex: 'status', width: 100, scopedSlots: { customRender: 'status' } },
        { title: '影响主机数', dataIndex: 'affected_hosts', width: 120 },
        { title: '错误信息', dataIndex: 'error_message', ellipsis: true }
      ],
      historyPagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        showTotal: total => `共 ${total} 条数据`,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100']
      }
    }
  },
  created() {
    this.fetchInstances()
    this.fetchMappings()
  },
  methods: {
    fetchInstances() {
      listZabbixInstance().then(resp => {
        const res = resp.data
        if (res.code === 200) {
          console.log(res.data)
          this.instances = res.data || []
        }
      }).catch(err => {
        console.error('获取实例列表失败:', err)
      })
    },
    fetchMappings() {
      this.loading = true
      metricMappingList({}).then(resp => {
        const res = resp.data
        if (res.code === 200) {
          this.mappings = res.data.items || []
        } else {
          this.$message.error(res.message || '获取映射配置失败')
        }
      }).catch(err => {
        this.$message.error('获取映射配置失败')
        console.error(err)
      }).finally(() => {
        this.loading = false
      })
    },
    handleInstanceChange(zid) {
      if (!zid) return
      this.templateList = []
      this.hostGroups = []
      hostgroupList(zid).then(resp => {
        if (resp.data.code === 200) {
          this.hostGroups = resp.data.data.items || []
        }
      }).catch(err => {
        console.error('获取主机组列表失败:', err)
        this.$message.error('获取主机组列表失败')
      })
      templateList(zid).then(resp => {
        if (resp.data.code === 200) {
          // 后端返回格式：{code: 200, message: "ok", data: [...]}
          this.templateList = resp.data.data || []
        }
      }).catch(err => {
        console.error('获取模板列表失败:', err)
        this.$message.error('获取模板列表失败')
      })
    },
    handleSystemTypeChange(type) {
      const typeMap = {
        linux: 'VM_LIN',
        windows: 'VM_WIN',
        network: 'HW_NET',
        server: 'HW_SRV'
      }
      this.metricConfig.host_type = typeMap[type] || ''
    },
    handleTemplateChange(templateId, metricType) {
      if (!this.form.zid) {
        this.$message.warning('请先选择实例')
        return
      }
      templateGetItemList(templateId, this.form.zid).then(resp => {
        if (resp.data.code === 200) {
          // 后端返回格式：{code: 200, message: "ok", data: {items: [{items: [...]}]}}
          const items = resp.data.data || []
          if (items.length > 0 && items[0].items) {
            this.itemLists[metricType] = items[0].items
          } else {
            this.itemLists[metricType] = []
          }
        }
      }).catch(err => {
        console.error('获取监控项列表失败:', err)
        this.$message.error('获取监控项列表失败')
      })
    },
    handleItemChange(itemId, metricType) {
      this.metricConfig.metrics[metricType] = itemId
    },
    showCreateDialog() {
      this.resetForm()
      this.dialogTitle = '新建映射配置'
      this.dialogVisible = true
    },
    showEditDialog(row) {
      metricMappingGet(row.id).then(resp => {
        const res = resp.data
        if (res.code === 200) {
          const data = res.data
          Object.assign(this.form, data)
          if (data.metric_config) {
            try {
              const config = JSON.parse(data.metric_config)
              Object.assign(this.metricConfig, config)
              Object.keys(this.metricConfig.metrics).forEach(key => {
                if (this.metricConfig.metrics[key]) {
                  // 单选，直接赋值
                  this.selectedItems[key] = this.metricConfig.metrics[key]
                }
              })
            } catch (e) {
              console.error('解析配置失败:', e)
            }
          }
          if (data.host_group_ids) {
            this.selectedGroups = data.host_group_ids.split(',')
          }
          this.autoInitSwitch = data.auto_init === 1
          this.initOnNewHostSwitch = data.init_on_new_host === 1
          this.handleInstanceChange(data.zid)
          this.dialogTitle = '编辑映射配置'
          this.dialogVisible = true
        } else {
          this.$message.error(res.message || '获取配置详情失败')
        }
      }).catch(err => {
        this.$message.error('获取配置详情失败')
        console.error(err)
      })
    },
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return false
        
        this.form.metric_config = JSON.stringify(this.metricConfig)
        const apiCall = this.form.id ? metricMappingUpdate(this.form.id, this.form) : metricMappingCreate(this.form)
        apiCall.then(resp => {
          const res = resp.data
          if (res.code === 200) {
            this.$message.success('保存成功')
            this.dialogVisible = false
            this.fetchMappings()
          } else {
            this.$message.error(res.message || '保存失败')
          }
        }).catch(err => {
          this.$message.error('保存失败')
          console.error(err)
        })
      })
    },
    handleCancel() {
      this.dialogVisible = false
      this.resetForm()
    },
    resetForm() {
      this.form = {
        id: '',
        zid: '',
        system_type: '',
        host_group_ids: '',
        metric_config: '',
        auto_init: 0,
        init_cron: '0 0 2 * * *',
        init_on_new_host: 0,
        max_retry: 3
      }
      this.metricConfig = {
        host_type: '',
        metrics: {
          uptime: '',
          cpu_core: '',
          cpu_utilization: '',
          memory_utilization: '',
          memory_total: '',
          memory_used: '',
          model: ''
        },
        ping_template_id: ''
      }
      this.selectedItems = {
        uptime: '',
        cpu_core: '',
        cpu_utilization: '',
        memory_utilization: '',
        memory_total: '',
        memory_used: '',
        model: ''
      }
      this.selectedGroups = []
      this.autoInitSwitch = false
      this.initOnNewHostSwitch = false
      if (this.$refs.formRef) {
        this.$refs.formRef.clearValidate()
      }
    },
    updateGroupIds() {
      this.form.host_group_ids = this.selectedGroups.join(',')
    },
    updateAutoInit(val) {
      this.form.auto_init = val ? 1 : 0
    },
    updateInitOnNewHost(val) {
      this.form.init_on_new_host = val ? 1 : 0
    },
    executeMapping(row) {
      this.$confirm({
        title: '提示',
        content: '确定要立即执行此映射配置吗？',
        onOk: () => {
          metricMappingExecute(row.id).then(resp => {
            const res = resp.data
            if (res.code === 200) {
              this.$message.success(res.message || '执行任务已提交')
              this.fetchMappings()
            } else {
              this.$message.error(res.message || '执行失败')
            }
          }).catch(err => {
            this.$message.error('执行失败')
            console.error(err)
          })
        }
      })
    },
    deleteMapping(row) {
      this.$confirm({
        title: '提示',
        content: '确定要删除此映射配置吗？',
        onOk: () => {
          metricMappingDelete(row.id).then(resp => {
            const res = resp.data
            if (res.code === 200) {
              this.$message.success('删除成功')
              this.fetchMappings()
            } else {
              this.$message.error(res.message || '删除失败')
            }
          }).catch(err => {
            this.$message.error('删除失败')
            console.error(err)
          })
        }
      })
    },
    showHistory(row) {
      this.currentMappingId = row.id
      this.historyPagination.current = 1
      this.fetchHistory()
      this.historyDialogVisible = true
    },
    fetchHistory() {
      this.historyLoading = true
      const params = {
        mapping_id: this.currentMappingId,
        page: this.historyPagination.current,
        limit: this.historyPagination.pageSize
      }
      metricMappingHistory(params).then(resp => {
        const res = resp.data
        if (res.code === 200) {
          this.historyList = res.data.items || []
          this.historyPagination.total = res.data.total || 0
        } else {
          this.$message.error(res.message || '获取历史记录失败')
        }
      }).catch(err => {
        this.$message.error('获取历史记录失败')
        console.error(err)
      }).finally(() => {
        this.historyLoading = false
      })
    },
    handleHistoryPageChange(pagination) {
      this.historyPagination.current = pagination.current
      this.historyPagination.pageSize = pagination.pageSize
      this.fetchHistory()
    },
    getSystemTypeName(type) {
      const map = { linux: 'Linux', windows: 'Windows', network: '网络设备', server: '服务器' }
      return map[type] || type
    },
    getInstanceName(zid) {
      const instance = this.instances.find(i => i.id === zid)
      return instance ? instance.name : `实例 ${zid}`
    },
    getSystemTypeColor(type) {
      const map = { linux: 'green', windows: 'blue', network: 'orange', server: 'purple' }
      return map[type] || 'default'
    },
    getStatusName(status) {
      const map = { 0: '未初始化', 1: '已初始化', 2: '初始化失败' }
      return map[status] || '未知'
    },
    getStatusColor(status) {
      const map = { 0: 'default', 1: 'green', 2: 'red' }
      return map[status] || 'default'
    },
    getExecTypeName(type) {
      const map = { manual: '手动', auto: '自动', retry: '重试' }
      return map[type] || type
    },
    getExecTypeColor(type) {
      const map = { manual: 'blue', auto: 'green', retry: 'orange' }
      return map[type] || 'default'
    },
    getHistoryStatusColor(status) {
      const map = { success: 'green', failed: 'red', running: 'orange' }
      return map[status] || 'default'
    },
    formatTime(time) {
      if (!time) return '-'
      return new Date(time).toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.header-section h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
.header-actions {
  display: flex;
  align-items: center;
}
.form-tip {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}
</style>
