<template>
  <page-layout :noTitle="true">
    <!-- <div class="tuopu" :style="`height: ${minHeight}px;`">
      <iframe src="https://dl.cactifans.com/pia/1.html" frameborder="0" style="width: 100%;border:none;height: 100%;"></iframe>
    </div> -->
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item :label="$t('task')">
        <a-input v-model.trim="name" :placeholder="$t('task')" />
      </a-form-model-item>
      <!-- <a-form-model-item :label="$t('status')"> -->
      <!-- <a-input v-model.trim="status" :placeholder="$t('task')" /> -->
      <!-- <a-select v-model.trim="form.status" style="width: px" @change="handleChange">
          <a-select-option value="2">
            :label="$t('success')"
          </a-select-option>
          <a-select-option value="3">
            error
          </a-select-option>
        </a-select> -->
      <!-- </a-form-model-item>
      <a-form-model-item :label="$t('status')">
        <a-input v-model.trim="exec_status" :placeholder="$t('task_name')" />
      </a-form-model-item> -->
      <a-form-model-item>
        <a-button type="primary" @click="init">{{ $t('search_btn') }}</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">{{ $t('clear_filter_btn') }}</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="newPage">{{ $t('add_report_btn') }}</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="name" slot-scope="record">{{record.name}}</div>
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
        <div slot="desc" slot-scope="record">{{record.desc}}</div>
        <div slot="operation" slot-scope="record">
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="checknow(record)">{{ $t('generate_report_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-if="record.status==0" @click="deployTopo(record)">{{ $t('enable_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-else @click="deployTopo(record)">{{ $t('disable_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="edit(record)">{{ $t('edit_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="showModal(record)">{{ $t('report_log_btn') }}</a-button>
          <a-modal :title="$t('label_report_log')" :visible="visible" :confirm-loading="confirmLoading" @ok="handleCancel" @cancel="handleCancel" width="1200px">
            <template>
              <!-- search -->
              <!-- <a-form-model :model="form" class=" home-search" layout="inline" :colon='false'>
    		<a-form-model-item :label="$t('form_labels.type')">
                  <a-select v-mode="form.cycle" style="width: 100px" @change="handleChange">
                    <a-select-option value="day">
                      每天
                    </a-select-option>
                    <a-select-option value="week">
                      每周
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
   		<a-form-model-item :label="$t('state')">
                  <a-select :v-mode="form.status" style="width: 70px" @change="handleChange">
                    <a-select-option value="2">
                      $t('ok')
                    </a-select-option>
                    <a-select-option value="3">
                      report failed
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
                <a-form-model-item>
 		  <a-button type="primary" @click="init">{{ $t('search_btn') }}</a-button>
	          <a-button style="margin-left: 10px;" @click="resetData">{{ $t('clear_filter_btn') }}</a-button>
	          <a-button type="primary" style="margin-left: 10px;" @click="newPage">{{ $t('add_report_btn') }}</a-button>

                  <a-button type="primary" @click="init">Search</a-button>
                  <a-button style="margin-left: 10px;" @click="resetData">Clear filter</a-button>
                  <a-button type="primary" style="margin-left: 10px;" @click="newPage">add report</a-button>
                </a-form-model-item>
              </a-form-model> -->
              <!-- table -->
              <a-table :columns="macolumns" :data-source="malist" :loading="loading1" @change="machangePage" :pagination="mapagination" :rowKey="(record) => { return record.id}">
                <span slot="id" slot-scope="record">{{record.id}}</span>
                <div slot="cycle" slot-scope="record">
                  <div v-if="record.cycle=='day'">{{ $t('cycle_daily') }}</div>
                  <div v-else-if="record.cycle=='week'">{{ $t('cycle_weekly') }}</div>
	          <div v-else>{{ $t('cycle_unknown') }}</div>
                </div>
                <div slot="status" slot-scope="record" style="width: 50px" >
                  <a-badge v-if="record.status == 2" status="success" :text="$t('report_ok')" />
                  <a-badge v-else-if="record.status == 3" status="error" :text="$t('report_fail')" />
      	          <a-badge v-else status="default" :text="$t('cycle_unknown')" />
                </div>

                <div slot="start_time" slot-scope="record">{{record.start_time | dateFormat}}</div>
                <div slot="end_time" slot-scope="record">{{record.end_time | dateFormat}}</div>
                <div slot="result" max slot-scope="record">{{record.result}}</div>
                <div slot="total_time" slot-scope="record">{{record.total_time}}s</div>
                <div slot="files" slot-scope="record"><a :href="download+record.files">{{record.files}}</a>
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
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { reportList, reportDelete, deleteTopology, reportStatusUpdate, taskLogList, taskLogDelete, reportCheckNow } from '@/services/admin'
import moment from 'moment'
export default {
  name: 'tuopu',
  i18n: require('./i18n'),
  components: { PageLayout },
  data() {
    return {
      title: "traffice report",
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
      download: "/download/",
      form: {
        status: '2',
        cycle: 'day',
      },
      columns: [
	{ title: this.$t('title_id'), key: 'id', align: 'left', scopedSlots: { customRender: 'id' } },
	{ title: this.$t('title_name'), key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
	{ title: this.$t('title_status'), key: 'status', align: 'left', scopedSlots: { customRender: 'status' } },
	{ title: this.$t('title_report_status'), key: 'exec_status', align: 'left', scopedSlots: { customRender: 'exec_status' } },
	{ title: this.$t('title_creation_date'), key: 'created_at', align: 'left', scopedSlots: { customRender: 'created_at' } },
	{ title: this.$t('title_last_execution_time'), key: 'start_at', align: 'left', scopedSlots: { customRender: 'start_at' } },
	{ title: this.$t('title_description'), key: 'desc', align: 'left', scopedSlots: { customRender: 'desc' } },
	{ title: this.$t('title_actions'), key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
      ],
      macolumns: [
  	{ title: this.$t('title_id'), key: 'id', align: 'left', scopedSlots: { customRender: 'id' } },
  	{ title: this.$t('title_period'), key: 'cycle', align: 'left', scopedSlots: { customRender: 'cycle' } },
  	{ title: this.$t('title_status'), key: 'status', align: 'left', scopedSlots: { customRender: 'status' } },
  	{ title: this.$t('title_start_time'), key: 'start_time', align: 'left', scopedSlots: { customRender: 'start_time' } },
  	{ title: this.$t('title_finish_time'), key: 'end_time', align: 'left', scopedSlots: { customRender: 'end_time' } },
  	{ title: this.$t('title_result'), key: 'result', width: '240px', align: 'left', scopedSlots: { customRender: 'result' } },
  	{ title: this.$t('title_runtime'), key: 'total_time', align: 'left', scopedSlots: { customRender: 'total_time' } },
  	{ title: this.$t('title_report'), key: 'files', align: 'left', scopedSlots: { customRender: 'files' } },
  	{ title: this.$t('title_actions'), key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }	
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
    this.init()
  },
  filters: {
    dateFormat(dateStr, pattern = "YYYY-MM-DD HH:mm:ss") {
      if (dateStr == "0001-01-01T00:00:00Z") {
        return '--';
      }
      if (dateStr) {
        return moment(dateStr).format(pattern);
      } else {
        return '--';
      }
    }
  },
  methods: {
    init() {
      this.loading = true
      reportList({
        page: this.page, limit: this.pageSize, name: this.name,
        status: this.status, exec_status: this.exec_status
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
    function(value) {
      if ((value / (1024 * 1024 * 1024)) > 10) {
        return (value / (1024 * 1024 * 1024)).toFixed(2) + " Gbps";
      } else if ((value / (1024 * 1024)) > 10) {
        return (value / (1024 * 1024)).toFixed(2) + " Mbps";
      } else if ((value / (1024)) > 10) {
        return (value / (1024)).toFixed(2) + " Kbps";
      } else {
        return value + " bps";
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
      this.$router.push("/report/edit?id=" + record.id)
    },
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
    newPage() {
      this.$router.push("/report/add")
    }
  },
}
</script>
<style lang="less" scoped>
.tuopu_bg {
  width: 708px;
}
</style>
