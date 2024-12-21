<template>
  <page-layout>
    <div slot="headerContent" class="linux-detail">
      <div>
        <iframe v-if="iframeVisible" ref="iframe" :src="iframeSrc" frameborder="0" scrolling="auto" id="bi_iframe" @load="adjustIframe" style="position: absolute; top: 0px; left: 0px" marginwidth="0"
          framespacing="0" marginheight="0" allowtransparency="true">
        </iframe>
      </div>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { configGetOne, zbxSession } from '@/services/admin'
import Cookie from 'js-cookie'

export default {
  components: { PageLayout },
  data() {
    return {
      iframeSrc: '',
      htmlData: '',
      iframeVisible: false // 控制 iframe 是否加载
    }
  },
  created() {
    this.setIframeSrc()
    this.adjustIframe()
  },
  mounted() {
    this.setZabbixCookie()
  },
  methods: {
    setIframeSrc() {
      configGetOne('2').then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.iframeSrc = `/zbx/zabbix.php?action=dashboard.view&dashboardid=${res.data.items.value}&kiosk=1`
        } else {
          this.iframeSrc =
            '/zbx/zabbix.php?action=dashboard.view&dashboardid=1&kiosk=1'
        }
      })
    },
    adjustIframe() {
      var ifm = document.getElementById('bi_iframe')
      ifm.height = document.documentElement.clientHeight - 256
      ifm.width = document.documentElement.clientWidth - 256
    },
    async setZabbixCookie() {
      const res = await zbxSession()
      if (res.data.code == 200) {
        const domain = window.location.hostname // 获取当前访问的域名
        console.log(domain)
        Cookie.set('zbx_session', res.data.data.items, {
          path: '/zbx',
          domain: domain
        })
        console.log('Zabbix session cookie set successfully')
      } else {
        console.log('Zabbix session cookie set failed')
      }
      this.iframeVisible = true
    }
  }
}
</script>

<style scoped>
iframe {
  border: none;
}
</style>
