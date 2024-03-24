<template>
  <page-layout :noTitle="true">
    <div style="width: 100%;height: 100%;" class="table-custom">
      <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}">
        <a-row :gutter="16">
          <a-col :xl="{ span: 4 }" :lg="{ span: 24 }">
	    <a-card :title="$t('overview')" :headStyle="{ background: '#FAFBFC' }" size="small">
              <div>
                <a-tree :showLine=false show-icon :tree-data="treeData" :default-expand-all="autoExpandParent" :replace-fields="replaceFields" @select="onSelect" v-if="treeData">
                </a-tree>
              </div>
            </a-card>
          </a-col>
          <a-col :xl="{ span: 20 }" :lg="{ span: 24 }">
            <a-row>
              <a-col :lg="24" :md="24">
		<a-card :title="$t('information')" :headStyle="{ background: '#FAFBFC' }" :bodyStyle="{ height: '350px' }" size="small">
                  <template #extra>
                    <!-- <a-button type="primary" style="margin-left: 10px;" @click="inventoryexport">导入资产</a-button> -->
		    <a-button type="info" style="margin-left: 10px;" @click="inventoryexport">{{ $t('export_btn') }}</a-button>

                  </template>
                  <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.hostid;}">
                    <span slot="hostid" slot-scope="record">{{record.hostid}}</span>
                    <span slot="name" slot-scope="record">{{record.name}}</span>
                    <span slot="interfaces" slot-scope="record">{{record.interfaces}}</span>
                    <span slot="uptime" slot-scope="record">{{record.uptime}}</span>
                    <div slot="location" slot-scope="record">
                      <p v-if="record.editable">
			<a-input v-model.trim="form.location" :placeholder="$t('location_placeholder')" />
                      </p>
                      <p v-else>{{record.location}}</p>
                    </div>
                    <span slot="department" slot-scope="record">
                      <p v-if="record.editable">
                        <a-input v-model.trim="form.department" :placeholder="$t('department_placeholder')" />
                      </p>
                      <p v-else>{{record.department}}</p>
                    </span>
                    <span slot="resource_id" slot-scope="record">
                      <p v-if="record.editable">
                        <a-input v-model.trim="form.resource_id" :placeholder="$t('asset_number_placeholder')" />
                      </p>
                      <p v-else>{{record.resource_id}}</p>
                    </span>
                    <span slot="mac" slot-scope="record">
                      <p v-if="record.editable">
                        <a-input v-model.trim="form.mac" :placeholder="$t('mac_address_placeholder')" />
                      </p>
                      <p v-else>{{record.mac}}</p>
                    </span>
                    <span slot="date_hw_install" slot-scope="record">
                      <p v-if="record.editable">
                        <a-date-picker @change="setDate_hw_install" v-model="form.date_hw_install"></a-date-picker>
                      </p>
                      <p v-else>{{record.date_hw_install}}</p>
                    </span>
                    <span slot="date_hw_expiry" slot-scope="record">
                      <p v-if="record.editable">
                        <a-date-picker @change="setDate_hw_expiry" v-model="form.date_hw_expiry"></a-date-picker>
                      </p>
                      <p v-else>{{record.date_hw_expiry}}</p>
                    </span>
                    <span slot="available" slot-scope="record">
                      <a-tooltip>
                        <template slot="title">
                          {{record.error}}
                        </template>
 			<a-tag v-if="record.available == 1" color="#34af67">{{ $t('status_available') }}</a-tag>
    			<a-tag v-else-if="record.available == 2" color="#DC143C">{{ $t('status_not_available') }}</a-tag>
    			<a-tag v-else status="default" :text="$t('status_unknown')" />
                      </a-tooltip>
                    </span>
                    <template slot="operation" slot-scope="text, record">
                      <div class="editable-row-operations">
                        <span v-if="record.editable">
		          <a @click="save(record)" style="margin-right: 10px">{{ $t('save_btn') }}</a>
		          <a-popconfirm :title="$t('discard_btn')" @confirm="cancel(record)">
      			    <a>{{ $t('cancel_btn') }}</a>
                          </a-popconfirm>
                        </span>
                        <span v-else>
    			  <a @click="edit(record)">{{ $t('edit_btn') }}</a>
                        </span>
                      </div>
                    </template>
                  </a-table>
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
import { inventoryTree, inventoryExport, hostUpdate, hostList } from '@/services/admin'
import DetailList from "@/components/tool/DetailList";
const DetailListItem = DetailList.Item;
export default {
  i18n: require('./i18n'),
  name: "index",
  components: { PageLayout, DetailListItem, DetailList },
  data() {
    return {
      loading: false,
      treeData: "",
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
      },
      autoExpandParent: true,
      page: 1,
      pageSize: 10,
      hosts: "",
      ip: "",
      available: "",
      interfaces: "",
      detail: "",
      columns: [
        { title: "ID", key: "hostid", align: "left", scopedSlots: { customRender: "hostid" }, },
        { title: this.$t('column_hostname'), key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: this.$t('column_ip_address'), key: 'interfaces', align: 'left', scopedSlots: { customRender: 'interfaces' } },
        { title: this.$t('column_uptime'), key: 'uptime', align: 'left', scopedSlots: { customRender: 'uptime' } },
        { title: this.$t('column_availability'), key: 'available', align: 'left', width: '120px', scopedSlots: { customRender: 'available' } },
        { title: this.$t('column_location'), key: 'location', align: 'left', scopedSlots: { customRender: 'location' } },
        { title: this.$t('column_department'), key: 'department', align: 'left', scopedSlots: { customRender: 'department' } },
        { title: this.$t('column_asset_no'), key: 'resource_id', align: 'left', scopedSlots: { customRender: 'resource_id' } },
        { title: this.$t('column_installation_date'), key: 'date_hw_install', align: 'left', scopedSlots: { customRender: 'date_hw_install' } },
        { title: this.$t('column_hardware_expiration_date'), key: 'date_hw_expiry', align: 'left', scopedSlots: { customRender: 'date_hw_expiry' } },
        { title: this.$t('column_mac_address'), key: 'mac', align: 'left', scopedSlots: { customRender: 'mac' } },
        { title: this.$t('column_actions'), key: 'edit', align: 'center', fixed: 'right', width: '80px', scopedSlots: { customRender: 'operation' } }
      ],
      list: [],
      pagination: {
        total: 0,
        current: 1,
        "show-quick-jumper": true,
        "page-size-options": ["10", "20", "30", "40", "50", "100", "200"],
        pageSize: 10,
        "show-size-changer": true,
        "show-total": (total) => `共 ${total} 条数据`,
      },
      form: {
        location: "",
        department: "",
        resource_id: "",
        mac: "",
        date_hw_install: null,
        date_hw_expiry: null,
      }
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
    edit(item) {
      this.form = {
        location: item.location || "",
        department: item.department || "",
        resource_id: item.resource_id || "",
        mac: item.mac || "",
        date_hw_install: item.date_hw_install || "",
        date_hw_expiry: item.date_hw_expiry || "",
      }
      item.editable = true;
    },
    cancel(item) {
      item.editable = false;
    },
    save(item) {
      let req = Object.assign(item, {
        location: this.form.location || "",
        department: this.form.department || "",
        resource_id: this.form.resource_id || "",
        mac: this.form.mac || "",
        date_hw_install: this.form.date_hw_install,
        date_hw_expiry: this.form.date_hw_expiry,
      })
      hostUpdate(req).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          item.editable = false;
          this.onSelect([this.hostid]);
	  this.$message.success(this.$t('message_save_success'));
        }
      })
    },
    onSelect(selectedKeys) {
      // this.hostid = selectedKeys[0]

      // hostDetail(this.hostid).then((resp) => {
      //   let res = resp.data;
      //   this.detail = res;

      // });
      this.hostid = selectedKeys[0]
      this.hostType = "VM_LIN";
      switch (selectedKeys[0]) {
        case 10:
          this.hostType = "VM_LIN";
          break;
        case 11:
          this.hostType = "VM_WIN";
          break;
        case 12:
          this.hostType = "HW_NET";
          break;
        case 13:
          this.hostType = "HW_SRV";
          break;
      }
      this.loading = true;
      hostList({
        page: this.page,
        limit: this.pageSize,
        hosttype: this.hostType,
        hosts: this.hosts,
        ip: this.interfaces,
        available: this.available,
      })
        .then((resp) => {
          let res = resp.data;
          if (res.code == 200) {
            this.pagination.total = res.data.total;
            this.pagination.current = this.page;
            this.pagination.pageSize = this.pageSize;
            let arr = res.data.items || [];
            this.list = arr.map(item => {
              return Object.assign(item, { editable: false });
            })
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    changePage(e) {
      // 切换页码
      this.page = e.current;
      this.pageSize = e.pageSize;
      this.onSelect([this.hostid]);
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
      this.form.date_hw_install = dateString
      console.log(dateString);
    },
    setDate_hw_expiry(date, dateString) {
      console.log(dateString);
      this.form.date_hw_expiry = dateString
    },
    setMac(e) {
      this.detail.mac = e.target.value
    },
    setVendor(e) {
      this.detail.vendor = e.target.value
    },
    inventoryexport() {
      inventoryExport(
        {
          hostType: this.hostType
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
  },
};
</script>

<style lang="less" scoped>
</style>
