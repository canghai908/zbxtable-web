<template>
  <page-layout :noTitle="true">
    <a-card :headStyle="{background: '#FAFBFC'}" size="small">
      <a-descriptions bordered>
        <a-descriptions-item label="Zabbix版本" :span="3">{{ ZabbixVersion }}</a-descriptions-item>
        <a-descriptions-item label=" 前端版本" :span="3">{{ UIVersion }}</a-descriptions-item>
        <a-descriptions-item label="后端版本信息">
          版本:{{ BackVersion }}
          <br />
          GitHash:{{ GitHash }}
          <br />
          构建时间:{{ BuildTime }}
        </a-descriptions-item>
      </a-descriptions>
    </a-card>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import config from "../../../package.json";
import { baseVersion } from "@/services/admin";
export default {
  name: "version",
  i18n: require('./i18n'),
  components: {
    PageLayout,
  },
  data() {
    return {
      ZabbixVersion: "",
      UIVersion: "",
      BackVersion: "",
      GitHash: "",
      BuildTime: "10",
    };
  },

  created() {
    this.UIVersion = config.version
    this.getversion()

  },
  methods: {
    getversion() {
      baseVersion().then((resp) => {
        this.ZabbixVersion = resp.data.data.items.zabbixVersion
        this.BackVersion = resp.data.data.items.version
        this.GitHash = resp.data.data.items.gitHash
        this.BuildTime = resp.data.data.items.buildTime

      });
    }
  },
};
</script>

<style lang="less" scoped>
</style>
