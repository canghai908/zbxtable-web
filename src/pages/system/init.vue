<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" :rowKey="(record) => { return record.id}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="name" slot-scope="record">{{record.name}}</div>
        <div slot="status" slot-scope="record">
          <a-tag v-if="record.status == 1" color="#2f9e5e">已完成</a-tag>
          <a-tag v-else-if="record.status == 0" color="#d05253"> 未完成</a-tag>
          <a-tag v-else status="default" text="未知" />
        </div>
        <div slot="inited_at" slot-scope="record">
          {{ new Date(+new Date(record.inited_at) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '') || '--' }}</div>
        <div slot="operation" slot-scope="record">
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeEdit(record)">编辑</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="deployInit(record)">初始化</a-button>
          <!-- <a-button class="pd20 paddingleft0" type="link" size="small" @click="showTopo(record)">预览</a-button> -->
        </div>
      </a-table>
    </div>
  </page-layout>
</template>
<script>
import PageLayout from '@/layouts/PageLayout'
import { systemList, systemInit } from '@/services/admin'
export default {
  name: 'tuopu',
  components: { PageLayout },
  data() {
    return {
      title: "初始化",
      topology: '',
      page: 1,
      pageSize: 10,
      loading: false,
      columns: [
        { title: '序号', key: 'id', align: 'left', scopedSlots: { customRender: 'id' } },
        { title: '系统类型', key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: '初始化状态', key: 'status', align: 'left', scopedSlots: { customRender: 'status' } },
        { title: '最近初始化时间', key: 'inited_at', align: 'left', scopedSlots: { customRender: 'inited_at' } },
        { title: '操作', key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
      ],
      list: [],
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.loading = true
      systemList().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.list = res.data.items || []
        }
      }).finally(() => { this.loading = false })
    },
    seeEdit(record) {
      this.$router.push("/system/init-edit?id=" + record.id)
    },
    deployInit(record) {
      console.log(record)
      systemInit(record.id,).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
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
