<template>
  <page-layout :title="detail.name">
    <div slot="headerContent" class="linux-detail">
      <detail-list size="small" :col="3">
        <detail-list-item term="主机ID">{{detail.hostid}}</detail-list-item>
        <detail-list-item term="设备位置">{{detail.location || "--"}}</detail-list-item>
        <detail-list-item term="部门">{{detail.department || "--"}}</detail-list-item>
        <detail-list-item term="运行时间">{{detail.uptime || "--"}}</detail-list-item>
        <detail-list-item term="设备型号">{{detail.model}}</detail-list-item>
        <detail-list-item term="序列号">{{detail.serial_no || "--"}}</detail-list-item>
        <detail-list-item term="设备安装时间">{{detail.date_hw_install || "--"}}</detail-list-item>
        <detail-list-item term="维保到期时间">{{detail.date_hw_expiry || "--"}}</detail-list-item>
        <detail-list-item term="资产编号">{{detail.resource_id || "--"}}</detail-list-item>
        <detail-list-item term="备注">{{detail.vendor || "--"}}</detail-list-item>
      </detail-list>
      <a-tabs :tabBarStyle="{textAlign: 'left', width: '100%'}" style="padding: 0px 2px;">
        <a-tab-pane tab="运行信息" key="1">
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!detail">
            <a-row :gutter="16">
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="CPU数量">
                  <div class="ser-detail"><b>{{detail.os || "--"}}</b><span>核</span></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="总内存">
                  <div class="ser-detail"><b>{{detail.os || "--"}}</b><span>G</span></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="总存储">
                  <div class="ser-detail"><b>{{detail.os || "--"}}</b><span>T</span></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="操作系统">
                  <div class="ser-detail"><b>{{detail.os || "--"}}</b></div>
                </a-card>
              </a-col>
            </a-row>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </div>
    <img slot="extra" src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png" alt="" class="extraBg">

  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import DetailList from "@/components/tool/DetailList";
const DetailListItem = DetailList.Item;
import { hostDetail } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
export default {
  name: "LinuxDetail",
  components: { PageLayout, DetailListItem, DetailList },
  data() {
    return {
      id: "",
      detail: "",
    };
  },
  created() {
    this.dates = new Date().getTime();
    this.dater = parseTimeFun(this.dates);
    this.id = this.$route.query.id || "";
    this.init();
  },
  methods: {
    init() {
      hostDetail(this.id).then((resp) => {
        let res = resp.data;
        this.detail = res;
      });
    },
  },
  filters: {
    filterType: function (val) {
      if (val === 0) return "0 B"
      var k = 1024;
      var sizes = ['B', 'KB', 'MB', 'GB', 'PB', 'TB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(val) / Math.log(k));
      return (val / Math.pow(k, i)).toPrecision(3) + "" + sizes[i]
    }
  },
};
</script>

<style lang="less" scoped>
.extraBg {
  width: 195px;
  position: absolute;
  right: 20px;
  top: 50px;
  z-index: 8;
  img {
    width: 100%;
  }
}
.ser-detail {
  width: 100%;
  height: 90px;
  padding: 24px 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: #6e6e6e;
  span {
    font-size: 16px;
  }
  b {
    font-size: 40px;
    font-weight: 500;
    line-height: 40px;
  }
}
</style>
