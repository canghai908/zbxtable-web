<template>
  <page-layout :noTitle="true">
    <div class="asset-management-page">
      <a-card :bordered="false">
        <div slot="title" class="asset-management-page__title">
          <a-icon type="appstore" />
          <span>资产管理</span>
        </div>

        <a-tabs :activeKey="activeTab" @change="handleTabChange">
          <a-tab-pane key="type" tab="资产类型">
            <asset-type embedded />
          </a-tab-pane>
          <a-tab-pane key="binding" tab="资产绑定">
            <asset-binding embedded />
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import AssetType from "./asset-type.vue";
import AssetBinding from "./asset-binding.vue";

export default {
  name: 'AssetManagement',
  components: {
    PageLayout,
    AssetType,
    AssetBinding,
  },
  computed: {
    activeTab() {
      const tab = this.$route.query.tab;
      return tab === 'binding' ? 'binding' : 'type';
    },
  },
  methods: {
    handleTabChange(tab) {
      if (tab === this.activeTab) return;
      this.$router.replace({
        path: this.$route.path,
        query: tab === 'type' ? {} : { tab },
      });
    },
  },
};
</script>

<style lang="less" scoped>
.asset-management-page__title {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
