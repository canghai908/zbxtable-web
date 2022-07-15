<template>
  <page-layout :noTitle="true">
    <!-- <div class="tuopu" :style="`height: ${minHeight}px;`">
      <iframe src="https://dl.cactifans.com/pia/1.html" frameborder="0" style="width: 100%;border:none;height: 100%;"></iframe>
    </div> -->
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item label="搜索">
        <a-input v-model.trim="topology" placeholder="拓扑图名称" />
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">查询</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">重置</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="newPage">新建拓扑</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="topology" slot-scope="record">{{record.topology}}</div>
        <div slot="status" slot-scope="record">
          <a-badge v-if="record.status == 1" status="success" text="已发布" />
          <a-badge v-else-if="record.status == 0" status="error" text="未发布" />
          <a-badge v-else status="default" text="未知" />
        </div>
        <div slot="created_at" slot-scope="record">
          {{ new Date(+new Date(record.created_at) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '') || '--' }}</div>
        <div slot="updated_at" slot-scope="record">
          {{ new Date(+new Date(record.created_at) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '') || '--' }}</div>
        <div slot="operation" slot-scope="record">
          <a-button class="pd20 paddingleft0" type="link" size="small" v-if="record.status==0" @click="deployTopo(record)">发布</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" v-else @click="deployTopo(record)">撤回</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeDetail(record)">编辑</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="showTopo(record)">预览</a-button>
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
import { topologyList, deleteTopology, deployTopology } from '@/services/admin'
export default {
  name: 'tuopu',
  components: { PageLayout },
  data() {
    return {
      title: "核心拓扑",
      topology: '',
      page: 1,
      pageSize: 10,
      loading: false,
      columns: [
        { title: '序号', key: 'id', align: 'center', scopedSlots: { customRender: 'id' } },
        { title: '拓扑名称', key: 'topology', align: 'center', scopedSlots: { customRender: 'topology' } },
        { title: '拓扑状态', key: 'status', align: 'center', scopedSlots: { customRender: 'status' } },
        { title: '创建时间', key: 'created_at', align: 'center', scopedSlots: { customRender: 'created_at' } },
        { title: '更新时间', key: 'updated_at', align: 'center', scopedSlots: { customRender: 'updated_at' } },
        { title: '操作', key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
      ],
      list: [],
      pagination: {
        total: 0, current: 1, "show-quick-jumper": true, "page-size-options": ["10", "20", "30", "40", "50", "100", "200"],
        pageSize: 10, "show-size-changer": true, "show-total": (total) => `共 ${total} 条数据`
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.loading = true
      topologyList({ page: this.page, limit: this.pageSize, name: this.topology }).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.pagination.total = res.data.total
          this.pagination.current = this.page
          this.pagination.pageSize = this.pageSize
          this.list = res.data.items || []
        }
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
          this.$message.success(res.message)
          this.init()
        }
      })
    },
    deleteData(record) {
      deleteTopology(record.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message)
          this.init()
        }
      })

    },
    deployTopo(record) {
      deployTopology(record).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message)
          this.init()
        }
      })
    },
    newPage() {
      this.$router.push("/topology/detail")
    }
  },
}
</script>

<style lang="less" scoped>
.tuopu_bg {
  width: 708px;
}
</style>
