<template>
  <a-layout-header :class="[headerTheme, 'admin-header']">
    <div :class="['admin-header-wide', layout, pageWidth]">
      <router-link v-if="isMobile || layout === 'head'" to="/" :class="['logo', isMobile ? null : 'pc', headerTheme]">
        <img width="32" src="@/assets/img/logo.png" />
        <h1 v-if="!isMobile">{{systemName}}</h1>
      </router-link>
      <a-divider v-if="isMobile" type="vertical" />
      <a-icon v-if="layout !== 'head'" class="trigger" :type="collapsed ? 'menu-unfold' : 'menu-fold'" @click="toggleCollapse" />
      <div v-if="layout !== 'side' && !isMobile" class="admin-header-menu" :style="`width: ${menuWidth};`">
        <i-menu class="head-menu" :theme="headerTheme" mode="horizontal" :options="menuData" @select="onSelect" />
      </div>
      <div :class="['admin-header-right', headerTheme]">
        <!-- 全局 Zabbix 实例切换 -->
        <div v-if="zabbixList && zabbixList.length" class="header-item" style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px;">当前连接:</span>
          <a-select class="zabbix-select" size="small" style="min-width: 160px" :value="activeZabbixId" :loading="zabbixLoading" @change="onZabbixChange">
            <a-select-option v-for="z in zabbixList" :key="z.id" :value="z.id">
              {{ z.name }}
            </a-select-option>
          </a-select>
        </div>
        <header-avatar class="header-item" />
        <a-dropdown class="lang header-item">
          <div>
            <a-icon type="global" /> {{langAlias}}
          </div>
          <a-menu @click="val => setLang(val.key)" :selected-keys="[lang]" slot="overlay">
            <a-menu-item v-for=" lang in langList" :key="lang.key">{{lang.key.toLowerCase() + ' ' + lang.name}}</a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>
  </a-layout-header>
</template>

<script>
// import HeaderSearch from './HeaderSearch'
// import HeaderNotice from './HeaderNotice'
import HeaderAvatar from "./HeaderAvatar";
import IMenu from "@/components/menu/menu";
import { mapState, mapMutations } from "vuex";
import { listZabbixInstances, getActiveZabbixInstance, activateZabbixInstance } from "@/services/zabbix";

export default {
  name: "AdminHeader",
  components: { IMenu, HeaderAvatar },
  props: ["collapsed", "menuData"],
  data() {
    return {
      langList: [
        { key: "CN", name: "简体中文", alias: "简体" },
        { key: "HK", name: "繁體中文", alias: "繁體" },
        { key: "US", name: "English", alias: "English" },
      ],
      searchActive: false,
      zabbixList: [],
      activeZabbixId: undefined,
      zabbixLoading: false,
    };
  },
  computed: {
    ...mapState("setting", [
      "theme",
      "isMobile",
      "layout",
      "systemName",
      "lang",
      "pageWidth",
    ]),
    headerTheme() {
      if (
        this.layout == "side" &&
        this.theme.mode == "dark" &&
        !this.isMobile
      ) {
        return "light";
      }
      return this.theme.mode;
    },
    langAlias() {
      let lang = this.langList.find((item) => item.key == this.lang);
      return lang.alias;
    },
    menuWidth() {
      const { layout, searchActive } = this;
      const headWidth = layout === "head" ? "100% - 188px" : "100%";
      const extraWidth = searchActive ? "600px" : "400px";
      return `calc(${headWidth} - ${extraWidth})`;
    },
  },
  methods: {
    toggleCollapse() {
      this.$emit("toggleCollapse");
    },
    onSelect(obj) {
      this.$emit("menuSelect", obj);
    },
    async loadZabbixInstances() {
      try {
        this.zabbixLoading = true;
        const [listRes, activeRes] = await Promise.all([
          listZabbixInstances(),
          getActiveZabbixInstance(),
        ]);
        const listBiz = listRes && listRes.data ? listRes.data : listRes;
        if (listBiz && listBiz.code === 200) {
          this.zabbixList = Array.isArray(listBiz.data) ? listBiz.data : [];
        }
        const activeBiz = activeRes && activeRes.data ? activeRes.data : activeRes;
        if (activeBiz && activeBiz.code === 200 && activeBiz.data) {
          this.activeZabbixId = activeBiz.data.id;
        } else if (this.zabbixList.length && this.activeZabbixId === undefined) {
          this.activeZabbixId = this.zabbixList.find((z) => z.is_active)?.id || this.zabbixList[0].id;
        }
      } catch (e) {
        // 静默失败，不影响主流程
        // console.error("加载 Zabbix 实例失败", e);
      } finally {
        this.zabbixLoading = false;
      }
    },
    async onZabbixChange(id) {
      this.zabbixLoading = true;
      try {
        const res = await activateZabbixInstance(id);
        const biz = res && res.data ? res.data : res;
        if (biz && biz.code === 200) {
          this.activeZabbixId = id;
          this.$message.success("已切换当前 Zabbix");
          // 重新加载实例列表以刷新“当前”标记
          this.loadZabbixInstances();
          // 切换 Zabbix 后自动刷新当前页面，使后续所有查询/分析都生效
          this.$router.go(0);
        } else {
          this.$message.error((biz && biz.message) || "切换失败");
        }
      } catch (e) {
        this.$message.error("切换失败");
      } finally {
        this.zabbixLoading = false;
      }
    },
    ...mapMutations("setting", ["setLang"]),
  },
  mounted() {
    // 登录后在头部加载一次 Zabbix 实例列表
    this.loadZabbixInstances();
  },
};
</script>

<style lang="less" scoped>
@import "index";
</style>
