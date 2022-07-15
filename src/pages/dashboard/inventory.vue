<template>
  <page-layout :noTitle="true">
    <div style="width: 100%;height: 100%;">
      <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}">
        <a-row :gutter="16">
          <a-col :xl="{ span: 8 }" :lg="{ span: 24 }">
            <a-card title="资产树" :headStyle="{background: '#FAFBFC'}" size="small">
              <div>
                <a-tree :showLine=false show-icon :tree-data="treeData" :defaultExpandAll=false :replace-fields="replaceFields" @select="onSelect">
                </a-tree>
              </div>
            </a-card>
          </a-col>
          <a-col :xl="{ span: 16 }" :lg="{ span: 24 }">
            <a-row>
              <a-col :lg="24" :md="24">
                <a-card title="资产信息" :headStyle="{background: '#FAFBFC'}" :bodyStyle="{height: '350px'}" size="small">
                  <a-row :gutter="[16,16]">
                    <a-col :span="8">
                      <a-input addon-before="设备位置" :v-model=detail.location :value=detail.location @change=setLocation />
                    </a-col>
                    <a-col :span="8">
                      <a-input addon-before="所属部门" :v-model=detail.department :value=detail.department @change=setDepartment />
                    </a-col>
                    <a-col :span="8">
                      <a-input addon-before="资产编号" :v-model=detail.resource_id :value=detail.resource_id @change=setResource_id />
                    </a-col>
                  </a-row>
                  <a-row :gutter="[16,16]">
                    <a-col :span="8">设备安装时间
                      <a-date-picker @change="setDate_hw_install" :v-model=detail.date_hw_install :value=detail.date_hw_install />
                      <br />

                    </a-col>
                    <a-col :span="8">维保到期时间
                      <a-date-picker @change="setDate_hw_expiry" :v-model=detail.date_hw_expiry :value=detail.date_hw_expiry />
                      <br />
                    </a-col>
                    <a-col :span="8">
                      <a-input addon-before="MAC地址" :v-model=detail.mac :value=detail.mac @change=setMac />
                    </a-col>
                  </a-row>
                  <a-row :gutter="[16,16]">
                    <a-col :span="10">备注
                      <a-textarea :v-model=detail.vendor :value=detail.vendor @change=setVendor :rows="4" />
                    </a-col>
                  </a-row>
                  <a-row :gutter="[16,16]">
                    <a-col :span="8">
                    </a-col>
                    <a-col :span="8">
                    </a-col>
                    <a-col :span="3">
                      <!-- <a-button type="primary" style="margin-left: 10px;" @click=hostexport()>导出资产</a-button> -->
                    </a-col>
                    <a-col :span="3">
                      <a-button type="primary" style="margin-left: 10px;" @click=saveData()>
                        保存
                      </a-button>
                    </a-col>
                  </a-row>
                </a-card>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { inventoryTree, hostDetail, hostUpdate, hostExport } from '@/services/admin'
import DetailList from "@/components/tool/DetailList";
const DetailListItem = DetailList.Item;
export default {
  name: "index",
  components: { PageLayout, DetailListItem, DetailList },
  data() {
    return {
      loading1: false,
      treeData: "",
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
      },
      hostid: "",
      detail: "",
    };
  },
  components: {
    PageLayout,
  },
  created() {
    this.initree()
  },
  methods: {
    initree() {
      inventoryTree().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.treeData = res.data.items
        }
      })
    },
    onSelect(selectedKeys) {
      this.hostid = selectedKeys[0]
      hostDetail(this.hostid).then((resp) => {
        let res = resp.data;
        this.detail = res;

      });
    },
    saveData() {
      console.log(this.detail)
      console.log("aa")
      hostUpdate(this.detail).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success("保存成功")
        }
      })
    },
    setLocation(e) {
      this.detail.location = e.target.value
    },
    setDepartment(e) {
      this.detail.department = e.target.value
    },
    setResource_id(e) {
      this.detail.resource_id = e.target.value
    },
    setDate_hw_install(date, dateString) {
      this.detail.date_hw_install = dateString
      console.log(dateString);
    },
    setDate_hw_expiry(date, dateString) {
      console.log(dateString);
      this.detail.date_hw_expiry = dateString
    },
    setMac(e) {
      this.detail.mac = e.target.value
    },
    setVendor(e) {
      this.detail.vendor = e.target.value
    },
    hostexport() {
      hostExport(
        {
          hosts: this.detail.host
        },
        {
          responseType: "arraybuffer",
        }
      ).then((resp) => {
        let filename = resp.headers["content-disposition"]
          .split(";")
          .find((n) => n.includes("filename="))
          .replace("filename=", "")
          .trim();
        const url = window.URL.createObjectURL(new Blob([resp.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      });
    },
  },
  filters: {
    parsetime(v) {
      return parseTimeFun(v);
    },
    kbFilters(v) {
      if (v && v > 0) {
        v = parseFloat(v);
        if (v <= 1024) {
          return v + "B/s";
        }
        if (v > 1024 && (v * 8) / 1024 < 1024) {
          return ((v * 8) / 1024).toFixed(2) + "Kb/s";
        }
        if ((v * 8) / 1024 > 1024 && (v * 8) / 1024 / 1024 < 1024) {
          return ((v * 8) / 1024 / 1024).toFixed(2) + "Mb/s";
        }
        if ((v * 8) / 1024 / 1024 > 1024) {
          return ((v * 8) / 1024 / 1024 / 1024).toFixed(2) + "Gb/s";
        }
      } else {
        return v;
      }
    },
  },
};
</script>

<style lang="less">
.homeMain {
  height: 430px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
}
</style>