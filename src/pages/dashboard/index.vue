<template>
  <page-layout :noTitle="true">
    <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!loading1 &&!loading2 && !loading3">
      <a-row :gutter="16">
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <a-card title="未恢复告警" :headStyle="{background: '#FAFBFC'}" size="small" :loading="!loading1">
            <div class="homeMain beauty-scroll">
              <a-timeline>
                <a-timeline-item v-for="(v, i) in triggerList" :key="i">
                  <a-tag v-if="v.severity == 1" color="#7499FF">信息</a-tag>
                  <a-tag v-else-if="v.severity == 2" color="#FFC859">警告</a-tag>
                  <a-tag v-else-if="v.severity == 3" color="#FFA059">一般</a-tag>
                  <a-tag v-else-if="v.severity == 4" color="#E97659">严重</a-tag>
                  <a-tag v-else-if="v.severity == 5" color="#f50000">灾难</a-tag>
                  <a-tag v-else color="#97AAB3">未分类</a-tag>
                  <!-- <a-icon slot="dot" type="minus-circle" v-else-if="v.severity == 2" :style="{ fontSize: '16px', color: '#F56C6C' }" />
                  <a-icon slot="dot" type="exclamation-circle" v-else :style="{ fontSize: '16px', color: '#E6A23C' }" /> -->
                  {{v.lastchange | parsetime}} <b>{{v.name}}</b> {{v.lasteventname}}
                </a-timeline-item>
              </a-timeline>
            </div>
          </a-card>
        </a-col>
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <a-row>
            <a-col :lg="24" :md="24">
              <a-card title="设备统计" :headStyle="{background: '#FAFBFC'}" :bodyStyle="{height: '180px'}" size="small" :loading="!loading2">
                <div class="homeHost beauty-scroll">
                  <div class="homeHItem"><img src="../../assets/img/t1.png" alt=""><span>网络设备</span><em>{{info.net_count}}台</em></div>
                  <div class="homeHItem"><img src="../../assets/img/t2.png" alt=""><span>硬件服务器</span><em>{{info.srv_count}}台</em></div>
                  <div class="homeHItem"><img src="../../assets/img/t4.png" alt=""><span>Windows系统</span><em>{{info.win_count}}台</em></div>
                  <div class="homeHItem"><img src="../../assets/img/t3.png" alt=""><span>Linux系统</span><em>{{info.lin_count}}台</em></div>
                </div>
              </a-card>
            </a-col>
            <a-col :lg="24" :md="24" style="margin-top: 14px;">
              <a-card :title=ptitle :headStyle="{background: '#FAFBFC'}" :bodyStyle="{height: '220px'}" size="small" :loading="!loading3">
                <div class="homeNet beauty-scroll">
                  <div class="homeNet1">
                    <div class="homeNet2"><span>{{edata.name_one}}</span></div>
                    <div class="homeNet3">
                      <p>In:<span>{{edata.in_one}}</span></p>
                      <p>Out:<span>{{edata.out_one}}</span></p>
                    </div>
                    <div class="homeNet4"><img src="../../assets/img/nbg.png" alt=""></div>
                  </div>
                  <div class="homeNetL"></div>
                  <div class="homeNet1">
                    <div class="homeNet2"><span>{{edata.name_two}}</span></div>
                    <div class="homeNet3">
                      <p>In:<span>{{edata.in_two}}</span></p>
                      <p>Out:<span>{{edata.out_two}}</span></p>
                    </div>
                    <div class="homeNet4"><img src="../../assets/img/nbg.png" alt=""></div>
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-card>
    <div style="width: 100%;height: 20px;"></div>
    <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!loading4 && !loading5">
      <a-row :gutter="16">
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <h2 class="homeH2">Windows TOP5</h2>
          <a-card title="CPU使用率 TOP 5" :headStyle="{background: '#FAFBFC'}" size="small" :loading="!loading4">
            <div class="homePies">
              <div class="homePied" v-for="(v, i) in winC" :key="'1'+i">
                <div class="homePie">
                  <pie :name="v.hostname" :rate="v.score" :height="130"></pie>
                </div>
                <div class="homePieN">{{v.hostname}}</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <a-card title="内存使用率 TOP 5" :headStyle="{background: '#FAFBFC'}" :bodyStyle="{padding: 0}" size="small" :loading="!loading5">
            <div class="homeLegent" v-if="winM.length > 0">
              <div class="homeLegent1">
                <div class="homeLeItem1">
                  <div class="homeLeLeft">
                    <div class="homeLeLeft1"><img src="../../assets/img/top1.png" alt=""><span>{{winM[0].score}}%</span></div>
                    <div class="homeLeLeft2">{{winM[0].hostname}}</div>
                  </div>
                  <div class="homeLeRight">
                    <legent :rate="winM[0].score" :height="38"></legent>
                  </div>
                </div>
              </div>
              <div class="homeLegent2">
                <div class="homeLeItem" v-for="(v, i) in winM.slice(1)" :key="i">
                  <div class="homeLeTop">
                    <div class="homeLeTop1"><img :src="require('../../assets/img/top'+(i+2)+'.png')" alt=""></div>
                    <div class="homeLeTop2">{{v.hostname}}</div>
                    <div class="homeLeTop3">{{v.score}}%</div>
                  </div>
                  <div class="homeLeBot">
                    <legent :rate="v.score"></legent>
                  </div>
                </div>
                <div class="homeLeItem" v-for="i in 5-winM.length" :key="i"></div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
    <div style="width: 100%;height: 20px;"></div>
    <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!loading6 && !loading7">
      <a-row :gutter="16">
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <h2 class="homeH2">Linux TOP5</h2>
          <a-card title="CPU使用率 TOP 5" :headStyle="{background: '#FAFBFC'}" size="small" :loading="!loading6">
            <div class="homePies">
              <div class="homePied" v-for="(v, i) in linC" :key="'2'+i">
                <div class="homePie">
                  <pie :name="v.hostname" :rate="v.score" :height="130"></pie>
                </div>
                <div class="homePieN">{{v.hostname}}</div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <a-card title="内存使用率 TOP 5" :headStyle="{background: '#FAFBFC'}" :bodyStyle="{padding: 0}" size="small" :loading="!loading7">
            <div class="homeLegent" v-if="linM.length > 0">
              <div class="homeLegent1">
                <div class="homeLeItem1">
                  <div class="homeLeLeft">
                    <div class="homeLeLeft1"><img src="../../assets/img/top1.png" alt=""><span>{{linM[0].score}}%</span></div>
                    <div class="homeLeLeft2">{{linM[0].hostname}}</div>
                  </div>
                  <div class="homeLeRight">
                    <legent :rate="linM[0].score" :height="38"></legent>
                  </div>
                </div>
              </div>
              <div class="homeLegent2">
                <div class="homeLeItem" v-for="(v, i) in linM.slice(1)" :key="i">
                  <div class="homeLeTop">
                    <div class="homeLeTop1"><img :src="require('../../assets/img/top'+(i+2)+'.png')" alt=""></div>
                    <div class="homeLeTop2">{{v.hostname}}</div>
                    <div class="homeLeTop3">{{v.score}}%</div>
                  </div>
                  <div class="homeLeBot">
                    <legent :rate="v.score"></legent>
                  </div>
                </div>
                <div class="homeLeItem" v-for="i in 5-linM.length" :key="i"></div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
    <div style="width: 100%;height: 20px;"></div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { indexTrigger, indexInfo, indexRestop, indexEgress } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
import pie from "@/components/gcharts/pie";
import legent from "@/components/gcharts/legent";
export default {
  name: "index",
  data() {
    return {
      loading1: false,
      triggerList: [],
      loading2: false,
      info: "",
      loading3: false,
      ptitle: '出口带宽',
      edata: {
        name_one: "--",
        in_one: "--",
        out_one: "--",
        name_two: "",
        in_two: "--",
        out_tw0: "--",
        date: '--'
      },
      loading4: false,
      winC: [],
      loading5: false,
      winM: [],
      loading6: false,
      linC: [],
      loading7: false,
      linM: [],
    };
  },
  components: {
    PageLayout,
    pie,
    legent,
  },
  created() {
    this.initTrigger();
    this.initInfo();
    this.edataInfo();
    this.initMock();
  },
  methods: {
    initTrigger() {
      indexTrigger()
        .then((resp) => {
          let res = resp.data;
          this.triggerList = res.data.items || [];
          console.log(res)
        })
        .finally(() => {
          this.loading1 = true;
        });
    },
    initInfo() {
      indexInfo()
        .then((resp) => {
          let res = resp.data;
          this.info = res.data.items;
        })
        .finally(() => {
          this.loading2 = true;
        });
    },
    edataInfo() {
      indexEgress()
        .then((resp) => {
          let res = resp.data;
          this.edata = res.data.items;
          this.ptitle = this.ptitle + '(采集时间:' + this.edata.date + ')';
        })
        .finally(() => {
          this.loading3 = true;
        });
    },
    initMock() {
      indexRestop({ host_type: "VM_WIN", metrics_type: "CPU", top_num: "5" })
        .then((resp) => {
          let res = resp.data;
          let arr = res.data.top_list || [];
          arr.sort((a, b) => {
            return b.score - a.score;
          });
          this.winC = arr.slice(0, 5);
        })
        .finally(() => {
          this.loading4 = true;
        });
      indexRestop({ host_type: "VM_WIN", metrics_type: "MEM", top_num: "5" })
        .then((resp) => {
          let res = resp.data;
          let arr = res.data.top_list || [];
          arr.sort((a, b) => {
            return b.score - a.score;
          });
          this.winM = arr.slice(0, 5);
        })
        .finally(() => {
          this.loading5 = true;
        });
      indexRestop({ host_type: "VM_LIN", metrics_type: "CPU", top_num: "5" })
        .then((resp) => {
          let res = resp.data;
          let arr = res.data.top_list || [];
          arr.sort((a, b) => {
            return b.score - a.score;
          });
          this.linC = arr.slice(0, 5);
        })
        .finally(() => {
          this.loading6 = true;
        });
      indexRestop({ host_type: "VM_LIN", metrics_type: "MEM", top_num: "5" })
        .then((resp) => {
          let res = resp.data;
          let arr = res.data.top_list || [];
          arr.sort((a, b) => {
            return b.score - a.score;
          });
          this.linM = arr.slice(0, 5);
        })
        .finally(() => {
          this.loading7 = true;
        });
    },
  },
  filters: {
    parsetime(v) {
      return parseTimeFun(v);
    },
    TrafficBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes';
      const k = 1000;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KBps', 'MBps', 'GBps', 'TBps', 'PBps', 'EBps', 'ZBps', 'YBps'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
    },
    kbFilters(v) {
      if (v && v > 0) {
        v = parseFloat(v);
        if (v <= 1024) {
          return v + "B/s";
        }
        if (v > 1024 && (v * 8) / 1024 < 1024) {
          return ((v * 8) / 1024).toFixed(2) + "Kb/s";
        }
        if ((v * 8) / 1024 > 1024 && (v * 8) / 1024 / 1024 < 1024) {
          return ((v * 8) / 1024 / 1024).toFixed(2) + "Mb/s";
        }
        if ((v * 8) / 1024 / 1024 > 1024) {
          return ((v * 8) / 1024 / 1024 / 1024).toFixed(2) + "Gb/s";
        }
      } else {
        return v;
      }
    },
  },
};
</script>

<style lang="less">
.homeMain {
  height: 430px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
}
.homeLegent1 {
  width: 100%;
  padding: 20px 30px 20px;
  border-bottom: 1px solid #ddd;
}
.homeLeItem1 {
  width: 100%;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
}
.homeLeLeft {
  flex: 0 0 40%;
}
.homeLeLeft1 {
  width: 90%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  img {
    width: 30px;
    height: auto;
    margin: 0 20px;
  }
  span {
    flex: 0 0 100px;
    border-left: 1px solid #ddd;
    font-size: 16px;
    line-height: 16px;
    font-weight: 500;
    color: #269414;
    text-align: center;
  }
}
.homeLeLeft2 {
  width: 90%;
  text-align: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: 500;
  color: #354052;
  line-height: 20px;
}
.homeLeRight {
  flex: 0 0 60%;
  height: 38px;
}
.homeLegent2 {
  width: 100%;
  padding: 20px 30px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}
.homeLeItem {
  flex: 0 0 48%;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 23px;
  height: 66px;
}
.homeLeTop {
  width: 100%;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.homeLeTop1 {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  img {
    width: 22px;
    height: auto;
  }
}
.homeLeTop2 {
  flex: 1;
  width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12px;
  font-weight: 500;
  color: #354052;
  line-height: 20px;
  margin: 0 10px;
}
.homeLeTop3 {
  font-size: 16px;
  line-height: 16px;
  font-weight: 500;
  color: #269414;
}
.homeLeBot {
  width: 100%;
  height: 20px;
}
.homeH2 {
  width: 100%;
  line-height: 100px;
  font-size: 40px;
  color: #000;
  font-weight: 600;
}
.homePies {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: center;
}
.homePied {
  flex: 0 0 20%;
  width: 0;
  height: 150px;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.homePie {
  width: 100%;
  height: 130px;
}
.homePieN {
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  color: #000;
  text-align: center;
  width: 80%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.homeHost {
  height: 156px;
  overflow: hidden;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.homeHItem {
  flex: 0 0 24%;
  max-width: 150px;
  height: 146px;
  border: 1px solid #ddd;
  border-radius: 10px;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  img {
    width: 54%;
    height: auto;
  }
  span {
    font-size: 14px;
    color: #999;
    margin: 12px 0;
    line-height: 14px;
  }
  em {
    display: inline-block;
    padding: 4px 0;
    font-size: 12px;
    line-height: 14px;
    color: #fff;
    font-style: normal;
    width: 64%;
    text-align: center;
    border-radius: 6px;
    background-color: #34aa44;
  }
}
.homeNet {
  height: 196px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}
.homeNetL {
  width: 1px;
  height: 160px;
  top: 18px;
  position: absolute;
  left: 150px;
  background-color: #e7e9ed;
}
.homeNet1 {
  height: 80px;
  width: 100%;
  display: inline-flex;
  align-items: center;
  margin: 10px 0;
}
.homeNet2 {
  flex: 0 0 180px;
  padding-left: 20px;
  display: inline-flex;
  align-items: center;
  img {
    width: 50px;
    height: 50px;
  }
  span {
    margin-left: 6px;
    font-size: 15px;
    line-height: 15px;
    font-weight: 600;
  }
}
.homeNet3 {
  flex: 0 0 160px;
  height: 70px;
  background-color: #fafbfc;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 10px;
  p {
    height: 30px;
    padding: 12px 0;
    display: inline-flex;
    align-items: center;
    font-size: 15px;
    margin: 0;
    span {
      font-size: 18px;
      font-weight: 600;
      margin-left: 4px;
    }
  }
  p:first-child {
    color: #6a7088;
    span {
      color: #38ba24;
    }
  }
  p:last-child {
    color: #632929;
    span {
      color: #442196;
    }
  }
}
.homeNet4 {
  flex: 1;
  height: 70px;
  overflow: hidden;
  margin-right: 10px;
  img {
    height: 70px;
    width: auto;
  }
}
</style>