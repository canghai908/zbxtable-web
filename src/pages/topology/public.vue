<template>
  <div class="public-topology-container">
    <!-- 顶部标题栏 -->
    <div class="topology-header">
      <div class="header-content">
        <div class="topology-title">
          <a-icon type="apartment" class="title-icon" />
          <h1>{{ form.name || '拓扑预览' }}</h1>
          <a-badge :status="isWebSocket ? 'processing' : 'default'" :text="isWebSocket ? '实时更新中' : '未连接'" class="status-badge" />
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
        </div>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="tuopu" :style="`height: ${canvasHeight}px;`">
      <div id="containerChart" :style="`height: ${canvasHeight}px;`"></div>
      <div class="mini-map-container" id="minimapContainer"></div>
    </div>
  </div>
</template>

<script>
import insertCss from 'insert-css'
import '@antv/x6-vue-shape'
import { Graph, Shape, DataUri } from '@antv/x6'
import axios from 'axios'

// 创建独立的 axios 实例，用于公开接口（不带 token，不使用全局拦截器）
const publicAxios = axios.create({
  timeout: 20000,
  withCredentials: false, // 不发送 cookies
})

export default {
  name: 'PublicTopology',
  data() {
    return {
      id: '',
      minHeight: window.innerHeight,
      canvasHeight: window.innerHeight - 80,
      graph: '',
      X6Data: {},
      form: {
        name: '',
      },
      connection: null,
      isWebSocket: false,
      websock: null,
    }
  },
  created() {
    this.id = this.$route.query.id || ""
    if (!this.id) {
      this.$message.error('缺少拓扑ID参数')
      return
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initX6()
      this.loadTopologyData()
    })
  },
  beforeDestroy() {
    if (this.websock) {
      this.websock.close()
    }
  },
  methods: {
    initX6() {
      this.graph = new Graph({
        container: document.getElementById('containerChart'),
        width: '100%',
        height: '100%',
        resizing: {
          enabled: true,
          orthogonal: true,
          restricted: false,
          autoScroll: true,
        },
        clipboard: {
          enabled: true,
        },
        keyboard: {
          enabled: true,
          global: true,
        },
        scroller: {
          enabled: true,
          pageVisible: true,
          pageBreak: false,
          pannable: true,
          autoResize: true,
          pageWidth: 3000,
          pageHeight: 2000,
        },
        selecting: {
          enabled: true,
          showNodeSelectionBox: true,
        },
        snapline: true,
        interacting: {
          edgeLabelMovable: false,
          vertexMovable: false,
          edgeMovable: false
        },
      })
      
      insertCss(`
        @keyframes ant-line {
          to {
              stroke-dashoffset: -1000
          }
        }
      `)
      
      this.graph.history.redo()
      this.graph.history.undo()
      this.graph.enablePanning()
      this.graph.enableMouseWheel()
      this.graph.centerContent()
    },
    
    saveToPNG() {
      this.$nextTick(() => {
        this.graph.toPNG((dataUri) => {
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
    
    initWebSocket() {
      // 构建 WebSocket URL
      // 自动从浏览器地址获取，支持开发和生产环境
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
     // const wsUrl = `${protocol}//${host}/public/ws/${this.id}`
      const wsUrl = `${protocol}//${host}/pb/ws/${this.id}`
      console.log('=== WebSocket Connection Debug ===')
      console.log('Environment:', process.env.NODE_ENV)
      console.log('Current location:', window.location.href)
      console.log('Protocol:', window.location.protocol)
      console.log('Host:', window.location.host)
      console.log('WebSocket URL:', wsUrl)
      console.log('Topology ID:', this.id)
      
      this.websock = new WebSocket(wsUrl)
      
      this.websock.onopen = (event) => {
        console.log('WebSocket onopen event:', event)
        this.websocketonopen()
      }
      
      this.websock.onmessage = (event) => {
        console.log('WebSocket onmessage event:', event)
        console.log('Message data:', event.data)
        this.websocketonmessage(event)
      }
      
      this.websock.onerror = (event) => {
        console.error('WebSocket onerror event:', event)
        this.websocketonerror(event)
      }
      
      this.websock.onclose = (event) => {
        console.log('WebSocket onclose event:', event)
        console.log('Close code:', event.code)
        console.log('Close reason:', event.reason)
        console.log('Was clean:', event.wasClean)
        this.websocketonclose(event)
      }
    },
    
    websocketonopen() {
      console.log('WebSocket connection opened successfully')
      this.isWebSocket = true
      console.log('Sending initial "success" message')
      this.websock.send("success")
      this.$message.success("实时更新已连接")
    },
    
    websocketonclose() {
      this.isWebSocket = false
      this.$message.warning("实时更新已断开")
    },
    
    websocketonerror(error) {
      this.isWebSocket = false
      console.error('WebSocket error occurred:', error)
      console.error('WebSocket readyState:', this.websock?.readyState)
      this.$message.error('WebSocket连接错误')
    },
    
    websocketonmessage(e) {
      const redata = JSON.parse(e.data)
      let X6Data = {}
      // 注意：这里的 nodes 和 edges 字段名称与后端返回的对应
      let nodes = JSON.parse(redata.nodes)
      let edges = JSON.parse(redata.edges)
      X6Data.cells = []
      X6Data.nodes = nodes
      X6Data.edges = edges
      this.X6Data = X6Data
      this.graph.fromJSON(this.X6Data)
      this.form.name = redata.topology
      
      this.$nextTick(() => {
        this.graph.getNodes().forEach(node => {
          node.attr('label/text', node.attr('label/text'))
        })
        const container = document.getElementById('containerChart')
        const ports = container.querySelectorAll('.x6-port-body')
        this.showPorts(ports, false)
        this.graph.centerContent()
        this.graph.zoomToFit({ padding: 100, maxScale: 1 })
      })
      
      this.websock.send("success")
    },
    
    loadTopologyData() {
      // 使用独立的 axios 实例，避免全局拦截器干扰
      publicAxios.get(`/public/topology/${this.id}`)
        .then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            // 注意：这里的 nodes 和 edges 字段名称与后端返回的对应
            let nodes = JSON.parse(res.data.items.nodes)
            let edges = JSON.parse(res.data.items.edges)
            let X6Data = {}
            X6Data.cells = []
            X6Data.nodes = nodes
            X6Data.edges = edges
            this.X6Data = X6Data
            this.graph.fromJSON(this.X6Data)
            this.form.name = res.data.items.topology
            
            this.$nextTick(() => {
              this.graph.getNodes().forEach(node => {
                node.attr('label/text', node.attr('label/text'))
              })
              this.graph.centerContent()
              this.graph.zoomToFit({ padding: 100, maxScale: 1 })
            })
            
            // 数据加载成功后再初始化 WebSocket
            this.initWebSocket()
          } else if (res.code == 403) {
            this.$message.error(res.message)
          } else {
            this.$message.error('加载拓扑失败')
          }
        })
        .catch((error) => {
          console.error('Load topology error:', error)
          this.$message.error('加载拓扑失败: ' + (error.response?.data?.message || error.message))
        })
    }
  }
}
</script>

<style lang="less" scoped>
.public-topology-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

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
