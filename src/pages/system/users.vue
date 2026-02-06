<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item :label="$t('label_username')">
        <a-input v-model.trim="username" :placeholder="$t('label_username')" />
      </a-form-model-item>
      <a-form-model-item :label="$t('label_state')">
        <a-select style="width: 80px" v-model.trim="status">
          <a-select-option :value="item.value" v-for="item in statusOption" :key="item.value">{{item.label}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">{{ $t('search_btn') }}</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">{{ $t('reset_btn') }}</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="showModal" v-auth="`add`">{{ $t('add_user_btn') }}</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id;}">
        <span slot="id" slot-scope="record">{{record.id}}</span>
        <div slot="username" slot-scope="record">{{record.username}}</div>
        <div slot="role" slot-scope="record">{{getRoleLabel(record.role)}}</div>
        <div slot="email" slot-scope="record">{{record.email}}</div>
        <div slot="phone" slot-scope="record">{{record.phone}}</div>
        <span slot="ding_talk" slot-scope="record">{{record.ding_talk}}</span>
        <span slot="wechat" slot-scope="record">{{record.wechat}}</span>
        <span slot="wechat_robot_key" slot-scope="record">
          <template v-if="record.wechat_robot_key">
            <span style="display: inline-flex; align-items: center; max-width: 300px;">
              <span style="flex: 1; margin-right: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;">
                {{ wechatRobotKeyVisible[record.id] ? record.wechat_robot_key : maskKey(record.wechat_robot_key) }}
              </span>
              <a-icon 
                :type="wechatRobotKeyVisible[record.id] ? 'eye-invisible' : 'eye'" 
                @click="toggleWechatRobotKey(record.id)"
                style="cursor: pointer; color: #1890ff; flex-shrink: 0;"
              />
            </span>
          </template>
          <span v-else>-</span>
        </span>
        <div slot="created" slot-scope="record">{{record.created| parsetime}}</div>
        <span slot="status" slot-scope="record">
          <a-switch :checked="record.status == '0' ? true : false" :checked-children="$t('enabled')"  :un-checked-children="$t('disabled')" @change="onStatusChange($event, record)" />
        </span>
        <span slot="operation" slot-scope="record">
          <!-- <a-button class="pd20 paddingleft0" type="link" size="small" @click="editModal(record)"> {{ $t('edit_btn') }} </a-button> -->
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="editModal(record)">{{ $t('edit_btn') }}</a-button>
          <a-popconfirm :title="$t('delete_user_confirm')" :ok-text="$t('yes_btn')" :cancel-text="$t('no_btn')" @confirm="deleteRecord(record)">
            <a-button class="paddingleft0" type="link" size="small" v-auth="`delete`">{{ $t('delete_btn') }}</a-button>
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
          <a-form-model-item :label="$t('label_password')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="password">
            <a-input-password v-model="user.password" :placeholder="$t('modalInputPassword')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('label_role')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="role">
            <a-select v-model="user.role">
              <a-select-option v-for="(item, index) in roleOption" :key="index" :value="item.value" :label="item.label" :title="item.label">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item :label="$t('label_email')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="email">
            <a-input v-model.trim="user.email" :placeholder="$t('modalInputEmail')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('label_phone')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="phone">
            <a-input v-model.trim="user.phone" :placeholder="$t('modalInputPhone')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('label_wechat')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="wechat">
            <a-input v-model.trim="user.wechat" :placeholder="$t('modalInputWechat')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('label_wechat_robot_key')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="wechat_robot_key">
            <a-input-password v-model.trim="user.wechat_robot_key" :placeholder="$t('modalInputWechatRobotKey')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('label_ding_talk')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="ding_talk">
            <a-input v-model.trim="user.ding_talk" :placeholder="$t('modalInputDingTalk')" />
          </a-form-model-item>
        </a-form-model>
      </template>
    </a-modal>
    <a-modal :title="$t('edit')" :visible="visibleEdit" :confirm-loading="confirmLoading" @ok="updateUser" @cancel="handleEditCancel" width="600px">
      <template>
        <a-form-model :rules="rulesUpdate" :model="user">
          <a-form-model-item :label="$t('modalUsername')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="username">
            <span>{{user.username}}</span>
          </a-form-model-item>
          <a-form-model-item :label="$t('label_password')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="password">
            <a-input-password v-model="user.password" :placeholder="$t('modalEditPassword')" />
          </a-form-model-item>
          <a-form-model-item v-if="nowrole==='admin'" :label="$t('label_role')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="role">
            <a-select v-model="user.role">
              <a-select-option v-for="(item, index) in roleOption" :key="index" :value="item.value" :label="item.label" :title="item.label">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item :label="$t('label_email')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="email">
            <a-input v-model.trim="user.email" :placeholder="$t('modalInputEmail')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('label_phone')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="phone">
            <a-input v-model.trim="user.phone" :placeholder="$t('modalInputPhone')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('label_wechat')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="wechat">
            <a-input v-model.trim="user.wechat" :placeholder="$t('modalInputWechat')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('label_wechat_robot_key')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="wechat_robot_key">
            <a-input-password v-model.trim="user.wechat_robot_key" :placeholder="$t('modalInputWechatRobotKey')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('label_ding_talk')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="ding_talk">
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
      wechatRobotKeyVisible: {}, // 存储每行key的显示状态 {recordId: true/false}
      user: {
        username: "",
        password: "",
        role: "user",
        email: "",
        phone: "",
        wechat: "",
        wechat_robot_key: "",
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
        wechat_robot_key: [{ required: false, type: 'string', message: '请输入企业微信群机器人webhook key', trigger: 'blur' }],
        ding_talk: [{ required: false, type: 'string', message: '请输入正确的钉钉账号', trigger: 'blur' }],      
      },
      rulesUpdate: {
	username: [{ required: false, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: false, message: '留空则不修改', trigger: 'change' }],
        role: [{ required: true, message: '请输入用户密码', trigger: 'change' }],
        email: [{ required: false, type: 'email', message: '请输入正确邮箱', trigger: 'change' }],
        phone: [{ required: false, pattern: /^1(3[0-9]|4[01456879]|5[0-3,5-9]|6[2567]|7[0-8]|8[0-9]|9[0-3,5-9])\d{8}$/, message: '请输入正确的手机号码', trigger: 'change' }],
        wechat: [{ required: false, type: 'string', message: '请输入正确的微信账号', trigger: 'blur' }],
        wechat_robot_key: [{ required: false, type: 'string', message: '请输入企业微信群机器人webhook key', trigger: 'blur' }],
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
  computed: {
    statusOption() {
      return [
        { label: this.$t('state_enabled'), value: "0" },
        { label: this.$t('state_disabled'), value: "1" },
      ];
    },
    roleOption() {
      return [
        { label: this.$t('role_user'), value: "user" },
        { label: this.$t('role_admin'), value: "admin" },
      ];
    },
    columns() {
      return [
        { title: "ID", key: "id", align: "left", scopedSlots: { customRender: "id" }, },
        { title: this.$t('table_headers_username'), key: 'username', align: 'left', scopedSlots: { customRender: 'username' } },
        { title: this.$t('table_headers_role'), key: 'role', align: 'left', scopedSlots: { customRender: 'role' } },
        { title: this.$t('table_headers_email'), key: 'email', align: 'left', scopedSlots: { customRender: 'email' } },
        { title: this.$t('table_headers_phone'), key: 'phone', align: 'left', scopedSlots: { customRender: 'phone' } },
        { title: this.$t('table_headers_ding_talk'), key: 'ding_talk', align: 'left', scopedSlots: { customRender: 'ding_talk' } },
        { title: this.$t('table_headers_wechat'), key: 'wechat', align: 'left', scopedSlots: { customRender: 'wechat' } },
        { title: this.$t('table_headers_wechat_robot_key'), key: 'wechat_robot_key', align: 'left', scopedSlots: { customRender: 'wechat_robot_key' } },
        { title: this.$t('table_headers_creation_date'), key: 'created', align: 'left', scopedSlots: { customRender: 'created' } },
        { title: this.$t('table_headers_user_status'), key: 'status', align: 'left', scopedSlots: { customRender: 'status' } },
        { title: this.$t('table_headers_operation'), key: 'operation', align: 'center', scopedSlots: { customRender: 'operation' } }
      ];
    },
  },
  filters: {
    parsetime(v) {
      return parseTimeFun(v);
    },
  },
  created() {
    this.init();
  },
  methods: {
    getRoleLabel(role) {
      return role === "admin" ? this.$t('role_admin') : this.$t('role_user');
    },
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
        wechat_robot_key: record.wechat_robot_key,
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
    toggleWechatRobotKey(recordId) {
      this.$set(this.wechatRobotKeyVisible, recordId, !this.wechatRobotKeyVisible[recordId]);
    },
    maskKey(key) {
      if (!key || key.length <= 8) {
        return "****";
      }
      // 显示前4位和后4位，中间用*代替
      const start = key.substring(0, 4);
      const end = key.substring(key.length - 4);
      const masked = "*".repeat(Math.max(4, key.length - 8));
      return start + masked + end;
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
