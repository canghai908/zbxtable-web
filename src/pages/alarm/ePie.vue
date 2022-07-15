<template>
  <div style="">
    <div class="pie-info" v-if="show != 1">
      <a-icon type="loading" v-show="show == 0" style="font-size: 50px" />
      <span style="color: #333;font-size: 24px;" v-show="show == 2">告警统计暂无数据</span>
    </div>
    <div class="pie-main" v-if="show == 1">
      <v-chart :forceFit="true" :height="height" :data="mockData" :scale="scale" :padding="[50, 50, 50, 100]">
        <v-tooltip :showTitle="false" dataKey="item*percent" />
        <v-axis />
        <v-legend dataKey="item" position="left" />
        <v-pie position="percent" color="item" :vStyle="pieStyle" :label="labelConfig" />
        <v-coord type="theta" />
      </v-chart>  
    </div>
  </div>
</template>

<script>
const DataSet = require('@antv/data-set')

export default {
  name: 'LinuxPie',
  props: ["mock", "timer"],
  data () {
    return {
      mockData: "",
      show: 0,         // 0-loading 1-有数据  2-无数据
      scale: [{ dataKey: 'percent', min: 0, formatter: '.0%'}],
      height: 400,
      pieStyle: {
        stroke: '#fff',
        lineWidth: 1
      },
      labelConfig: ['percent', {
        formatter: (val, item) => {
          return item.point.item + ': ' + val
        },
      }]
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    init() {
      if(this.mock && this.mock.length) {
        this.show = 1;
        this.$nextTick(() => {
          let list = [];
          this.mock.forEach((v) => {
            list.push({count: v.value, item: this.levelFilter(v.name), name: v.name});
          })
          const dv = new DataSet.View().source(list);
          dv.transform({ type: 'percent', field: 'count', dimension: 'item', as: 'percent'});
          this.mockData = dv.rows;  
        })
      } else {
        this.show = 2;
      }
    },
    levelFilter (v) {
      let res = "未分类";
      switch (v) {
        case "1": res = "未分类"; break;
        case "2": res = "信息"; break;
        case "3": res = "一般"; break;
        case "4": res = "严重"; break;
        case "5": res = "灾难"; break;
      }
      return res;
    }
  }
}
</script>

<style lang="less" scoped>
  .pie-info{
    width: 100%;
    height: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .pie-main{
    width: 100%;
    h3{
      line-height: 30px;
      text-align: center;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    .pie-msg{
      line-height: 20px;
      margin: 4px 0 20px;
      text-align: center;
      font-size: 14px;
      color: #999;
    }
  }
</style>
