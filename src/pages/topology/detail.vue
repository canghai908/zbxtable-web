<template>
  <page-layout :noTitle="true">
    <div class="topology-header">
      <div class="header-row">
        <div class="topology-info">
          <h2>{{ isReading ? '查看拓扑' : (id ? '编辑拓扑' : '新建拓扑') }}</h2>
          <a-input 
            v-model="form.name" 
            placeholder="请输入拓扑图名称" 
            style="width: 300px;"
            :disabled="isReading"
          />
          <a-select 
            v-model="canvasSizePreset" 
            placeholder="画布尺寸" 
            style="width: 200px;"
            :disabled="isReading"
            @change="handleCanvasSizeChange"
          >
            <a-select-option value="1920x1080">1920x1080 (Full HD)</a-select-option>
            <a-select-option value="2560x1440">2560x1440 (2K)</a-select-option>
            <a-select-option value="3000x2000">3000x2000 (默认)</a-select-option>
            <a-select-option value="3840x2160">3840x2160 (4K)</a-select-option>
            <a-select-option value="4096x2160">4096x2160 (4K DCI)</a-select-option>
            <a-select-option value="custom">自定义尺寸</a-select-option>
          </a-select>
          <a-button 
            v-if="!isReading" 
            type="link" 
            @click="showCanvasSizeModal"
            style="padding: 0 8px;"
          >
            <a-icon type="setting" /> 自定义
          </a-button>
        </div>
        <div class="topology-actions">
          <a-button v-if="isReading" type="primary" @click="editNode">
            <a-icon type="edit" /> 编辑
          </a-button>
          <a-button v-else type="primary" @click="saveData">
            <a-icon type="save" /> 保存
          </a-button>
          <a-button @click="backToList">
            <a-icon type="rollback" /> 返回
          </a-button>
        </div>
      </div>
      
      <!-- 工具栏 - 横向布局 -->
      <div class="toolbar-container" v-if="!isReading">
        <div class="toolbar-section">
          <div class="section-label">节点工具</div>
          <div class="tool-buttons">
          <a-tooltip placement="bottom">
              <template slot="title">云服务</template>
              <div class="tool-btn" @mousedown="startDrag('cloud',$event)">
                <img src="@/assets/img/cloud.png" alt="云服务">
                <span>云</span>
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
              <template slot="title">核心设备</template>
              <div class="tool-btn" @mousedown="startDrag('core',$event)">
                <img src="@/assets/img/core.png" alt="核心">
                <span>核心</span>
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
              <template slot="title">交换机</template>
              <div class="tool-btn" @mousedown="startDrag('switch',$event)">
                <img src="@/assets/img/switch.png" alt="交换机">
                <span>交换机</span>
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
              <template slot="title">服务器</template>
              <div class="tool-btn" @mousedown="startDrag('server',$event)">
                <img src="@/assets/img/server.png" alt="服务器">
                <span>服务器</span>
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
              <template slot="title">防火墙</template>
              <div class="tool-btn" @mousedown="startDrag('firewalld',$event)">
                <img src="@/assets/img/firewalld.png" alt="防火墙">
                <span>防火墙</span>
            </div>
          </a-tooltip>
          </div>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-section">
          <div class="section-label">文字工具</div>
          <div class="tool-buttons">
            <a-tooltip placement="bottom">
              <template slot="title">添加文字</template>
              <div class="tool-btn" @click="addTextNode">
                <a-icon type="font-size" class="icon-large" />
                <span>文字</span>
              </div>
            </a-tooltip>
          </div>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-section">
          <div class="section-label">背景</div>
          <div class="tool-buttons">
            <a-tooltip placement="bottom">
              <template slot="title">设置背景图</template>
              <div class="tool-btn" @click="showBackgroundModal">
                <a-icon type="picture" class="icon-large" />
                <span>背景图</span>
              </div>
            </a-tooltip>
          </div>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-section">
          <div class="section-label">操作</div>
          <div class="tool-buttons">
            <a-tooltip placement="bottom">
              <template slot="title">删除选中</template>
              <a-popconfirm 
                title="确定要删除选中的元素吗?" 
                ok-text="确定" 
                cancel-text="取消" 
                @confirm="deleteNode()"
              >
                <div class="tool-btn">
                  <a-icon type="delete" class="icon-large" />
                  <span>删除</span>
            </div>
              </a-popconfirm>
          </a-tooltip>
            </div>
        </div>
      </div>
    </div>

    <!-- 画布尺寸设置弹窗 -->
    <a-modal
      v-model="canvasSizeModalVisible"
      title="自定义画布尺寸"
      :width="500"
      @ok="handleCanvasSizeOk"
      @cancel="handleCanvasSizeCancel"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="画布宽度">
          <a-input-number 
            v-model="customCanvasWidth" 
            :min="800" 
            :max="10000" 
            :step="100"
            style="width: 100%;"
          />
          <span style="color: #999; font-size: 12px;">像素 (800-10000)</span>
        </a-form-item>
        <a-form-item label="画布高度">
          <a-input-number 
            v-model="customCanvasHeight" 
            :min="600" 
            :max="10000" 
            :step="100"
            style="width: 100%;"
          />
          <span style="color: #999; font-size: 12px;">像素 (600-10000)</span>
        </a-form-item>
        <a-alert 
          message="提示" 
          description="画布尺寸决定了可编辑区域的大小。建议根据实际需要选择合适的尺寸，过大的画布可能影响性能。" 
          type="info" 
          show-icon 
        />
      </a-form>
    </a-modal>

    <!-- 背景图设置弹窗 -->
    <a-modal
      v-model="backgroundModalVisible"
      title="设置背景图"
      :width="600"
      @ok="handleBackgroundOk"
      @cancel="handleBackgroundCancel"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="背景图片">
          <a-upload
            :before-upload="beforeUpload"
            :show-upload-list="false"
            accept="image/*"
          >
            <a-button>
              <a-icon type="upload" /> 选择图片
            </a-button>
          </a-upload>
          <div v-if="backgroundImage" style="margin-top: 10px;">
            <img :src="backgroundImage" style="max-width: 100%; max-height: 200px; border: 1px solid #d9d9d9; border-radius: 4px;" />
            <div v-if="imageNaturalSize.width" style="margin-top: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
              <div style="font-size: 12px; color: #666;">
                <div><strong>图片尺寸：</strong>{{ imageNaturalSize.width }} x {{ imageNaturalSize.height }} 像素</div>
                <div><strong>画布尺寸：</strong>{{ form.canvasWidth }} x {{ form.canvasHeight }} 像素</div>
                <div v-if="imageNaturalSize.width > form.canvasWidth || imageNaturalSize.height > form.canvasHeight" style="color: #ff4d4f; margin-top: 4px;">
                  <a-icon type="warning" /> 警告：图片尺寸超过画布尺寸，建议调整画布大小或使用较小的图片
                </div>
                <div v-else style="color: #52c41a; margin-top: 4px;">
                  <a-icon type="check-circle" /> 图片尺寸适合当前画布
                </div>
              </div>
            </div>
          </div>
        </a-form-item>
        
        <a-form-item label="背景大小">
          <a-radio-group v-model="backgroundSize">
            <a-radio value="cover">覆盖</a-radio>
            <a-radio value="contain">包含</a-radio>
            <a-radio value="auto">原始大小</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="背景位置">
          <a-radio-group v-model="backgroundPosition">
            <a-radio value="center">居中</a-radio>
            <a-radio value="top">顶部</a-radio>
            <a-radio value="bottom">底部</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="背景重复">
          <a-radio-group v-model="backgroundRepeat">
            <a-radio value="no-repeat">不重复</a-radio>
            <a-radio value="repeat">重复</a-radio>
            <a-radio value="repeat-x">水平重复</a-radio>
            <a-radio value="repeat-y">垂直重复</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item label="背景透明度">
          <a-slider v-model="backgroundOpacity" :min="0" :max="100" :step="5" />
          <span style="margin-left: 10px;">{{ backgroundOpacity }}%</span>
        </a-form-item>
        
        <a-form-item label="">
          <a-button type="danger" ghost @click="removeBackground">
            <a-icon type="delete" /> 移除背景图
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>

    <div class="tuopu" :style="`height: ${minHeight}px;`">
      <div id="containerChart" :style="`height: ${minHeight}px;`"></div>
      <div class="mini-map-container" id="minimapContainer"></div>
      
      <RightDrawer 
        v-if="!isReading && type !== 'grid'" 
        class="right_drawer" 
        :drawerType="type" 
        :selectCell="selectCell" 
        :form="form" 
        :graph="graph" 
        @deleteNode="deleteNode"
      />
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import RightDrawer from './RightDrawer.vue'
import insertCss from 'insert-css'
import '@antv/x6-vue-shape'
import { Graph, Shape, FunctionExt } from '@antv/x6'
import { startDragToGraph } from './Graph/methods.js'
import { createTopology, topologyDetail, updateTopology } from '@/services/admin'

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

export default {
  name: 'tuopu',
  components: {
    PageLayout,
    RightDrawer
  },
  data() {
    return {
      isReading: false, // 默认为编辑模式
      id: '',
      title: "核心拓扑",
      minHeight: window.innerHeight - 64 - 80,
      graph: '',
      type: 'grid',
      selectCell: null,
      connectEdgeType: {
        router: { name: '' }
      },
      sourceMarker: {
        name: 'path',
        size: 12,
      },
      targetMarker: {
        name: 'path',
        size: 12,
      },
      X6Data: {},
      grid: {
        size: 10,
        visible: true,
        type: 'mesh',
        args: {
          color: '#D0D0D0',
          thickness: 1,
          factor: 10
        }
      },
      form: {
        name: '',
        gridType: 1,
        status: '',
        backgroundImage: '',
        canvasWidth: 3000,
        canvasHeight: 2000,
      },
      isAddingTextNode: false, // 标记是否正在添加文字节点
      backgroundModalVisible: false, // 背景图设置弹窗
      backgroundImage: '', // 背景图片 base64
      backgroundSize: 'cover', // 背景大小
      backgroundPosition: 'center', // 背景位置
      backgroundRepeat: 'no-repeat', // 背景重复
      backgroundOpacity: 100, // 背景透明度
      imageNaturalSize: { width: 0, height: 0 }, // 图片原始尺寸
      canvasSizePreset: '3000x2000', // 画布尺寸预设
      canvasSizeModalVisible: false, // 自定义画布尺寸弹窗
      customCanvasWidth: 3000,
      customCanvasHeight: 2000
    }
  },
  created() {
    this.id = this.$route.query.id || ""
    // 如果有ID，则为查看模式；否则为编辑模式
    if (this.$route.query.id) {
      this.isReading = true
    this.tuopuDetail()
    } else {
      this.isReading = false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initX6()
    })
  },
  methods: {
    initX6() {
      var _that = this
      this.graph = new Graph({
        container: document.getElementById('containerChart'),
        width: '100%',
        height: '100%',
        background: _that.backgroundOptions,
        grid: _that.grid,
        resizing: {
          enabled: true,
          orthogonal: false
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
          pageWidth: this.form.canvasWidth, // 使用动态画布宽度
          pageHeight: this.form.canvasHeight, // 使用动态画布高度
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
        connecting: {
          anchor: 'center',
          connectionPoint: 'anchor',
          allowBlank: false,
          snap: true,
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  ZID: '',
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
      
      this.graph.history.redo()
      this.graph.history.undo()
      this.graph.enablePanning()
      this.graph.enableMouseWheel()
      
      // 绘制画布边界虚线框
      this.drawCanvasBorder()
      
      // 初始化时将画布居中显示
      this.$nextTick(() => {
        this.graph.centerPoint(this.form.canvasWidth / 2, this.form.canvasHeight / 2)
      })
      
      this.graph.bindKey('ctrl+c', () => {
        const cells = this.graph.getSelectedCells()
        if (cells.length) {
          this.graph.copy(cells)
        }
        return false
      })
      
      this.graph.bindKey('ctrl+v', () => {
        if (!this.graph.isClipboardEmpty()) {
          const cells = this.graph.paste({ offset: 32 })
          this.graph.cleanSelection()
          this.graph.select(cells)
        }
        return false
      })
      
      this.graph.on('node:mouseenter', FunctionExt.debounce(() => {
        const container = document.getElementById('containerChart')
        const ports = container.querySelectorAll('.x6-port-body')
        this.showPorts(ports, true)
      }), 500)
      
      this.graph.on('node:mouseleave', () => {
        const container = document.getElementById('containerChart')
        const ports = container.querySelectorAll('.x6-port-body')
        this.showPorts(ports, false)
      })
      
      this.graph.on('blank:click', () => {
        this.type = 'grid'
      })
      
      this.graph.on('cell:click', ({ cell }) => {
        // 如果点击的是背景图或边界框，不做任何处理
        if (cell.id === 'canvas-background' || cell.id === 'canvas-border') {
          return
        }
        this.type = cell.isNode() ? 'node' : 'edge'
      })
      
      this.graph.on('selection:changed', (args) => {
        args.added.forEach(cell => {
          // 如果选中的是背景图或边界框，取消选中
          if (cell.id === 'canvas-background' || cell.id === 'canvas-border') {
            this.graph.unselect(cell)
            return
          }
          
          this.selectCell = cell
          // 如果是文字节点，选中时显示边框
          if (cell.shape === 'text-node') {
            cell.attr('body/stroke', '#1890ff')
            cell.attr('body/strokeWidth', 2)
            cell.attr('body/fill', 'rgba(24, 144, 255, 0.05)')
          }
        })
        args.removed.forEach(cell => {
          cell.removeTools()
          // 如果是文字节点，取消选中时隐藏边框
          if (cell.shape === 'text-node') {
            cell.attr('body/stroke', 'transparent')
            cell.attr('body/strokeWidth', 1)
            cell.attr('body/fill', 'transparent')
          }
        })
      })
      
      // 监听画布点击事件，用于添加文字节点
      this.graph.on('blank:click', ({ x, y }) => {
        if (_that.isAddingTextNode) {
          _that.createTextNodeAt(x, y)
          _that.isAddingTextNode = false
          // 恢复鼠标样式
          document.getElementById('containerChart').style.cursor = 'default'
        } else {
          _that.type = 'grid'
        }
      })
    },
    
    showPorts(ports, show) {
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? 'visible' : 'hidden'
      }
    },
    
    // 绘制画布边界虚线框
    drawCanvasBorder() {
      // 移除旧的边界框（如果存在）
      const oldBorder = this.graph.getCellById('canvas-border')
      if (oldBorder) {
        this.graph.removeCell(oldBorder)
      }
      
      // 添加画布边界矩形
      this.graph.addNode({
        id: 'canvas-border',
        shape: 'rect',
        x: 0,
        y: 0,
        width: this.form.canvasWidth,
        height: this.form.canvasHeight,
        zIndex: -1, // 置于最底层
        attrs: {
          body: {
            fill: 'transparent',
            stroke: '#1890ff',
            strokeWidth: 2,
            strokeDasharray: '10 5',
            pointerEvents: 'none', // 不响应鼠标事件
          },
        },
        // 标记为不可选择、不可移动
        selectable: false,
        movable: false,
        resizable: false,
        rotatable: false,
        // 添加自定义属性标记这是边界框
        data: {
          isBorder: true,
        },
      })
    },
    
    // 画布尺寸相关方法
    showCanvasSizeModal() {
      this.customCanvasWidth = this.form.canvasWidth
      this.customCanvasHeight = this.form.canvasHeight
      this.canvasSizeModalVisible = true
    },
    
    handleCanvasSizeChange(value) {
      if (value === 'custom') {
        this.showCanvasSizeModal()
      } else {
        const [width, height] = value.split('x').map(Number)
        this.form.canvasWidth = width
        this.form.canvasHeight = height
        this.updateCanvasSize()
      }
    },
    
    handleCanvasSizeOk() {
      if (this.customCanvasWidth < 800 || this.customCanvasWidth > 10000) {
        this.$message.error('画布宽度必须在 800-10000 之间')
        return
      }
      if (this.customCanvasHeight < 600 || this.customCanvasHeight > 10000) {
        this.$message.error('画布高度必须在 600-10000 之间')
        return
      }
      
      this.form.canvasWidth = this.customCanvasWidth
      this.form.canvasHeight = this.customCanvasHeight
      this.canvasSizePreset = 'custom'
      this.updateCanvasSize()
      this.canvasSizeModalVisible = false
      this.$message.success('画布尺寸已更新')
    },
    
    handleCanvasSizeCancel() {
      this.canvasSizeModalVisible = false
    },
    
    updateCanvasSize() {
      // 更新 scroller 的页面尺寸
      this.graph.scroller.resize(this.form.canvasWidth, this.form.canvasHeight)
      // 重新绘制边界框
      this.drawCanvasBorder()
      // 将画布居中显示
      this.$nextTick(() => {
        this.graph.centerPoint(this.form.canvasWidth / 2, this.form.canvasHeight / 2)
      })
    },
    
    startDrag(type, e) {
      if (this.isReading) {
        this.$message.warn('阅读模式不可编辑')
      } else {
        startDragToGraph(this.graph, type, e)
      }
    },
    
    addTextNode() {
      if (this.isReading) {
        this.$message.warn('阅读模式不可编辑')
        return
      }
      
      // 设置添加文字节点模式
      this.isAddingTextNode = true
      
      // 改变鼠标样式，提示用户点击画布
      document.getElementById('containerChart').style.cursor = 'crosshair'
      
      this.$message.info('请在画布上点击以放置文字节点')
    },
    
    createTextNodeAt(x, y) {
      const textNode = this.graph.addNode({
        shape: 'text-node',
        x: x - 100, // 节点宽度的一半
        y: y - 30,  // 节点高度的一半
        width: 200,
        height: 60,
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
      })
      
      // 延迟选中节点
      this.$nextTick(() => {
        this.graph.select(textNode)
        this.$message.success('文字节点已添加，点击节点可在右侧面板编辑')
      })
    },
    
    // 背景图相关方法
    showBackgroundModal() {
      if (this.isReading) {
        this.$message.warn('阅读模式不可编辑')
        return
      }
      this.backgroundModalVisible = true
    },
    
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        this.$message.error('图片大小不能超过 5MB!')
        return false
      }
      
      // 读取图片并转换为 base64，同时获取图片尺寸
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // 保存图片原始尺寸
          this.imageNaturalSize = {
            width: img.naturalWidth,
            height: img.naturalHeight
          }
          this.backgroundImage = e.target.result
          
          // 检查图片尺寸是否超过画布
          if (img.naturalWidth > this.form.canvasWidth || img.naturalHeight > this.form.canvasHeight) {
            this.$warning({
              title: '图片尺寸提示',
              content: `图片尺寸 (${img.naturalWidth}x${img.naturalHeight}) 超过当前画布尺寸 (${this.form.canvasWidth}x${this.form.canvasHeight})。建议调整画布大小或使用较小的图片以获得最佳效果。`,
            })
          }
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
      
      return false // 阻止自动上传
    },
    
    handleBackgroundOk() {
      this.applyBackground()
      this.backgroundModalVisible = false
      this.$message.success('背景图已应用')
    },
    
    handleBackgroundCancel() {
      this.backgroundModalVisible = false
    },
    
    applyBackground() {
      if (this.backgroundImage) {
        // 移除旧的背景图节点（如果存在）
        const oldBg = this.graph.getCellById('canvas-background')
        if (oldBg) {
          this.graph.removeCell(oldBg)
        }
        
        // 计算背景图的位置和尺寸
        let bgWidth, bgHeight, bgX, bgY
        
        if (this.backgroundSize === 'cover') {
          // 覆盖模式：填充整个画布，保持比例
          const canvasRatio = this.form.canvasWidth / this.form.canvasHeight
          const imageRatio = this.imageNaturalSize.width / this.imageNaturalSize.height
          
          if (imageRatio > canvasRatio) {
            // 图片更宽，以高度为准
            bgHeight = this.form.canvasHeight
            bgWidth = bgHeight * imageRatio
          } else {
            // 图片更高，以宽度为准
            bgWidth = this.form.canvasWidth
            bgHeight = bgWidth / imageRatio
          }
        } else if (this.backgroundSize === 'contain') {
          // 包含模式：完整显示图片，保持比例
          const canvasRatio = this.form.canvasWidth / this.form.canvasHeight
          const imageRatio = this.imageNaturalSize.width / this.imageNaturalSize.height
          
          if (imageRatio > canvasRatio) {
            // 图片更宽，以宽度为准
            bgWidth = this.form.canvasWidth
            bgHeight = bgWidth / imageRatio
          } else {
            // 图片更高，以高度为准
            bgHeight = this.form.canvasHeight
            bgWidth = bgHeight * imageRatio
          }
        } else {
          // 原始大小
          bgWidth = this.imageNaturalSize.width
          bgHeight = this.imageNaturalSize.height
        }
        
        // 计算位置
        if (this.backgroundPosition === 'center') {
          bgX = (this.form.canvasWidth - bgWidth) / 2
          bgY = (this.form.canvasHeight - bgHeight) / 2
        } else if (this.backgroundPosition === 'top') {
          bgX = (this.form.canvasWidth - bgWidth) / 2
          bgY = 0
        } else if (this.backgroundPosition === 'bottom') {
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
          zIndex: -2, // 置于边界框之下
          imageUrl: this.backgroundImage,
          attrs: {
            image: {
              opacity: this.backgroundOpacity / 100,
            },
          },
          // 标记为不可选择、不可移动
          selectable: false,
          movable: false,
          resizable: false,
          rotatable: false,
          // 添加自定义属性标记这是背景图
          data: {
            isBackground: true,
          },
        })
        
        // 保存到 form 中
        this.form.backgroundImage = JSON.stringify({
          image: this.backgroundImage,
          size: this.backgroundSize,
          position: this.backgroundPosition,
          repeat: this.backgroundRepeat,
          opacity: this.backgroundOpacity,
          naturalWidth: this.imageNaturalSize.width,
          naturalHeight: this.imageNaturalSize.height,
        })
      }
    },
    
    removeBackground() {
      this.backgroundImage = ''
      this.backgroundSize = 'cover'
      this.backgroundPosition = 'center'
      this.backgroundRepeat = 'no-repeat'
      this.backgroundOpacity = 100
      this.imageNaturalSize = { width: 0, height: 0 }
      this.form.backgroundImage = ''
      
      // 移除背景图节点
      const oldBg = this.graph.getCellById('canvas-background')
      if (oldBg) {
        this.graph.removeCell(oldBg)
      }
      
      this.$message.success('背景图已移除')
    },
    
    editNode() {
      this.isReading = false
    },
    
    deleteNode() {
      const cells = this.graph.getSelectedCells()
      if (cells && cells.length > 0) {
        this.graph.removeCells(cells)
        this.type = 'grid'
        this.$message.success(`已删除 ${cells.length} 个元素`)
      } else {
        this.$message.warn('请先选中要删除的元素')
      }
    },
    
    saveData() {
      if (!this.form.name) {
        this.$message.warn('请输入拓扑图名称')
        return
      }
      
      console.log('保存时的 ID:', this.id)
      console.log('路由参数 ID:', this.$route.query.id)
      
      this.$nextTick(() => {
        const getJson = this.graph.toJSON()
        this.handelData(getJson)
      })
    },
    
    backToList() {
      this.$router.push("/topology/list")
    },
    
    handelData(data) {
      const dataJson = data.cells
      const edges = []
      const nodes = []
      
      dataJson.forEach((item) => {
        // 排除背景图节点和边界框节点
        if (item.id === 'canvas-background' || item.id === 'canvas-border') {
          return
        }
        
        if (item.attrs.line) {
          edges.push(item)
        }
        if (item.attrs.image || item.shape === 'text-node') {
          nodes.push(item)
        }
      })
      
      let params = JSON.stringify({
        edges: JSON.stringify(edges),
        nodes: JSON.stringify(nodes),
        topology: this.form.name,
        status: this.form.status,
        background_image: this.form.backgroundImage || '',
        canvas_width: this.form.canvasWidth,
        canvas_height: this.form.canvasHeight,
      })
      
      if (this.id) {
        updateTopology(this.id, params).then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            this.$message.success(res.message)
            this.isReading = true
          }
        })
      } else {
        createTopology(params).then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            this.$message.success(res.message)
            this.isReading = true
            // 创建成功后，获取ID并更新路由
            if (res.data && res.data.id) {
              this.id = res.data.id
              this.$router.replace({ query: { id: this.id } })
            }
          }
        })
      }
    },
    
    tuopuDetail() {
      if (this.id) {
        topologyDetail(this.id).then((resp) => {
          let res = resp.data
          let X6Data = {}
          if (res.code == 200) {
            let edges = JSON.parse(res.data.items.edges)
            let nodes = JSON.parse(res.data.items.nodes)
            
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
            X6Data.edges = edges
            X6Data.nodes = nodes
            this.X6Data = X6Data
            this.form.name = res.data.items.topology
            this.form.status = res.data.items.status
            
            // 加载画布尺寸
            if (res.data.items.canvas_width && res.data.items.canvas_height) {
              this.form.canvasWidth = res.data.items.canvas_width
              this.form.canvasHeight = res.data.items.canvas_height
              // 设置预设值
              const sizeKey = `${this.form.canvasWidth}x${this.form.canvasHeight}`
              const presets = ['1920x1080', '2560x1440', '3000x2000', '3840x2160', '4096x2160']
              this.canvasSizePreset = presets.includes(sizeKey) ? sizeKey : 'custom'
              // 更新画布尺寸
              this.updateCanvasSize()
            }
            
            // 先加载节点和边
            this.graph.fromJSON(this.X6Data)
            
            // 然后加载背景图（在 fromJSON 之后，避免被清除）
            if (res.data.items.background_image) {
              try {
                this.form.backgroundImage = res.data.items.background_image
                const bgConfig = JSON.parse(res.data.items.background_image)
                this.backgroundImage = bgConfig.image
                this.backgroundSize = bgConfig.size || 'cover'
                this.backgroundPosition = bgConfig.position || 'center'
                this.backgroundRepeat = bgConfig.repeat || 'no-repeat'
                this.backgroundOpacity = bgConfig.opacity || 100
                this.imageNaturalSize = {
                  width: bgConfig.naturalWidth || 0,
                  height: bgConfig.naturalHeight || 0
                }
                
                // 应用背景图
                this.applyBackground()
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
.topology-header {
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  padding: 0;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
}

.topology-info {
  display: flex;
  align-items: center;
  gap: 16px;
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

.topology-actions {
  display: flex;
  gap: 12px;
}

.toolbar-container {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  border-top: 1px solid #e8e8e8;
  gap: 24px;
}

.toolbar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  white-space: nowrap;
  padding-right: 8px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 16px;
    background: #d9d9d9;
  }
}

.tool-buttons {
  display: flex;
  gap: 8px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fff;
  border: 2px solid #e8e8e8;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:hover {
    border-color: #1890ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
    
    &::before {
      opacity: 1;
    }
    
    span {
      color: #1890ff;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  img {
    width: 32px;
    height: 32px;
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }
  
  span {
    font-size: 12px;
    color: #666;
    transition: color 0.3s;
    position: relative;
    z-index: 1;
  }
  
  .arrow-icon {
    font-size: 24px;
    margin-bottom: 4px;
    transform: rotate(45deg);
    position: relative;
    z-index: 1;
  }
  
  .icon-large {
    font-size: 24px;
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }
  
  &.active {
    background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
    
    span {
      color: #1890ff;
      font-weight: 500;
}
  }
}

.toolbar-divider {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, transparent 0%, #d9d9d9 20%, #d9d9d9 80%, transparent 100%);
}

.tuopu {
  position: relative;
  background: #ffffff; // 改为白色背景
}

// 防止节点文本被画布边界裁剪
::v-deep #containerChart {
  .x6-graph-scroller {
    overflow: auto !important;
  }
}

.mini-map-container {
  position: fixed;
  z-index: 999;
  bottom: 20px;
  right: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.right_drawer {
  position: fixed;
  right: 0;
  top: 144px;
  width: 320px;
  height: calc(100vh - 144px);
  background: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}
</style>
