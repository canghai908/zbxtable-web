<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item :label="$t('label_search')">
        <a-input v-model.trim="hosts" :placeholder="$t('label_hostname')" />
      </a-form-model-item>
      <a-form-model-item :label="$t('label_model')">
        <a-input v-model.trim="model" :placeholder="$t('label_model')" />
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
        <div slot="model" slot-scope="record">{{record.model}}</div>
        <div slot="location" slot-scope="record">{{record.location}}</div>
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
            <a-tag v-else-if="record.available == 2" color="#DC143C">{{ $t('status_abnormal') }}</a-tag>
            <a-tag v-else status="default" :text="$t('status_unknown')" />
          </a-tooltip>
        </span>
        <span slot="operation" slot-scope="record">
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeDetail(record)">{{ $t('btn_view_detail') }}</a-button>
        </span>
      </a-table>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { hostList, hostExport } from '@/services/admin'
export default {
  i18n: require('./i18n'),
  name: 'NetList',
  components: {
    PageLayout
  },
  data() {
    return {
      page: 1,
      pageSize: 10,
      hosts: '',
      model: '',
      ip: '',
      available: '',
      hosttype: 'HW_NET',
      loading: false,
      interfaces: '',
      availableOption: [],
      columns: [],
      list: [],
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
          title: this.$t('col_model'),
          key: 'model',
          align: 'left',
          scopedSlots: { customRender: 'model' }
        },
        {
          title: this.$t('col_location'),
          key: 'location',
          align: 'left',
          scopedSlots: { customRender: 'location' }
        },
        {
          title: this.$t('col_ip_address'),
          key: 'interfaces',
          align: 'left',
          scopedSlots: { customRender: 'interfaces' }
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
          scopedSlots: { customRender: 'cpu_utilization' }
        },
        {
          title: this.$t('col_memory_usage'),
          key: 'memory_utilization',
          align: 'left',
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
          align: 'left',
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
        model: this.model,
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
          model: this.model,
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
      this.$router.push('/net/detail?id=' + v.hostid + '&zid=' + v.zid)
    },
    resetData() {
      if (this.hosts || this.interfaces || this.available || this.model) {
        this.hosts = ''
        this.model = ''
        this.interfaces = ''
        this.available = ''
        this.init()
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
</style>
