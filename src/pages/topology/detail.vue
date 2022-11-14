<template>
  <page-layout :noTitle="true">
    <div class="tuopu" :style="`height: ${minHeight}px;`">
      <div id="containerChart" :style="`height: ${minHeight}px;`"></div>
      <!-- //<div id="minimapContainer" /> // minimap -->
      <div class="mini-map-container" id="minimapContainer"></div>
      <RightDrawer v-if="!isReading" class="right_drawer" :drawerType="type" :selectCell="selectCell" :form="form" :graph="graph" @deleteNode="deleteNode">
      </RightDrawer>
      <div class="operating">
        <div class="btn-group">
          <a-tooltip placement="bottom">
            <template slot="title"> cloud </template>
            <div class="btn btn-cloud" @mousedown="startDrag('cloud',$event)">
              <img src="@/assets/img/cloud.png" alt="">
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template slot="title"> core </template>
            <div class="btn btn-core" @mousedown="startDrag('core',$event)">
              <img src="@/assets/img/core.png" alt="">
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template slot="title"> switch </template>
            <div class="btn btn-switch" @mousedown="startDrag('switch',$event)">
              <img src="@/assets/img/switch.png" alt="">
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template slot="title"> server </template>
            <div class="btn btn-server" @mousedown="startDrag('server',$event)">
              <img src="@/assets/img/server.png" alt="">
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template slot="title"> firewalld </template>
            <div class="btn btn-firewalld" @mousedown="startDrag('firewalld',$event)">
              <img src="@/assets/img/firewalld.png" alt="">
            </div>
          </a-tooltip>
        </div>
        <div class="btn-group">
          <a-tooltip placement="bottom">
            <template slot="title">连线</template>
            <div :class="['btn', currentArrow === 1 ? 'currentArrow' : '']" @mousedown="changeEdgeType('normal')">
              <a-icon type="arrow-up" class="arrow-up" />
            </div>
          </a-tooltip>
          <!-- <a-tooltip placement="bottom">
            <template slot="title"> 直角箭头 </template>
            <div :class="['btn', currentArrow === 2 ? 'currentArrow' : '']"
              @mousedown="changeEdgeType('manhattan')">
              <a-icon type="enter"
                class="arrow-enter" />
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template slot="title"> 双向箭头 </template>
            <div :class="['btn', currentArrow === 3 ? 'currentArrow' : '']"
              @mousedown="changeEdgeType()">
              <a-icon type="swap" />
            </div>
          </a-tooltip> -->
        </div>
        <div class="btn-group">
          <a-tooltip placement="bottom" v-if="isReading">
            <template slot="title"> 编辑 </template>
            <div class="btn" @mousedown="editNode()">
              <a-icon type="edit" class="operate_icon" />
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom" v-else>
            <div class="btn">
              <a-popconfirm title="确定要删除吗?" ok-text="确定" cancel-text="取消" @confirm="deleteNode()" @cancel="cancel">
                <template slot="title">删除</template>
                <a-icon type="delete" class="operate_icon" />
              </a-popconfirm>
            </div>
          </a-tooltip>
          <a-tooltip placement="bottom">
            <template slot="title"> 保存 </template>
            <div class="btn" @mousedown="saveData()">
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
import RightDrawer from './RightDrawer.vue'
import insertCss from 'insert-css'
import '@antv/x6-vue-shape'
import { Graph, Shape, FunctionExt } from '@antv/x6'
import { startDragToGraph } from './Graph/methods.js'
import { createTopology, topologyDetail, updateTopology } from '@/services/admin'
// updateTopology
// import { x6Data } from './save.js'
// const data = {}
export default {
  name: 'tuopu',
  components: {
    PageLayout,
    RightDrawer
  },
  data() {
    return {
      isReading: true,
      id: '',
      title: "核心拓扑",
      minHeight: window.innerHeight - 64 - 140,
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
      grid: { // 网格设置
        size: 10,      // 网格大小 10px
        visible: true, // 渲染网格背景
        type: 'mesh',
        args: {
          color: '#D0D0D0',
          thickness: 1, // 网格线宽度/网格点大小
          factor: 10
        }
      },
      form: {
        name: '',
        gridType: 1,
        status: '',
      },
    }
  },
  created() {
    this.id = this.$route.query.id || ""
    this.tuopuDetail()
    this.$route.query.id ? this.isReading = true : this.isReading = false
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
          orthogonal: false
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
          pannable: true
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
      // 鼠标移入移出节点
      this.graph.on('node:mouseenter', FunctionExt.debounce(() => {
        const container = document.getElementById('containerChart')
        const ports = container.querySelectorAll(
          '.x6-port-body'
        )
        this.showPorts(ports, true)
      }), 500)
      this.graph.on('node:mouseleave', () => {
        const container = document.getElementById('containerChart')
        const ports = container.querySelectorAll(
          '.x6-port-body'
        )
        this.showPorts(ports, false)
      })
      this.graph.on('blank:click', () => {
        this.type = 'grid'
      })
      this.graph.on('cell:click', ({ cell }) => {
        this.type = cell.isNode() ? 'node' : 'edge'
      })
      this.graph.on('selection:changed', (args) => {
        args.added.forEach(cell => {
          this.selectCell = cell
          if (cell.isEdge()) {
            cell.isEdge()

          }
        })
        args.removed.forEach(cell => {
          cell.isEdge()
          cell.removeTools()
        })
      })
    },
    showPorts(ports, show) {
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? 'visible' : 'hidden'
      }
    },
    startDrag(type, e) {
      if (this.isReading) {
        this.$message.warn('阅读模式不可编辑')
      } else {
        startDragToGraph(this.graph, type, e)
      }
    },
    changeEdgeType(e) {
      if (e == 'normal') {
        this.sourceMarker.name = 'path'
        this.connectEdgeType = {
          connector: 'normal',
          router: { name: '' }
        }
        this.currentArrow = 1
      } else if (e == 'manhattan') {
        this.sourceMarker.name = ''
        this.connectEdgeType = {
          connector: 'normal',
          router: { name: 'manhattan' }
        }
        this.currentArrow = 2
      } else {
        this.sourceMarker.name = 'classic'
        this.currentArrow = 3
      }
    },
    editNode() {
      this.isReading = false
    },
    deleteNode() {
      const cell = this.graph.getSelectedCells()
      this.graph.clearCells(cell)
      this.type = 'grid'
    },
    cancle() {
    },
    saveData() {
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
        if (item.attrs.line) {
          edges.push(item)
        }
        if (item.attrs.image) {
          nodes.push(item)
        }
      })
      // console.log('dataJson', dataJson)
      let params = JSON.stringify({
        edges: JSON.stringify(edges),
        nodes: JSON.stringify(nodes),
        topology: this.form.name,
        status: this.form.status,
        id: this.id,
      })
      if (this.id) {
        updateTopology(params).then((resp) => {
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
          }
        })
      }
    },
    // 获取拓扑图详情
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
