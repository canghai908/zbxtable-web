<template>
  <page-layout :noTitle="true">
    <!-- 顶部标题栏 -->
    <div class="topology-header">
      <div class="header-content">
        <div class="topology-title">
          <a-icon type="apartment" class="title-icon" />
          <h1>{{ form.name || $t('title_topology_preview') }}</h1>
          <span v-if="form.updateTime" class="update-time">
            <a-icon type="clock-circle" />
            {{ $t('label_update_time') }}: {{ form.updateTime }}
          </span>
          <a-badge 
            :status="isWebSocket ? 'processing' : 'default'" 
            :text="isWebSocket ? $t('status_realtime_updating') : $t('status_not_connected')"
            class="status-badge"
          />
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
          <a-button @click="backToList()" style="margin-left: 12px;">
            <a-icon type="rollback" />
            {{ $t('btn_back_to_list') }}
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
import { topologyDetail } from '@/services/admin'
import { API_WS } from "@/services/api"
import Cookie from 'js-cookie'
import { fitGraphContent, getContainerSize } from './Graph/zoom'

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
);

export default {
  name: 'tuopu',
  i18n: require('./i18n'),
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
        gridType: 1,
        updateTime: '',
        canvasWidth: 1920,
        canvasHeight: 1080,
      },
      connection: null,
      isWebSocket: false,//判断是否链接成功！
      wsManualClose: false, // 是否为主动关闭（主动关闭不重连）
      wsReconnectTimer: null, // 重连定时器
      wsReconnectAttempts: 0, // 已重连次数（用于退避）
    }
  },
  created() {
    this.id = this.$route.query.id || ""
  },
  mounted() {
    this.$nextTick(() => {
      // 先初始化画布，再建立 WebSocket，避免消息早于 this.graph 到达导致渲染异常
      this.initX6()
      this.initWebSocket(this.id)
    })
  },
  beforeDestroy() {
    this.wsManualClose = true
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
    initX6() {
      var _that = this
      const container = document.getElementById('containerChart')
      const { width, height } = getContainerSize(container, {
        width: this.canvasHeight ? Math.max(window.innerWidth - 40, 800) : 800,
        height: this.canvasHeight || 600,
      })
      this.graph = new Graph({
        container,
        width,
        height,
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
          enabled: false, // 禁用 scroller，避免出现滚动条
        },
        // minimap: {//小地图
        //   enabled: true,
        //   width: 200,
        //   height: 160,
        //   padding: 10,
        //   container: minimapContainer
        // },
        selecting: {//允许选定
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
                  stroke: '#FF6B00', // 橙色，在背景图上更明显
                  strokeWidth: 3, // 加粗线条
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

        .topology-animated-line {
          animation: ant-line 30s infinite linear;
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
    initWebSocket() { //初始化websocket
      //init topo
      this.tuopuDetail(this.id)

      // 已存在连接时先清理，避免重复连接
      if (this.websock) {
        this.websock.onclose = null
        this.websock.close()
        this.websock = null
      }

      // 构建 WebSocket URL，通过 query 携带令牌（浏览器 WS 无法自定义 Authorization header）
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const token = Cookie.get('X-Token') || ''
      const qs = token ? `?token=${encodeURIComponent(token)}` : ''
      const wsUrl = `${protocol}//${window.location.host}${API_WS}/${this.id}${qs}`

      console.log('=== WebSocket Connection (Auth) ===')
      console.log('WebSocket URL:', wsUrl.replace(/token=[^&]+/, 'token=***'))

      //init websocket
      this.websock = new WebSocket(wsUrl);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketonclose;
    },
    websocketonopen() { //连接建立之后执行send方法发送数据
      this.isWebSocket = true;
      this.wsReconnectAttempts = 0 // 连接成功后重置退避计数
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
        this.initWebSocket(this.id)
      }, delay)
    },
    websocketonclose() {//断开
      this.isWebSocket = false
      this.scheduleReconnect()
    },
    websocketonerror() {//连接建立失败
      this.isWebSocket = false
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
    async websocketonmessage(e) { //数据接收
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
      const redata = JSON.parse(e.data);
      let X6Data = {}
      const { nodes, edges } = this.parseTopologyCells(redata.nodes, redata.edges)
      
      X6Data.cells = []
      X6Data.edges = edges
      X6Data.nodes = nodes
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
      
      // 强制重绘以确保文本正确渲染
      this.$nextTick(() => {
        this.graph.getNodes().forEach(node => {
          node.attr('label/text', node.attr('label/text'))
        })
      const container = document.getElementById('containerChart')
        const ports = container.querySelectorAll('.x6-port-body')
      this.showPorts(ports, false)
        // 保持居中和缩放，使用较大的padding确保文本不被裁剪
        fitGraphContent(this.graph, { padding: 100, maxScale: 1 })
      })
    },
    tuopuDetail() {
      if (this.id) {
        topologyDetail(this.id).then((resp) => {
          let res = resp.data
          let X6Data = {}
          if (res.code == 200) {
            // 适配新的响应格式：res.data 直接是拓扑对象
            const topologyData = res.data
            const { nodes, edges } = this.parseTopologyCells(topologyData.nodes, topologyData.edges)
            
            X6Data.cells = []
            X6Data.edges = edges
            X6Data.nodes = nodes
            this.X6Data = X6Data
            this.form.name = topologyData.topology
            this.form.status = topologyData.status
            this.form.updateTime = topologyData.updated_at ? this.formatTime(topologyData.updated_at) : ''
            
            // 加载画布尺寸（仅用于背景图计算，不影响显示）
            if (topologyData.canvas_width && topologyData.canvas_height) {
              this.form.canvasWidth = topologyData.canvas_width
              this.form.canvasHeight = topologyData.canvas_height
            }
            
            // 先加载节点和边
            this.graph.fromJSON(this.X6Data)
            this.applyAnimatedEdgeStyles()
            
            // 然后加载背景图（在 fromJSON 之后）
            if (topologyData.background_image) {
              try {
                let bgImage, bgSize, bgPosition, bgOpacity, naturalWidth, naturalHeight
                
                // 兼容新旧两种格式
                if (topologyData.background_image.startsWith('{')) {
                  // 旧格式：JSON（包含 base64）
                  const bgConfig = JSON.parse(topologyData.background_image)
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
                  bgImage = topologyData.background_image
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
                  img.src = topologyData.background_image
                }
              } catch (e) {
                console.error('解析背景图配置失败', e)
              }
            }
            
            // 强制重绘以确保文本正确渲染，并重新居中和缩放
            this.$nextTick(() => {
              this.graph.getNodes().forEach(node => {
                node.attr('label/text', node.attr('label/text'))
              })
              // 居中并自动缩放以适应画布，使用较大的padding确保文本不被裁剪
              fitGraphContent(this.graph, { padding: 100, maxScale: 1 })
            })
          } else {
            this.$message.error(res.message || this.$t('msg_load_topology_failed'))
          }
        }).catch((err) => {
          this.$message.error(this.$t('msg_load_topology_failed'))
          console.error(err)
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
// 顶部标题栏
.topology-header {
  background: #f4f5f6;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: none;
  position: relative;
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  max-width: 100%;
}

.topology-title {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .title-icon {
    font-size: 32px;
    color: #5d646e;
  }
  
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 500;
    color: #30343b;
  }
  
  .update-time {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #5d646e;
    font-size: 13px;
    font-weight: 400;
    padding: 4px 8px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    
    .anticon {
      font-size: 12px;
    }
  }
  
  .status-badge {
    ::v-deep .ant-badge-status-text {
      color: #5d646e;
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
    transition: color 160ms ease, background-color 160ms ease, border-color 160ms ease;
    
    &:hover {
      border-color: #bfc5cc;
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
  box-shadow: 0 2px 8px rgba(31, 35, 41, 0.12);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}
</style>
