<template>
  <page-layout :noTitle="true">
    <!-- <div class="tuopu" :style="`height: ${minHeight}px;`">
      <iframe src="https://dl.cactifans.com/pia/1.html" frameborder="0" style="width: 100%;border:none;height: 100%;"></iframe>
    </div> -->
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item label="任务名">
        <a-input v-model.trim="name" placeholder="任务名称" />
      </a-form-model-item>
      <!-- <a-form-model-item label="运行状态"> -->
      <!-- <a-input v-model.trim="status" placeholder="任务名称" /> -->
      <!-- <a-select v-model.trim="form.status" style="width: px" @change="handleChange">
          <a-select-option value="2">
            成功
          </a-select-option>
          <a-select-option value="3">
            失败
          </a-select-option>
        </a-select> -->
      <!-- </a-form-model-item>
      <a-form-model-item label="运行状态">
        <a-input v-model.trim="exec_status" placeholder="任务名称" />
      </a-form-model-item> -->
      <a-form-model-item>
        <a-button type="primary" @click="init">查询</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">重置</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="newPage">添加报表</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="name" slot-scope="record">{{record.name}}</div>
        <div slot="status" slot-scope="record">
          <a-badge v-if="record.status == 1" status="success" text="启用" />
          <a-badge v-else-if="record.status == 0" status="error" text="禁用" />
          <a-badge v-else status="default" text="未知" />
        </div>
        <div slot="exec_status" slot-scope="record">
          <a-badge v-if="record.exec_status == 0" status="default" text="未开始" />
          <a-badge v-else-if="record.exec_status == 1" status="processing" text="运行中" />
          <a-badge v-else-if="record.exec_status == 2" status="success" text="已生成" />
          <a-badge v-else text="未知" />
        </div>
        <div slot="created_at" slot-scope="record">
          {{ record.created_at | dateFormat }}</div>
        <div slot="start_at" slot-scope="record">
          {{ record.start_at | dateFormat }}</div>
        <div slot="desc" slot-scope="record">{{record.desc}}</div>
        <div slot="operation" slot-scope="record">
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="checknow(record)">测试</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-if="record.status==0" @click="deployTopo(record)">启用</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-else @click="deployTopo(record)">禁用</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="edit(record)">编辑</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="showModal(record)">日志</a-button>
          <a-modal title="执行日志" :visible="visible" :confirm-loading="confirmLoading" @ok="handleCancel" @cancel="handleCancel" width="1200px">
            <template>
              <!-- search -->
              <!-- <a-form-model :model="form" class=" home-search" layout="inline" :colon='false'>
                <a-form-model-item label="类型">
                  <a-select v-mode="form.cycle" style="width: 100px" @change="handleChange">
                    <a-select-option value="day">
                      每天
                    </a-select-option>
                    <a-select-option value="week">
                      每周
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
                <a-form-model-item label="状态">
                  <a-select :v-mode="form.status" style="width: px" @change="handleChange">
                    <a-select-option value="2">
                      成功
                    </a-select-option>
                    <a-select-option value="3">
                      失败
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
                <a-form-model-item>
                  <a-button type="primary" @click="init">查询</a-button>
                  <a-button style="margin-left: 10px;" @click="resetData">重置</a-button>
                  <a-button type="primary" style="margin-left: 10px;" @click="newPage">添加报表</a-button>
                </a-form-model-item>
              </a-form-model> -->
              <!-- table -->
              <a-table :columns="macolumns" :data-source="malist" :loading="loading1" @change="machangePage" :pagination="mapagination" :rowKey="(record) => { return record.id}">
                <span slot="id" slot-scope="record">{{record.id}}</span>
                <div slot="cycle" slot-scope="record">
                  <div v-if="record.cycle=='day'">每天</div>
                  <div v-else-if="record.cycle=='week'">每周</div>
                  <div v-else>未知</div>
                </div>
                <div slot="status" slot-scope="record">
                  <a-badge v-if="record.status == 2" status="success" text="成功" />
                  <a-badge v-else-if="record.status == 3" status="error" text="失败" />
                  <a-badge v-else status="default" text="未知" />
                </div>

                <div slot="start_time" slot-scope="record">{{record.start_time | dateFormat}}</div>
                <div slot="end_time" slot-scope="record">{{record.end_time | dateFormat}}</div>
                <div slot="result" max slot-scope="record">{{record.result}}</div>
                <div slot="total_time" slot-scope="record">{{record.total_time}}s</div>
                <div slot="files" slot-scope="record"><a :href="download+record.files">{{record.files}}</a>
                </div>
                <div slot="operation" slot-scope="record">
                  <a-popconfirm title="确定要删除吗?" ok-text="确定" cancel-text="取消" @confirm="maconfirm(record)">
                    <a-button class="paddingleft0" type="link" size="small">删除</a-button>
                  </a-popconfirm>
                </div>
              </a-table>
            </template>
          </a-modal>
          <a-popconfirm title="确定要删除吗?" ok-text="确定" cancel-text="取消" @confirm="confirm(record)">
            <a-button class="paddingleft0" type="link" size="small">删除</a-button>
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
  components: { PageLayout },
  data() {
    return {
      title: "流量报表",
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
        { title: '序号', key: 'id', align: 'left', scopedSlots: { customRender: 'id' } },
        { title: '任务名称', key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: '任务状态', key: 'status', align: 'left', scopedSlots: { customRender: 'status' } },
        { title: '报表状态', key: 'exec_status', align: 'left', scopedSlots: { customRender: 'exec_status' } },
        { title: '添加时间', key: 'created_at', align: 'left', scopedSlots: { customRender: 'created_at' } },
        { title: '最近执行时间', key: 'start_at', align: 'left', scopedSlots: { customRender: 'start_at' } },
        { title: '任务备注', key: 'desc', align: 'left', scopedSlots: { customRender: 'desc' } },
        { title: '操作', key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
      ],
      macolumns: [
        { title: '序号', key: 'id', align: 'left', scopedSlots: { customRender: 'id' } },
        { title: '周期', key: 'cycle', align: 'left', scopedSlots: { customRender: 'cycle' } },
        { title: '状态', key: 'status', align: 'left', scopedSlots: { customRender: 'status' } },
        { title: '开始', key: 'start_time', align: 'left', scopedSlots: { customRender: 'start_time' } },
        { title: '结束', key: 'end_time', align: 'left', scopedSlots: { customRender: 'end_time' } },
        { title: '结果', key: 'result', width: '240px', align: 'left', scopedSlots: { customRender: 'result' } },
        { title: '耗时', key: 'total_time', align: 'left', scopedSlots: { customRender: 'total_time' } },
        { title: '报告', key: 'files', align: 'left', scopedSlots: { customRender: 'files' } },
        { title: '操作', key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
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
