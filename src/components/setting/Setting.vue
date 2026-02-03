<template>
  <div class="side-setting">
    <setting-item>
      <a-button @click="saveSetting" type="primary" icon="save">{{$t('save')}}</a-button>
      <a-button @click="resetSetting" type="dashed" icon="redo" style="float: right">{{$t('reset')}}</a-button>
    </setting-item>
    <setting-item>
      <a-button @click="saveToServer" type="primary" icon="cloud-upload" block :loading="saving">设置为默认</a-button>
      <a-alert v-if="lastSaveTime" type="success" :message="`上次保存: ${lastSaveTime}`" style="margin-top: 8px" />
    </setting-item>
    <setting-item :title="$t('theme.title')">
      <img-checkbox-group @change="values => setTheme({...theme, mode: values[0]})" :default-values="[theme.mode]">
        <img-checkbox :title="$t('theme.dark')" :img="theme_dark" value="dark" />
        <img-checkbox :title="$t('theme.light')" :img="theme_light" value="light" />
        <img-checkbox :title="$t('theme.night')" :img="theme_night" value="night" />
      </img-checkbox-group>
    </setting-item>
    <setting-item :title="$t('theme.color')">
      <color-checkbox-group @change="(values, colors) => setTheme({...theme, color: colors[0]})" :defaultValues="[palettes.indexOf(theme.color)]" :multiple="false">
        <color-checkbox v-for="(color, index) in palettes" :key="index" :color="color" :value="index" />
      </color-checkbox-group>
    </setting-item>
    <a-divider />
    <setting-item :title="$t('navigate.title')">
      <img-checkbox-group @change="values => setLayout(values[0])" :default-values="[layout]">
        <img-checkbox :title="$t('navigate.side')" :img="navigate_side" value="side" />
        <img-checkbox :title="$t('navigate.head')" :img="navigate_head" value="head" />
        <img-checkbox :title="$t('navigate.mix')" :img="navigate_mix" value="mix" />
      </img-checkbox-group>
    </setting-item>
    <setting-item>
      <a-list :split="false">
        <a-list-item>
          {{$t('navigate.content.title')}}
          <a-select :getPopupContainer="getPopupContainer" :value="pageWidth" @change="setPageWidth" class="select-item" size="small" slot="actions">
            <a-select-option value="fluid">{{$t('navigate.content.fluid')}}</a-select-option>
            <a-select-option value="fixed">{{$t('navigate.content.fixed')}}</a-select-option>
          </a-select>
        </a-list-item>
        <a-list-item>
          {{$t('navigate.fixedHeader')}}
          <a-switch :checked="fixedHeader" slot="actions" size="small" @change="setFixedHeader" />
        </a-list-item>
        <a-list-item>
          {{$t('navigate.fixedSideBar')}}
          <a-switch :checked="fixedSideBar" slot="actions" size="small" @change="setFixedSideBar" />
        </a-list-item>
      </a-list>
    </setting-item>
    <a-divider />
    <setting-item :title="$t('other.title')">
      <a-list :split="false">
        <a-list-item>
          {{$t('other.weekMode')}}
          <a-switch :checked="weekMode" slot="actions" size="small" @change="setWeekMode" />
        </a-list-item>
        <a-list-item>
          {{$t('other.multiPages')}}
          <a-switch :checked="multiPage" slot="actions" size="small" @change="setMultiPage" />
        </a-list-item>
        <a-list-item>
          {{$t('other.hideSetting')}}
          <a-switch :checked="hideSetting" slot="actions" size="small" @change="setHideSetting" />
        </a-list-item>
      </a-list>
    </setting-item>
    <a-divider />
    <setting-item :title="$t('animate.title')">
      <a-list :split="false">
        <a-list-item>
          {{$t('animate.disable')}}
          <a-switch :checked="animate.disabled" slot="actions" size="small" @change="val => setAnimate({...animate, disabled: val})" />
        </a-list-item>
        <a-list-item>
          {{$t('animate.effect')}}
          <a-select :value="animate.name" :getPopupContainer="getPopupContainer" @change="val => setAnimate({...animate, name: val})" class="select-item" size="small" slot="actions">
            <a-select-option :key="index" :value="item.name" v-for="(item, index) in animates">{{item.alias}}</a-select-option>
          </a-select>
        </a-list-item>
        <a-list-item>
          {{$t('animate.direction')}}
          <a-select :value="animate.direction" :getPopupContainer="getPopupContainer" @change="val => setAnimate({...animate, direction: val})" class="select-item" size="small" slot="actions">
            <a-select-option :key="index" :value="item" v-for="(item, index) in directions">{{item}}</a-select-option>
          </a-select>
        </a-list-item>
      </a-list>
    </setting-item>
    <!-- <a-alert v-if="isDev" style="max-width: 240px; margin: -16px 0 8px; word-break: break-all" type="warning" :message="$t('alert')">
    </a-alert> -->
    <a-button v-if="isDev" id="copyBtn" :data-clipboard-text="copyConfig" @click="copyCode" style="width: 100%" icon="copy">{{$t('copy')}}</a-button>
  </div>
</template>

<script>
import SettingItem from './SettingItem'
import { ColorCheckbox, ImgCheckbox } from '@/components/checkbox'
import Clipboard from 'clipboard'
import { mapState, mapMutations } from 'vuex'
import { formatConfig } from '@/utils/formatter'
import { setting } from '@/config/default'
import sysConfig from '@/config/config'
import fastEqual from 'fast-deep-equal'
import deepMerge from 'deepmerge'
import { userPut } from '@/services/admin'
import theme_dark from '@/assets/img/theme_dark.svg'
import theme_light from '@/assets/img/theme_light.svg'
import theme_night from '@/assets/img/theme_night.svg'
import navigate_side from '@/assets/img/navigate_side.svg'
import navigate_head from '@/assets/img/navigate_head.svg'
import navigate_mix from '@/assets/img/navigate_mix.svg'

const ColorCheckboxGroup = ColorCheckbox.Group
const ImgCheckboxGroup = ImgCheckbox.Group
export default {
  name: 'Setting',
  i18n: require('./i18n'),
  components: { ImgCheckboxGroup, ImgCheckbox, ColorCheckboxGroup, ColorCheckbox, SettingItem },
  data() {
    return {
      copyConfig: 'Sorry, you have copied nothing O(∩_∩)O~',
      isDev: process.env.NODE_ENV === 'development',
      saving: false,
      lastSaveTime: '',
      theme_dark,
      theme_light,
      theme_night,
      navigate_side,
      navigate_head,
      navigate_mix
    }
  },
  computed: {
    directions() {
      return this.animates.find(item => item.name == this.animate.name).directions
    },
    ...mapState('setting', ['theme', 'layout', 'animate', 'animates', 'palettes', 'multiPage', 'weekMode', 'fixedHeader', 'fixedSideBar', 'hideSetting', 'pageWidth']),
    ...mapState('account', { currentUser: 'user' })
  },
  mounted() {
    // 加载上次保存时间
    const savedTime = localStorage.getItem('theme_last_save_time')
    if (savedTime) {
      this.lastSaveTime = savedTime
    }
  },
  watch: {
    'animate.name': function (val) {
      this.setAnimate({ name: val, direction: this.directions[0] })
    }
  },
  methods: {
    getPopupContainer() {
      return this.$el.parentNode
    },
    copyCode() {
      let config = this.extractConfig(false)
      this.copyConfig = `// 自定义配置，参考 ./default/setting.config.js，需要自定义的属性在这里配置即可
      module.exports = ${formatConfig(config)}
      `
      let clipboard = new Clipboard('#copyBtn')
      clipboard.on('success', () => {
        this.$message.success(`复制成功，覆盖文件 src/config/config.js 然后重启项目即可生效`).then(() => {
          const localConfig = localStorage.getItem(process.env.VUE_APP_SETTING_KEY)
          if (localConfig) {
            console.warn('检测到本地有历史保存的主题配置，想要要拷贝的配置代码生效，您可能需要先重置配置')
            this.$message.warn('检测到本地有历史保存的主题配置，想要要拷贝的配置代码生效，您可能需要先重置配置', 5)
          }
        })
        clipboard.destroy()
      })
    },
    saveSetting() {
      const closeMessage = this.$message.loading('正在保存到本地，请稍后...', 0)
      const config = this.extractConfig(true)
      localStorage.setItem(process.env.VUE_APP_SETTING_KEY, JSON.stringify(config))
      setTimeout(closeMessage, 800)
    },
    async saveToServer() {
      this.saving = true
      try {
        // 获取当前用户信息
        const user = this.$store.getters['account/user']
        if (!user || !user.id) {
          throw new Error('用户信息不存在')
        }
        
        const config = this.extractConfig(true)
        
        // 调用用户更新接口，只更新 theme 字段
        const response = await userPut(user.id, {
          theme: JSON.stringify(config)
        })
        
        if (response.data && response.data.code === 200) {
          const now = new Date().toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit',
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
          })
          this.lastSaveTime = now
          localStorage.setItem('theme_last_save_time', now)
          
          // 同时保存到本地
          localStorage.setItem(process.env.VUE_APP_SETTING_KEY, JSON.stringify(config))
          
          this.$message.success('主题配置已保存到服务器')
        } else {
          throw new Error(response.data?.message || '保存失败')
        }
      } catch (error) {
        console.error('保存主题配置失败:', error)
        this.$message.error('保存到服务器失败: ' + (error.message || '网络错误'))
      } finally {
        this.saving = false
      }
    },
    resetSetting() {
      this.$confirm({
        title: '重置主题会刷新页面，当前页面内容不会保留，确认重置？',
        onOk() {
          localStorage.removeItem(process.env.VUE_APP_SETTING_KEY)
          localStorage.removeItem('theme_last_save_time')
          window.location.reload()
        }
      })
    },
    //提取配置
    extractConfig(local = false) {
      let config = {}
      let mySetting = this.$store.state.setting
      let dftSetting = local ? deepMerge(setting, sysConfig) : setting
      Object.keys(mySetting).forEach(key => {
        const dftValue = dftSetting[key], myValue = mySetting[key]
        if (dftValue != undefined && !fastEqual(dftValue, myValue)) {
          config[key] = myValue
        }
      })
      return config
    },
    ...mapMutations('setting', ['setTheme', 'setLayout', 'setMultiPage', 'setWeekMode',
      'setFixedSideBar', 'setFixedHeader', 'setAnimate', 'setHideSetting', 'setPageWidth'])
  }
}
</script>

<style lang="less" scoped>
.side-setting {
  min-height: 100%;
  background-color: @base-bg-color;
  padding: 24px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  position: relative;
  .flex {
    display: flex;
  }
  .select-item {
    width: 80px;
  }
}
</style>
