<template>
  <div style="">
    <div class="pie-info" v-if="show != 1">
      <a-icon type="loading" v-show="show == 0" style="font-size: 50px" />
      <span style="color: #333;font-size: 24px;" v-show="show == 2">告警TOP10暂无数据</span>
    </div>
    <div class="pie-main" v-if="show == 1">
      <v-chart :forceFit="true" height="400" :data="mockData" :scale="scale" :padding="padding">
        <v-tooltip></v-tooltip>
        <v-interval position="name*num" opacity="1" :label="barLabel" :size="20"></v-interval>
        <v-axis dataKey="name"></v-axis>
        <v-coord type="rect" direction="LB"></v-coord>
        <v-axis dataKey="num"></v-axis>
      </v-chart>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LinuxPie',
  props: ["mock", "numList", "timer"],
  data() {
    return {
      mockData: "",
      show: 0,         // 0-loading 1-有数据  2-无数据
      padding: [20, 50, 50, 100],
      scale: [{ dataKey: 'num', min: 0, formatter: function (v) { return v + '个' } }],
      barLabel: ['num', { textStyle: { fill: '#8d8d8d' }, offset: 5 }],
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (this.mock && this.mock.length) {
        this.show = 1;
        this.$nextTick(() => {
          let list = [];
          this.mock.forEach((v, i) => {
            list.push({ num: this.numList[i], name: v.length > 10 ? (v.substring(0, 10) + '...') : v });
          })
          this.mockData = list;
        })
      } else {
        this.show = 2;
      }
    },
    levelFilter(v) {
      let res = "未分类";
      switch (v) {
        case "0": res = "未分类"; break;
        case "1": res = "信息"; break;
        case "2": res = "警告"; break;
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
.pie-info {
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pie-main {
  width: 100%;
  h3 {
    line-height: 30px;
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
  .pie-msg {
    line-height: 20px;
    margin: 4px 0 20px;
    text-align: center;
    font-size: 14px;
    color: #999;
  }
}
</style>
