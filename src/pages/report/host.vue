<template>
  <page-layout :noTitle="true">
    <a-alert :message="$t('multi_instance_alert_title')" type="info" show-icon closable style="margin-bottom: 16px;">
      <template slot="description">
        {{ $t('multi_instance_alert_content') }}
      </template>
    </a-alert>
    
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item :label="$t('task')">
        <a-input v-model.trim="name" :placeholder="$t('task')" />
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">{{ $t('search_btn') }}</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">{{ $t('clear_filter_btn') }}</a-button>
        <a-button style="margin-left: 10px;" icon="reload" @click="init">{{ $t('refresh_btn') }}</a-button>
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
          <a-button class="pd20 paddingleft0" type="link" size="small" :disabled="record.exec_status == 1" @click="checknow(record)">
            {{ record.report_mode === 'realtime' ? $t('generate_btn') : $t('generate_report_btn') }}
          </a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-if="record.status==0" @click="deployTopo(record)">{{ $t('enable_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-else @click="deployTopo(record)">{{ $t('disable_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="edit(record)">{{ $t('edit_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="showModal(record)">{{ $t('report_log_btn') }}</a-button>
          <a-popconfirm :title="$t('message_delete_item')" :ok-text="$t('confirm_btn')" :cancel-text="$t('cancel_btn')" @confirm="confirm(record)">
            <a-button class="paddingleft0" type="link" size="small">{{ $t('delete_btn') }}</a-button>
          </a-popconfirm>
        </div>
      </a-table>
    </div>
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
            <a-badge v-else-if="record.status == 1" status="processing" :text="$t('exec_status_processing')" />
            <a-badge v-else-if="record.status == 3" status="error" :text="$t('report_fail')" />
            <a-badge v-else status="default" :text="$t('cycle_unknown')" />
          </div>
          <div slot="progress" slot-scope="record" style="min-width: 180px;">
            <a-progress :percent="record.progress || 0" size="small" :status="getTaskProgressStatus(record)" />
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

    <!-- Add/Edit Host Report Modal -->
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
        <!-- Realtime report: show start and end time -->
        <template v-if="formData.reportMode === 'realtime'">
          <a-form-model-item :label="$t('start_time')" prop="startTime">
            <a-date-picker v-model="formData.startTime" show-time format="YYYY-MM-DD HH:mm:ss" :placeholder="$t('select_start_time')" style="width: 100%" @change="handleStartTimeChange" />
          </a-form-model-item>
          <a-form-model-item :label="$t('end_time')" prop="endTime">
            <a-date-picker v-model="formData.endTime" show-time format="YYYY-MM-DD HH:mm:ss" :placeholder="$t('select_end_time')" style="width: 100%" @change="handleEndTimeChange" />
          </a-form-model-item>
        </template>
        <a-form-model-item :label="$t('host_selection')" prop="hostConfigs">
          <div v-for="(config, index) in formData.hostConfigs" :key="index" class="host-config-card">
            <a-row :gutter="16" style="margin-bottom: 8px;">
              <a-col :span="8">
                <a-select v-model="config.selection_mode" style="width: 100%" @change="(value) => handleSelectionModeChange(value, index)">
                  <a-select-option value="single">{{ $t('selection_single') }}</a-select-option>
                  <a-select-option value="host_group">{{ $t('selection_host_group') }}</a-select-option>
                  <a-select-option value="tag">{{ $t('selection_tag') }}</a-select-option>
                </a-select>
              </a-col>
              <a-col :span="16">
                <a-select v-model="config.zid" :placeholder="$t('select_instance_first')" @change="(value) => handleInstanceChange(value, index)" style="width: 100%" show-search option-filter-prop="children">
                  <a-select-option v-for="item in instanceList" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </a-select-option>
                  </a-select>
              </a-col>
            </a-row>
            <a-row v-if="config.selection_mode === 'single'" :gutter="16">
              <a-col :span="10">
                <a-select v-model="config.host_id" show-search :placeholder="config.zid ? $t('select_host') : $t('select_instance_first')" @popupScroll="handleHostPopupScrollForConfig(index)"
                  @search="(value) => handleHostSearchForConfig(value, index)" option-filter-prop="label" @change="handleHostChange(config, index)" style="width: 100%" :disabled="!config.zid">
                  <a-select-option v-for="(host, idx) in configHostsList[index]" :key="idx" :title="host.name" :label="host.name" :value="host.hostid">
                    {{ host.name }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="12">
                <a-select mode="multiple" show-search v-model="config.item_ids" :placeholder="config.host_id ? $t('select_items') : $t('select_host_first')" @popupScroll="() => handleItemPopupScroll(index)"
                  @search="(value) => handleItemSearch(value, index)" option-filter-prop="label" style="width: 100%" :disabled="!config.host_id">
                  <a-select-option v-for="(item, idx) in curItemsList[index]" :key="idx" :label="item.name" :title="item.name" :value="item.itemid">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="2">
                <a-button type="danger" icon="delete" class="host-config-delete-button" @click="removeHostConfig(index)" :disabled="formData.hostConfigs.length <= 1" />
              </a-col>
            </a-row>
            <template v-else>
              <a-row v-if="config.selection_mode === 'host_group'" :gutter="16" style="margin-bottom: 8px;">
                <a-col :span="15">
                  <a-select v-model="config.group_ids" mode="multiple" :placeholder="$t('select_host_group')" style="width: 100%" :disabled="!config.zid">
                    <a-select-option v-for="group in configHostGroupsList[index] || []" :key="group.groupid" :value="group.groupid">
                      {{ group.name }}
                    </a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="6">
                  <a-button type="primary" class="bulk-action-button" @click="loadBulkHostsForConfig(index)" :disabled="!config.zid">{{ $t('bulk_load_hosts') }}</a-button>
                </a-col>
                <a-col :span="3">
                  <a-button type="danger" icon="delete" class="host-config-delete-button" @click="removeHostConfig(index)" :disabled="formData.hostConfigs.length <= 1" />
                </a-col>
              </a-row>
              <template v-if="config.selection_mode === 'tag'">
                <a-row v-for="(tagFilter, tagIndex) in config.tag_filters" :key="`tag-${index}-${tagIndex}`" :gutter="8" style="margin-bottom: 8px;">
                  <a-col :span="9">
                    <a-input v-model.trim="tagFilter.tag" :placeholder="$t('tag_name')" />
                  </a-col>
                  <a-col :span="9">
                    <a-input v-model.trim="tagFilter.value" :placeholder="$t('tag_value')" />
                  </a-col>
                  <a-col :span="4">
                    <a-button v-if="tagIndex === config.tag_filters.length - 1" type="dashed" style="width: 100%" @click="addTagFilter(index)">{{ $t('add_tag_filter') }}</a-button>
                  </a-col>
                  <a-col :span="2">
                    <a-button type="danger" icon="delete" class="host-config-delete-button" @click="removeTagFilter(index, tagIndex)" :disabled="config.tag_filters.length <= 1" />
                  </a-col>
                </a-row>
                <a-row :gutter="16" style="margin-bottom: 8px;">
                  <a-col :span="21">
                    <a-button type="primary" class="bulk-action-button" @click="loadBulkHostsForConfig(index)" :disabled="!config.zid">{{ $t('bulk_load_hosts') }}</a-button>
                  </a-col>
                  <a-col :span="3">
                    <a-button type="danger" icon="delete" class="host-config-delete-button" @click="removeHostConfig(index)" :disabled="formData.hostConfigs.length <= 1" />
                  </a-col>
                </a-row>
              </template>
              <a-row :gutter="16" style="margin-bottom: 8px;">
                <a-col :span="24">
                  <div style="color: rgba(0, 0, 0, 0.65);">
                    {{ config.matched_hosts && config.matched_hosts.length ? $t('matched_hosts_count', { count: config.matched_hosts.length }) : $t('no_matched_hosts') }}
                  </div>
                  <div v-if="config.matched_hosts && config.matched_hosts.length" style="margin-top: 4px; color: rgba(0, 0, 0, 0.45);">
                    {{ $t('matched_hosts_preview') }}: {{ getMatchedHostsPreview(config.matched_hosts) }}
                  </div>
                </a-col>
              </a-row>
              <a-row :gutter="16">
                <a-col :span="10">
                  <a-select v-model="config.reference_host_id" show-search :placeholder="$t('select_reference_host')" style="width: 100%"
                    :disabled="!(config.matched_hosts && config.matched_hosts.length)" @change="() => handleReferenceHostChange(config, index)">
                    <a-select-option v-for="host in config.matched_hosts || []" :key="host.hostid" :value="host.hostid">
                      {{ host.name }}
                    </a-select-option>
                  </a-select>
                </a-col>
                <a-col :span="12">
                  <a-select mode="multiple" show-search v-model="config.reference_item_ids" :placeholder="$t('select_reference_items')" option-filter-prop="label" style="width: 100%" :disabled="!config.reference_host_id">
                    <a-select-option v-for="(item, idx) in bulkReferenceItemsList[index] || []" :key="`ref-item-${index}-${idx}`" :label="item.name" :title="item.name" :value="item.itemid">
                      {{ item.name }}
                    </a-select-option>
                  </a-select>
                </a-col>
              </a-row>
            </template>
          </div>
          <a-button type="dashed" @click="addHostConfig" style="width: 100%">
            <a-icon type="plus" />
            {{ $t('add_host_config') }}
          </a-button>
        </a-form-model-item>
        <!-- Scheduled report: show email and cycle selection -->
        <template v-if="formData.reportMode === 'scheduled'">
          <a-form-model-item :label="$t('email')" prop="emails">
            <a-input v-model.trim="formData.emails" :placeholder="$t('email_placeholder')" />
          </a-form-model-item>
        </template>
        <!-- Scheduled report: show cycle selection -->
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
import { reportList, reportDelete, reportStatusUpdate, taskLogList, taskLogDelete, reportCheckNow, reportAdd, reportGet, reportPut, hostList, itemList, hostgroupList, hostgroupHosts, hostgroupHostsLegacy, hostFilterByTag } from '@/services/admin'
import { listZabbixInstance } from '@/services/zabbix'
import moment from 'moment'

const debounce = (func, delay = 60) => {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => func.apply(this, args), delay)
  }
}

const createTagFilter = () => ({
  tag: '',
  value: ''
})

const createHostConfig = (defaultZid) => ({
  selection_mode: 'single',
  zid: defaultZid,
  host_id: '',
  item_ids: [],
  group_ids: [],
  tag_filters: [createTagFilter()],
  matched_hosts: [],
  reference_host_id: undefined,
  reference_item_ids: []
})

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
      logPollingTimer: null,
      pendingTaskLog: null,
      pendingReportStatusMap: {},
      repid: '',
      reportid: '',
      download: "/download/",
      form: {
        status: '2',
        cycle: 'day',
      },
      // Instance list
      instanceList: [],
      // Form modal related
      formModalVisible: false,
      formModalLoading: false,
      formModalTitle: '',
      isEditMode: false,
      editId: '',
      formData: {
        name: '',
        reportMode: 'realtime', // Default to realtime report
        hostConfigs: [createHostConfig(undefined)],
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
      configHostGroupsList: {}, // key: index, value: host group list
      bulkReferenceItemsList: {}, // key: index, value: reference item list
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
            message: this.$t('select_instance_first'),
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
                if (!config.zid) {
                  callback(new Error(this.$t('select_instance_for_each_config')))
                  return
                }
                if (config.selection_mode === 'single') {
                  if (!config.host_id) {
                    callback(new Error(this.$t('message_host_required')))
                    return
                  }
                  if (!config.item_ids || config.item_ids.length === 0) {
                    callback(new Error(this.$t('message_items_required')))
                    return
                  }
                  continue
                }
                if (config.selection_mode === 'host_group' && (!config.group_ids || config.group_ids.length === 0)) {
                  callback(new Error(this.$t('message_group_required')))
                  return
                }
                if (config.selection_mode === 'tag') {
                  const hasTagFilter = (config.tag_filters || []).some(tagFilter => tagFilter.tag && tagFilter.tag.trim())
                  if (!hasTagFilter) {
                    callback(new Error(this.$t('message_tag_required')))
                    return
                  }
                }
                if (!config.reference_host_id) {
                  callback(new Error(this.$t('message_reference_host_required')))
                  return
                }
                if (!config.reference_item_ids || config.reference_item_ids.length === 0) {
                  callback(new Error(this.$t('message_reference_items_required')))
                  return
                }
                if (!config.matched_hosts || config.matched_hosts.length === 0) {
                  callback(new Error(this.$t('no_matched_hosts')))
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
              // Scheduled report needs cycle, realtime report doesn't
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
            trigger: ['change', 'blur'],
            validator: (rule, value, callback) => {
              // Realtime report needs start time
              if (this.formData.reportMode === 'realtime') {
                if (!value) {
                  callback(new Error(this.$t('select_start_time')))
                  return
                }
                // Validate start time is before end time
                if (this.formData.endTime) {
                  const startTime = value.valueOf()
                  const endTime = this.formData.endTime.valueOf()
                  if (startTime >= endTime) {
                    callback(new Error(this.$t('start_time_before_end_time')))
                    return
                  }
                }
              }
              callback()
            }
          }
        ],
        endTime: [
          {
            trigger: ['change', 'blur'],
            validator: (rule, value, callback) => {
              // Realtime report needs end time
              if (this.formData.reportMode === 'realtime') {
                if (!value) {
                  callback(new Error(this.$t('select_end_time')))
                  return
                }
                // Validate end time is after start time
                if (this.formData.startTime) {
                  const startTime = this.formData.startTime.valueOf()
                  const endTime = value.valueOf()
                  if (endTime <= startTime) {
                    callback(new Error(this.$t('end_time_after_start_time')))
                    return
                  }
                }
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
        { title: this.$t('title_progress'), key: 'progress', align: 'center', width: '220px', scopedSlots: { customRender: 'progress' } },
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
        pageSize: 10, "show-size-changer": true, "show-total": (total) => this.$t('total_records', { total })
      },
      mapagination: {
        total: 0, current: 1, "show-quick-jumper": true, "page-size-options": ["10", "20", "30", "40", "50", "100", "200"],
        pageSize: 10, "show-size-changer": true, "show-total": (total) => this.$t('total_records', { total })
      },
    }
  },
  created() {
    this.loadInstances()
    this.init()
  },
  beforeDestroy() {
    this.stopLogPolling()
  },
  watch: {
    instanceList: {
      handler(newVal) {
        // 如果只有一个实例，自动为所有未选择实例的配置选中该实例
        if (newVal && newVal.length === 1) {
          this.formData.hostConfigs.forEach((config, index) => {
            if (!config.zid) {
              this.$set(config, 'zid', newVal[0].id)
              // 自动加载该实例的主机列表
              this.handleInstanceChange(newVal[0].id, index)
            }
          })
        }
      },
      immediate: false
    }
  },
  filters: {
    dateFormat(dateStr, pattern = "YYYY-MM-DD HH:mm:ss") {
      if (!dateStr || dateStr === "0001-01-01T00:00:00Z" || dateStr === "0001-01-01 00:00:00") {
        return '--';
      }
      try {
        // moment.js can automatically parse ISO 8601 format, including timezone format
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
        const res = await listZabbixInstance()
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.instanceList = biz.data || []
        }
      } catch (e) {
        console.error(this.$t('load_instances_failed'), e)
      }
    },
    isBulkSelectionMode(selectionMode) {
      return selectionMode === 'host_group' || selectionMode === 'tag'
    },
    getItemsCacheKey(zid, hostId) {
      return `${zid}_${hostId}`
    },
    createDefaultHostConfig() {
      const defaultZid = this.instanceList.length === 1 ? this.instanceList[0].id : undefined
      return createHostConfig(defaultZid)
    },
    getMatchedHostsPreview(hosts = []) {
      return hosts.slice(0, 5).map(host => host.name).join(', ')
    },
    normalizeTagFilters(tagFilters = []) {
      return tagFilters
        .map(tagFilter => ({
          tag: (tagFilter.tag || '').trim(),
          value: (tagFilter.value || '').trim()
        }))
        .filter(tagFilter => tagFilter.tag)
    },
    dedupeHosts(hosts = []) {
      const seen = new Set()
      return hosts.filter(host => {
        const key = `${host.zid || ''}_${host.hostid}`
        if (seen.has(key)) {
          return false
        }
        seen.add(key)
        return true
      })
    },
    rebuildIndexedStore(store, removedIndex) {
      const rebuilt = {}
      Object.keys(store || {}).forEach((key) => {
        const numericKey = Number(key)
        if (Number.isNaN(numericKey) || numericKey === removedIndex) {
          return
        }
        const nextIndex = numericKey > removedIndex ? numericKey - 1 : numericKey
        rebuilt[nextIndex] = store[key]
      })
      return rebuilt
    },
    resetSingleConfigState(index) {
      this.$set(this.formData.hostConfigs[index], 'host_id', '')
      this.$set(this.formData.hostConfigs[index], 'item_ids', [])
      this.$set(this.curItemsList, index, [])
      this.$set(this.itemsFilterList, index, [])
    },
    resetBulkConfigState(index) {
      const config = this.formData.hostConfigs[index]
      this.$set(config, 'group_ids', [])
      this.$set(config, 'tag_filters', [createTagFilter()])
      this.$set(config, 'matched_hosts', [])
      this.$set(config, 'reference_host_id', undefined)
      this.$set(config, 'reference_item_ids', [])
      this.$set(this.bulkReferenceItemsList, index, [])
    },
    async fetchHostGroupsForConfig(zid, index) {
      if (!zid) {
        this.$set(this.configHostGroupsList, index, [])
        return
      }
      try {
        const resp = await hostgroupList(zid)
        if (resp.data.code === 200) {
          this.$set(this.configHostGroupsList, index, resp.data.data || [])
        }
      } catch (err) {
        console.error(this.$t('load_host_groups_failed'), err)
        this.$message.error(this.$t('load_host_groups_failed'))
      }
    },
    async fetchItemsByHost(zid, hostId) {
      const cacheKey = this.getItemsCacheKey(zid, hostId)
      if (this.ItemsList[cacheKey]) {
        return this.ItemsList[cacheKey]
      }
      const resp = await itemList({ hostid: hostId, zid })
      const res = resp.data
      if (res.code !== 200) {
        throw new Error(res.message || 'load items failed')
      }
      const items = (res.data && res.data.items) ? res.data.items : []
      this.$set(this.ItemsList, cacheKey, items)
      return items
    },
    handleInstanceChange(value, index) {
      const config = this.formData.hostConfigs[index]
      this.$set(config, 'zid', value)
      this.resetSingleConfigState(index)
      this.resetBulkConfigState(index)
      this.fetchHostGroupsForConfig(value, index)

      if (!value) {
        this.$set(this.configHostsList, index, [])
        this.$set(this.configHostsFilterList, index, [])
        return
      }

      hostList({
        page: 1,
        limit: 10000,
        zid: value
      }).then((resp) => {
        const res = resp.data
        if (res.code == 200) {
          const hosts = res.data.items || []
          this.$set(this.configHostsFilterList, index, hosts)
          this.$set(this.configHostsList, index, hosts.slice(0, selectSize))
        }
      }).catch(err => {
        console.error(this.$t('load_hosts_failed'), err)
        this.$message.error(this.$t('load_hosts_failed'))
      })
    },
    handleSelectionModeChange(value, index) {
      const config = this.formData.hostConfigs[index]
      this.$set(config, 'selection_mode', value)
      this.resetSingleConfigState(index)
      this.resetBulkConfigState(index)
      if (config.zid && this.isBulkSelectionMode(value)) {
        this.fetchHostGroupsForConfig(config.zid, index)
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
          const items = (res.data.items || []).map((item) => this.mergePendingReportStatus(item))
          this.pagination.total = res.data.total
          this.pagination.current = this.page
          this.pagination.pageSize = this.pageSize
          this.list = items
        }
      }).finally(() => { this.loading = false })
    },
    showModal(value, options = {}) {
      this.repid = value
      this.reportid = value.id
      this.visible = true
      if (options.pendingLog) {
        this.pendingTaskLog = options.pendingLog
        this.malist = [options.pendingLog]
        this.mapagination.total = 1
      } else {
        this.pendingTaskLog = null
      }
      this.fetchTaskLogs()
      this.startLogPolling()
    },
    handleCancel() {
      this.visible = false;
      this.pendingTaskLog = null
      this.stopLogPolling()
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
      this.fetchTaskLogs()
    },
    fetchTaskLogs() {
      if (!this.reportid) {
        return Promise.resolve()
      }
      this.loading1 = true
      return taskLogList({ page: this.mapage, limit: this.mapageSize, report_id: this.reportid }).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          const items = res.data.items || []
          this.mapagination.total = res.data.total
          this.mapagination.current = this.mapage
          this.mapagination.pageSize = this.mapageSize
          if (items.length > 0) {
            this.malist = items
            this.pendingTaskLog = null
            this.clearPendingReportStatus(this.reportid)
          } else if (this.pendingTaskLog) {
            this.malist = [this.pendingTaskLog]
            this.mapagination.total = 1
          } else {
            this.malist = []
          }
          if (!this.hasRunningTaskLogs() && !this.pendingTaskLog) {
            this.stopLogPolling()
          }
        }
      }).finally(() => {
        this.loading1 = false
      })
    },
    hasRunningTaskLogs() {
      return (this.malist || []).some(item => item.status == 1)
    },
    startLogPolling() {
      this.stopLogPolling()
      this.logPollingTimer = setInterval(() => {
        if (!this.visible) {
          this.stopLogPolling()
          return
        }
        this.fetchTaskLogs()
        this.init()
      }, 3000)
    },
    stopLogPolling() {
      if (this.logPollingTimer) {
        clearInterval(this.logPollingTimer)
        this.logPollingTimer = null
      }
    },
    getTaskProgressStatus(record) {
      if (record.status == 3) {
        return 'exception'
      }
      if (record.status == 2) {
        return 'success'
      }
      return 'active'
    },
    mergePendingReportStatus(record) {
      const pendingStartedAt = this.pendingReportStatusMap[record.id]
      if (!pendingStartedAt) {
        return record
      }
      if (Date.now() - pendingStartedAt > 15000) {
        this.clearPendingReportStatus(record.id)
        return record
      }
      if (String(record.exec_status) === '0') {
        return {
          ...record,
          exec_status: '1'
        }
      }
      if (String(record.exec_status) !== '1') {
        this.clearPendingReportStatus(record.id)
      }
      return record
    },
    setPendingReportStatus(reportId) {
      this.$set(this.pendingReportStatusMap, reportId, Date.now())
    },
    clearPendingReportStatus(reportId) {
      if (Object.prototype.hasOwnProperty.call(this.pendingReportStatusMap, reportId)) {
        this.$delete(this.pendingReportStatusMap, reportId)
      }
    },
    buildPendingTaskLog(record, taskLogId) {
      return {
        id: taskLogId || `pending-${record.id}-${Date.now()}`,
        report_id: record.id,
        name: record.name,
        cycle: record.report_mode === 'realtime' ? 'realtime' : '',
        status: 1,
        progress: 0,
        start_time: new Date().toISOString(),
        end_time: '',
        total_time: 0,
        result: this.$t('exec_status_processing'),
        files: ''
      }
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
      this.formData = {
        name: '',
        reportMode: 'realtime', // Default to realtime report
        hostConfigs: [this.createDefaultHostConfig()],
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
      this.configHostGroupsList = {}
      this.bulkReferenceItemsList = {}
      if (this.$refs.formModal) {
        this.$refs.formModal.resetFields()
      }

      const defaultZid = this.formData.hostConfigs[0].zid
      if (defaultZid) {
        this.handleInstanceChange(defaultZid, 0)
      }
    },
    loadFormData(id) {
      this.formModalLoading = true
      this.formData = {
        name: '',
        reportMode: 'realtime',
        hostConfigs: [this.createDefaultHostConfig()],
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
      this.configHostGroupsList = {}
      this.bulkReferenceItemsList = {}
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
            this.formData.reportMode = reportData.report_mode || 'scheduled' // Default to scheduled report
            
            // Load time (use start and end fields, not start_at and end_at)
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
            
            // Parse host_ids and item_ids
            if (reportData.host_ids) {
              try {
                const hostConfigs = JSON.parse(reportData.host_ids)
                if (Array.isArray(hostConfigs) && hostConfigs.length > 0) {
                  const hasRawBulkConfig = hostConfigs.some(config => config.selection_mode)
                  this.formData.hostConfigs = hostConfigs.map((config) => ({
                    selection_mode: hasRawBulkConfig ? (config.selection_mode || 'single') : 'single',
                    zid: config.zid ? Number(config.zid) : undefined,
                    host_id: config.host_id ? String(config.host_id) : '',
                    item_ids: (config.item_ids || []).map(id => String(id)),
                    group_ids: (config.group_ids || []).map(id => String(id)),
                    tag_filters: (config.tag_filters && config.tag_filters.length)
                      ? config.tag_filters.map(tagFilter => ({
                        tag: tagFilter.tag || '',
                        value: tagFilter.value || ''
                      }))
                      : [createTagFilter()],
                    matched_hosts: config.matched_hosts || [],
                    reference_host_id: config.reference_host_id ? String(config.reference_host_id) : undefined,
                    reference_item_ids: (config.reference_item_ids || []).map(id => String(id))
                  }))
                  
                  // Load corresponding host list and items for each config
                  this.formData.hostConfigs.forEach((config, index) => {
                    if (config.zid) {
                      this.fetchHostGroupsForConfig(config.zid, index)
                      // Load host list for this instance
                      let params = {
                        page: 1,
                        limit: 10000,
                        zid: config.zid
                      }
                      hostList(params).then((resp) => {
                        let res = resp.data
                        if (res.code == 200) {
                          const hosts = res.data.items || []
                          this.$set(this.configHostsFilterList, index, hosts)
                          this.$set(this.configHostsList, index, hosts.slice(0, selectSize))
                          
                          // If host is already selected, load items
                          if (config.host_id) {
                            this.handleHostChange(config, index)
                          }
                        }
                      })

                      if (this.isBulkSelectionMode(config.selection_mode)) {
                        if ((!config.matched_hosts || !config.matched_hosts.length) && config.reference_host_id) {
                          this.loadBulkHostsForConfig(index, { preserveSelection: true })
                        }
                        if (config.reference_host_id) {
                          this.fetchItemsByHost(config.zid, config.reference_host_id).then((items) => {
                            this.$set(this.bulkReferenceItemsList, index, items)
                          })
                        }
                      }
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
        if (!valid) {
          this.$message.error(this.$t('form_validation_error'))
          return false
        }
        
        // 额外的时间验证（实时报表）
        if (this.formData.reportMode === 'realtime') {
          if (!this.formData.startTime) {
            this.$message.error(this.$t('select_start_time'))
            return false
          }
          if (!this.formData.endTime) {
            this.$message.error(this.$t('select_end_time'))
            return false
          }
          
          const startTime = this.formData.startTime.valueOf()
          const endTime = this.formData.endTime.valueOf()
          
          if (startTime >= endTime) {
            this.$message.error(this.$t('start_time_before_end_time'))
            return false
          }
        }

        this.formModalLoading = true
        if (this.hasBulkSelectionConfig()) {
          this.submitRawConfigs()
            .catch((error) => {
              if (error) {
                const message = error.message || error
                if (message) {
                  this.$message.error(message)
                }
              }
            })
            .finally(() => {
              this.formModalLoading = false
            })
          return
        }

        this.buildExpandedHostConfigs()
          .then(({ expandedConfigs, missingSummaries }) => {
            if (!expandedConfigs.length) {
              throw new Error(this.$t('message_host_config'))
            }
            const proceedSave = () => this.submitExpandedConfigs(expandedConfigs)
            if (missingSummaries.length) {
              const preview = missingSummaries
                .slice(0, 5)
                .map(summary => this.$t('bulk_mapping_missing_preview', { host: summary.host, count: summary.count }))
                .join('；')
              this.formModalLoading = false
              this.$confirm({
                title: this.$t('bulk_mapping_warning_title'),
                content: `${this.$t('bulk_mapping_warning_content')} ${preview}`,
                onOk: () => {
                  this.formModalLoading = true
                  return proceedSave().finally(() => {
                    this.formModalLoading = false
                  })
                }
              })
              return
            }
            return proceedSave()
          })
          .catch((error) => {
            if (error) {
              const message = error.message || error
              if (message) {
                this.$message.error(message)
              }
            }
          })
          .finally(() => {
            this.formModalLoading = false
          })
      })
    },
    hasBulkSelectionConfig() {
      return (this.formData.hostConfigs || []).some(config => this.isBulkSelectionMode(config.selection_mode))
    },
    buildRawHostConfigs() {
      return (this.formData.hostConfigs || []).map((config) => ({
        selection_mode: config.selection_mode || 'single',
        zid: config.zid ? String(config.zid) : '',
        host_id: config.host_id ? String(config.host_id) : '',
        item_ids: (config.item_ids || []).map(id => String(id)),
        group_ids: (config.group_ids || []).map(id => String(id)),
        tag_filters: this.normalizeTagFilters(config.tag_filters),
        reference_host_id: config.reference_host_id ? String(config.reference_host_id) : '',
        reference_item_ids: (config.reference_item_ids || []).map(id => String(id))
      }))
    },
    async submitRawConfigs() {
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
        host_ids: JSON.stringify(this.buildRawHostConfigs()),
        item_ids: '',
        cycle: this.formData.reportMode === 'scheduled' ? this.formData.cycle.join(',') : '',
        status: this.formData.reportMode === 'scheduled' ? (this.formData.status ? '1' : '0') : '1',
        emails: this.formData.emails,
        desc: this.formData.desc,
        start: startTimeStr,
        end: endTimeStr
      }

      const promise = this.isEditMode
        ? reportPut(this.editId, params)
        : reportAdd(params)

      const resp = await promise
      const res = resp.data
      if (res.code == 200) {
        this.$message.success(this.$t(this.isEditMode ? 'bulk_task_saved_async' : 'bulk_task_created_async'))
        this.formModalVisible = false
        this.init()
        return
      }
      throw new Error(res.message || this.$t('form_validation_error'))
    },
    async submitExpandedConfigs(expandedConfigs) {
      const hostIds = JSON.stringify(expandedConfigs.map(config => ({
        host_id: config.host_id,
        item_ids: config.item_ids,
        zid: config.zid
      })))
      const itemIds = JSON.stringify(expandedConfigs.flatMap(config => config.item_ids))

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
        cycle: this.formData.reportMode === 'scheduled' ? this.formData.cycle.join(',') : '',
        status: this.formData.reportMode === 'scheduled' ? (this.formData.status ? '1' : '0') : '1',
        emails: this.formData.emails,
        desc: this.formData.desc,
        start: startTimeStr,
        end: endTimeStr
      }

      const promise = this.isEditMode
        ? reportPut(this.editId, params)
        : reportAdd(params)

      const resp = await promise
      const res = resp.data
      if (res.code == 200) {
        this.$message.success(this.isEditMode ? this.$t('message_task_edited') : this.$t('message_task_added'))
        this.formModalVisible = false
        this.init()
        return
      }
      throw new Error(res.message || this.$t('form_validation_error'))
    },
    async buildExpandedHostConfigs() {
      const expandedConfigs = []
      const missingSummaries = []

      for (let index = 0; index < this.formData.hostConfigs.length; index += 1) {
        const config = this.formData.hostConfigs[index]
        if (config.selection_mode === 'single') {
          expandedConfigs.push({
            host_id: config.host_id,
            item_ids: config.item_ids.map(id => String(id)),
            zid: config.zid
          })
          continue
        }

        const referenceItems = (this.bulkReferenceItemsList[index] || []).filter(item =>
          (config.reference_item_ids || []).includes(String(item.itemid))
        )
        if (!referenceItems.length) {
          throw new Error(this.$t('message_reference_items_required'))
        }

        const matchedHosts = config.matched_hosts || []
        for (const host of matchedHosts) {
          const targetItems = await this.fetchItemsByHost(config.zid, host.hostid)
          const itemMapByKey = targetItems.reduce((accumulator, item) => {
            accumulator[item.key_] = String(item.itemid)
            return accumulator
          }, {})

          const matchedItemIDs = []
          const missingKeys = []
          referenceItems.forEach((item) => {
            const itemKey = item.key_
            if (itemMapByKey[itemKey]) {
              matchedItemIDs.push(itemMapByKey[itemKey])
            } else {
              missingKeys.push(itemKey)
            }
          })

          if (matchedItemIDs.length > 0) {
            expandedConfigs.push({
              host_id: String(host.hostid),
              item_ids: matchedItemIDs,
              zid: config.zid
            })
          }

          if (missingKeys.length > 0) {
            missingSummaries.push({
              host: host.name,
              count: missingKeys.length,
              keys: missingKeys
            })
          }
        }
      }

      return { expandedConfigs, missingSummaries }
    },
    handleFormCancel() {
      this.formModalVisible = false
      this.resetFormData()
    },
    handleReportModeChange() {
      // Clear related fields when switching report mode
      if (this.formData.reportMode === 'realtime') {
        // Realtime report: clear cycle and status
        this.formData.cycle = []
        this.formData.status = true
      } else {
        // Scheduled report: clear start and end time
        this.formData.startTime = null
        this.formData.endTime = null
        if (this.formData.cycle.length === 0) {
          this.formData.cycle = ['day'] // Default to daily
        }
      }
      // Re-validate form
      if (this.$refs.formModal) {
        this.$refs.formModal.validate()
      }
    },
    handleStartTimeChange() {
      // Validate both start and end time when start time changes
      this.$nextTick(() => {
        if (this.$refs.formModal) {
          this.$refs.formModal.validateField('startTime')
          if (this.formData.endTime) {
            this.$refs.formModal.validateField('endTime')
          }
        }
      })
    },
    handleEndTimeChange() {
      // Validate both start and end time when end time changes
      this.$nextTick(() => {
        if (this.$refs.formModal) {
          this.$refs.formModal.validateField('endTime')
          if (this.formData.startTime) {
            this.$refs.formModal.validateField('startTime')
          }
        }
      })
    },
    async loadBulkHostsForConfig(index, options = {}) {
      const config = this.formData.hostConfigs[index]
      if (!config.zid) {
        this.$message.warning(this.$t('select_instance_first'))
        return
      }

      try {
        let matchedHosts = []
        if (config.selection_mode === 'host_group') {
          if (!config.group_ids || config.group_ids.length === 0) {
            this.$message.warning(this.$t('message_group_required'))
            return
          }
          const responses = await Promise.all(config.group_ids.map(async (groupId) => {
            try {
              return await hostgroupHosts(groupId, config.zid)
            } catch (error) {
              const status = error && (error.status || (error.data && error.data.code))
              if (status === 404) {
                return hostgroupHostsLegacy(groupId, config.zid)
              }
              throw error
            }
          }))
          matchedHosts = responses.flatMap(resp => ((resp.data.data || {}).items || []))
        } else if (config.selection_mode === 'tag') {
          const tagFilters = this.normalizeTagFilters(config.tag_filters)
          if (!tagFilters.length) {
            this.$message.warning(this.$t('message_tag_required'))
            return
          }
          const resp = await hostFilterByTag({
            zid: config.zid,
            tags: JSON.stringify(tagFilters)
          })
          matchedHosts = ((resp.data.data || {}).items || [])
        }

        this.$set(config, 'matched_hosts', this.dedupeHosts(matchedHosts))
        if (!options.preserveSelection) {
          this.$set(config, 'reference_host_id', undefined)
          this.$set(config, 'reference_item_ids', [])
          this.$set(this.bulkReferenceItemsList, index, [])
        }
      } catch (err) {
        console.error(this.$t('load_bulk_hosts_failed'), err)
        this.$message.error(this.$t('load_bulk_hosts_failed'))
      }
    },
    handleHostChange(config, index) {
      if (!config.host_id) {
        this.$set(this.curItemsList, index, [])
        return
      }
      
      if (!config.zid) {
        this.$message.warning(this.$t('select_instance_first'))
        return
      }
      
      let params = {
        hostid: config.host_id,
        zid: config.zid
      }
      itemList(params).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          const cacheKey = this.getItemsCacheKey(config.zid, config.host_id)
          this.$set(this.ItemsList, cacheKey, res.data.items)
          this.$set(this.itemsFilterList, index, res.data.items)
          this.$set(this.curItemsList, index, res.data.items.slice(0, selectSize))
          
          // Ensure item_ids type matches itemid type in items list (convert to string)
          if (config.item_ids && Array.isArray(config.item_ids) && config.item_ids.length > 0) {
            const items = res.data.items || []
            // Convert item_ids to strings and filter valid item_ids
            const validItemIds = config.item_ids.map(id => String(id)).filter(id => {
              return items.some(item => String(item.itemid) === id)
            })
            // Update item_ids with valid item_ids (ensure type consistency)
            this.$set(config, 'item_ids', validItemIds)
          }
        }
      })
    },
    async handleReferenceHostChange(config, index) {
      if (!config.reference_host_id || !config.zid) {
        this.$set(this.bulkReferenceItemsList, index, [])
        return
      }

      try {
        const items = await this.fetchItemsByHost(config.zid, config.reference_host_id)
        this.$set(this.bulkReferenceItemsList, index, items)
        this.$set(config, 'reference_item_ids', [])
      } catch (err) {
        console.error(this.$t('load_hosts_failed'), err)
        this.$message.error(this.$t('load_hosts_failed'))
      }
    },
    addTagFilter(index) {
      const config = this.formData.hostConfigs[index]
      config.tag_filters.push(createTagFilter())
    },
    removeTagFilter(index, tagIndex) {
      const config = this.formData.hostConfigs[index]
      if (config.tag_filters.length <= 1) {
        return
      }
      config.tag_filters.splice(tagIndex, 1)
    },
    addHostConfig() {
      const newIndex = this.formData.hostConfigs.length
      const newConfig = this.createDefaultHostConfig()
      this.formData.hostConfigs.push(newConfig)
      this.$set(this.configHostsList, newIndex, [])
      this.$set(this.configHostsFilterList, newIndex, [])
      this.$set(this.curItemsList, newIndex, [])
      this.$set(this.configHostGroupsList, newIndex, [])
      this.$set(this.bulkReferenceItemsList, newIndex, [])

      if (newConfig.zid) {
        this.handleInstanceChange(newConfig.zid, newIndex)
      }
    },
    removeHostConfig(index) {
      this.formData.hostConfigs.splice(index, 1)
      this.curItemsList = this.rebuildIndexedStore(this.curItemsList, index)
      this.configHostsList = this.rebuildIndexedStore(this.configHostsList, index)
      this.configHostsFilterList = this.rebuildIndexedStore(this.configHostsFilterList, index)
      this.itemsFilterList = this.rebuildIndexedStore(this.itemsFilterList, index)
      this.configHostGroupsList = this.rebuildIndexedStore(this.configHostGroupsList, index)
      this.bulkReferenceItemsList = this.rebuildIndexedStore(this.bulkReferenceItemsList, index)
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
      // If no search value, restore full list
      if (!value || value.trim() === '') {
        const allHosts = this.configHostsFilterList[index] || []
        this.$set(this.configHostsList, index, allHosts.slice(0, selectSize))
        return
      }
      // Filter from full list
      const allHosts = this.configHostsFilterList[index] || []
      const filtered = allHosts.filter((item) => {
        const reg = new RegExp(value, 'gi')
        const match = item.name.toString().match(reg)
        return match
      })
      // Update display list to first selectSize items after filtering
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
      const allItems = this.ItemsList[this.getItemsCacheKey(hostConfig.zid, hostConfig.host_id)] || []
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
          this.setPendingReportStatus(record.id)
          this.$set(record, 'exec_status', 1)
          this.$message.success(this.$t('report_execute_success'))
          this.init()
          setTimeout(() => {
            this.init()
          }, 600)
        }
      }).finally(() => {
        this.loading = false
      })
    },
  },
}
</script>
<style lang="less" scoped>
.tuopu_bg {
  width: 708px;
}

.host-config-card {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.bulk-action-button,
.host-config-delete-button {
  width: 100%;
}
</style>
