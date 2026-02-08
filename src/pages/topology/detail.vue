<template>
  <page-layout :noTitle="true">
    <div class="topology-header">
      <div class="header-row">
        <div class="topology-info">
          <h2>{{ isReading ? $t('title_view_topology') : (id ? $t('title_edit_topology') : $t('title_new_topology')) }}</h2>
          <a-input 
            v-model="form.name" 
            :placeholder="$t('placeholder_enter_topology_name')" 
            style="width: 300px;"
            :disabled="isReading"
          />
          <a-select 
            v-model="canvasSizePreset" 
            :placeholder="$t('label_canvas_size')" 
            style="width: 200px;"
            :disabled="isReading"
            @change="handleCanvasSizeChange"
          >
            <a-select-option value="1920x1080">1920x1080 (Full HD)</a-select-option>
            <a-select-option value="2560x1440">2560x1440 (2K)</a-select-option>
            <a-select-option value="3000x2000">{{ $t('canvas_size_default') }}</a-select-option>
            <a-select-option value="3840x2160">3840x2160 (4K)</a-select-option>
            <a-select-option value="4096x2160">4096x2160 (4K DCI)</a-select-option>
            <a-select-option value="custom">{{ $t('canvas_size_custom') }}</a-select-option>
          </a-select>
          <a-button 
            v-if="!isReading" 
            type="link" 
            @click="showCanvasSizeModal"
            style="padding: 0 8px;"
          >
            <a-icon type="setting" /> {{ $t('btn_custom') }}
          </a-button>
        </div>
        <div class="topology-actions">
          <a-button v-if="isReading" type="primary" @click="editNode">
            <a-icon type="edit" /> {{ $t('btn_edit') }}
          </a-button>
          <a-button v-else type="primary" @click="saveData">
            <a-icon type="save" /> {{ $t('btn_save') }}
          </a-button>
          <a-button @click="backToList">
            <a-icon type="rollback" /> {{ $t('btn_back') }}
          </a-button>
        </div>
      </div>
      
      <!-- 工具栏 - 横向布局 -->
      <div class="toolbar-container" v-if="!isReading">
        <div class="toolbar-section">
          <div class="section-label">{{ $t('label_node_tools') }}</div>
          <div class="tool-buttons">
          <a-tooltip placement="bottom">
              <template slot="title">{{ $t('tool_cloud') }}</template>
              <div class="tool-btn" @mousedown="startDrag('cloud',$event)">
                <img src="@/assets/img/cloud.png" :alt="$t('tool_cloud')">
                <span>{{ $t('tool_cloud_short') }}</span>
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
              <template slot="title">{{ $t('tool_core') }}</template>
              <div class="tool-btn" @mousedown="startDrag('core',$event)">
                <img src="@/assets/img/core.png" :alt="$t('tool_core')">
                <span>{{ $t('tool_core_short') }}</span>
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
              <template slot="title">{{ $t('tool_switch') }}</template>
              <div class="tool-btn" @mousedown="startDrag('switch',$event)">
                <img src="@/assets/img/switch.png" :alt="$t('tool_switch')">
                <span>{{ $t('tool_switch_short') }}</span>
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
              <template slot="title">{{ $t('tool_server') }}</template>
              <div class="tool-btn" @mousedown="startDrag('server',$event)">
                <img src="@/assets/img/server.png" :alt="$t('tool_server')">
                <span>{{ $t('tool_server_short') }}</span>
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
              <template slot="title">{{ $t('tool_firewall') }}</template>
              <div class="tool-btn" @mousedown="startDrag('firewalld',$event)">
                <img src="@/assets/img/firewalld.png" :alt="$t('tool_firewall')">
                <span>{{ $t('tool_firewall_short') }}</span>
            </div>
          </a-tooltip>
          </div>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-section">
          <div class="section-label">{{ $t('label_text_tools') }}</div>
          <div class="tool-buttons">
            <a-tooltip placement="bottom">
              <template slot="title">{{ $t('tool_add_text') }}</template>
              <div class="tool-btn" @click="addTextNode">
                <a-icon type="font-size" class="icon-large" />
                <span>{{ $t('tool_text') }}</span>
              </div>
            </a-tooltip>
          </div>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-section">
          <div class="section-label">{{ $t('label_background') }}</div>
          <div class="tool-buttons">
            <a-tooltip placement="bottom">
              <template slot="title">{{ $t('tool_set_background') }}</template>
              <div class="tool-btn" @click="showBackgroundModal">
                <a-icon type="picture" class="icon-large" />
                <span>{{ $t('tool_background') }}</span>
              </div>
            </a-tooltip>
          </div>
        </div>
        
        <div class="toolbar-divider"></div>
        
        <div class="toolbar-section">
          <div class="section-label">{{ $t('label_operations') }}</div>
          <div class="tool-buttons">
            <a-tooltip placement="bottom">
              <template slot="title">{{ $t('tool_delete_selected') }}</template>
              <a-popconfirm 
                :title="$t('confirm_delete_elements')" 
                :ok-text="$t('confirm_yes')" 
                :cancel-text="$t('confirm_no')" 
                @confirm="deleteNode()"
              >
                <div class="tool-btn">
                  <a-icon type="delete" class="icon-large" />
                  <span>{{ $t('btn_delete') }}</span>
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
      :title="$t('modal_custom_canvas_size')"
      :width="500"
      @ok="handleCanvasSizeOk"
      @cancel="handleCanvasSizeCancel"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item :label="$t('label_canvas_width')">
          <a-input-number 
            v-model="customCanvasWidth" 
            :min="800" 
            :max="10000" 
            :step="100"
            style="width: 100%;"
          />
          <span style="color: #999; font-size: 12px;">{{ $t('unit_pixels_range', { min: 800, max: 10000 }) }}</span>
        </a-form-item>
        <a-form-item :label="$t('label_canvas_height')">
          <a-input-number 
            v-model="customCanvasHeight" 
            :min="600" 
            :max="10000" 
            :step="100"
            style="width: 100%;"
          />
          <span style="color: #999; font-size: 12px;">{{ $t('unit_pixels_range', { min: 600, max: 10000 }) }}</span>
        </a-form-item>
        <a-alert 
          :message="$t('hint_title')" 
          :description="$t('canvas_size_hint')" 
          type="info" 
          show-icon 
        />
      </a-form>
    </a-modal>

    <!-- 背景图设置弹窗 -->
    <a-modal
      v-model="backgroundModalVisible"
      :title="$t('modal_set_background')"
      :width="600"
      @ok="handleBackgroundOk"
      @cancel="handleBackgroundCancel"
    >
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item :label="$t('label_background_image')">
          <a-upload
            :before-upload="beforeUpload"
            :customRequest="() => {}"
            :show-upload-list="false"
            accept="image/*"
          >
            <a-button>
              <a-icon type="upload" /> {{ $t('btn_select_image') }}
            </a-button>
          </a-upload>
          <div v-if="backgroundImage" style="margin-top: 10px;">
            <img :src="backgroundImage" style="max-width: 100%; max-height: 200px; border: 1px solid #d9d9d9; border-radius: 4px;" />
            <div v-if="imageNaturalSize.width" style="margin-top: 8px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
              <div style="font-size: 12px; color: #666;">
                <div><strong>{{ $t('label_image_size') }}：</strong>{{ imageNaturalSize.width }} x {{ imageNaturalSize.height }} {{ $t('unit_pixels') }}</div>
                <div><strong>{{ $t('label_canvas_size') }}：</strong>{{ form.canvasWidth }} x {{ form.canvasHeight }} {{ $t('unit_pixels') }}</div>
                <div v-if="imageNaturalSize.width > form.canvasWidth || imageNaturalSize.height > form.canvasHeight" style="color: #ff4d4f; margin-top: 4px;">
                  <a-icon type="warning" /> {{ $t('warning_image_exceeds_canvas') }}
                </div>
                <div v-else style="color: #52c41a; margin-top: 4px;">
                  <a-icon type="check-circle" /> {{ $t('info_image_fits_canvas') }}
                </div>
              </div>
            </div>
          </div>
        </a-form-item>
        
        <a-form-item :label="$t('label_background_size')">
          <a-radio-group v-model="backgroundSize">
            <a-radio value="cover">{{ $t('bg_size_cover') }}</a-radio>
            <a-radio value="contain">{{ $t('bg_size_contain') }}</a-radio>
            <a-radio value="auto">{{ $t('bg_size_auto') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item :label="$t('label_background_position')">
          <a-radio-group v-model="backgroundPosition">
            <a-radio value="center">{{ $t('bg_pos_center') }}</a-radio>
            <a-radio value="top">{{ $t('bg_pos_top') }}</a-radio>
            <a-radio value="bottom">{{ $t('bg_pos_bottom') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item :label="$t('label_background_repeat')">
          <a-radio-group v-model="backgroundRepeat">
            <a-radio value="no-repeat">{{ $t('bg_repeat_no') }}</a-radio>
            <a-radio value="repeat">{{ $t('bg_repeat_yes') }}</a-radio>
            <a-radio value="repeat-x">{{ $t('bg_repeat_x') }}</a-radio>
            <a-radio value="repeat-y">{{ $t('bg_repeat_y') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        
        <a-form-item :label="$t('label_background_opacity')">
          <a-slider v-model="backgroundOpacity" :min="0" :max="100" :step="5" />
          <span style="margin-left: 10px;">{{ backgroundOpacity }}%</span>
        </a-form-item>
        
        <a-form-item label="">
          <a-button type="danger" ghost @click="removeBackground">
            <a-icon type="delete" /> {{ $t('btn_remove_background') }}
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
  i18n: require('./i18n'),
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
        canvasWidth: 1920,
        canvasHeight: 1080,
      },
      isAddingTextNode: false, // 标记是否正在添加文字节点
      backgroundModalVisible: false, // 背景图设置弹窗
      backgroundImage: '', // 背景图片 base64
      backgroundSize: 'cover', // 背景大小
      backgroundPosition: 'center', // 背景位置
      backgroundRepeat: 'no-repeat', // 背景重复
      backgroundOpacity: 100, // 背景透明度
      imageNaturalSize: { width: 0, height: 0 }, // 图片原始尺寸
      canvasSizePreset: '1920x1080', // 画布尺寸预设
      canvasSizeModalVisible: false, // 自定义画布尺寸弹窗
      customCanvasWidth: 1920,
      customCanvasHeight: 1080
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
        this.$message.error(this.$t('error_canvas_width_range'))
        return
      }
      if (this.customCanvasHeight < 600 || this.customCanvasHeight > 10000) {
        this.$message.error(this.$t('error_canvas_height_range'))
        return
      }
      
      this.form.canvasWidth = this.customCanvasWidth
      this.form.canvasHeight = this.customCanvasHeight
      this.canvasSizePreset = 'custom'
      this.updateCanvasSize()
      this.canvasSizeModalVisible = false
      this.$message.success(this.$t('msg_canvas_size_updated'))
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
        this.$message.warn(this.$t('msg_readonly_mode'))
      } else {
        startDragToGraph(this.graph, type, e)
      }
    },
    
    addTextNode() {
      if (this.isReading) {
        this.$message.warn(this.$t('msg_readonly_mode'))
        return
      }
      
      // 设置添加文字节点模式
      this.isAddingTextNode = true
      
      // 改变鼠标样式，提示用户点击画布
      document.getElementById('containerChart').style.cursor = 'crosshair'
      
      this.$message.info(this.$t('msg_click_canvas_to_place'))
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
        this.$message.success(this.$t('msg_text_node_added'))
      })
    },
    
    // 背景图相关方法
    showBackgroundModal() {
      if (this.isReading) {
        this.$message.warn(this.$t('msg_readonly_mode'))
        return
      }
      this.backgroundModalVisible = true
    },
    
    async beforeUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件!')
        return false
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('图片大小不能超过 10MB!')
        return false
      }
      
      // 上传到服务器
      const formData = new FormData()
      formData.append('file', file)
      
      try {
        // 使用 axios 直接上传
        const axios = require('axios')
        const response = await axios.post('/v1/topology/upload-background', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        
        if (response.data.code === 200) {
          const imagePath = response.data.data.path
          
          // 加载图片以获取尺寸
          const img = new Image()
          img.onload = () => {
            this.imageNaturalSize = {
              width: img.naturalWidth,
              height: img.naturalHeight
            }
            // 使用服务器返回的路径
            this.backgroundImage = imagePath
            
            // 检查图片尺寸是否超过画布
            if (img.naturalWidth > this.form.canvasWidth || img.naturalHeight > this.form.canvasHeight) {
              this.$warning({
                title: this.$t('msg_image_size_warning_title'),
                content: this.$t('msg_image_size_warning_content', {
                  imageWidth: img.naturalWidth,
                  imageHeight: img.naturalHeight,
                  canvasWidth: this.form.canvasWidth,
                  canvasHeight: this.form.canvasHeight
                }),
              })
            }
            
            this.$message.success('图片上传成功')
          }
          img.onerror = () => {
            this.$message.error('图片加载失败')
          }
          // 使用完整的 URL 加载图片
          img.src = imagePath
        } else {
          this.$message.error(response.data.message || '上传失败')
        }
      } catch (error) {
        console.error('上传失败:', error)
        this.$message.error('上传失败: ' + (error.response?.data?.message || error.message || '未知错误'))
      }
      
      return false // 阻止默认上传行为
    },
    
    handleBackgroundOk() {
      this.applyBackground()
      this.backgroundModalVisible = false
      this.$message.success(this.$t('msg_background_applied'))
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
        
        // 保存到 form 中（只保存路径，不保存 base64）
        this.form.backgroundImage = this.backgroundImage
      }
    },
    
    async removeBackground() {
      // 如果是服务器路径，先删除服务器上的文件
      if (this.backgroundImage && this.backgroundImage.startsWith('/upload/background/')) {
        try {
          const axios = require('axios')
          await axios.delete('/v1/topology/delete-background', {
            params: { path: this.backgroundImage }
          })
        } catch (error) {
          console.error('删除服务器文件失败:', error)
          // 继续执行，即使删除失败也要清除本地状态
        }
      }
      
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
      
      this.$message.success(this.$t('msg_background_removed'))
    },
    
    editNode() {
      this.isReading = false
    },
    
    deleteNode() {
      const cells = this.graph.getSelectedCells()
      if (cells && cells.length > 0) {
        this.graph.removeCells(cells)
        this.type = 'grid'
        this.$message.success(this.$t('msg_elements_deleted', { count: cells.length }))
      } else {
        this.$message.warn(this.$t('msg_select_elements_first'))
      }
    },
    
    saveData() {
      if (!this.form.name) {
        this.$message.warn(this.$t('msg_enter_topology_name'))
        return
      }
      
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
            this.$message.success(res.message || this.$t('msg_update_success'))
            this.isReading = true
          } else {
            this.$message.error(res.message || this.$t('msg_update_failed'))
          }
        }).catch((err) => {
          this.$message.error(this.$t('msg_update_failed'))
          console.error(err)
        })
      } else {
        createTopology(params).then((resp) => {
          let res = resp.data
          if (res.code == 200) {
            this.$message.success(res.message || this.$t('msg_create_success'))
            this.isReading = true
            // 创建成功后，获取ID并更新路由
            if (res.data && res.data.id) {
              this.id = res.data.id
              this.$router.replace({ query: { id: this.id } })
            }
          } else {
            this.$message.error(res.message || this.$t('msg_create_failed'))
          }
        }).catch((err) => {
          this.$message.error(this.$t('msg_create_failed'))
          console.error(err)
        })
      }
    },
    
    tuopuDetail() {
      if (this.id) {
        topologyDetail(this.id).then((resp) => {
          let res = resp.data
          let X6Data = {}
          if (res.code == 200) {
            // 适配新的响应格式：res.data 直接是拓扑对象
            const topologyData = res.data
            let edges = JSON.parse(topologyData.edges)
            let nodes = JSON.parse(topologyData.nodes)
            
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
            this.form.name = topologyData.topology
            this.form.status = topologyData.status
            
            // 加载画布尺寸
            if (topologyData.canvas_width && topologyData.canvas_height) {
              this.form.canvasWidth = topologyData.canvas_width
              this.form.canvasHeight = topologyData.canvas_height
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
            if (topologyData.background_image) {
              try {
                // 兼容新旧两种格式
                if (topologyData.background_image.startsWith('{')) {
                  // 旧格式：JSON（包含 base64）
                  const bgConfig = JSON.parse(topologyData.background_image)
                  this.backgroundImage = bgConfig.image
                  this.backgroundSize = bgConfig.size || 'cover'
                  this.backgroundPosition = bgConfig.position || 'center'
                  this.backgroundRepeat = bgConfig.repeat || 'no-repeat'
                  this.backgroundOpacity = bgConfig.opacity || 100
                  this.imageNaturalSize = {
                    width: bgConfig.naturalWidth || 0,
                    height: bgConfig.naturalHeight || 0
                  }
                  this.form.backgroundImage = topologyData.background_image
                } else {
                  // 新格式：直接是图片路径
                  this.backgroundImage = topologyData.background_image
                  this.backgroundSize = 'cover'
                  this.backgroundPosition = 'center'
                  this.backgroundRepeat = 'no-repeat'
                  this.backgroundOpacity = 100
                  this.form.backgroundImage = topologyData.background_image
                  
                  // 加载图片获取尺寸
                  const img = new Image()
                  img.onload = () => {
                    this.imageNaturalSize = {
                      width: img.naturalWidth,
                      height: img.naturalHeight
                    }
                  }
                  img.src = topologyData.background_image
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
