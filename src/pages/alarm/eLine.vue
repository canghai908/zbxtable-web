<template>
  <div style="">
    <div class="line-info" v-if="show != 1">
      <a-icon type="loading" v-show="show == 0" style="font-size: 50px" />
      <span style="color: #333;font-size: 24px;" v-show="show == 2">告警统计暂无数据</span>
    </div>
    <div class="line-main" v-if="show == 1">
      <v-chart :forceFit="true" :height="height" :data="data" :scale="scale" :padding="[20, 60, 60, 120]">
        <v-tooltip />
        <v-coord type="rect" direction="LT" />
        <v-axis dataKey="name" position="left" :label="{
            textStyle: {
              fontSize: 12,
              textBaseline: 'middle',
            },
            formatter: (text) => formatLongText(text, 15)
          }" :line="null" :grid="null" />
        <v-axis dataKey="value" position="bottom" :label="{
            textStyle: {
              fontSize: 12,
              textBaseline: 'top',
              offset: 15
            },
            formatter: (val) => `${val}次`
          }" :line="null" :grid="null" />
        <v-bar position="name*value" color="#1890ff" :label="['value', {
            position: 'right',
            offsetX: 5,
            textStyle: {
              fill: '#666',
              fontSize: 12
            },
            formatter: (val) => `${val}次`
          }]" />
      </v-chart>
    </div>

    <!-- 添加悬浮提示 -->
    <a-tooltip placement="right" v-if="currentHoverText">
      <template slot="title">
        {{ currentHoverText }}
      </template>
    </a-tooltip>
  </div>
</template>

<script>
export default {
  name: 'LinuxLine',
  props: {
    mock: {
      type: Array,
      default: () => []
    },
    numList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      data: [],
      show: 0,
      height: 380,
      scale: [
        {
          dataKey: 'name',
          type: 'cat'
        },
        {
          dataKey: 'value',
          min: 0,
          alias: '告警次数'
        }
      ],
      currentHoverText: '', // 当前悬浮显示的完整文本
    }
  },
  watch: {
    mock: {
      handler(val) {
        this.init();
      },
      deep: true
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    init() {
      if(this.mock && this.mock.length) {
        this.show = 1;
        let list = [];
        this.mock.forEach((v, i) => {
          list.push({
            name: v,
            value: this.numList[i] || 0
          });
        });
        list.sort((a, b) => b.value - a.value);
        this.data = list;
      } else {
        this.show = 2;
      }
    },
    formatLongText(text, maxLength) {
      if (text && text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
      }
      return text;
    }
  }
}
</script>

<style lang="less" scoped>
.line-info {
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.line-main {
  width: 100%;
  position: relative;
  padding: 10px;
  margin-bottom: 10px;
  
  :deep(.g2-tooltip) {
    background-color: rgba(255, 255, 255, 0.96);
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    
    .g2-tooltip-title {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .g2-tooltip-list {
      padding: 0;
      margin: 0;
      list-style: none;
      
      .g2-tooltip-list-item {
        margin: 4px 0;
        white-space: nowrap;
        
        .g2-tooltip-name {
          margin-right: 8px;
        }
      }
    }
  }
}
</style>
