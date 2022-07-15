<template>
  <page-layout :title="title">
    <div slot="headerContent" class="linux-detail">
      <detail-list size="small" :col="1">
        <detail-list-item term="用户名:">admin</detail-list-item>
        <detail-list-item term="密码:">Password</detail-list-item>
      </detail-list>
      <a-tabs :tabBarStyle="{textAlign: 'left', width: '100%', marginTop: '20px'}" style="padding: 0px 2px;">
        <a-tab-pane tab="详情" key="1">
          <img src="../../assets/img/bg.png" alt="" class="tuopu_bg">
        </a-tab-pane>
      </a-tabs>
    </div>    
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import DetailList from '@/components/tool/DetailList'
const DetailListItem = DetailList.Item

export default {
  name: 'LinuxDetail',
  components: { PageLayout, DetailListItem, DetailList},
  data () {
    return {
      title: "滨江业务所拓扑图",
    }
  }
}
</script>

<style lang="less" scoped>
  .tuopu_bg{
    width: 708px;
  }
</style>
