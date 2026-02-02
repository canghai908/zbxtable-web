<template>
  <page-layout :noTitle="true">
    <!-- 顶部标题栏 -->
    <div class="topology-header">
      <div class="header-content">
        <div class="topology-title">
          <a-icon type="apartment" class="title-icon" />
          <h1>{{ form.name || '拓扑预览' }}</h1>
          <a-badge 
            :status="isWebSocket ? 'processing' : 'default'" 
            :text="isWebSocket ? '实时更新中' : '未连接'"
            class="status-badge"
          />
      </div>
        <div class="header-actions">
          <a-button-group>
            <a-button @click="saveToPNG()">
              <a-icon type="file-image" />
              导出PNG
            </a-button>
            <a-button @click="saveToSVG()">
              <a-icon type="save" />
              导出SVG
            </a-button>
          </a-button-group>
          <a-button @click="backToList()" style="margin-left: 12px;">
            <a-icon type="rollback" />
            返回列表
          </a-button>
        </div>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="tuopu" :style="`height: ${canvasHeight}px;`">
      <div id="containerChart" :style="`height: ${canvasHeight}px;`"></div>
      <div class="mini-map-container" id="minimapContainer"></div>
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
      canvasHeight: window.innerHeight - 80, // 减去标题栏高度
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
          pageVisible: true,
          pageBreak: false,
          pannable: true,
          autoResize: true,
          pageWidth: 3000, // 定义虚拟画布宽度
          pageHeight: 2000, // 定义虚拟画布高度
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
      
      // 强制重绘以确保文本正确渲染
      this.$nextTick(() => {
        this.graph.getNodes().forEach(node => {
          node.attr('label/text', node.attr('label/text'))
        })
      const container = document.getElementById('containerChart')
        const ports = container.querySelectorAll('.x6-port-body')
      this.showPorts(ports, false)
        // 保持居中和缩放，使用较大的padding确保文本不被裁剪
        this.graph.centerContent()
        this.graph.zoomToFit({ padding: 100, maxScale: 1 })
      })
      
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
            
            // 强制重绘以确保文本正确渲染，并重新居中和缩放
            this.$nextTick(() => {
              this.graph.getNodes().forEach(node => {
                node.attr('label/text', node.attr('label/text'))
              })
              // 居中并自动缩放以适应画布，使用较大的padding确保文本不被裁剪
              this.graph.centerContent()
              this.graph.zoomToFit({ padding: 100, maxScale: 1 })
            })
          }
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
// 顶部标题栏
.topology-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  max-width: 100%;
}

.topology-title {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .title-icon {
    font-size: 32px;
    color: #fff;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
  
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    letter-spacing: 0.5px;
  }
  
  .status-badge {
    ::v-deep .ant-badge-status-text {
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      font-weight: 500;
    }
    
    ::v-deep .ant-badge-status-dot {
      width: 8px;
      height: 8px;
}
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .ant-btn {
    height: 36px;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

// 画布区域
.tuopu {
  position: relative;
  overflow: hidden;
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
}

// 防止节点文本被画布边界裁剪
::v-deep #containerChart {
  .x6-graph-scroller {
    overflow: auto !important;
  }
  
  // 美化滚动条
  .x6-graph-scroller::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .x6-graph-scroller::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 5px;
  }
  
  .x6-graph-scroller::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    transition: background 0.3s;
    
    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}

// 小地图容器
.mini-map-container {
  position: fixed;
  z-index: 999;
  bottom: 24px;
  right: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.8);
}
</style>
