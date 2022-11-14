<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item label="用户名">
        <a-input v-model.trim="username" placeholder="用户名" />
      </a-form-model-item>
      <a-form-model-item label="状态">
        <a-select style="width: 80px" v-model.trim="status">
          <a-select-option :value="item.value" v-for="item in statusOption" :key="item.value">{{item.label}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">查询</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">重置</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="showModal" v-auth="`add`">新增</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.hostid;}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="username" slot-scope="record">{{record.username}}</div>
        <div slot="role" slot-scope="record">{{record.role | renderRole}}</div>
        <div slot="email" slot-scope="record">{{record.email}}</div>
        <div slot="phone" slot-scope="record">{{record.phone}}</div>
        <span slot="ding_talk" slot-scope="record">{{record.ding_talk}}</span>
        <span slot="wechat" slot-scope="record">{{record.wechat}}</span>
        <div slot="created" slot-scope="record">{{record.created| parsetime}}</div>
        <span slot="status" slot-scope="record">
          <a-switch :checked="record.status == '0' ? true : false" checked-children="启用" un-checked-children="禁用" @change="onStatusChange($event, record)" />
        </span>
        <span slot="operation" slot-scope="record">
          <!-- <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeDetail(record)">详细信息</a-button> -->
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="editModal(record)">编辑</a-button>
          <a-popconfirm title="确定要删除吗?" ok-text="确定" cancel-text="取消" @confirm="deleteRecord(record)">
            <a-button class="paddingleft0" type="link" size="small" v-auth="`delete`">删除</a-button>
          </a-popconfirm>
        </span>
      </a-table>
    </div>
    <a-modal title="新增用户" :visible="visible" :confirm-loading="confirmLoading" @ok="createUser" @cancel="handleCancel" width="600px">
      <template>
        <a-form-model :rules="rules" :model="user">
          <a-form-model-item :label="$t('modalUsername')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="username">
            <a-input v-model.trim="user.username" :placeholder="$t('modalInputUser')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('password')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="password">
            <a-input-password v-model="user.password" :placeholder="$t('modalInputPassword')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('role')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="role">
            <a-select v-model="user.role">
              <a-select-option v-for="(item, index) in roleOption" :key="index" :value="item.value" :label="item.label" :title="item.label">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item :label="$t('email')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="email">
            <a-input v-model.trim="user.email" :placeholder="$t('modalInputEmail')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('phone')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="phone">
            <a-input v-model.trim="user.phone" :placeholder="$t('modalInputPhone')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('wechat')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="wechat">
            <a-input v-model.trim="user.wechat" :placeholder="$t('modalInputWechat')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('ding_talk')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="ding_talk">
            <a-input v-model.trim="user.ding_talk" :placeholder="$t('modalInputDingTalk')" />
          </a-form-model-item>
        </a-form-model>
      </template>
    </a-modal>
    <a-modal title="编辑用户" :visible="visibleEdit" :confirm-loading="confirmLoading" @ok="updateUser" @cancel="handleEditCancel" width="600px">
      <template>
        <a-form-model :rules="rulesUpdate" :model="user">
          <a-form-model-item :label="$t('modalUsername')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="username">
            <span>{{user.username}}</span>
          </a-form-model-item>
          <a-form-model-item :label="$t('password')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="password">
            <a-input-password v-model="user.password" :placeholder="$t('modalEditPassword')" />
          </a-form-model-item>
          <a-form-model-item v-if="nowrole==='admin'" :label="$t('role')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="role">
            <a-select v-model="user.role">
              <a-select-option v-for="(item, index) in roleOption" :key="index" :value="item.value" :label="item.label" :title="item.label">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item :label="$t('email')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="email">
            <a-input v-model.trim="user.email" :placeholder="$t('modalInputEmail')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('phone')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="phone">
            <a-input v-model.trim="user.phone" :placeholder="$t('modalInputPhone')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('wechat')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="wechat">
            <a-input v-model.trim="user.wechat" :placeholder="$t('modalInputWechat')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('ding_talk')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="ding_talk">
            <a-input v-model.trim="user.ding_talk" :placeholder="$t('modalInputDingTalk')" />
          </a-form-model-item>
        </a-form-model>
      </template>
    </a-modal>

  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { parseTimeFun } from "@/utils/formatter";
import { userList, userCreate, userDelete, userPut, userStatusPut } from "@/services/admin";
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
      confirmLoading: false,
      loadingSwitch: false,
      status: "",
      username: "",
      nowuser: "",
      nowrole: "",
      statusOption: [
        { label: "启用", value: "0" },
        { label: "禁用", value: "1" },
      ],
      roleOption: [
        { label: "普通用户", value: "user" },
        { label: "管理员", value: "admin" },
      ],
      columns: [
        { title: "ID", key: "id", align: "left", scopedSlots: { customRender: "id" }, },
        { title: "用户名", key: "username", align: "left", scopedSlots: { customRender: "username" }, },
        { title: "角色", key: "role", align: "left", scopedSlots: { customRender: "role" }, },
        { title: "邮箱", key: "email", align: "left", scopedSlots: { customRender: "email" }, },
        { title: "手机", key: "phone", align: "left", scopedSlots: { customRender: "phone" }, },
        { title: "钉钉", key: "ding_talk", align: "left", scopedSlots: { customRender: "ding_talk" }, },
        { title: "微信", key: "wechat", align: "left", scopedSlots: { customRender: "wechat" }, },
        { title: "创建时间", key: "created", align: "left", scopedSlots: { customRender: "created" }, },
        { title: "用户状态", key: "status", align: "left", scopedSlots: { customRender: "status" }, },
        { title: "操作", key: "operation", align: "center", scopedSlots: { customRender: "operation" } },
      ],
      user: {
        username: "",
        password: "",
        role: "user",
        email: "",
        phone: "",
        wechat: "",
        status: "1",
        ding_talk: "",
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入用户密码', trigger: 'change' }],
        role: [{ required: true, message: '请输入用户密码', trigger: 'change' }],
        email: [{ required: false, type: 'email', message: '请输入正确邮箱', trigger: 'change' }],
        phone: [{ required: false, pattern: /^1(3[0-9]|4[01456879]|5[0-3,5-9]|6[2567]|7[0-8]|8[0-9]|9[0-3,5-9])\d{8}$/, message: '请输入正确的手机号码', trigger: 'change' }],
        wechat: [{ required: false, type: 'string', message: '请输入正确的微信账号', trigger: 'blur' }],
        ding_talk: [{ required: false, type: 'string', message: '请输入正确的钉钉账号', trigger: 'blur' }],
      },
      rulesUpdate: {
        username: [{ required: false, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: false, message: '留空则不修改', trigger: 'change' }],
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
      return v === "admin" ? "管理员" : "普通用户";
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
      userList({
        page: this.page,
        limit: this.pageSize,
        username: this.username,
        status: this.status,
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
    onStatusChange(e, record) {
      if (e) {
        record.status = 0
      } else {
        if (record.username === "admin") {
          this.$message.error("cannot disable admin user")
          return
        }
        record.status = 1
      }
      this.loading = true;
      userStatusPut(record.id, this.user = { status: record.status }).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.$message.success(res.message);
          this.loading = false;
        } else {
          this.$message.error(res.message);
          this.loading = true;
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    createUser() {
      this.confirmLoading = true;
      userCreate(this.user).then((resp) => {
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
    showModal() {
      this.visible = true;
    },
    handleCancel() {
      this.visible = false;
    },
    seeDetail(v) {
      this.$router.push("/system/user?id=" + v.hostid + "&type=1");
    },
    deleteRecord(record) {
      this.loading = true
      userDelete(record.id).then((resp) => {
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
    editModal(record) {
      this.visibleEdit = true;
      this.user = {
        id: record.id,
        username: record.username,
        password: "",
        role: record.role,
        email: record.email,
        phone: record.phone,
        wechat: record.wechat,
        ding_talk: record.ding_talk,
      }
    },
    updateUser() {
      userPut(this.user.id, this.user).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message)
          this.init()
        } else {
          this.$message.error(res.message)
        }
      })
      this.visibleEdit = false
    },
    resetData() {
      if (this.username || this.status) {
        this.username = "";
        this.status = "";
        this.init();
      }
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
