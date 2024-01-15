<template>
  <page-layout :noTitle="true">
    <div class="tuopu" :style="`height: ${minHeight}px;`">
      <div id="containerChart" :style="`height: ${minHeight}px;`"></div>
      <div class="mini-map-container" id="minimapContainer">
      </div>
      <div class="operating">
        <div class="btn-group">
          <a-tooltip placement="bottom" v-if="isReading">
            <template slot="title">导出PNG</template>
            <div class="btn" @mousedown="saveToPNG()">
              <a-icon type="file-image" class="operate_icon" />
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template slot="title">导出SVG</template>
            <div class="btn" @mousedown="saveToSVG()">
              <a-icon type="save" class="operate_icon" />
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template slot="title"> 返回 </template>
            <div class="btn" @mousedown="backToList()">
              <a-icon type="rollback" class="operate_icon" />
            </div>
          </a-tooltip>
        </div>
      </div>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import insertCss from 'insert-css'
import '@antv/x6-vue-shape'
import { Graph, Shape, DataUri } from '@antv/x6'
import { startDragToGraph } from './Graph/methods.js'
import { topologyDetail } from '@/services/admin'
import { API_WS } from "@/services/api";

export default {
  name: 'tuopu',
  components: {
    PageLayout,
  },
  data() {
    return {
      isReading: true,
      id: '',
      title: "核心拓扑",
      minHeight: window.innerHeight,
      graph: '',
      type: 'grid',
      selectCell: null,
      connectEdgeType: {  //连线方式
        router: {
          name: ''
        }
      },
      // backgroundOptions: {
      //   color: 'rgb(41, 50, 54)',
      //   opacity: '1'
      // },
      sourceMarker: {
        name: 'path',
        size: 12,
      },
      targetMarker: {
        name: 'path',
        size: 12,
      },
      X6Data: {},
      currentArrow: 1,
      // grid: { // 网格设置
      //   size: 1,      // 网格大小 10px
      //   visible: true, // 渲染网格背景
      //   type: 'mesh',
      //   args: {
      //     color: '#D0D0D0',
      //     thickness: 1, // 网格线宽度/网格点大小
      //     factor: 10
      //   }
      // },
      form: {
        name: '',
        gridType: 1
      },
      connection: null,
      isWebSocket: false,//判断是否链接成功！
    }
  },
  created() {
    this.id = this.$route.query.id || ""
    this.initWebSocket(this.id)
  },
  mounted() {
    this.$nextTick(() => {
      this.initX6()
    })
  },
  methods: {
    initX6() {
      var _that = this
      const minimapContainer = document.getElementById('minimapContainer')
      this.graph = new Graph({
        container: document.getElementById('containerChart'),
        width: '100%',
        height: '100%',
        background: _that.backgroundOptions,
        grid: _that.grid,
        resizing: { // 调整节点宽高
          enabled: true,
          orthogonal: true,
          restricted: false,
          autoScroll: true,
        },
        clipboard: {
          enabled: true,
        },
        keyboard: {//键盘
          enabled: true,
          global: true,
        },
        scroller: {//拖动
          enabled: true,
          pageVisible: false,
          pageBreak: true,
          pannable: true,
          autoResize: true,
        },
        // minimap: {//小地图
        //   enabled: true,
        //   width: 200,
        //   height: 160,
        //   padding: 10,
        //   container: minimapContainer
        // },
        selecting: {//允许选定
          enabled: true,
          showNodeSelectionBox: true,
        },
        snapline: true,
        interacting: {
          edgeLabelMovable: false,
          vertexMovable: false,
          edgeMovable: false
        },
        connecting: {
          anchor: 'center',
          connectionPoint: 'anchor',
          allowBlank: false,
          snap: true,
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  HostType: '',
                  HostValue: '',
                  HostName: '',
                  HostID: '',
                  FlowName: '',
                  FlowID: '',
                  TriggerDesc: '',
                  TriggerID: '',
                  sourceMarker: _that.sourceMarker,
                  targetMarker: _that.sourceMarker,
                }
              },
              label: {
                text: '',
              },
              connector: _that.connectEdgeType.connector,
              router: {
                name: _that.connectEdgeType.router.name || ''
              },
              zIndex: 0
            })
          }
        },
        highlighting: {
          magnetAvailable: {
            name: 'stroke',
            args: {
              padding: 4,
              attrs: {
                strokeWidth: 4,
                stroke: '#6a6c8a'
              }
            }
          }
        }
      })
      insertCss(`
        @keyframes ant-line {
          to {
              stroke-dashoffset: -1000
          }
        }
      `)
      // this.graph.fromJSON(this.X6Data)
      this.graph.history.redo()
      this.graph.history.undo()
      this.graph.enablePanning()
      this.graph.enableMouseWheel()
      this.graph.centerContent()

    },
    saveToPNG() {
      this.$nextTick(() => {
        this.graph.toPNG((dataUri) => {
          // 下载
          DataUri.downloadDataUri(dataUri, this.form.name + '.png')
        }, {
          backgroundColor: 'white',
          padding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
          },
          quality: 1,
          copyStyles: false
        })
      })
    },
    saveToSVG() {
      this.$nextTick(() => {
        this.graph.toPNG((dataUri) => {
          // 下载
          DataUri.downloadDataUri(dataUri, this.form.name + '.svg')
        }, {
          backgroundColor: 'white',
          padding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50
          },
          quality: 1,
          copyStyles: false
        })
      })
    },
    showPorts(ports, show) {
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? 'visible' : 'hidden'
      }
    },
    backToList() {
      this.$router.push("/topology/list")
    },
    initWebSocket() { //初始化websocket
      //init topo
      this.tuopuDetail(this.id)
      let url = new URL(this.url, window.location.href)
      if (url.protocol == "http:") {
        url.protocol = url.protocol.replace('http:', 'ws')
      } else {
        url.protocol = url.protocol.replace('https:', 'wss')
      }
      //init websocket
      this.websock = new WebSocket(url.origin + API_WS + "/" + this.id);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      // this.websock.onclose = this.websocketonclose;
    },
    websocketonopen() { //连接建立之后执行send方法发送数据
      this.isWebSocket = true;
      this.websock.send("success")
      this.$message.success("Websocket链接成功")

    },
    websocketonclose() {//断开
      // setTimeout(this.$message.info("重新建立Websocket连接中11"), 5000);
      // setTimeout(this.initWebSocket(), 5000); //重连
    },
    websocketonerror() {//连接建立失败重连
      // setTimeout(this.$message.info("重新建立Websocket连接中22"), 5000);
      // this.initWebSocket()
    },
    websocketonmessage(e) { //数据接收
      const redata = JSON.parse(e.data);
      let X6Data = {}
      let edges = JSON.parse(redata.nodes)
      let nodes = JSON.parse(redata.edges)
      X6Data.cells = []
      X6Data.edges = edges
      X6Data.nodes = nodes
      this.X6Data = X6Data
      this.graph.fromJSON(this.X6Data)
      this.form.name = redata.topology
      const container = document.getElementById('containerChart')
      const ports = container.querySelectorAll(
        '.x6-port-body'
      )
      this.showPorts(ports, false)
      this.websock.send("success");
    },
    tuopuDetail() {
      if (this.id) {
        topologyDetail(this.id).then((resp) => {
          let res = resp.data
          let X6Data = {}
          if (res.code == 200) {
            let edges = JSON.parse(res.data.items.edges)
            let nodes = JSON.parse(res.data.items.nodes)
            X6Data.cells = []
            X6Data.edges = edges
            X6Data.nodes = nodes
            this.X6Data = X6Data
            this.graph.fromJSON(this.X6Data)
            this.form.name = res.data.items.topology
            this.form.status = res.data.items.status
          }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.tuopu_bg {
  width: 708px;
}
.mini-map-container {
  position: fixed;
  z-index: 999;
  bottom: 20px;
  right: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>
