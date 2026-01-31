<template>
  <page-layout :noTitle="true">
    <a-alert message="多实例主机报表说明" type="info" show-icon closable style="margin-bottom: 16px;">
      <template slot="description">
        系统已支持多实例数据聚合。在配置主机报表时，可以为每个主机选择不同的实例。一个报表可以包含来自不同实例的主机数据。
      </template>
    </a-alert>
    
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item :label="$t('task')">
        <a-input v-model.trim="name" :placeholder="$t('task')" />
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">{{ $t('search_btn') }}</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">{{ $t('clear_filter_btn') }}</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="showFormModal">{{ $t('add_report_btn') }}</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="name" slot-scope="record">{{record.name}}</div>
        <div slot="report_mode" slot-scope="record">
          <span v-if="record.report_mode === 'realtime'">{{ $t('realtime_report') }}</span>
          <span v-else>{{ $t('scheduled_report') }}</span>
        </div>
        <div slot="status" slot-scope="record">
          <a-badge v-if="record.status == 1" status="success" :text="$t('status_enabled')" />
          <a-badge v-else-if="record.status == 0" status="error" :text="$t('status_disabled')" />
          <a-badge v-else status="default" :text="$t('status_unknown')" />
        </div>
        <div slot="exec_status" slot-scope="record">
          <a-badge v-if="record.exec_status == 0" status="default" :text="$t('exec_status_idle')" />
          <a-badge v-else-if="record.exec_status == 1" status="processing" :text="$t('exec_status_processing')" />
          <a-badge v-else-if="record.exec_status == 2" status="success" :text="$t('exec_status_generated')" />
          <a-badge v-else :text="$t('exec_status_unknown')" />
        </div>
        <div slot="created_at" slot-scope="record">
          {{ record.created_at | dateFormat }}</div>
        <div slot="start_at" slot-scope="record">
          {{ record.start_at | dateFormat }}</div>
        <div slot="report_start_time" slot-scope="record">
          {{ record.start | dateFormat }}</div>
        <div slot="report_end_time" slot-scope="record">
          {{ record.end | dateFormat }}</div>
        <div slot="desc" slot-scope="record">{{record.desc}}</div>
        <div slot="operation" slot-scope="record">
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="checknow(record)">
            {{ record.report_mode === 'realtime' ? $t('generate_btn') : $t('generate_report_btn') }}
          </a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-if="record.status==0" @click="deployTopo(record)">{{ $t('enable_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-else @click="deployTopo(record)">{{ $t('disable_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="edit(record)">{{ $t('edit_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="showModal(record)">{{ $t('report_log_btn') }}</a-button>
          <a-modal :title="$t('label_report_log')" :visible="visible" :confirm-loading="confirmLoading" @ok="handleCancel" @cancel="handleCancel" width="1400px">
            <template>
              <a-table :columns="macolumns" :data-source="malist" :loading="loading1" @change="machangePage" :pagination="mapagination" :rowKey="(record) => { return record.id}">
                <span slot="id" slot-scope="record">{{record.id}}</span>
                <div slot="cycle" slot-scope="record">
                  <div v-if="record.cycle=='day'">{{ $t('cycle_daily') }}</div>
                  <div v-else-if="record.cycle=='week'">{{ $t('cycle_weekly') }}</div>
                  <div v-else>{{ $t('cycle_unknown') }}</div>
                </div>
                <div slot="status" slot-scope="record" style="width: 50px">
                  <a-badge v-if="record.status == 2" status="success" :text="$t('report_ok')" />
                  <a-badge v-else-if="record.status == 3" status="error" :text="$t('report_fail')" />
                  <a-badge v-else status="default" :text="$t('cycle_unknown')" />
                </div>
                <div slot="start_time" slot-scope="record">{{record.start_time | dateFormat}}</div>
                <div slot="end_time" slot-scope="record">{{record.end_time | dateFormat}}</div>
                <div slot="result" slot-scope="record" style="max-width: 300px; word-break: break-word;">{{record.result}}</div>
                <div slot="total_time" slot-scope="record">{{record.total_time}}s</div>
                <div slot="files" slot-scope="record" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  <a :href="download+record.files" :title="record.files">{{record.files}}</a>
                </div>
                <div slot="operation" slot-scope="record">
                  <a-popconfirm :title="$t('delete_item_confirm')" :ok-text="$t('yes_btn')" :cancel-text="$t('no_btn')" @confirm="maconfirm(record)">
                    <a-button class="paddingleft0" type="link" size="small">{{ $t('delete_item_btn') }}</a-button>
                  </a-popconfirm>
                </div>
              </a-table>
            </template>
          </a-modal>
          <a-popconfirm :title="$t('message_delete_item')" :ok-text="$t('confirm_btn')" :cancel-text="$t('cancel_btn')" @confirm="confirm(record)">
            <a-button class="paddingleft0" type="link" size="small">{{ $t('delete_btn') }}</a-button>
          </a-popconfirm>
        </div>
      </a-table>
    </div>

    <!-- 添加/编辑主机报表弹窗 -->
    <a-modal :title="formModalTitle" :visible="formModalVisible" :width="1000" :confirm-loading="formModalLoading" @ok="handleFormSubmit" @cancel="handleFormCancel">
      <a-form-model ref="formModal" :rules="formRules" :model="formData" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-model-item :label="$t('host_report_name')" prop="name">
          <a-input v-model="formData.name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('report_mode')" prop="reportMode">
          <a-radio-group v-model="formData.reportMode" @change="handleReportModeChange">
            <a-radio value="realtime">{{ $t('realtime_report') }}</a-radio>
            <a-radio value="scheduled">{{ $t('scheduled_report') }}</a-radio>
          </a-radio-group>
        </a-form-model-item>
        <!-- 实时报表：显示开始和结束时间 -->
        <template v-if="formData.reportMode === 'realtime'">
          <a-form-model-item :label="$t('start_time')" prop="startTime">
            <a-date-picker v-model="formData.startTime" show-time format="YYYY-MM-DD HH:mm:ss" :placeholder="$t('select_start_time')" style="width: 100%" />
          </a-form-model-item>
          <a-form-model-item :label="$t('end_time')" prop="endTime">
            <a-date-picker v-model="formData.endTime" show-time format="YYYY-MM-DD HH:mm:ss" :placeholder="$t('select_end_time')" style="width: 100%" />
          </a-form-model-item>
        </template>
        <a-form-model-item :label="$t('host_selection')" prop="hostConfigs">
          <div v-for="(config, index) in formData.hostConfigs" :key="index" style="margin-bottom: 16px; padding: 16px; border: 1px solid #d9d9d9; border-radius: 4px;">
            <a-row :gutter="16" style="margin-bottom: 8px;" v-if="instanceList.length > 1">
              <a-col :span="22">
                <a-select v-model="config.instance_id" placeholder="请选择实例" @change="(value) => handleInstanceChange(value, index)" style="width: 100%">
                  <a-select-option v-for="item in instanceList" :key="item.tenant_id" :value="item.tenant_id">
                    {{ item.name }} ({{ item.tenant_id }})
                  </a-select-option>
                </a-select>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :span="10">
                <a-select v-model="config.host_id" show-search :placeholder="$t('select_host')" @popupScroll="handleHostPopupScrollForConfig(index)"
                  @search="(value) => handleHostSearchForConfig(value, index)" option-filter-prop="label" @change="handleHostChange(config, index)" style="width: 100%" :disabled="!config.instance_id">
                  <a-select-option v-for="(host, idx) in configHostsList[index]" :key="idx" :title="host.name" :label="host.name" :value="host.hostid">
                    {{ host.name }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="12">
                <a-select mode="multiple" show-search v-model="config.item_ids" :placeholder="$t('select_items')" @popupScroll="() => handleItemPopupScroll(index)"
                  @search="(value) => handleItemSearch(value, index)" option-filter-prop="label" style="width: 100%" :disabled="!config.host_id">
                  <a-select-option v-for="(item, idx) in curItemsList[index]" :key="idx" :label="item.name" :title="item.name" :value="item.itemid">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="2">
                <a-button type="danger" icon="delete" @click="removeHostConfig(index)" :disabled="formData.hostConfigs.length <= 1" />
              </a-col>
            </a-row>
          </div>
          <a-button type="dashed" @click="addHostConfig" style="width: 100%">
            <a-icon type="plus" />
            {{ $t('add_host_config') }}
          </a-button>
        </a-form-model-item>
        <!-- 循环报表：显示邮箱和周期选择 -->
        <template v-if="formData.reportMode === 'scheduled'">
          <a-form-model-item :label="$t('email')" prop="emails">
            <a-input v-model.trim="formData.emails" :placeholder="$t('email_placeholder')" />
          </a-form-model-item>
        </template>
        <!-- 循环报表：显示周期选择 -->
        <template v-if="formData.reportMode === 'scheduled'">
          <a-form-model-item :label="$t('period')" prop="cycle">
            <a-checkbox-group v-model="formData.cycle">
              <a-checkbox value="day" name="type">
                {{ $t('day') }}
              </a-checkbox>
              <a-checkbox value="week" name="type">
                {{ $t('week') }}
              </a-checkbox>
            </a-checkbox-group>
          </a-form-model-item>
          <a-form-model-item :label="$t('state')" prop="status">
            <a-switch :checked-children="$t('status_enabled')" :un-checked-children="$t('status_disabled')" v-model="formData.status" />
          </a-form-model-item>
        </template>
        <a-form-model-item :label="$t('description')">
          <a-input v-model="formData.desc" type="textarea" :placeholder="$t('description_placeholder')" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </page-layout>
</template>

<script>
const selectSize = 30
import PageLayout from '@/layouts/PageLayout'
import { reportList, reportDelete, deleteTopology, reportStatusUpdate, taskLogList, taskLogDelete, reportCheckNow, reportAdd, reportGet, reportPut, hostList, itemList } from '@/services/admin'
import { listZabbixInstances } from '@/services/zabbix'
import moment from 'moment'

const debounce = (func, delay = 60) => {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => func.apply(this, args), delay)
  }
}

export default {
  name: 'hostReport',
  i18n: require('./i18n'),
  components: { PageLayout },
  data() {
    return {
      title: "",
      ModalText: 'Content of the modal',
      visible: false,
      confirmLoading: false,
      name: '',
      status: '',
      exec_status: '',
      page: 1,
      pageSize: 10,
      mapage: 1,
      mapageSize: 10,
      loading: false,
      loading1: false,
      repid: '',
      reportid: '',
      download: "/download/",
      form: {
        status: '2',
        cycle: 'day',
      },
      // 实例列表
      instanceList: [],
      // 表单弹窗相关
      formModalVisible: false,
      formModalLoading: false,
      formModalTitle: '',
      isEditMode: false,
      editId: '',
      formData: {
        name: '',
        reportMode: 'realtime', // 默认实时报表
        hostConfigs: [
          {
            instance_id: undefined,
            host_id: '',
            item_ids: []
          }
        ],
        cycle: ['day'],
        status: true,
        report_type: 'host',
        emails: '',
        desc: '',
        startTime: null,
        endTime: null
      },
      configHostsList: {}, // key: index, value: hosts list for this config
      configHostsFilterList: {}, // key: index, value: filtered hosts list
      ItemsList: {}, // key: host_id, value: items list
      curItemsList: {}, // key: index, value: items list
      itemsFilterList: {}, // key: index, value: filtered items list
      formRules: {
        name: [
          {
            required: true,
            message: this.$t('message_report_name'),
            trigger: 'blur'
          }
        ],
        selectedInstance: [
          {
            required: false,
            message: '请选择实例',
            trigger: 'change'
          }
        ],
        hostConfigs: [
          {
            required: true,
            message: this.$t('message_host_config'),
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (!value || value.length === 0) {
                callback(new Error(this.$t('message_host_config')))
                return
              }
              for (let config of value) {
                if (!config.instance_id) {
                  callback(new Error('请为每个主机配置选择实例'))
                  return
                }
                if (!config.host_id) {
                  callback(new Error(this.$t('message_host_required')))
                  return
                }
                if (!config.item_ids || config.item_ids.length === 0) {
                  callback(new Error(this.$t('message_items_required')))
                  return
                }
              }
              callback()
            }
          }
        ],
        emails: [
          {
            required: false,
            message: this.$t('message_email'),
            trigger: 'blur'
          }
        ],
        cycle: [
          {
            type: 'array',
            required: false,
            message: this.$t('message_reporting_period'),
            trigger: 'change',
            validator: (rule, value, callback) => {
              // 循环报表需要周期，实时报表不需要
              if (this.formData.reportMode === 'scheduled' && (!value || value.length === 0)) {
                callback(new Error(this.$t('message_reporting_period')))
                return
              }
              callback()
            }
          }
        ],
        startTime: [
          {
            required: false,
            message: this.$t('select_start_time'),
            trigger: 'change',
            validator: (rule, value, callback) => {
              // 实时报表需要开始时间
              if (this.formData.reportMode === 'realtime' && !value) {
                callback(new Error(this.$t('select_start_time')))
                return
              }
              callback()
            }
          }
        ],
        endTime: [
          {
            required: false,
            message: this.$t('select_end_time'),
            trigger: 'change',
            validator: (rule, value, callback) => {
              // 实时报表需要结束时间
              if (this.formData.reportMode === 'realtime' && !value) {
                callback(new Error(this.$t('select_end_time')))
                return
              }
              callback()
            }
          }
        ],
        status: [
          {
            required: true,
            message: this.$t('message_state'),
            trigger: 'change'
          }
        ]
      },
      columns: [
        { title: this.$t('title_id'), key: 'id', align: 'left', scopedSlots: { customRender: 'id' } },
        { title: this.$t('title_name'), key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: this.$t('report_mode'), key: 'report_mode', align: 'left', scopedSlots: { customRender: 'report_mode' } },
        { title: this.$t('title_status'), key: 'status', align: 'left', scopedSlots: { customRender: 'status' } },
        { title: this.$t('title_report_status'), key: 'exec_status', align: 'left', scopedSlots: { customRender: 'exec_status' } },
        { title: this.$t('start_time'), key: 'report_start_time', align: 'left', scopedSlots: { customRender: 'report_start_time' } },
        { title: this.$t('end_time'), key: 'report_end_time', align: 'left', scopedSlots: { customRender: 'report_end_time' } },
        { title: this.$t('title_creation_date'), key: 'created_at', align: 'left', scopedSlots: { customRender: 'created_at' } },
        { title: this.$t('title_last_execution_time'), key: 'start_at', align: 'left', scopedSlots: { customRender: 'start_at' } },
        { title: this.$t('title_description'), key: 'desc', align: 'left', scopedSlots: { customRender: 'desc' } },
        { title: this.$t('title_actions'), key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
      ],
      macolumns: [
        { title: this.$t('title_id'), key: 'id', align: 'center', width: '80px', scopedSlots: { customRender: 'id' } },
        { title: this.$t('title_period'), key: 'cycle', align: 'center', width: '100px', scopedSlots: { customRender: 'cycle' } },
        { title: this.$t('title_status'), key: 'status', align: 'center', width: '100px', scopedSlots: { customRender: 'status' } },
        { title: this.$t('title_start_time'), key: 'start_time', align: 'center', width: '180px', scopedSlots: { customRender: 'start_time' } },
        { title: this.$t('title_finish_time'), key: 'end_time', align: 'center', width: '180px', scopedSlots: { customRender: 'end_time' } },
        { title: this.$t('title_runtime'), key: 'total_time', align: 'center', width: '100px', scopedSlots: { customRender: 'total_time' } },
        { title: this.$t('title_result'), key: 'result', align: 'left', scopedSlots: { customRender: 'result' } },
        { title: this.$t('title_report'), key: 'files', align: 'left', width: '200px', scopedSlots: { customRender: 'files' } },
        { title: this.$t('title_actions'), key: 'operation', align: 'center', width: '80px', scopedSlots: { customRender: 'operation' } }	
      ],
      list: [],
      malist: [],
      pagination: {
        total: 0, current: 1, "show-quick-jumper": true, "page-size-options": ["10", "20", "30", "40", "50", "100", "200"],
        pageSize: 10, "show-size-changer": true, "show-total": (total) => `共 ${total} 条数据`
      },
      mapagination: {
        total: 0, current: 1, "show-quick-jumper": true, "page-size-options": ["10", "20", "30", "40", "50", "100", "200"],
        pageSize: 10, "show-size-changer": true, "show-total": (total) => `共 ${total} 条数据`
      },
    }
  },
  created() {
    this.loadInstances()
    this.init()
  },
  filters: {
    dateFormat(dateStr, pattern = "YYYY-MM-DD HH:mm:ss") {
      if (!dateStr || dateStr === "0001-01-01T00:00:00Z" || dateStr === "0001-01-01 00:00:00") {
        return '--';
      }
      try {
        // moment.js 可以自动解析 ISO 8601 格式，包括带时区的格式
        const m = moment(dateStr);
        if (m.isValid()) {
          return m.format(pattern);
        } else {
          return '--';
        }
      } catch (e) {
        console.error('Date format error:', e, dateStr);
        return '--';
      }
    }
  },
  methods: {
    async loadInstances() {
      try {
        const res = await listZabbixInstances()
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.instanceList = biz.data || []
          // 如果只有一个实例，自动为第一个主机配置选中
          if (this.instanceList.length === 1 && this.formData.hostConfigs.length > 0) {
            this.formData.hostConfigs[0].instance_id = this.instanceList[0].tenant_id
            this.handleInstanceChange(this.instanceList[0].tenant_id, 0)
          }
        }
      } catch (e) {
        console.error('加载实例列表失败', e)
      }
    },
    handleInstanceChange(value, index) {
      // 设置该配置的实例ID
      this.$set(this.formData.hostConfigs[index], 'instance_id', value)
      // 清空该配置的主机和监控项
      this.$set(this.formData.hostConfigs[index], 'host_id', '')
      this.$set(this.formData.hostConfigs[index], 'item_ids', [])
      this.$set(this.curItemsList, index, [])
      this.$set(this.itemsFilterList, index, [])
      
      // 加载该实例的所有主机
      if (value) {
        let params = {
          page: 1,
          limit: 10000,
          instance_id: value
        }
        hostList(params).then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            const hosts = res.data.items || []
            // 为该配置加载主机列表
            this.$set(this.configHostsFilterList, index, hosts)
            this.$set(this.configHostsList, index, hosts.slice(0, selectSize))
          }
        })
      } else {
        this.$set(this.configHostsList, index, [])
        this.$set(this.configHostsFilterList, index, [])
      }
    },
    formatReportTime(timeStr) {
      if (!timeStr || timeStr === '0001-01-01T00:00:00Z' || timeStr === '0001-01-01 00:00:00') {
        return '--'
      }
      try {
        return moment(timeStr).format('YYYY-MM-DD HH:mm:ss')
      } catch (e) {
        console.error('Format time error:', e, timeStr)
        return '--'
      }
    },
    init() {
      this.loading = true
      reportList({
        page: this.page, limit: this.pageSize, name: this.name,
        status: this.status, exec_status: this.exec_status, report_type: 'host'
      }).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.pagination.total = res.data.total
          this.pagination.current = this.page
          this.pagination.pageSize = this.pageSize
          this.list = res.data.items || []
        }
      }).finally(() => { this.loading = false })
    },
    showModal(value) {
      this.repid = value
      taskLogList({ page: this.mapage, limit: this.mapageSize, report_id: value.id }).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.reportid = value.id
          this.mapagination.total = res.data.total
          this.mapagination.current = this.mapage
          this.mapagination.pageSize = this.mapageSize
          this.malist = res.data.items || []
        }
      }).finally(() => { this.visible = true; })
    },
    handleCancel() {
      this.visible = false;
    },
    resetData() {
      if (this.name) {
        this.name = ''
        this.init()
      }
    },
    changePage(e) {
      this.page = e.current
      this.pageSize = e.pageSize
      this.init()
    },
    machangePage(e) {
      this.mapage = e.current
      this.mapageSize = e.pageSize
      taskLogList({ page: this.mapage, limit: this.mapageSize, report_id: this.reportid }).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.mapagination.total = res.data.total
          this.mapagination.current = this.mapage
          this.mapagination.pageSize = this.mapageSize
          this.malist = res.data.items || []
        }
      })
    },
    edit(record) {
      this.isEditMode = true
      this.editId = record.id
      this.formModalTitle = this.$t('edit_btn') + ' - ' + record.name
      this.loadFormData(record.id)
      this.formModalVisible = true
    },
    showFormModal() {
      this.isEditMode = false
      this.editId = ''
      this.formModalTitle = this.$t('add_report_btn')
      this.resetFormData()
      this.formModalVisible = true
    },
    resetFormData() {
      const defaultInstanceId = this.instanceList.length === 1 ? this.instanceList[0].tenant_id : undefined
      this.formData = {
        name: '',
        reportMode: 'realtime', // 默认实时报表
        hostConfigs: [
          {
            instance_id: defaultInstanceId,
            host_id: '',
            item_ids: []
          }
        ],
        cycle: ['day'],
        status: true,
        report_type: 'host',
        emails: '',
        desc: '',
        startTime: null,
        endTime: null
      }
      this.configHostsList = {}
      this.configHostsFilterList = {}
      this.ItemsList = {}
      this.curItemsList = {}
      this.itemsFilterList = {}
      if (this.$refs.formModal) {
        this.$refs.formModal.resetFields()
      }
      // 如果只有一个实例，自动加载主机列表
      if (defaultInstanceId) {
        this.handleInstanceChange(defaultInstanceId, 0)
      }
    },
    loadFormData(id) {
      this.formModalLoading = true
      reportGet(id)
        .then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            const reportData = res.data || {}
            this.formData.name = reportData.name || ''
            this.formData.hoststype = reportData.hoststype || ''
            this.formData.emails = reportData.emails || ''
            this.formData.desc = reportData.desc || ''
            this.formData.status = reportData.status === '1' || reportData.status === 1
            this.formData.cycle = reportData.cycle ? reportData.cycle.split(',') : ['day']
            this.formData.report_type = 'host'
            this.formData.reportMode = reportData.report_mode || 'scheduled' // 默认为循环报表
            
            // 加载时间（使用 start 和 end 字段，而不是 start_at 和 end_at）
            if (reportData.start && reportData.start !== '0001-01-01T00:00:00Z') {
              this.formData.startTime = moment(reportData.start)
            } else {
              this.formData.startTime = null
            }
            if (reportData.end && reportData.end !== '0001-01-01T00:00:00Z') {
              this.formData.endTime = moment(reportData.end)
            } else {
              this.formData.endTime = null
            }
            
            // 解析host_ids和item_ids
            if (reportData.host_ids) {
              try {
                const hostConfigs = JSON.parse(reportData.host_ids)
                if (Array.isArray(hostConfigs) && hostConfigs.length > 0) {
                  this.formData.hostConfigs = hostConfigs.map((config, idx) => ({
                    instance_id: config.instance_id ? String(config.instance_id) : undefined,
                    host_id: config.host_id ? String(config.host_id) : '',
                    item_ids: (config.item_ids || []).map(id => String(id))
                  }))
                  
                  // 为每个配置加载对应的主机列表和items
                  this.formData.hostConfigs.forEach((config, index) => {
                    if (config.instance_id) {
                      // 加载该实例的主机列表
                      let params = {
                        page: 1,
                        limit: 10000,
                        instance_id: config.instance_id
                      }
                      hostList(params).then((resp) => {
                        let res = resp.data
                        if (res.code == 200) {
                          const hosts = res.data.items || []
                          this.$set(this.configHostsFilterList, index, hosts)
                          this.$set(this.configHostsList, index, hosts.slice(0, selectSize))
                          
                          // 如果有已选择的主机，加载监控项
                          if (config.host_id) {
                            this.handleHostChange(config, index)
                          }
                        }
                      })
                    }
                  })
                }
              } catch (e) {
                console.error('Parse host_ids error:', e)
              }
            }
          }
        })
        .finally(() => {
          this.formModalLoading = false
        })
    },
    handleFormSubmit() {
      this.$refs.formModal.validate((valid) => {
        if (valid) {
          this.formModalLoading = true
          // 构建host_ids和item_ids JSON字符串
          const hostIds = JSON.stringify(this.formData.hostConfigs.map(c => ({
            host_id: c.host_id,
            item_ids: c.item_ids,
            instance_id: c.instance_id
          })))
          const itemIds = JSON.stringify(this.formData.hostConfigs.flatMap(c => c.item_ids))
          
          // 格式化时间
          let startTimeStr = ''
          let endTimeStr = ''
          if (this.formData.startTime) {
            startTimeStr = this.formData.startTime.format('YYYY-MM-DD HH:mm:ss')
          }
          if (this.formData.endTime) {
            endTimeStr = this.formData.endTime.format('YYYY-MM-DD HH:mm:ss')
          }
          
          const params = {
            name: this.formData.name,
            report_type: 'host',
            report_mode: this.formData.reportMode,
            host_ids: hostIds,
            item_ids: itemIds,
            cycle: this.formData.reportMode === 'scheduled' ? this.formData.cycle.join(',') : '', // 循环报表需要周期
            status: this.formData.reportMode === 'scheduled' ? (this.formData.status ? '1' : '0') : '1', // 实时报表默认启用
            emails: this.formData.emails,
            desc: this.formData.desc,
            start: startTimeStr,
            end: endTimeStr
          }
          
          const promise = this.isEditMode 
            ? reportPut(this.editId, params)
            : reportAdd(params)
          
          promise.then((resp) => {
            let res = resp.data
            if (res.code == 200) {
              this.$message.success(this.isEditMode ? this.$t('message_task_edited') : this.$t('message_task_added'))
              this.formModalVisible = false
              this.init()
            }
          }).finally(() => {
            this.formModalLoading = false
          })
        }
      })
    },
    handleFormCancel() {
      this.formModalVisible = false
      this.resetFormData()
    },
    handleReportModeChange() {
      // 切换报表模式时，清空相关字段
      if (this.formData.reportMode === 'realtime') {
        // 实时报表：清空周期和状态
        this.formData.cycle = []
        this.formData.status = true
      } else {
        // 循环报表：清空开始和结束时间
        this.formData.startTime = null
        this.formData.endTime = null
        if (this.formData.cycle.length === 0) {
          this.formData.cycle = ['day'] // 默认选择日报
        }
      }
      // 重新验证表单
      if (this.$refs.formModal) {
        this.$refs.formModal.validate()
      }
    },
    handleHostChange(config, index) {
      if (!config.host_id) {
        this.$set(this.curItemsList, index, [])
        return
      }
      
      if (!config.instance_id) {
        this.$message.warning('请先选择实例')
        return
      }
      
      let params = {
        hostid: config.host_id,
        instance_id: config.instance_id
      }
      itemList(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$set(this.ItemsList, config.host_id, res.data.items)
          this.$set(this.itemsFilterList, index, res.data.items)
          this.$set(this.curItemsList, index, res.data.items.slice(0, selectSize))
          
          // 确保item_ids的类型与items列表中的itemid类型一致（统一转换为字符串）
          if (config.item_ids && Array.isArray(config.item_ids) && config.item_ids.length > 0) {
            const items = res.data.items || []
            // 将item_ids统一转换为字符串，并过滤出有效的item_ids
            const validItemIds = config.item_ids.map(id => String(id)).filter(id => {
              return items.some(item => String(item.itemid) === id)
            })
            // 更新item_ids为有效的item_ids（确保类型一致）
            this.$set(config, 'item_ids', validItemIds)
          }
        }
      })
    },
    addHostConfig() {
      const newIndex = this.formData.hostConfigs.length
      const defaultInstanceId = this.instanceList.length === 1 ? this.instanceList[0].tenant_id : undefined
      
      this.formData.hostConfigs.push({
        instance_id: defaultInstanceId,
        host_id: '',
        item_ids: []
      })
      
      // 如果只有一个实例，自动加载主机列表
      if (defaultInstanceId) {
        this.handleInstanceChange(defaultInstanceId, newIndex)
      } else {
        this.$set(this.configHostsList, newIndex, [])
        this.$set(this.configHostsFilterList, newIndex, [])
      }
      this.$set(this.curItemsList, newIndex, [])
    },
    removeHostConfig(index) {
      this.formData.hostConfigs.splice(index, 1)
      // 清理对应的items和hosts列表
      delete this.curItemsList[index]
      delete this.configHostsList[index]
      delete this.configHostsFilterList[index]
      // 重新索引
      const newItemsList = {}
      const newHostsList = {}
      const newHostsFilterList = {}
      this.formData.hostConfigs.forEach((config, idx) => {
        if (this.curItemsList[idx] !== undefined) {
          newItemsList[idx] = this.curItemsList[idx]
        }
        if (this.configHostsList[idx] !== undefined) {
          newHostsList[idx] = this.configHostsList[idx]
        }
        if (this.configHostsFilterList[idx] !== undefined) {
          newHostsFilterList[idx] = this.configHostsFilterList[idx]
        }
      })
      this.curItemsList = newItemsList
      this.configHostsList = newHostsList
      this.configHostsFilterList = newHostsFilterList
    },
    handleHostPopupScrollForConfig: debounce(function (index) {
      const curList = this.configHostsList[index] || []
      const filterList = this.configHostsFilterList[index] || []
      const curLen = curList.length
      const allLen = filterList.length
      if (curLen < allLen) {
        const nextPage = filterList.slice(curLen, curLen + selectSize)
        this.$set(this.configHostsList, index, [...curList, ...nextPage])
      }
    }),
    handleHostSearchForConfig: debounce(function (value, index) {
      // 如果没有搜索值，恢复完整列表
      if (!value || value.trim() === '') {
        const allHosts = this.configHostsFilterList[index] || []
        this.$set(this.configHostsList, index, allHosts.slice(0, selectSize))
        return
      }
      // 从完整列表中过滤
      const allHosts = this.configHostsFilterList[index] || []
      const filtered = allHosts.filter((item) => {
        const reg = new RegExp(value, 'gi')
        const match = item.name.toString().match(reg)
        return match
      })
      // 更新显示列表为过滤后的前selectSize条
      this.$set(this.configHostsList, index, filtered.slice(0, selectSize))
    }),
    handleItemPopupScroll: debounce(function (index) {
      const curLen = this.curItemsList[index] ? this.curItemsList[index].length : 0
      const allLen = this.itemsFilterList[index] ? this.itemsFilterList[index].length : 0
      if (curLen < allLen) {
        const nextPage = this.itemsFilterList[index].slice(curLen, curLen + selectSize)
        this.$set(this.curItemsList, index, [...(this.curItemsList[index] || []), ...nextPage])
      }
    }),
    handleItemSearch: debounce(function (value, index) {
      const hostConfig = this.formData.hostConfigs[index]
      if (!hostConfig || !hostConfig.host_id) {
        return
      }
      const allItems = this.ItemsList[hostConfig.host_id] || []
      this.$set(this.itemsFilterList, index, allItems.filter((item) => {
        const reg = new RegExp(value, 'gi')
        const match = item.name.toString().match(reg)
        return match
      }))
      this.$set(this.curItemsList, index, this.itemsFilterList[index].slice(0, selectSize))
    }),
    confirm(record) {
      this.loading = true
      reportDelete(record.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.loading = false
          this.$message.success(res.message)
          this.init()
        }
      })
    },
    maconfirm(record) {
      this.loading1 = true
      taskLogDelete(record.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.loading1 = false
          this.$message.success(res.message)
          this.showModal(this.repid)
        }
      })
    },
    deployTopo(record) {
      this.loading = true
      reportStatusUpdate(record).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.loading = false
          this.$message.success(res.message)
          this.init()
        }
      })
    },
    checknow(record) {
      this.loading = true
      reportCheckNow(record).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.loading = false
          this.$message.success(res.message)
          this.init()
        }
      })
    },
  },
}
</script>
<style lang="less" scoped>
.tuopu_bg {
  width: 708px;
}
</style>
