<template>
  <a-layout :class="['admin-layout', 'beauty-scroll']">
    <drawer v-if="isMobile" v-model="drawerOpen">
      <side-menu :theme="theme.mode" :menuData="menuData" :collapsed="false" :collapsible="false" @menuSelect="onMenuSelect"/>
    </drawer>
    <side-menu :class="[fixedSideBar ? 'fixed-side' : '']" :theme="theme.mode" v-else-if="layout === 'side' || layout === 'mix'" :menuData="sideMenuData" :collapsed="collapsed" :collapsible="true" />
    <div v-if="fixedSideBar && !isMobile" :style="`width: ${sideMenuWidth}; min-width: ${sideMenuWidth};max-width: ${sideMenuWidth};`" class="virtual-side"></div>
    <drawer v-if="!hideSetting" v-model="showSetting" placement="right">
      <div class="setting" slot="handler">
        <a-icon :type="showSetting ? 'close' : 'setting'"/>
      </div>
      <setting />
    </drawer>
    <a-layout class="admin-layout-main beauty-scroll">
      <admin-header :class="[{'fixed-tabs': fixedTabs, 'fixed-header': fixedHeader, 'multi-page': multiPage}]" :style="headerStyle" :menuData="headMenuData" :collapsed="collapsed" @toggleCollapse="toggleCollapse"/>
      <a-layout-header :class="['virtual-header', {'fixed-tabs' : fixedTabs, 'fixed-header': fixedHeader, 'multi-page': multiPage}]" v-show="fixedHeader"></a-layout-header>
      <a-layout-content class="admin-layout-content" :style="`min-height: ${minHeight}px;`">
        <div style="position: relative">
          <slot></slot>
        </div>
      </a-layout-content>
      <!-- <a-layout-footer style="padding: 0px">
        <page-footer :link-list="footerLinks" :copyright="copyright" />
      </a-layout-footer> -->
    </a-layout>

    <!-- 首次配置引导 -->
    <setup-guide 
      :visible="showSetupGuide" 
      @finish="handleSetupFinish" 
      @skip="handleSetupSkip"
      @open-zabbix-modal="handleOpenZabbixModal"
      ref="setupGuide" />
  </a-layout>
</template>

<script>
import AdminHeader from './header/AdminHeader'
// import PageFooter from './footer/PageFooter'
import Drawer from '../components/tool/Drawer'
import SideMenu from '../components/menu/SideMenu'
import Setting from '../components/setting/Setting'
import SetupGuide from '../components/SetupGuide'
import {mapState, mapMutations, mapGetters} from 'vuex'
import {getInitialSetupStatus, completeInitialSetup} from '@/services/admin'

// const minHeight = window.innerHeight - 64 - 122

export default {
  name: 'AdminLayout',
  i18n: require('./AdminLayout-i18n'),
  components: {Setting, SideMenu, Drawer, AdminHeader, SetupGuide},
  data () {
    return {
      minHeight: window.innerHeight - 64,
      collapsed: false,
      showSetting: false,
      drawerOpen: false,
      showSetupGuide: false
    }
  },
  provide() {
    return {
      adminLayout: this
    }
  },
  watch: {
    $route(val) {
      this.setActivated(val)
    },
    layout() {
      this.setActivated(this.$route)
    },
    isMobile(val) {
      if(!val) {
        this.drawerOpen = false
      }
    }
  },
  computed: {
    ...mapState('setting', ['isMobile', 'theme', 'layout', 'footerLinks', 'copyright', 'fixedHeader', 'fixedSideBar',
      'fixedTabs', 'hideSetting', 'multiPage']),
    ...mapGetters('setting', ['firstMenu', 'subMenu', 'menuData']),
    sideMenuWidth() {
      return this.collapsed ? '80px' : '256px'
    },
    headerStyle() {
      let width = (this.fixedHeader && this.layout !== 'head' && !this.isMobile) ? `calc(100% - ${this.sideMenuWidth})` : '100%'
      let position = this.fixedHeader ? 'fixed' : 'static'
      return `width: ${width}; position: ${position};`
    },
    headMenuData() {
      const {layout, menuData, firstMenu} = this
      return layout === 'mix' ? firstMenu : menuData
    },
    sideMenuData() {
      const {layout, menuData, subMenu} = this
      return layout === 'mix' ? subMenu : menuData
    }
  },
  methods: {
    ...mapMutations('setting', ['correctPageMinHeight', 'setActivatedFirst']),
    toggleCollapse () {
      this.collapsed = !this.collapsed
    },
    onMenuSelect () {
      this.toggleCollapse()
    },
    setActivated(route) {
      if (this.layout === 'mix') {
        let matched = route.matched
        matched = matched.slice(0, matched.length - 1)
        const {firstMenu} = this
        for (let menu of firstMenu) {
          if (matched.findIndex(item => item.path === menu.fullPath) !== -1) {
            this.setActivatedFirst(menu.fullPath)
            break
          }
        }
      }
    },
    async checkSetupStatus() {
      try {
        const res = await getInitialSetupStatus()
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          const data = biz.data
          // 如果初始配置未完成，显示引导
          if (!data.setup_completed) {
            // 延迟显示引导，确保页面已加载
            setTimeout(() => {
              this.showSetupGuide = true
            }, 1000)
          }
        }
      } catch (error) {
        console.error(this.$t('setup_check_status_failed') + ':', error)
      }
    },
    async handleSetupFinish() {
      console.log('AdminLayout.handleSetupFinish 被调用')
      // 先关闭引导界面，提升用户体验
      this.showSetupGuide = false
      console.log('引导界面已关闭，showSetupGuide =', this.showSetupGuide)
      
      try {
        const res = await completeInitialSetup()
        const biz = (res && res.data) ? res.data : res
        if (biz && biz.code === 200) {
          this.$message.success(this.$t('setup_complete_success'))
        } else {
          this.$message.warning(this.$t('setup_complete_mark_failed'))
        }
      } catch (error) {
        console.error(this.$t('setup_complete_failed') + ':', error)
        // 即使标记失败，也不再显示引导（用户体验优先）
        this.$message.warning(this.$t('setup_complete_action_failed'))
      }
    },
    async handleSetupSkip() {
      // 先关闭引导界面
      this.showSetupGuide = false
      this.$message.info(this.$t('setup_skip_tip'))
      
      // 跳过时也标记为已完成，避免刷新后再次出现
      try {
        await completeInitialSetup()
      } catch (error) {
        console.error(this.$t('setup_skip_mark_failed') + ':', error)
      }
    },
    // 打开Zabbix实例对话框
    handleOpenZabbixModal() {
      // 跳转到Zabbix管理页面并触发打开新增对话框
      this.$router.push('/system/zabbix').then(() => {
        // 使用事件总线通知Zabbix管理页面打开新增对话框
        this.$root.$emit('open-zabbix-instance-modal')
      }).catch(err => {
        // 如果已经在Zabbix管理页面，直接触发事件
        if (err.name === 'NavigationDuplicated' || err.message.includes('Avoided redundant navigation')) {
          this.$root.$emit('open-zabbix-instance-modal')
        }
      })
    },
    // 实例添加成功的回调
    handleInstanceAdded(instanceName) {
      console.log('AdminLayout 收到 instance-added-from-guide 事件，实例名称:', instanceName)
      if (this.$refs.setupGuide) {
        console.log('调用 setupGuide.onInstanceAdded')
        this.$refs.setupGuide.onInstanceAdded(instanceName)
      } else {
        console.error('setupGuide ref 不存在')
      }
    }
  },
  created() {
    this.correctPageMinHeight(this.minHeight - 24)
    this.setActivated(this.$route)
    // 检查是否需要显示初始配置引导
    this.checkSetupStatus()
    
    // 监听实例添加成功事件
    this.$root.$on('instance-added-from-guide', this.handleInstanceAdded)
  },
  beforeDestroy() {
    this.correctPageMinHeight(-this.minHeight + 24)
    // 移除事件监听
    this.$root.$off('instance-added-from-guide', this.handleInstanceAdded)
  }
}
</script>

<style lang="less" scoped>
  .admin-layout{
    background: @base-bg-color;
    .side-menu{
      &.fixed-side{
        position: fixed;
        height: 100vh;
        left: 0;
        top: 0;
      }
    }
    .virtual-side{
      transition: all 0.2s;
    }
    .virtual-header{
      transition: all 0.2s;
      opacity: 0;
      &.fixed-tabs.multi-page:not(.fixed-header){
        height: 0;
      }
    }
    .admin-layout-main{
      .admin-header{
        top: 0;
        right: 0;
        overflow: hidden;
        transition: all 0.2s;
        &.fixed-tabs.multi-page:not(.fixed-header){
          height: 0;
        }
      }
    }
    .admin-layout-content{
      padding: 24px 24px 0;
      background: @base-bg-color;
      /*overflow-x: hidden;*/
      /*min-height: calc(100vh - 64px - 122px);*/
    }
    .setting{
      background-color: @primary-color;
      color: @base-bg-color;
      border-radius: 5px 0 0 5px;
      line-height: 40px;
      font-size: 22px;
      width: 40px;
      height: 40px;
      box-shadow: -2px 0 8px @shadow-color;
    }
  }
</style>
