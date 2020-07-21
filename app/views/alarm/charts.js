export const opt1=[
  {
    value:'#ff4d4f',
    key:'danger',
    label:'高风险',
  },

  {
    value:'#fa8c16',
    key:'warning',
    label:'较高风险',
  },

  {
    value:'#faad14',
    key:'alert',
    label:'中风险',
  },

  {
    value:'#1890ff',
    key:'low',
    label:'低风险',
  },
];
const color=['#1890ff','#faad14','#fa8c16','#ff4d4f'];

export const option = ops => ({
  title: {
    text: '告警统计',
    subtext: `报告周期 ${ops.time}`,
    left: 'center',
  },
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    data: ops.legend,
  },
  /* legend: {
    orient: 'horizontal',//vertical
    // left: 10,
    right:50,
    // x:'center',
    y:'top',
    padding:[10,0,0,0],
    data: color.map(v=>v.label),
  }, */
  color,
  series: [{
    name: '告警等级',
    type: 'pie',
    radius: '55%',
    center: ['50%', '60%'],
    data:ops.data,
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
  }],
});


export const option1 = ops => ({
  title: {
    text: '告警TOP10',
    subtext: `报告周期 ${ops.time}`,
    left: 'center',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
  },
  color:color[0],
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    boundaryGap: [0, 0.01],
  },
  yAxis: {
    type: 'category',
    data: ops.legend,
  },
  series: [
    {
      name: '告警数',
      type: 'bar',
      data: ops.data,
    },
  ],
});
