<template>
  <page-layout :title="detail.name">
    <div slot="headerContent" class="linux-detail">
      <!-- 主机基本信息 -->
      <a-card :headStyle="{...$cardHeadStyle, marginBottom: '12px'}" :bodyStyle="{padding: '12px'}" :title="$t('ser_card_basic_info')">
        <a-row :gutter="[24, 8]">
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('ser_label_host_id') }}:</span>
              <span class="info-value">{{detail.hostid}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('ser_label_device_location') }}:</span>
              <span class="info-value">{{detail.location || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('ser_label_department') }}:</span>
              <span class="info-value">{{detail.department || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('ser_label_uptime') }}:</span>
              <span class="info-value">{{detail.uptime || "--"}}</span>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="[24, 8]">
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('ser_label_device_model') }}:</span>
              <span class="info-value">{{detail.model}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('ser_label_serial_no') }}:</span>
              <span class="info-value">{{detail.serial_no || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('ser_label_install_date') }}:</span>
              <span class="info-value">{{detail.date_hw_install || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('ser_label_expiry_date') }}:</span>
              <span class="info-value">{{detail.date_hw_expiry || "--"}}</span>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="[24, 8]">
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('ser_label_asset_no') }}:</span>
              <span class="info-value">{{detail.resource_id || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="18" :lg="16" :md="24" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('ser_label_remarks') }}:</span>
              <span class="info-value">{{detail.vendor || "--"}}</span>
            </div>
          </a-col>
        </a-row>
      </a-card>
      <a-tabs :tabBarStyle="{textAlign: 'center', width: '100%'}" style="padding: 0px 2px;">
        <a-tab-pane :tab="$t('ser_tab_runtime_info')" key="1">
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd', padding: '12px'}" :loading="!detail">
            <a-row :gutter="[12, 12]">
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" :title="$t('ser_card_cpu_count')">
                  <div class="ser-detail"><b :style="{color: themeColor}">{{detail.os || "--"}}</b><span>{{ $t('ser_unit_core') }}</span></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" :title="$t('ser_card_total_memory')">
                  <div class="ser-detail"><b :style="{color: themeColor}">{{detail.os || "--"}}</b><span>{{ $t('ser_unit_gb') }}</span></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" :title="$t('ser_card_total_storage')">
                  <div class="ser-detail"><b :style="{color: themeColor}">{{detail.os || "--"}}</b><span>{{ $t('ser_unit_tb') }}</span></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" :title="$t('ser_card_os')">
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
import { hostDetail } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
import themeMixin from '@/mixins/themeMixin';

export default {
  i18n: require('./i18n'),
  name: "SerDetail",
  mixins: [themeMixin],
  components: { PageLayout },
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
