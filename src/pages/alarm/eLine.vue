<template>
  <div style="">
    <div class="line-info" v-if="show != 1">
      <a-icon type="loading" v-show="show == 0" style="font-size: 50px" />
      <span style="color: #333;font-size: 24px;" v-show="show == 2">告警统计暂无数据</span>
    </div>
    <div class="line-main" v-if="show == 1">
      <v-chart :forceFit="true" :height="height" :data="data" :scale="scale" :padding="[20, 80, 60, 200]">
        <v-tooltip />
        <v-coord type="rect" direction="LT" />
        <v-axis dataKey="name" position="left" :label="{
            textStyle: {
              fontSize: 12,
              textBaseline: 'middle',
              fill: $themeColor,
              textAlign: 'right'
            },
            formatter: (text) => formatLongText(text, 30),
            autoRotate: false
          }" :line="null" :grid="null" />
        <v-axis dataKey="value" position="bottom" :label="{
            textStyle: {
              fontSize: 12,
              textBaseline: 'top',
              offset: 15,
              fill: $themeColor
            },
            formatter: (val) => `${val}次`
          }" :line="null" :grid="null" />
        <v-bar position="name*value" :color="$themeColor" />
      </v-chart>
      
      <!-- 添加主机名和实例标签列表 -->
      <div class="host-list" :style="{ background: hexToRgba($themeColor, 0.05) }">
        <div v-for="(item, index) in displayList" :key="index" class="host-item" :style="{ background: hexToRgba($themeColor, 0.02), borderLeft: `3px solid ${$themeColor}` }">
          <span class="host-name" :style="{ color: $themeColor }">{{ item.hostname }}</span>
          <a-tag v-if="item.instanceName" :color="$themeColor" class="instance-tag">{{ item.instanceName }}</a-tag>
          <span class="host-count" :style="{ color: $themeColor }">{{ item.value }}次</span>
        </div>
      </div>
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
      displayList: [],
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
      handler() {
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
        let displayList = [];
        this.mock.forEach((v, i) => {
          // 解析主机名和实例名 格式: "主机名 [实例名]"
          const match = v.match(/^(.+?)\s*\[(.+?)\]$/);
          let hostname = v;
          let instanceName = '';
          let displayName = v; // 用于图表显示的唯一标识
          
          if (match) {
            hostname = match[1].trim();
            instanceName = match[2].trim();
            // 使用"主机名 [实例名]"作为唯一标识
            displayName = `${hostname} [${instanceName}]`;
          }
          
          list.push({
            name: displayName, // 图表使用完整的"主机名 [实例名]"作为唯一标识
            value: this.numList[i] || 0
          });
          
          displayList.push({
            hostname: hostname,
            instanceName: instanceName,
            value: this.numList[i] || 0
          });
        });
        list.sort((a, b) => b.value - a.value);
        displayList.sort((a, b) => b.value - a.value);
        this.data = list;
        this.displayList = displayList;
      } else {
        this.show = 2;
      }
    },
    formatLongText(text, maxLength) {
      if (!text) return '';
      // 计算实际字符宽度（中文字符算2个宽度）
      let width = 0;
      let result = '';
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        // 中文字符、全角字符等宽字符
        if (char.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/)) {
          width += 2;
        } else {
          width += 1;
        }
        if (width > maxLength) {
          return result + '...';
        }
        result += char;
      }
      return result;
    },
    hexToRgba(hex, alpha = 1) {
      if (!hex) return `rgba(24, 144, 255, ${alpha})`
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
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

.host-list {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
  transition: background 0.3s ease;
  
  .host-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    margin-bottom: 8px;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .host-name {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.3s ease;
    }
    
    .instance-tag {
      margin: 0 8px;
    }
    
    .host-count {
      font-size: 14px;
      font-weight: 500;
      transition: color 0.3s ease;
    }
  }
}
</style>
