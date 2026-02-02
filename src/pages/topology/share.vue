<template>
  <div class="public-topology-container">
    <!-- 顶部标题栏 -->
    <div class="topology-header">
      <div class="header-content">
        <div class="topology-title">
          <a-icon type="apartment" class="title-icon" />
          <h1>共享拓扑{{ form.name ? ' - ' + form.name : '' }}</h1>
          <span v-if="form.updateTime" class="update-time">
            <a-icon type="clock-circle" />
            更新时间: {{ form.updateTime }}
          </span>
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
    console.log('Component beforeDestroy - closing WebSocket')
    this.wsInitialized = false
    if (this.websock) {
      this.websock.close()
      this.websock = null
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
      console.log('Sending initial "success" message')
      this.websock.send("success")
      this.$message.success("WebSocket已连接")
    },
    
    websocketonclose() {
      this.isWebSocket = false
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
      
      // 确保所有节点都有 shape 属性
      nodes = nodes.map(node => {
        if (!node.shape) {
          // 根据节点属性判断类型
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
      
      // 确保所有边都有 shape 属性
      edges = edges.map(edge => {
        if (!edge.shape) {
          edge.shape = 'edge'
        }
        return edge
      })
      
      X6Data.cells = []
      X6Data.nodes = nodes
      X6Data.edges = edges
      this.X6Data = X6Data
      this.form.name = redata.topology
      this.form.updateTime = redata.updated_at ? this.formatTime(redata.updated_at) : ''
      
      // 先加载节点和边
      this.graph.fromJSON(this.X6Data)
      
      // 然后加载背景图（在 fromJSON 之后）
      if (redata.background_image) {
        try {
          const bgConfig = JSON.parse(redata.background_image)
          const bgImage = bgConfig.image
          const bgSize = bgConfig.size || 'cover'
          const bgPosition = bgConfig.position || 'center'
          const bgOpacity = (bgConfig.opacity || 100) / 100
          const naturalWidth = bgConfig.naturalWidth || 0
          const naturalHeight = bgConfig.naturalHeight || 0
          
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
            
            // 确保所有节点都有 shape 属性
            nodes = nodes.map(node => {
              if (!node.shape) {
                // 根据节点属性判断类型
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
            
            // 确保所有边都有 shape 属性
            edges = edges.map(edge => {
              if (!edge.shape) {
                edge.shape = 'edge'
              }
              return edge
            })
            
            let X6Data = {}
            X6Data.cells = []
            X6Data.nodes = nodes
            X6Data.edges = edges
            this.X6Data = X6Data
            this.form.name = res.data.items.topology
            this.form.updateTime = res.data.items.updated_at ? this.formatTime(res.data.items.updated_at) : ''
            
            // 加载画布尺寸（仅用于背景图计算，不影响显示）
            if (res.data.items.canvas_width && res.data.items.canvas_height) {
              this.form.canvasWidth = res.data.items.canvas_width
              this.form.canvasHeight = res.data.items.canvas_height
            }
            
            // 先加载节点和边
            this.graph.fromJSON(this.X6Data)
            
            // 然后加载背景图（在 fromJSON 之后）
            if (res.data.items.background_image) {
              try {
                const bgConfig = JSON.parse(res.data.items.background_image)
                const bgImage = bgConfig.image
                const bgSize = bgConfig.size || 'cover'
                const bgPosition = bgConfig.position || 'center'
                const bgOpacity = (bgConfig.opacity || 100) / 100
                const naturalWidth = bgConfig.naturalWidth || 0
                const naturalHeight = bgConfig.naturalHeight || 0
                
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
