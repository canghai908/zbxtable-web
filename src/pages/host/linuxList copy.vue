<template>
  <page-layout title="列表信息">
    <div class="linux-list">
      <a-list :grid="{gutter: 24, lg: 3, md: 2, sm: 1, xs: 1}" :dataSource="dataSource">
        <a-list-item slot="renderItem" slot-scope="item">
          <template v-if="item.add">
            <a-button class="new-btn" type="dashed"><a-icon type="plus" />新增主机</a-button>
          </template>
          <template v-else>
            <a-card :hoverable="true">
              <a-card-meta @click="handMain">
                <div style="margin-bottom: 3px" slot="title">{{item.title}}</div>
                <a-avatar class="card-avatar" slot="avatar" :src="item.avatar" size="large" />
                <div class="meta-content" slot="description">创建时间: {{item.timer}} <br /><br />备注信息: {{item.content}}</div>
              </a-card-meta>
              <div slot="actions" @click="handBtn" style="text-align: right;padding-right: 20px;">查看拓扑图</div>
            </a-card>
          </template>
        </a-list-item>
      </a-list>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import {hostList} from "@/services/admin"
export default {
  name: 'LinuxList',
  components: {
    PageLayout,
  },
  data () {
    return {
      dataSource:[
        {
          add: true
        },
        {
          title: '拓扑名称',
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/WdGqmHpayyMjiEhcKoVE.png',
          content: '这里展示被备注信息',
          timer: '2021-08-09'
        }
      ]
    }
  },
  created () {
    hostList().then((res) => {
      console.log(res);
    })
  },
  methods: {
    handMain () {
      this.$router.push("/host/detail")
    },
    handBtn () {
      this.$router.push("/host/tuopu")
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
  .new-btn{
    border-radius: 2px;
    width: 100%;
    height: 187px;
  }
  .meta-content{
    position: relative;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    height: 64px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

</style>
