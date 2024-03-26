<template>
  <page-layout>
    <div slot="headerContent" class="linux-detail">
      <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading=loading>
        <a-row :gutter="16">
          <a-col :xl="{ span: 24 }" :lg="{ span: 24 }">
            <a-card hoverable :headStyle="{textAlign: 'left', width: '100%', background: '#FAFBFC'}" :title="winTitle">
              <a-list :grid=" {gutter: 24, column: 24 }" :data-source="win">
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
            <a-card hoverable :headStyle="{textAlign: 'left', width: '100%', background: '#FAFBFC'}" :title="linTitle">
              <a-list :grid="{ gutter: 24, column: 24 }" :data-source="lin">
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
            <a-card hoverable :headStyle="{textAlign: 'left', width: '100%', background: '#FAFBFC'}" :title="netTitle">
              <a-list :grid="{ gutter: 24, column: 24 }" :data-source="net">
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
            <a-card hoverable :headStyle="{textAlign: 'left', width: '100%', background: '#FAFBFC'}" :title="srvTitle">
              <a-list :grid="{ gutter: 24, column: 24 }" :data-source="srv">
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
  width: 30px;
  height: 30px;
  background: rgb(0, 255, 0);
  color: white;
  border-radius: 30px;
}
.danger-box {
  display: flex;
  width: 30px;
  height: 30px;
  background: rgb(255, 0, 0);
  color: white;
  border-radius: 30px;
}
.warnning-box {
  display: flex;
  width: 30px;
  height: 30px;
  background: rgb(255, 255, 0);
  color: white;
  border-radius: 30px;
}
.unknown-box {
  display: flex;
  width: 30px;
  height: 30px;
  background: #67c23a;
  color: white;
  border-radius: 30px;
}
.linux-charts {
  display: flex;
  margin-top: 5px;
  position: relative;
  left: 5px;
  right: 5px;
}
</style>
