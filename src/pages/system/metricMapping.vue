<template>
  <page-layout>
    <div slot="headerContent">
      <div class="header-section">

        <div class="header-actions">
          <a-button type="primary" @click="showCreateDialog">{{ $t('create_mapping') }}</a-button>
        </div>
      </div>
    </div>

    <a-table :loading="loading" :columns="columns" :data-source="mappings" :pagination="false" :rowKey="record => record.id">
      <span slot="zid" slot-scope="text">
        <a-tag :color="$themeColor">{{ getInstanceName(text) }}</a-tag>
      </span>
      <span slot="system_type" slot-scope="text">
        <a-tag :color="getSystemTypeColor(text)">{{ getSystemTypeName(text) }}</a-tag>
      </span>
      <span slot="auto_init" slot-scope="text">
        <a-tag :color="text === 1 ? 'green' : 'default'">{{ text === 1 ? $t('auto_init_enabled') : $t('auto_init_disabled') }}</a-tag>
      </span>
      <span slot="status" slot-scope="text">
        <a-tag :color="getStatusColor(text)">{{ getStatusName(text) }}</a-tag>
      </span>
      <span slot="last_success_at" slot-scope="text">
        {{ text ? formatTime(text) : '-' }}
      </span>
      <span slot="operation" slot-scope="text, record">
        <a-button size="small" type="primary" @click="executeMapping(record)">{{ $t('btn_execute_now') }}</a-button>
        <a-divider type="vertical" />
        <a-button size="small" @click="showEditDialog(record)">{{ $t('btn_edit') }}</a-button>
        <a-divider type="vertical" />
        <a-button size="small" type="link" @click="showHistory(record)">{{ $t('btn_history') }}</a-button>
        <a-divider type="vertical" />
        <a-button size="small" type="danger" @click="deleteMapping(record)">{{ $t('btn_delete') }}</a-button>
      </span>
    </a-table>

    <a-modal :title="dialogTitle" :visible="dialogVisible" width="900px" @ok="submitForm" @cancel="handleCancel">
      <a-form-model ref="formRef" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-model-item :label="$t('form_instance')" prop="zid">
          <a-select v-model="form.zid" :placeholder="$t('placeholder_select_instance')" @change="handleInstanceChange">
            <a-select-option v-for="instance in instances" :key="instance.id" :value="instance.id">
              {{ instance.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item :label="$t('form_system_type')" prop="system_type">
          <a-select v-model="form.system_type" :placeholder="$t('placeholder_select_system_type')" @change="handleSystemTypeChange">
            <a-select-option value="linux">Linux</a-select-option>
            <a-select-option value="windows">Windows</a-select-option>
            <a-select-option value="network">{{ $t('system_type_network') }}</a-select-option>
            <a-select-option value="server">{{ $t('system_type_server') }}</a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item :label="$t('form_host_group')" prop="host_group_ids">
          <a-select v-model="selectedGroups" mode="multiple" :placeholder="$t('placeholder_select_host_group')" @change="updateGroupIds">
            <a-select-option v-for="group in hostGroups" :key="group.groupid" :value="group.groupid">
              {{ group.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-divider orientation="left">{{ $t('form_metric_config') }}</a-divider>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_uptime')" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" :placeholder="$t('placeholder_select_template')" @change="val => handleTemplateChange(val, 'uptime')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_item')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.uptime" :placeholder="$t('placeholder_select_item')" @change="val => handleItemChange(val, 'uptime')">
                <a-select-option v-for="item in itemLists.uptime" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16" v-if="form.system_type === 'linux' || form.system_type === 'windows'">
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_cpu_core')" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" :placeholder="$t('placeholder_select_template')" @change="val => handleTemplateChange(val, 'cpu_core')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_item')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.cpu_core" :placeholder="$t('placeholder_select_item')" @change="val => handleItemChange(val, 'cpu_core')">
                <a-select-option v-for="item in itemLists.cpu_core" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_cpu_utilization')" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" :placeholder="$t('placeholder_select_template')" @change="val => handleTemplateChange(val, 'cpu_utilization')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_item')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.cpu_utilization" :placeholder="$t('placeholder_select_item')" @change="val => handleItemChange(val, 'cpu_utilization')">
                <a-select-option v-for="item in itemLists.cpu_utilization" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_memory_utilization')" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" :placeholder="$t('placeholder_select_template')" @change="val => handleTemplateChange(val, 'memory_utilization')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_item')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.memory_utilization" :placeholder="$t('placeholder_select_item')" @change="val => handleItemChange(val, 'memory_utilization')">
                <a-select-option v-for="item in itemLists.memory_utilization" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_memory_total')" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" :placeholder="$t('placeholder_select_template')" @change="val => handleTemplateChange(val, 'memory_total')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_item')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.memory_total" :placeholder="$t('placeholder_select_item')" @change="val => handleItemChange(val, 'memory_total')">
                <a-select-option v-for="item in itemLists.memory_total" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_memory_used')" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" :placeholder="$t('placeholder_select_template')" @change="val => handleTemplateChange(val, 'memory_used')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_item')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.memory_used" :placeholder="$t('placeholder_select_item')" @change="val => handleItemChange(val, 'memory_used')">
                <a-select-option v-for="item in itemLists.memory_used" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row :gutter="16" v-if="form.system_type === 'network' || form.system_type === 'server'">
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_model')" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-select show-search option-filter-prop="label" :placeholder="$t('placeholder_select_template')" @change="val => handleTemplateChange(val, 'model')">
                <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
                  {{ tpl.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item :label="$t('metric_item')" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
              <a-select show-search option-filter-prop="label" v-model="selectedItems.model" :placeholder="$t('placeholder_select_item')" @change="val => handleItemChange(val, 'model')">
                <a-select-option v-for="item in itemLists.model" :key="item.itemid" :value="item.itemid" :label="item.name">
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-form-model-item :label="$t('form_icmp_template')">
          <a-select v-model="metricConfig.ping_template_id" show-search option-filter-prop="label" :placeholder="$t('placeholder_select_icmp_template')">
            <a-select-option v-for="tpl in templateList" :key="tpl.templateid" :value="tpl.templateid" :label="tpl.name">
              {{ tpl.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-divider orientation="left">{{ $t('form_automation_config') }}</a-divider>

        <a-form-model-item :label="$t('form_enable_auto_init')">
          <a-switch v-model="autoInitSwitch" @change="updateAutoInit" />
        </a-form-model-item>

        <a-form-model-item :label="$t('form_cron_expression')" v-if="autoInitSwitch">
          <a-input v-model="form.init_cron" :placeholder="$t('placeholder_cron_expression')" />
          <span class="form-tip">{{ $t('tip_cron_format') }}</span>
        </a-form-model-item>

        <a-form-model-item :label="$t('form_new_host_auto_init')" v-if="autoInitSwitch">
          <a-switch v-model="initOnNewHostSwitch" @change="updateInitOnNewHost" />
        </a-form-model-item>

        <a-form-model-item :label="$t('form_max_retry')">
          <a-input-number v-model="form.max_retry" :min="0" :max="10" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>

    <a-modal :title="$t('history_title')" :visible="historyDialogVisible" width="1000px" @cancel="historyDialogVisible = false" :footer="null">
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

const i18nMessages = require('./metricMapping-i18n')

export default {
  name: 'MetricMapping',
  components: { PageLayout },
  i18n: i18nMessages,
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
      columns: [],
      dialogVisible: false,
      dialogTitle: '',
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
      rules: {},
      historyDialogVisible: false,
      historyLoading: false,
      historyList: [],
      currentMappingId: 0,
      historyColumns: [],
      historyPagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        showTotal: total => this.$t('history_total', { total }),
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100']
      }
    }
  },
  created() {
    this.initColumns()
    this.initRules()
    this.fetchInstances()
    this.fetchMappings()
  },
  methods: {
    initColumns() {
      this.columns = [
        { title: this.$t('table_id'), dataIndex: 'id', width: 80 },
        { title: this.$t('table_instance_name'), dataIndex: 'zid', width: 200, scopedSlots: { customRender: 'zid' } },
        { title: this.$t('table_system_type'), dataIndex: 'system_type', width: 120, scopedSlots: { customRender: 'system_type' } },
        { title: this.$t('table_auto_init'), dataIndex: 'auto_init', width: 120, scopedSlots: { customRender: 'auto_init' } },
        { title: this.$t('table_status'), dataIndex: 'status', width: 120, scopedSlots: { customRender: 'status' } },
        { title: this.$t('table_last_success_at'), dataIndex: 'last_success_at', width: 180, scopedSlots: { customRender: 'last_success_at' } },
        { title: this.$t('table_operation'), key: 'operation', width: 350, fixed: 'right', scopedSlots: { customRender: 'operation' } }
      ]
      
      this.historyColumns = [
        { title: this.$t('history_id'), dataIndex: 'id', width: 80 },
        { title: this.$t('history_exec_type'), dataIndex: 'exec_type', width: 100, scopedSlots: { customRender: 'exec_type' } },
        { title: this.$t('history_start_time'), dataIndex: 'start_time', width: 180, scopedSlots: { customRender: 'start_time' } },
        { title: this.$t('history_duration'), dataIndex: 'duration', width: 100 },
        { title: this.$t('history_status'), dataIndex: 'status', width: 100, scopedSlots: { customRender: 'status' } },
        { title: this.$t('history_affected_hosts'), dataIndex: 'affected_hosts', width: 120 },
        { title: this.$t('history_error_message'), dataIndex: 'error_message', ellipsis: true }
      ]
    },
    initRules() {
      this.rules = {
        zid: [{ required: true, message: this.$t('validate_instance_required'), trigger: 'change' }],
        system_type: [{ required: true, message: this.$t('validate_system_type_required'), trigger: 'change' }]
      }
    },
    fetchInstances() {
      listZabbixInstance().then(resp => {
        const res = resp.data
        if (res.code === 200) {
          console.log(res.data)
          this.instances = res.data || []
        }
      }).catch(err => {
        console.error(this.$t('msg_get_instances_failed'), err)
      })
    },
    fetchMappings() {
      this.loading = true
      metricMappingList({}).then(resp => {
        const res = resp.data
        if (res.code === 200) {
          this.mappings = res.data.items || []
        } else {
          this.$message.error(res.message || this.$t('msg_get_mappings_failed'))
        }
      }).catch(err => {
        this.$message.error(this.$t('msg_get_mappings_failed'))
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
          this.hostGroups = resp.data.data || []
        }
      }).catch(err => {
        console.error(this.$t('msg_get_host_groups_failed'), err)
        this.$message.error(this.$t('msg_get_host_groups_failed'))
      })
      templateList(zid).then(resp => {
        if (resp.data.code === 200) {
          // 后端返回格式：{code: 200, message: "ok", data: [...]}
          this.templateList = resp.data.data || []
        }
      }).catch(err => {
        console.error(this.$t('msg_get_templates_failed'), err)
        this.$message.error(this.$t('msg_get_templates_failed'))
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
        this.$message.warning(this.$t('tip_select_instance_first'))
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
        console.error(this.$t('msg_get_items_failed'), err)
        this.$message.error(this.$t('msg_get_items_failed'))
      })
    },
    handleItemChange(itemId, metricType) {
      this.metricConfig.metrics[metricType] = itemId
    },
    showCreateDialog() {
      this.resetForm()
      this.dialogTitle = this.$t('create_mapping')
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
              console.error(this.$t('msg_parse_config_failed'), e)
            }
          }
          if (data.host_group_ids) {
            this.selectedGroups = data.host_group_ids.split(',')
          }
          this.autoInitSwitch = data.auto_init === 1
          this.initOnNewHostSwitch = data.init_on_new_host === 1
          this.handleInstanceChange(data.zid)
          this.dialogTitle = this.$t('edit_mapping')
          this.dialogVisible = true
        } else {
          this.$message.error(res.message || this.$t('msg_get_detail_failed'))
        }
      }).catch(err => {
        this.$message.error(this.$t('msg_get_detail_failed'))
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
            this.$message.success(this.$t('msg_save_success'))
            this.dialogVisible = false
            this.fetchMappings()
          } else {
            this.$message.error(res.message || this.$t('msg_save_failed'))
          }
        }).catch(err => {
          this.$message.error(this.$t('msg_save_failed'))
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
        title: this.$t('confirm_execute_title'),
        content: this.$t('confirm_execute_content'),
        onOk: () => {
          metricMappingExecute(row.id).then(resp => {
            const res = resp.data
            if (res.code === 200) {
              this.$message.success(res.message || this.$t('msg_execute_submitted'))
              this.fetchMappings()
            } else {
              this.$message.error(res.message || this.$t('msg_execute_failed'))
            }
          }).catch(err => {
            this.$message.error(this.$t('msg_execute_failed'))
            console.error(err)
          })
        }
      })
    },
    deleteMapping(row) {
      this.$confirm({
        title: this.$t('confirm_delete_title'),
        content: this.$t('confirm_delete_content'),
        onOk: () => {
          metricMappingDelete(row.id).then(resp => {
            const res = resp.data
            if (res.code === 200) {
              this.$message.success(this.$t('msg_delete_success'))
              this.fetchMappings()
            } else {
              this.$message.error(res.message || this.$t('msg_delete_failed'))
            }
          }).catch(err => {
            this.$message.error(this.$t('msg_delete_failed'))
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
          this.$message.error(res.message || this.$t('msg_get_history_failed'))
        }
      }).catch(err => {
        this.$message.error(this.$t('msg_get_history_failed'))
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
      const map = { 
        linux: this.$t('system_type_linux'), 
        windows: this.$t('system_type_windows'), 
        network: this.$t('system_type_network'), 
        server: this.$t('system_type_server') 
      }
      return map[type] || type
    },
    getInstanceName(zid) {
      const instance = this.instances.find(i => i.id === zid)
      return instance ? instance.name : `${this.$t('form_instance')} ${zid}`
    },
    getSystemTypeColor(type) {
      const map = { linux: 'green', windows: 'blue', network: 'orange', server: 'purple' }
      return map[type] || 'default'
    },
    getStatusName(status) {
      const map = { 
        0: this.$t('status_not_initialized'), 
        1: this.$t('status_initialized'), 
        2: this.$t('status_failed') 
      }
      return map[status] || this.$t('status_not_initialized')
    },
    getStatusColor(status) {
      const map = { 0: 'default', 1: 'green', 2: 'red' }
      return map[status] || 'default'
    },
    getExecTypeName(type) {
      const map = { 
        manual: this.$t('exec_type_manual'), 
        auto: this.$t('exec_type_auto'), 
        retry: this.$t('exec_type_retry') 
      }
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
