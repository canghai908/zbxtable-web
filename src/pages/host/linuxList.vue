<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item :label="$t('label_hostname')">
        <a-input v-model.trim="hosts" :placeholder="$t('label_hostname')" />
      </a-form-model-item>
      <a-form-model-item :label="$t('label_ip')">
        <a-input v-model.trim="interfaces" :placeholder="$t('label_ip')" />
      </a-form-model-item>
      <a-form-model-item :label="$t('label_collection_status')">
        <a-select style="width: 120px" v-model.trim="available">
          <a-select-option :value="item.value" v-for="item in availableOption" :key="item.value">{{item.label}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">{{ $t('btn_query') }}</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">{{ $t('btn_reset') }}</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="hostexport">{{ $t('btn_export') }}</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.hostid;}">
        <span slot="hostid" slot-scope="record">{{record.hostid}}</span>
        <div slot="name" slot-scope="record">{{record.name}}</div>
        <div slot="instance_name" slot-scope="record">
          <a-tag :color="$themeColor">{{record.instance_name || $t('tag_unknown')}}</a-tag>
        </div>
        <div slot="os" slot-scope="record">{{record.os}}</div>
        <div slot="interfaces" slot-scope="record">{{record.interfaces}}</div>
        <span slot="uptime" slot-scope="record">{{record.uptime||'--'}}</span>
        <div slot="cpu_utilization" slot-scope="record">
          <a-progress :percent="parseFloat(record.cpu_utilization || 0)" size="small" status="active" />
        </div>
        <div slot="memory_utilization" slot-scope="record">
          <a-progress :percent="parseFloat(record.memory_utilization || 0)" size="small" status="active" />
        </div>
        <div slot="ping" slot-scope="record">
          <a-tag v-if="record.ping.includes('Up')" color="#34af67">Up</a-tag>
          <a-tag v-else-if="record.ping.includes('Down')" color="#DC143C">Down</a-tag>
          <a-tag v-else status="default" color="#808080">Unknown</a-tag>
          {{record.ping_sec.replace(/\s/g, '') || '--'}}/{{record.ping_loss.replace(/\s/g, '') || '--'}}
        </div>
        <span slot="available" slot-scope="record">
          <a-tooltip>
            <template slot="title">
              {{record.error}}
            </template>
            <a-tag v-if="record.available == 1" color="#34af67">{{ $t('status_normal') }}</a-tag>
            <a-tag v-else-if="record.available ==2" color="#DC143C">{{ $t('status_abnormal') }}</a-tag>
            <a-tag v-else status="default" :text="$t('status_unknown')" />
          </a-tooltip>
        </span>
        <span slot="operation" slot-scope="record">
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeGraph(record)">{{ $t('btn_view_graph') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeDetail(record)">{{ $t('btn_view_detail') }}</a-button>
        </span>
      </a-table>
      <a-modal :visible="visible" width="1400px" :title="$t('modal_title_graph')" @ok="handleCancel" @cancel="handleCancel">
        <a-row>
          <a-col>
            <a-form-model class="time-select" layout="inline" style=" display: flex; justify-content: center; align-items: center; width: 80%; height: 10%; margin: 0 auto;" :colon='false'>
              <a-form-model-item :label="$t('label_time')">
                <a-range-picker format="YYYY-MM-DD HH:mm:ss" :show-time="{ format: 'HH:mm', defaultValue:[moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')]}" v-model="timeValue"
                  @change="changeCreationTime" :getCalendarContainer="triggerNode=>{return triggerNode.parentNode || document.body}" />
              </a-form-model-item>
              <a-form-model-item>
                <a-button :style="{ marginRight: '10px' }" type="primary" @click="Query">{{ $t('btn_query') }}</a-button>
                <a-button @click="restDate">{{ $t('btn_reset') }}</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-col>
        </a-row>
        <a-row>
          <a-col>
            <div class="png-data-container">
              <div v-if="sortedPngData && sortedPngData.length > 0">
                <div v-for="item in sortedPngData" :key="item.name" class="png-data-item">
                  <h3 style="">{{ item.name }}</h3>
                  <div class="png-container">
                    <img :src="`data:image/png;base64,${item.png}`" :alt="item.name" />
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <a-empty :description="$t('empty_graph_data')" />
              </div>
            </div>
          </a-col>
        </a-row>
      </a-modal>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { hostList, hostExport, hostGraph } from '@/services/admin'
import moment from 'moment'
import { parseTimeFun } from '@/utils/formatter'
import echarts from 'echarts'
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
require('echarts-liquidfill')
export default {
  i18n: require('./i18n'),
  name: 'LinuxList',
  components: {
    PageLayout
  },
  data() {
    return {
      moment,
      page: 1,
      pageSize: 10,
      hosts: '',
      ip: '',
      available: '',
      interfaces: '',
      hosttype: 'VM_LIN',
      loading: false,
      visible: false,
      timeValue: '',
      beginTime: '',
      endTime: '',
      availableOption: [],
      columns: [],
      list: [],
      pngData: [],
      sortedPngData: [],
      pagination: {
        total: 0,
        current: 1,
        'show-quick-jumper': true,
        'page-size-options': ['10', '20', '30', '40', '50', '100', '200'],
        pageSize: 10,
        'show-size-changer': true,
        'show-total': (total) => this.$t('pagination_total', { total })
      }
    }
  },
  created() {
    this.initOptions()
    this.initColumns()
    this.dates = new Date().getTime()
    let ntime = new Date(),
      qtime = new Date(new Date().getTime() - 2 * 60 * 60 * 1000)
    this.beginTime = parseTimeFun(qtime)
    this.endTime = parseTimeFun(ntime)
    this.timeValue = [
      moment(qtime, 'YYYY-MM-DD HH:mm:ss'),
      moment(ntime, 'YYYY-MM-DD HH:mm:ss')
    ]
    this.init()
  },
  methods: {
    initOptions() {
      this.availableOption = [
        { label: this.$t('status_normal'), value: '1' },
        { label: this.$t('status_abnormal'), value: '2' }
      ]
    },
    initColumns() {
      this.columns = [
        {
          title: this.$t('col_hostid'),
          key: 'hostid',
          align: 'left',
          scopedSlots: { customRender: 'hostid' }
        },
        {
          title: this.$t('col_hostname'),
          key: 'name',
          align: 'left',
          scopedSlots: { customRender: 'name' }
        },
        {
          title: this.$t('col_instance'),
          key: 'instance_name',
          align: 'left',
          width: 120,
          scopedSlots: { customRender: 'instance_name' }
        },
        {
          title: this.$t('col_ip_address'),
          key: 'interfaces',
          align: 'left',
          scopedSlots: { customRender: 'interfaces' }
        },
        {
          title: this.$t('col_kernel_version'),
          key: 'os',
          align: 'left',
          scopedSlots: { customRender: 'os' }
        },
        {
          title: this.$t('col_uptime'),
          key: 'uptime',
          align: 'left',
          scopedSlots: { customRender: 'uptime' }
        },
        {
          title: this.$t('col_cpu_usage'),
          key: 'cpu_utilization',
          align: 'left',
          width: '150px',
          scopedSlots: { customRender: 'cpu_utilization' }
        },
        {
          title: this.$t('col_memory_usage'),
          key: 'memory_utilization',
          align: 'left',
          width: '150px',
          scopedSlots: { customRender: 'memory_utilization' }
        },
        {
          title: this.$t('col_ping'),
          key: 'ping',
          align: 'left',
          scopedSlots: { customRender: 'ping' }
        },
        {
          title: this.$t('col_collection_status'),
          key: 'available',
          align: 'left',
          scopedSlots: { customRender: 'available' }
        },
        {
          title: this.$t('col_operation'),
          key: 'operation',
          align: 'center',
          scopedSlots: { customRender: 'operation' }
        }
      ]
    },
    init() {
      this.loading = true
      hostList({
        page: this.page,
        limit: this.pageSize,
        hosttype: this.hosttype,
        hosts: this.hosts,
        ip: this.interfaces,
        available: this.available
      })
        .then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            this.pagination.total = res.data.total
            this.pagination.current = this.page
            this.pagination.pageSize = this.pageSize
            this.list = res.data.items || []
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    changeCreationTime(e) {
      if (e.length) {
        this.beginTime = parseTimeFun(new Date(e[0]))
        this.endTime = parseTimeFun(new Date(e[1]))
      } else {
        this.beginTime = ''
        this.endTime = ''
      }
    },
    restDate() {
      let ntime = new Date(),
        qtime = new Date(new Date().getTime() - 2 * 60 * 60 * 1000)
      this.beginTime = parseTimeFun(qtime)
      this.endTime = parseTimeFun(ntime)
      this.timeValue = [
        moment(qtime, 'YYYY-MM-DD HH:mm:ss'),
        moment(ntime, 'YYYY-MM-DD HH:mm:ss')
      ]
    },
    changePage(e) {
      // 切换页码
      this.page = e.current
      this.pageSize = e.pageSize
      this.init()
    },
    hostexport() {
      hostExport(
        {
          hosttype: this.hosttype,
          hosts: this.hosts,
          ip: this.interfaces,
          available: this.available
        },
        {
          responseType: 'arraybuffer'
        }
      ).then((resp) => {
        let filename = resp.headers['content-disposition']
          .split(';')
          .find((n) => n.includes('filename='))
          .replace('filename=', '')
          .trim()
        const url = window.URL.createObjectURL(new Blob([resp.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
      })
    },
    seeDetail(v) {
      this.$router.push('/host/lindetail?id=' + v.hostid + '&zid=' + v.zid + '&type=1')
    },
    seeGraph(v) {
      hostGraph(v.hostid, {
        start: this.beginTime,
        end: this.endTime
      }).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.hostid = v.hostid
          this.pngData = res.data.items
          this.sortPngData()
          this.visible = true
        } else if (res.code == 403) {
          // 密码没有配置，显示错误提示
          this.$message.error(res.message || this.$t('msg_password_not_configured'))
        } else {
          // 其他错误
          this.$message.error(res.message || this.$t('msg_get_graph_failed'))
        }
      }).catch((error) => {
        // 处理请求异常
        this.$message.error(this.$t('msg_request_failed'))
      })
      // this.$router.push("/host/lindetail?id=" + v.hostid + "&type=2");
      // this.visible = true
    },
    Query() {
      hostGraph(this.hostid, {
        start: this.beginTime,
        end: this.endTime
      }).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.pngData = res.data.items
          this.sortPngData()
        } else if (res.code == 403) {
          // 密码没有配置，显示错误提示
          this.$message.error(res.message || this.$t('msg_password_not_configured'))
          this.pngData = []
          this.sortPngData()
        } else {
          // 其他错误
          this.$message.error(res.message || this.$t('msg_get_graph_failed'))
          this.pngData = []
          this.sortPngData()
        }
      }).catch((error) => {
        // 处理请求异常
        this.$message.error(this.$t('msg_request_failed'))
        this.pngData = []
        this.sortPngData()
      })
    },
    sortPngData() {
      this.sortedPngData = [...this.pngData].sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
    },
    handleCancel() {
      this.visible = false
    },
    resetData() {
      if (this.hosts || this.interfaces || this.available) {
        this.hosts = ''
        this.interfaces = ''
        this.available = ''
        this.init()
      }
    },
    restDate() {
      let ntime = new Date(),
        qtime = new Date(new Date().getTime() - 2 * 60 * 60 * 1000)
      this.beginTime = parseTimeFun(qtime)
      this.endTime = parseTimeFun(ntime)
      this.timeValue = [
        moment(qtime, 'YYYY-MM-DD HH:mm:ss'),
        moment(ntime, 'YYYY-MM-DD HH:mm:ss')
      ]
    },
    changeCreationTime(e) {
      if (e.length) {
        this.beginTime = parseTimeFun(new Date(e[0]))
        this.endTime = parseTimeFun(new Date(e[1]))
      } else {
        this.beginTime = ''
        this.endTime = ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 48px;
}
.new-btn {
  border-radius: 2px;
  width: 100%;
  height: 187px;
}
.home-search {
  margin-bottom: 10px;
}
.time-select {
  margin-top: 10px;
  //水平居中

  display: flex;
}
.meta-content {
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  height: 64px;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.linux-list {
  /deep/ .ant-progress-bg {
    height: 14px !important;
  }
  /deep/ .ant-progress-text {
    margin-left: 2px;
  }
}
.png-data-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.png-data-item {
  text-align: center;
  margin: 20px;
}

.png-container {
  display: flex;
  justify-content: center;
}
</style>
