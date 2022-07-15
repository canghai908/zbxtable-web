<template>
  <div v-if="showPage">
    <v-chart :forceFit="true" height="300" :data="mock" :scale="scale" :animate="true" :padding="20">
      <v-coord type="polar" :startAngle="-202.5" :endAngle="22.5" :radius="0.75"></v-coord>
      <v-series gemo="point" position="value*1" shape="pointer" :color="color" :active="false"></v-series>
      <!-- <v-guide type="arc" :zIndex="0" :top="false" :start="[0*x1, 0.945]" :end="[1*x1, 0.945]" :vStyle="style1"></v-guide>
      <v-guide type="arc" :zIndex="0" :top="false" :start="[1*x1, 0.945]" :end="[2*x1, 0.945]" :vStyle="style2"></v-guide>
      <v-guide type="arc" :zIndex="0" :top="false" :start="[2*x1, 0.945]" :end="[3*x1, 0.945]" :vStyle="style3"></v-guide>
      <v-guide type="arc" :zIndex="0" :top="false" :start="[3*x1, 0.945]" :end="[max, 0.945]" :vStyle="style4"></v-guide>
      <v-guide type="arc" :zIndex="1" :start="[0, 0.945]" :end="[mock[0].value, 0.945]" :vStyle="style5"></v-guide> -->
      <v-guide type="arc" :zIndex="0" :start="[0, 0.945]" :end="[mock[0].value, 0.945]" :vStyle="style5"></v-guide>
      <v-guide type="arc" :zIndex="1" :top="false" :start="[0*x1, 0.945]" :end="[1*x1, 0.945]" :vStyle="style1"></v-guide>
      <v-guide type="arc" :zIndex="1" :top="false" :start="[1*x1, 0.945]" :end="[2*x1, 0.945]" :vStyle="style2"></v-guide>
      <v-guide type="arc" :zIndex="1" :top="false" :start="[2*x1, 0.945]" :end="[3*x1, 0.945]" :vStyle="style3"></v-guide>
      <v-guide type="arc" :zIndex="1" :top="false" :start="[3*x1, 0.945]" :end="[max, 0.945]" :vStyle="style4"></v-guide>
      <v-guide type="html" :position="htmlGuidePosition" :html="htmlGuideHtml"></v-guide>
    </v-chart>
  </div>
</template>

<script>
import { registerShape } from "viser-vue";
registerShape("point", "pointer", {
  draw(cfg, container) {
    let point = cfg.points[0]; // 获取第一个标记点
    point = this.parsePoint(point);
    const center = this.parsePoint({x: 0,y: 0});
    container.addShape("line", {attrs: {x1: center.x, y1: center.y, x2: point.x, y2: point.y + 1, stroke: cfg.color, lineWidth: 2, lineCap: "round"}});
    return container.addShape("circle", {attrs: {x: center.x, y: center.y, r: 4, stroke: cfg.color, lineWidth: 2, fill: "#fff"}});
  },
});
export default {
  props: ["rate", 'min', 'max', 'icon'],
  data() {
    return {
      showPage: false,
      mock: [],
      x1: 0,
      scale: [],
      axisLabel: { offset: -16, textStyle: {fontSize: 18,textAlign: "center",textBaseline: "middle"}},
      axisSubTickLine: {length: -8,stroke: "#fff",strokeOpacity: 1},
      axisTickLine: {length: -17,stroke: "#fff",strokeOpacity: 1},

      style1: { stroke: "#30BF78", lineWidth: 18},
      style2: { stroke: "#A0D911", lineWidth: 18},
      style3: { stroke: "#FAAD14", lineWidth: 18},
      style4: { stroke: "#F4664A", lineWidth: 18},
      style5: { stroke: "#000000", lineWidth: 16},

      htmlGuidePosition: ["50%", "95%"],
      htmlGuideHtml:"",
      color: ""
    };
  },
  created () {
    if((this.rate && this.rate > 0) || this.rate == 0) {
      this.mock = [{value: this.rate}];
      this.scale = [{ dataKey: "value", min: this.min, max: this.max, tickInterval: 1, nice: false }];
      this.x1 = (this.max/4).toFixed(2);
      this.color = this['style'+ (parseInt(this.rate/this.x1) + 1)].stroke || "#000000";
      this.htmlGuideHtml =  `
        <div style="width: 100px;text-align: center;">
          <p style="font-size: 14px;color: ${this.color};margin: 0;">${ this.rate }${this.icon || "%"}</p>
        </div>
      `
      this.showPage = true;
    }
  }
};
</script>
