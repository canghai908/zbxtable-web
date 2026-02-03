<template>
  <page-layout :title="detail.name">
    <div slot="headerContent" class="linux-detail">
      <!-- 主机基本信息 -->
      <a-card :headStyle="{...$cardHeadStyle, marginBottom: '12px'}" :bodyStyle="{padding: '12px'}" title="主机基本信息">
        <a-row :gutter="[24, 8]">
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">主机ID:</span>
              <span class="info-value">{{detail.hostid}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">设备位置:</span>
              <span class="info-value">{{detail.location || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">部门:</span>
              <span class="info-value">{{detail.department || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">运行时间:</span>
              <span class="info-value">{{detail.uptime || "--"}}</span>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="[24, 8]">
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">设备型号:</span>
              <span class="info-value">{{detail.model}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">序列号:</span>
              <span class="info-value">{{detail.serial_no || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">设备安装时间:</span>
              <span class="info-value">{{detail.date_hw_install || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">维保到期时间:</span>
              <span class="info-value">{{detail.date_hw_expiry || "--"}}</span>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="[24, 8]">
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">资产编号:</span>
              <span class="info-value">{{detail.resource_id || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="18" :lg="16" :md="24" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">备注:</span>
              <span class="info-value">{{detail.vendor || "--"}}</span>
            </div>
          </a-col>
        </a-row>
      </a-card>
      <a-tabs :tabBarStyle="{textAlign: 'center', width: '100%'}" style="padding: 0px 2px;">
        <a-tab-pane tab="运行信息" key="1">
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd', padding: '12px'}" :loading="!detail">
            <a-row :gutter="[12, 12]">
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" title="CPU数量">
                  <div class="ser-detail"><b :style="{color: themeColor}">{{detail.os || "--"}}</b><span>核</span></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" title="总内存">
                  <div class="ser-detail"><b :style="{color: themeColor}">{{detail.os || "--"}}</b><span>G</span></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" title="总存储">
                  <div class="ser-detail"><b :style="{color: themeColor}">{{detail.os || "--"}}</b><span>T</span></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" title="操作系统">
                  <div class="ser-detail"><b :style="{color: themeColor}">{{detail.os || "--"}}</b></div>
                </a-card>
              </a-col>
            </a-row>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import DetailList from "@/components/tool/DetailList";
const DetailListItem = DetailList.Item;
import { hostDetail } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
import themeMixin from '@/mixins/themeMixin';

export default {
  name: "SerDetail",
  mixins: [themeMixin],
  components: { PageLayout, DetailListItem, DetailList },
  data() {
    return {
      id: "",
      zid: "",
      detail: "",
    };
  },
  created() {
    this.dates = new Date().getTime();
    this.dater = parseTimeFun(this.dates);
    this.id = this.$route.query.id || "";
    this.zid = this.$route.query.zid || "";
    this.init();
  },
  methods: {
    init() {
      hostDetail(this.id, this.zid).then((resp) => {
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
.info-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
  
  .info-label {
    font-weight: 500;
    margin-right: 8px;
    white-space: nowrap;
  }
  
  .info-value {
    flex: 1;
    word-break: break-all;
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
