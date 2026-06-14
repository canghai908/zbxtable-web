<template>
  <div class="public-topology-container">
    <!-- 顶部标题栏 -->
    <div class="topology-header" :style="{ background: `linear-gradient(135deg, ${$themeColor} 0%, ${adjustColor($themeColor, -30)} 100%)` }">
      <div class="header-content">
        <div class="topology-title">
          <a-icon type="apartment" class="title-icon" />
          <h1>{{ $t('title_shared_topology') }}{{ form.name ? ' - ' + form.name : '' }}</h1>
          <span v-if="form.updateTime" class="update-time">
            <a-icon type="clock-circle" />
            {{ $t('label_update_time') }}: {{ form.updateTime }}
          </span>
          <a-badge :status="isWebSocket ? 'processing' : 'default'" :text="isWebSocket ? $t('status_realtime_updating') : $t('status_not_connected')" class="status-badge" />
        </div>
        <div class="header-actions">
          <a-button-group>
            <a-button @click="saveToPNG()">
              <a-icon type="file-image" />
              {{ $t('btn_export_png') }}
            </a-button>
            <a-button @click="saveToSVG()">
              <a-icon type="save" />
              {{ $t('btn_export_svg') }}
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
import { Graph, DataUri } from '@antv/x6'
import axios from 'axios'

// 创建独立的 axios 实例，用于公开接口（不带 token，不使用全局拦截器）
const publicAxios = axios.create({
  timeout: 20000,
  withCredentials: false, // 不发送 cookies
})

// 注册文字节点类型
Graph.registerNode(
  'text-node',
  {
    inherit: 'rect',
    width: 200,
    height: 60,
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'text',
        selector: 'label',
      },
    ],
    attrs: {
      body: {
        fill: 'transparent',  // 背景透明
        stroke: 'transparent', // 边框透明
        strokeWidth: 1,
        rx: 4,
        ry: 4,
      },
      label: {
        text: '双击编辑文字',
        fill: '#333333',
        fontSize: 14,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        refX: '50%',
        refY: '50%',
        textWrap: {
          width: -20,
          height: -20,
          ellipsis: true,
        },
      },
    },
  },
  true
)

// 定义端口配置
const ports = {
  groups: {
    top: {
      position: "top",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
    bottom: {
      position: "bottom",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
    left: {
      position: "left",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
    right: {
      position: "right",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
  },
  items: [
    {
      id: "port1",
      group: "top",
    },
    {
      id: "port2",
      group: "bottom",
    },
    {
      id: "port3",
      group: "left",
    },
    {
      id: "port4",
      group: "right",
    },
  ],
}

// 注册自定义节点类型
Graph.registerNode(
  "custom-image",
  {
    inherit: "rect",
    width: 60,
    height: 60,
    markup: [
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "image",
      },
      {
        tagName: "text",
        selector: "label",
      },
    ],
    attrs: {
      body: {
        rx: 0,
        ry: 0,
        stroke: "rgba(95,149,255,0.00)",
        strokeWidth: 1,
        fill: "rgba(95,149,255,0.00)",
      },
      image: {
        width: 60,
        height: 60,
        refX: 0,
        refY: 0,
      },
      label: {
        refX: 0.5,
        refY: 80,
        textAnchor: "middle",
        textVerticalAnchor: "bottom",
        fontSize: 14,
        fill: "#000",
        textWrap: {
          width: 120,
          height: 40,
          ellipsis: true,
        },
      },
    },
    ports: { ...ports },
  },
  true
)

export default {
  name: 'PublicTopology',
  i18n: require('./i18n'),
  data() {
    return {
      id: '',
      minHeight: window.innerHeight,
      canvasHeight: window.innerHeight - 80,
      graph: '',
      X6Data: {},
      form: {
        name: '',
        updateTime: '',
        canvasWidth: 1920,
        canvasHeight: 1080,
      },
      connection: null,
      isWebSocket: false,
      websock: null,
      wsInitialized: false, // 防止重复初始化
      wsManualClose: false, // 是否为主动关闭（主动关闭不重连）
      wsReconnectTimer: null, // 重连定时器
      wsReconnectAttempts: 0, // 已重连次数（用于退避）
    }
  },
  created() {
    this.id = this.$route.query.id || ""
    if (!this.id) {
      this.$message.error(this.$t('msg_missing_topology_id'))
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
    console.log('Component beforeDestroy - closing WebSocket')
    this.wsManualClose = true
    this.wsInitialized = false
    if (this.wsReconnectTimer) {
      clearTimeout(this.wsReconnectTimer)
      this.wsReconnectTimer = null
    }
    if (this.websock) {
      this.websock.onclose = null // 避免主动关闭触发重连
      this.websock.close()
      this.websock = null
    }
  },
  methods: {
    adjustColor(color, amount) {
      const hex = color.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      
      const newR = Math.max(0, Math.min(255, r + amount))
      const newG = Math.max(0, Math.min(255, g + amount))
      const newB = Math.max(0, Math.min(255, b + amount))
      
      return '#' + 
        newR.toString(16).padStart(2, '0') + 
        newG.toString(16).padStart(2, '0') + 
        newB.toString(16).padStart(2, '0')
    },
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
          enabled: false, // 禁用 scroller，避免出现滚动条
        },
        selecting: {
          enabled: false, // 禁用选择
          showNodeSelectionBox: false,
        },
        snapline: true,
        interacting: {
          nodeMovable: false, // 禁止移动节点
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

        .topology-animated-line {
          animation: ant-line 30s infinite linear;
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
    
    formatTime(timeStr) {
      if (!timeStr) return ''
      const date = new Date(timeStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    applyBackgroundImage(bgImage, bgSize, bgPosition, bgOpacity, naturalWidth, naturalHeight) {
      // 移除旧的背景图
      const oldBg = this.graph.getCellById('canvas-background')
      if (oldBg) {
        this.graph.removeCell(oldBg)
      }
      
      if (naturalWidth && naturalHeight) {
        // 计算背景图的位置和尺寸
        let bgWidth, bgHeight, bgX, bgY
        
        if (bgSize === 'cover') {
          const canvasRatio = this.form.canvasWidth / this.form.canvasHeight
          const imageRatio = naturalWidth / naturalHeight
          
          if (imageRatio > canvasRatio) {
            bgHeight = this.form.canvasHeight
            bgWidth = bgHeight * imageRatio
          } else {
            bgWidth = this.form.canvasWidth
            bgHeight = bgWidth / imageRatio
          }
        } else if (bgSize === 'contain') {
          const canvasRatio = this.form.canvasWidth / this.form.canvasHeight
          const imageRatio = naturalWidth / naturalHeight
          
          if (imageRatio > canvasRatio) {
            bgWidth = this.form.canvasWidth
            bgHeight = bgWidth / imageRatio
          } else {
            bgHeight = this.form.canvasHeight
            bgWidth = bgHeight * imageRatio
          }
        } else {
          bgWidth = naturalWidth
          bgHeight = naturalHeight
        }
        
        // 计算位置
        if (bgPosition === 'center') {
          bgX = (this.form.canvasWidth - bgWidth) / 2
          bgY = (this.form.canvasHeight - bgHeight) / 2
        } else if (bgPosition === 'top') {
          bgX = (this.form.canvasWidth - bgWidth) / 2
          bgY = 0
        } else if (bgPosition === 'bottom') {
          bgX = (this.form.canvasWidth - bgWidth) / 2
          bgY = this.form.canvasHeight - bgHeight
        }
        
        // 添加背景图节点
        this.graph.addNode({
          id: 'canvas-background',
          shape: 'image',
          x: bgX,
          y: bgY,
          width: bgWidth,
          height: bgHeight,
          zIndex: -2,
          imageUrl: bgImage,
          attrs: {
            image: {
              opacity: bgOpacity,
            },
          },
          selectable: false,
          movable: false,
          resizable: false,
          rotatable: false,
        })
      }
    },
    
    initWebSocket() {
      // 防止重复初始化
      if (this.wsInitialized) {
        console.warn('WebSocket already initialized, skipping...')
        return
      }
      
      // 如果已有连接，先关闭
      if (this.websock) {
        console.log('Closing existing WebSocket connection...')
        this.websock.close()
        this.websock = null
      }
      
      this.wsInitialized = true
      this.wsManualClose = false

      // 构建 WebSocket URL - 使用统一的 /ws/public 路径（共享）
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws/pub/${this.id}`
      
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
      this.wsReconnectAttempts = 0 // 连接成功后重置退避计数
      console.log('Sending initial "success" message')
      this.websock.send("success")
      this.$message.success(this.$t('msg_websocket_connected'))
    },

    scheduleReconnect() { // 断线重连（指数退避，封顶 30s）
      if (this.wsManualClose) return
      if (this.wsReconnectTimer) return
      const delay = Math.min(3000 * Math.pow(2, this.wsReconnectAttempts), 30000)
      this.wsReconnectAttempts++
      console.log(`WebSocket 将在 ${delay}ms 后重连（第 ${this.wsReconnectAttempts} 次）`)
      this.wsReconnectTimer = setTimeout(() => {
        this.wsReconnectTimer = null
        this.wsInitialized = false // 允许重新初始化
        this.initWebSocket()
      }, delay)
    },

    websocketonclose() {
      this.isWebSocket = false
      this.scheduleReconnect()
    },

    websocketonerror(error) {
      this.isWebSocket = false
      console.error('WebSocket error occurred:', error)
      console.error('WebSocket readyState:', this.websock?.readyState)
      // onerror 之后浏览器通常会触发 onclose，由 onclose 统一重连
    },
    
    parseTopologyCells(nodesJSON, edgesJSON) {
      let nodes = []
      let edges = []

      try {
        nodes = nodesJSON ? JSON.parse(nodesJSON) : []
        edges = edgesJSON ? JSON.parse(edgesJSON) : []
      } catch (error) {
        console.error('解析拓扑数据失败:', error)
        return { nodes: [], edges: [] }
      }

      nodes = Array.isArray(nodes) ? nodes : []
      edges = Array.isArray(edges) ? edges : []

      nodes = nodes.map(node => {
        if (!node.shape) {
          if (node.attrs && node.attrs.image) {
            node.shape = 'custom-image'
          } else if (node.attrs && node.attrs.label && !node.attrs.image) {
            node.shape = 'text-node'
          } else {
            node.shape = 'custom-image'
          }
        }
        return node
      })

      edges = edges.map(edge => {
        if (!edge.shape) {
          edge.shape = 'edge'
        }
        const line = edge.attrs && edge.attrs.line ? edge.attrs.line : null
        if (line) {
          const dash = line.strokeDasharray
          if (typeof dash === 'number' && dash > 0) {
            line.strokeDasharray = `${dash} ${dash}`
          } else if (typeof dash === 'string' && /^\d+$/.test(dash)) {
            line.strokeDasharray = `${dash} ${dash}`
          }
        }
        return edge
      })

      return { nodes, edges }
    },
    applyAnimatedEdgeStyles() {
      if (!this.graph) {
        return
      }
      this.graph.getEdges().forEach((edge) => {
        const attrs = edge.getAttrs() || {}
        const line = attrs.line || {}
        const style = line.style || {}
        const animation = style.animation || line.animation || ''
        const dash = line.strokeDasharray
        if (animation) {
          if (typeof dash === 'number' && dash > 0) {
            edge.attr('line/strokeDasharray', `${dash} ${dash}`)
          } else if (typeof dash === 'string' && /^\d+$/.test(dash)) {
            edge.attr('line/strokeDasharray', `${dash} ${dash}`)
          }
          edge.attr('line/class', 'topology-animated-line')
          edge.attr('line/style/animation', animation)
          edge.attr('line/style/strokeDashoffset', 0)
        } else {
          edge.attr('line/class', '')
        }
      })
    },
    
    async websocketonmessage(e) {
      try {
        await this.renderTopologyMessage(e)
      } catch (err) {
        console.error('渲染拓扑消息失败:', err)
      } finally {
        // 无论渲染是否成功，都要回发 success，维持服务端的刷新循环
        if (this.websock && this.websock.readyState === WebSocket.OPEN) {
          this.websock.send("success")
        }
      }
    },

    async renderTopologyMessage(e) {
      const redata = JSON.parse(e.data)
      let X6Data = {}
      const { nodes, edges } = this.parseTopologyCells(redata.nodes, redata.edges)
      
      X6Data.cells = []
      X6Data.nodes = nodes
      X6Data.edges = edges
      this.X6Data = X6Data
      this.form.name = redata.topology
      this.form.updateTime = redata.updated_at ? this.formatTime(redata.updated_at) : ''
      
      // 先加载节点和边
      this.graph.fromJSON(this.X6Data)
      this.applyAnimatedEdgeStyles()
      
      // 然后加载背景图（在 fromJSON 之后）
      if (redata.background_image) {
        try {
          let bgImage, bgSize, bgPosition, bgOpacity, naturalWidth, naturalHeight
          
          // 兼容新旧两种格式
          if (redata.background_image.startsWith('{')) {
            // 旧格式：JSON（包含 base64）
            const bgConfig = JSON.parse(redata.background_image)
            bgImage = bgConfig.image
            bgSize = bgConfig.size || 'cover'
            bgPosition = bgConfig.position || 'center'
            bgOpacity = (bgConfig.opacity || 100) / 100
            naturalWidth = bgConfig.naturalWidth || 0
            naturalHeight = bgConfig.naturalHeight || 0
            
            // 应用背景图
            this.applyBackgroundImage(bgImage, bgSize, bgPosition, bgOpacity, naturalWidth, naturalHeight)
          } else {
            // 新格式：直接是图片路径
            bgImage = redata.background_image
            bgSize = 'cover'
            bgPosition = 'center'
            bgOpacity = 1
            // 需要加载图片获取尺寸
            const img = new Image()
            img.onload = () => {
              naturalWidth = img.naturalWidth
              naturalHeight = img.naturalHeight
              // 应用背景图
              this.applyBackgroundImage(bgImage, bgSize, bgPosition, bgOpacity, naturalWidth, naturalHeight)
            }
            img.onerror = () => {
              console.error('背景图加载失败')
            }
            img.src = redata.background_image
          }
        } catch (e) {
          console.error('解析背景图配置失败', e)
        }
      }
      
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
    },

    loadTopologyData() {
      // 使用独立的 axios 实例，避免全局拦截器干扰
      publicAxios.get(`/public/topology/${this.id}`)
        .then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            const { nodes, edges } = this.parseTopologyCells(res.data.nodes, res.data.edges)
            
            let X6Data = {}
            X6Data.cells = []
            X6Data.nodes = nodes
            X6Data.edges = edges
            this.X6Data = X6Data
            this.form.name = res.data.topology
            this.form.updateTime = res.data.updated_at ? this.formatTime(res.data.updated_at) : ''
            
            // 加载画布尺寸（仅用于背景图计算，不影响显示）
            if (res.data.canvas_width && res.data.canvas_height) {
              this.form.canvasWidth = res.data.canvas_width
              this.form.canvasHeight = res.data.canvas_height
            }
            
            // 先加载节点和边
            this.graph.fromJSON(this.X6Data)
            this.applyAnimatedEdgeStyles()
            
            // 然后加载背景图（在 fromJSON 之后）
            if (res.data.background_image) {
              try {
                let bgImage, bgSize, bgPosition, bgOpacity, naturalWidth, naturalHeight
                
                // 兼容新旧两种格式
                if (res.data.background_image.startsWith('{')) {
                  // 旧格式：JSON（包含 base64）
                  const bgConfig = JSON.parse(res.data.background_image)
                  bgImage = bgConfig.image
                  bgSize = bgConfig.size || 'cover'
                  bgPosition = bgConfig.position || 'center'
                  bgOpacity = (bgConfig.opacity || 100) / 100
                  naturalWidth = bgConfig.naturalWidth || 0
                  naturalHeight = bgConfig.naturalHeight || 0
                  
                  // 应用背景图
                  this.applyBackgroundImage(bgImage, bgSize, bgPosition, bgOpacity, naturalWidth, naturalHeight)
                } else {
                  // 新格式：直接是图片路径
                  bgImage = res.data.background_image
                  bgSize = 'cover'
                  bgPosition = 'center'
                  bgOpacity = 1
                  // 需要加载图片获取尺寸
                  const img = new Image()
                  img.onload = () => {
                    naturalWidth = img.naturalWidth
                    naturalHeight = img.naturalHeight
                    // 应用背景图
                    this.applyBackgroundImage(bgImage, bgSize, bgPosition, bgOpacity, naturalWidth, naturalHeight)
                  }
                  img.onerror = () => {
                    console.error('背景图加载失败')
                  }
                  img.src = res.data.background_image
                }
              } catch (e) {
                console.error('解析背景图配置失败', e)
              }
            }
            
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
            this.$message.error(this.$t('msg_load_topology_failed'))
          }
        })
        .catch((error) => {
          console.error('Load topology error:', error)
          this.$message.error(this.$t('msg_load_topology_failed') + ': ' + (error.response?.data?.message || error.message))
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
  transition: background 0.3s ease;
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
  
  .update-time {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 13px;
    font-weight: 400;
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    
    .anticon {
      font-size: 12px;
    }
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
  overflow: hidden; // 隐藏溢出，防止滚动条
  background: #ffffff;
}

// 防止节点文本被画布边界裁剪
::v-deep #containerChart {
  overflow: hidden !important; // 强制隐藏滚动条
  
  .x6-graph-scroller {
    overflow: hidden !important; // 强制隐藏滚动条
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
