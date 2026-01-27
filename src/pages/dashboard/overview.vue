<template>
  <page-layout>
    <div slot="headerContent" class="linux-detail">
      <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd', padding: '16px'}" :loading=loading>
        <a-row :gutter="[16, 16]">
          <a-col :xl="{ span: 12 }" :lg="{ span: 12 }" :md="{ span: 24 }">
            <a-card hoverable :headStyle="{textAlign: 'left', background: '#FAFBFC', padding: '12px 16px'}" :bodyStyle="{padding: '12px'}" :title="winTitle">
              <a-list :grid="{ gutter: 8, column: 12, xs: 6, sm: 8, md: 10, lg: 12, xl: 12 }" :data-source="win">
                <a-list-item slot="renderItem" slot-scope="item">
                  <a-popover :title="$t('title_device_info')" placement="topLeft">
                    <template slot="content">
                      <p>{{ $t('label_hostname') }}: {{ item.name }}</p>
                      <p>{{ $t('label_IP') }}:{{ item.interfaces }}</p>
                      <p>{{ $t('label_cpu_usage') }}: {{ item.cpu_utilization }}</p>
                      <p>{{ $t('label_memory_usage') }}: {{ item.memory_utilization }}</p>
                      <p>{{ $t('label_num_errors') }}: {{ item.error }}</p>
                      <p>{{ $t('label_num_alarms') }}: {{ item.alarm }}</p>

                    </template>
                    <a-list-item-meta>
                      <div v-if="item.available==1 && item.alarm==0" class="primary-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==1 && item.alarm>0" class="warnning-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==0" class="unknown-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==2" class="danger-box" slot="avatar" id="one"></div>
                    </a-list-item-meta>
                  </a-popover>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>
          <a-col :xl="{ span: 12 }" :lg="{ span: 12 }" :md="{ span: 24 }">
            <a-card hoverable :headStyle="{textAlign: 'left', background: '#FAFBFC', padding: '12px 16px'}" :bodyStyle="{padding: '12px'}" :title="linTitle">
              <a-list :grid="{ gutter: 8, column: 12, xs: 6, sm: 8, md: 10, lg: 12, xl: 12 }" :data-source="lin">
                <a-list-item slot="renderItem" slot-scope="item">
                  <a-popover :title="$t('title_device_info')" placement="topLeft">
                    <template slot="content">
                      <p>{{ $t('label_hostname') }}: {{ item.name }}</p>
                      <p>{{ $t('label_IP') }}:{{ item.interfaces }}</p>
                      <p>{{ $t('label_cpu_usage') }}: {{ item.cpu_utilization }}</p>
                      <p>{{ $t('label_memory_usage') }}: {{ item.memory_utilization }}</p>
                      <p>{{ $t('label_num_errors') }}: {{ item.error }}</p>
                      <p>{{ $t('label_num_alarms') }}: {{ item.alarm }}</p>
                    </template>
                    <a-list-item-meta>
                      <div v-if="item.available==1 && item.alarm==0" class="primary-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==1 && item.alarm>0" class="warnning-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==0" class="unknown-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==2" class="danger-box" slot="avatar" id="one"></div>
                    </a-list-item-meta>
                  </a-popover>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>
          <a-col :xl="{ span: 12 }" :lg="{ span: 12 }" :md="{ span: 24 }">
            <a-card hoverable :headStyle="{textAlign: 'left', background: '#FAFBFC', padding: '12px 16px'}" :bodyStyle="{padding: '12px'}" :title="netTitle">
              <a-list :grid="{ gutter: 8, column: 12, xs: 6, sm: 8, md: 10, lg: 12, xl: 12 }" :data-source="net">
                <a-list-item slot="renderItem" slot-scope="item">
                  <a-popover :title="$t('title_device_info')" placement="topLeft">
                    <template slot="content">
                      <p>{{ $t('label_hostname') }}: {{ item.name }}</p>
                      <p>{{ $t('label_IP') }}:{{ item.interfaces }}</p>
                      <p>{{ $t('label_cpu_usage') }}: {{ item.cpu_utilization }}</p>
                      <p>{{ $t('label_memory_usage') }}: {{ item.memory_utilization }}</p>
                      <p>{{ $t('label_num_errors') }}: {{ item.error }}</p>
                      <p>{{ $t('label_num_alarms') }}: {{ item.alarm }}</p>
                    </template>
                    <a-list-item-meta>
                      <div v-if="item.available==1 && item.alarm==0" class="primary-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==1 && item.alarm>0" class="warnning-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==0" class="unknown-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==2" class="danger-box" slot="avatar" id="one"></div>
                    </a-list-item-meta>
                  </a-popover>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>
          <a-col :xl="{ span: 12 }" :lg="{ span: 12 }" :md="{ span: 24 }">
            <a-card hoverable :headStyle="{textAlign: 'left', background: '#FAFBFC', padding: '12px 16px'}" :bodyStyle="{padding: '12px'}" :title="srvTitle">
              <a-list :grid="{ gutter: 8, column: 12, xs: 6, sm: 8, md: 10, lg: 12, xl: 12 }" :data-source="srv">
                <a-list-item slot="renderItem" slot-scope="item">
                  <a-popover :title="$t('title_device_info')" placement="topLeft">
                    <template slot="content">
                      <p>{{ $t('label_hostname') }}: {{ item.name }}</p>
                      <p>{{ $t('label_IP') }}:{{ item.interfaces }}</p>
                      <p>{{ $t('label_cpu_usage') }}: {{ item.cpu_utilization }}</p>
                      <p>{{ $t('label_memory_usage') }}: {{ item.memory_utilization }}</p>
                      <p>{{ $t('label_num_errors') }}: {{ item.error }}</p>
                      <p>{{ $t('label_num_alarms') }}: {{ item.alarm }}</p>
                    </template>
                    <a-list-item-meta>
                      <div v-if="item.available==1 && item.alarm==0" class="primary-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==1 && item.alarm>0" class="warnning-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==0" class="unknown-box" slot="avatar" id="one"></div>
                      <div v-if="item.available==2" class="danger-box" slot="avatar" id="one"></div>
                    </a-list-item-meta>
                  </a-popover>
                </a-list-item>
              </a-list>
            </a-card>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </page-layout>

</template>

<script>
import PageLayout from "@/layouts/PageLayout";
// import HeadInfo from '../../components/tool/HeadInfo'
// import linuxLine from '../../components/chart/linuxLine'
import { indexOverview } from "@/services/admin";
export default {
  i18n: require('./i18n'),
  name: "LinuxDetail",
  components: { PageLayout, },
  data() {
    return {
      name: '测试',
      win: '',
      lin: '',
      net: '',
      srv: '',
      loading: '',
      winTitle: '',
      linTitle: '',
      netTitle: '',
      srvTitle: '',

    };
  },
  created() {
    this.init();
    // this.initMock(this.dates)
  },
  filters: {

  },
  methods: {
    init() {
      this.loading = true;
      indexOverview().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.win = res.data.items.vm_win || []
	  this.winTitle = this.$t('num_windows_hosts') + this.win.length;
          this.lin = res.data.items.vm_lin || []
	  this.linTitle = this.$t('num_linux_hosts') + this.lin.length;
          this.net = res.data.items.hw_net || []
          this.netTitle = this.$t('num_networking_hosts') + this.net.length;
          this.srv = res.data.items.hw_srv || []
          this.srvTitle = this.$t('num_hardware_hosts') + this.srv.length;
        }
        console.log(this.win)
      }).finally(() => { this.loading = false })
    },
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
.primary-box {
  display: flex;
  width: 24px;
  height: 24px;
  background: #52c41a;
  color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s;
  &:hover {
    transform: scale(1.1);
  }
}
.danger-box {
  display: flex;
  width: 24px;
  height: 24px;
  background: #f5222d;
  color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s;
  &:hover {
    transform: scale(1.1);
  }
}
.warnning-box {
  display: flex;
  width: 24px;
  height: 24px;
  background: #faad14;
  color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s;
  &:hover {
    transform: scale(1.1);
  }
}
.unknown-box {
  display: flex;
  width: 24px;
  height: 24px;
  background: #bfbfbf;
  color: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.3s;
  &:hover {
    transform: scale(1.1);
  }
}
.linux-charts {
  display: flex;
  margin-top: 5px;
  position: relative;
  left: 5px;
  right: 5px;
}

// 添加新的样式来控制列表项的间距
.ant-list-item {
  padding: 4px !important;  // 减小内边距
  margin: 0 !important;     // 移除外边距
}

.ant-list-item-meta {
  margin-bottom: 0 !important;  // 移除底部边距
}

// 调整卡片内容区域的内边距
.ant-card-body {
  padding: 12px !important;
}
</style>
