<template>
  <page-layout :noTitle="true">
    <!-- <div class="tuopu" :style="`height: ${minHeight}px;`">
      <iframe src="https://dl.cactifans.com/pia/1.html" frameborder="0" style="width: 100%;border:none;height: 100%;"></iframe>
    </div> -->
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item :label="$t('label_search')">
        <a-input v-model.trim="topology" :placeholder="$t('placeholder_topology_name')" />
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">{{ $t('btn_query') }}</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">{{ $t('btn_reset') }}</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="newPage">{{ $t('btn_new_topology') }}</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="topology" slot-scope="record">{{record.topology}}</div>
        <div slot="status" slot-scope="record">
          <a-badge v-if="record.status == 1" status="success" :text="$t('status_shared')" />
          <a-badge v-else-if="record.status == 0" status="default" :text="$t('status_not_shared')" />
          <a-badge v-else status="default" :text="$t('status_unknown')" />
        </div>
        <div slot="created_at" slot-scope="record">
          {{ new Date(+new Date(record.created_at) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '') || '--' }}</div>
        <div slot="updated_at" slot-scope="record">
          {{ new Date(+new Date(record.created_at) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '') || '--' }}</div>
        <div slot="operation" slot-scope="record">
          <a-button class="pd20 paddingleft0" type="link" size="small" v-if="record.status==0" @click="deployTopo(record)">{{ $t('btn_share') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-else @click="deployTopo(record)">{{ $t('btn_cancel_share') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-if="record.status==1" @click="copyShareLink(record)">
            <a-icon type="link" />
            {{ $t('btn_share') }}
          </a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeDetail(record)">{{ $t('btn_edit') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="showTopo(record)">{{ $t('btn_view') }}</a-button>
          <a-popconfirm :title="$t('confirm_delete')" :ok-text="$t('confirm_yes')" :cancel-text="$t('confirm_no')" @confirm="confirm(record)">
            <a-button class="paddingleft0" type="link" size="small">{{ $t('btn_delete') }}</a-button>
          </a-popconfirm>
        </div>
      </a-table>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { topologyList, deleteTopology, deployTopology } from '@/services/admin'
export default {
  name: 'tuopu',
  i18n: require('./i18n'),
  components: { PageLayout },
  data() {
    return {
      title: "核心拓扑",
      topology: '',
      page: 1,
      pageSize: 10,
      loading: false,
      columns: [],
      list: [],
      pagination: {
        total: 0, current: 1, "show-quick-jumper": true, "page-size-options": ["10", "20", "30", "40", "50", "100", "200"],
        pageSize: 10, "show-size-changer": true, "show-total": (total) => this.$t('pagination_total', { total })
      }
    }
  },
  created() {
    this.initColumns()
    this.init()
  },
  methods: {
    initColumns() {
      this.columns = [
        { title: this.$t('col_id'), key: 'id', align: 'center', scopedSlots: { customRender: 'id' } },
        { title: this.$t('label_topology_name'), key: 'topology', align: 'center', scopedSlots: { customRender: 'topology' } },
        { title: this.$t('col_status'), key: 'status', align: 'center', scopedSlots: { customRender: 'status' } },
        { title: this.$t('col_created_at'), key: 'created_at', align: 'center', scopedSlots: { customRender: 'created_at' } },
        { title: this.$t('col_updated_at'), key: 'updated_at', align: 'center', scopedSlots: { customRender: 'updated_at' } },
        { title: this.$t('col_operation'), key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
      ]
    },
    init() {
      this.loading = true
      topologyList({ page: this.page, limit: this.pageSize, name: this.topology }).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.pagination.total = res.data.total
          this.pagination.current = this.page
          this.pagination.pageSize = this.pageSize
          this.list = res.data.items || []
        } else {
          this.$message.error(res.message || this.$t('msg_load_failed'))
        }
      }).catch((err) => {
        this.$message.error(this.$t('msg_load_failed'))
        console.error(err)
      }).finally(() => { this.loading = false })
    },
    resetData() {
      if (this.topology) {
        this.topology = ''
        this.init()
      }
    },
    changePage(e) {
      this.page = e.current
      this.pageSize = e.pageSize
      this.init()
    },
    seeDetail(record) {
      this.$router.push("/topology/detail?id=" + record.id)
    },
    showTopo(record) {
      this.$router.push("/topology/show?id=" + record.id)
    },
    confirm(record) {
      deleteTopology(record.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message || this.$t('msg_delete_success'))
          this.init()
        } else {
          this.$message.error(res.message || this.$t('msg_delete_failed'))
        }
      }).catch((err) => {
        this.$message.error(this.$t('msg_delete_failed'))
        console.error(err)
      })
    },
    deleteData(record) {
      deleteTopology(record.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message || this.$t('msg_delete_success'))
          this.init()
        } else {
          this.$message.error(res.message || this.$t('msg_delete_failed'))
        }
      }).catch((err) => {
        this.$message.error(this.$t('msg_delete_failed'))
        console.error(err)
      })
    },
    deployTopo(record) {
      deployTopology(record).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message || this.$t('msg_operation_success'))
          this.init()
        } else {
          this.$message.error(res.message || this.$t('msg_operation_failed'))
        }
      }).catch((err) => {
        this.$message.error(this.$t('msg_operation_failed'))
        console.error(err)
      })
    },
    newPage() {
      this.$router.push("/topology/detail")
    },
    copyShareLink(record) {
      const shareUrl = `${window.location.origin}/#/share/topology?id=${record.id}`
      
      // 复制到剪贴板
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      
      try {
        document.execCommand('copy')
        this.$message.success(this.$t('msg_link_copied'))
        
        // 显示链接
        this.$info({
          title: this.$t('title_share_link'),
          content: shareUrl,
          okText: this.$t('btn_close')
        })
      } catch (err) {
        this.$message.error(this.$t('msg_copy_failed'))
      } finally {
        document.body.removeChild(textarea)
      }
    }
  },
}
</script>

<style lang="less" scoped>
.tuopu_bg {
  width: 708px;
}
</style>
