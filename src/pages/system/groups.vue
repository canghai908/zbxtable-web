<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
    <a-form-model-item :label="$t('label_group_name')">
      <a-input v-model.trim="name" :placeholder="$t('label_group_name')" />
      </a-form-model-item>
      <a-form-model-item>
    	<a-button type="primary" @click="init">{{ $t('search_btn') }}</a-button>
    	<a-button style="margin-left: 10px;" @click="resetData">{{ $t('reset_btn') }}</a-button>
    	<a-button type="primary" style="margin-left: 10px;" @click="showModal" v-auth="`add`">{{ $t('add_group_btn') }}</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.hostid;}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="name" slot-scope="record">{{record.name}}</div>
        <div slot="note" slot-scope="record">{{record.note}}</div>
        <div slot="created" slot-scope="record">{{record.created| parsetime}}</div>
        <span slot="operation" slot-scope="record">
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="editModal(record)">{{ $t('edit_btn') }}</a-button>
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="editMember(record)">{{ $t('members_btn') }}</a-button>
          <a-popconfirm :title="$t('confirm_delete_group')" :ok-text="$t('confirm_yes')" :cancel-text="$t('confirm_no')" @confirm="deleteRecord(record)">
          <a-button class="paddingleft0" type="link" size="small" v-auth="`delete`">{{ $t('delete_group_btn') }}</a-button>
          </a-popconfirm>
        </span>
      </a-table>
    </div>
    <a-modal :title="$t('add_group')" :visible="visible" :confirm-loading="confirmLoading" @ok="createGroup" @cancel="handleCancel" width="600px">
      <template>
        <a-form-model :rules="rules" :model="group">
          <a-form-model-item :label="$t('group_name')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="name">
            <a-input v-model.trim="group.name" :placeholder="$t('modalInputGroup')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('group_note')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="note">
            <a-input v-model.trim="group.note" :placeholder="$t('modalInputNote')" />
          </a-form-model-item>
        </a-form-model>
      </template>
    </a-modal>
    <a-modal :title="$t('edit_group')" :visible="visibleEdit" :confirm-loading="confirmLoading" @ok="updateGroup" @cancel="handleEditCancel" width="600px">
      <template>
        <a-form-model :rules="rulesUpdate" :model="group">
          <a-form-model-item :label="$t('group_name')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="name">
            <a-input v-model.trim="group.name" :placeholder="$t('modalInputGroup')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('group_note')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="note">
            <a-input v-model.trim="group.note" :placeholder="$t('modalInputNote')" />
          </a-form-model-item>
        </a-form-model>
      </template>
    </a-modal>
    <a-modal :title="$t('edit_members')" :visible="visibleMember" :confirm-loading="confirmLoading" @ok="updateGroupMember" @cancel="handleMemberCancel" width="600px">
      <template>
        <a-form-model :rules="rulesUpdate" :model="group">
          <a-form-model-item :label="$t('group_name')" :labelCol="{span: 3}" :wrapperCol="{span: 10}" prop="name">
            <span>{{group.name}}</span>
          </a-form-model-item>
          <a-form-model-item prop="email">
    	    <a-transfer :data-source="transferDataSource" :render="item => item.title" show-search :list-style="{width: '250px',height: '300px',}" :titles="[$t('all_users'), $t('group_members')]" :target-keys="targetKeys" :selected-keys="selectedKeys" @change="handleChange" @selectChange="handleSelectChange" />
            <!-- <a-input v-model="group.members" :placeholder="$t('modalInputEmail')" /> -->
          </a-form-model-item>
        </a-form-model>
      </template>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { parseTimeFun } from "@/utils/formatter";
import { groupList, groupCreate, userList, groupPut, groupMemberPut, groupDelete } from "@/services/admin";
export default {
  name: "userList",
  i18n: require('./i18n'),
  components: {
    PageLayout,
  },
  authorize: {              //权限校验注入设置
    deleteRecord: {        //需要 注入权限校验 的方法名：deleteRecord
      check: 'delete',     //需要校验的操作权限：check
      type: 'role'         //指定操作权限校验的类型，可选 permission 和 role。这里指定以 role.operation 校验操作权限
    },
    onStatusChange: {        //需要 注入权限校验 的方法名：deleteRecord
      check: 'update',     //需要校验的操作权限：check
      type: 'role'         //指定操作权限校验的类型，可选 permission 和 role。这里指定以 role.operation 校验操作权限
    },
  },
  data() {
    return {
      page: 1,
      pageSize: 10,
      loading: false,
      visible: false,
      visibleEdit: false,
      visibleMember: false,
      confirmLoading: false,
      loadingSwitch: false,
      name: "",
      nowuser: "",
      nowrole: "",
      transferDataSource: [],
      targetKeys: [],
      selectedKeys: [],
      statusOption: [
        { label: "启用", value: "0" },
        { label: "禁用", value: "1" },
      ],
      columns: [
        { title: "ID", key: "id", align: "left", scopedSlots: { customRender: "id" }, },
        { title: this.$t('table_headers_group'), key: "name", align: "left", scopedSlots: { customRender: "name" }, },
        { title: this.$t('table_headers_description'), key: "note", align: "left", scopedSlots: { customRender: "note" }, },
        { title: this.$t('table_headers_creation_date'), key: "created", align: "left", scopedSlots: { customRender: "created" }, },
        // { title: "用户状态", key: "status", align: "left", scopedSlots: { customRender: "status" }, },
        { title: this.$t('table_headers_operation'), key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
      ],
      group: {
        name: "",
        note: "",
      },
      user: {
        id: "",
        username: "",
      },
      rules: {
        name: [{ required: true, message: this.$t('username_required'), trigger: 'blur' }],
        note: [{ required: false, message: this.$t('password_required'), trigger: 'change' }],
      },
      rulesUpdate: {
        name: [{ required: false, message: '请输入用户名', trigger: 'blur' }],
        note: [{ required: false, message: '留空则不修改', trigger: 'change' }],
        role: [{ required: true, message: '请输入用户密码', trigger: 'change' }],
        email: [{ required: false, type: 'email', message: '请输入正确邮箱', trigger: 'change' }],
        phone: [{ required: false, pattern: /^1(3[0-9]|4[01456879]|5[0-3,5-9]|6[2567]|7[0-8]|8[0-9]|9[0-3,5-9])\d{8}$/, message: '请输入正确的手机号码', trigger: 'change' }],
        wechat: [{ required: false, type: 'string', message: '请输入正确的微信账号', trigger: 'blur' }],
        ding_talk: [{ required: false, type: 'string', message: '请输入正确的钉钉账号', trigger: 'blur' }],
      },
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
    };
  },
  filters: {
    parsetime(v) {
      return parseTimeFun(v);
    },
    renderRole(v) {
      return v === "admin" ? "admin" : "user";
    },
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.nowuser = this.$store.getters['account/user'].name;
      this.nowrole = this.$store.getters['account/user'].role;
      this.loading = true;
      groupList({
        page: this.page,
        limit: this.pageSize,
        name: this.name,
      }).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.pagination.total = res.data.total;
          this.pagination.current = this.page;
          this.pagination.pageSize = this.pageSize;
          this.list = res.data.items || [];
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    showModal() {
      this.visible = true;
    },
    createGroup() {
      this.confirmLoading = true;
      groupCreate(this.group).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.$message.success(res.message)
          this.loading = false;
          this.confirmLoading = false;
          this.visible = false;
          this.init()
        } else {
          this.visible = true;
          this.confirmLoading = false;
          this.$message.error(res.message);
        }
      })
    },
    changePage(e) {
      // 切换页码
      this.page = e.current;
      this.pageSize = e.pageSize;
      this.init();
    },

    handleCancel() {
      this.visible = false;
    },
    deleteRecord(record) {
      this.loading = true
      groupDelete(record.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.loading = false
          this.$message.success(res.message)
          this.init()
        } else {
          this.loading = false
          this.$message.error(res.message)
        }
      })
    },
    handleEditCancel() {
      this.visibleEdit = false;
    },
    handleMemberCancel() {
      this.visibleMember = false
    },
    editModal(record) {
      this.visibleEdit = true;
      this.group = {
        id: record.id,
        name: record.name,
        note: record.note,
      }
    },
    updateGroup() {
      groupPut(this.group.id, this.group).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.visibleEdit = false
          this.$message.success(res.message)
          this.init()
        } else {
          this.$message.error(res.message)
        }
      })
    },
    resetData() {
      if (this.name) {
        this.name = "";
        this.init();
      }
    },
    handleChange(nextTargetKeys, direction, moveKeys) {
      this.targetKeys = nextTargetKeys;
    },
    handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
      this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys];
    },
    editMember(record) {
      this.visibleMember = true;
      this.group = {
        id: record.id,
        name: record.name,
      }
      //获取用户列表
      let transferDataSource = []
      userList({
        page: 1,
        limit: 1000,
      }).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.user = res.data.items || [];
          this.user.forEach((item) => {
            let data = {
              key: JSON.stringify(item.id),
              title: item.username,
              disabled: item.status == "1" ? true : false,
            }
            transferDataSource.push(data);
          });
          this.transferDataSource = transferDataSource
          this.targetKeys = record.member.split(',')
        }
      })
    },
    updateGroupMember() {
      groupMemberPut(this.group.id, { "member": this.targetKeys }).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.visibleMember = false
          this.$message.success(res.message)
          this.init()
        } else {
          this.visibleMember = true
          this.$message.error(res.message)
        }
      })
    },
  },
};
</script>

<style lang="less" scoped>
.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 48px;
}
.new-btn {
  border-radius: 2px;
  width: 100%;
  height: 187px;
}
.home-search {
  margin-bottom: 10px;
}
.meta-content {
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  height: 64px;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.linux-list {
  /deep/ .ant-progress-bg {
    height: 14px !important;
  }
  /deep/ .ant-progress-text {
    margin-left: 2px;
  }
}
</style>
