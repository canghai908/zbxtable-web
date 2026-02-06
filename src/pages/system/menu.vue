<template>
  <page-layout :title="$t('title')">
    <a-card :bordered="false">
      <div style="margin-bottom: 16px;">
        <a-button type="primary" icon="plus" @click="handleAdd">
          {{ $t('add_menu') }}
        </a-button>
      </div>

      <a-table
        :columns="columns"
        :data-source="menuTree"
        :loading="loading"
        :pagination="false"
        :row-key="record => record.id"
        :default-expand-all-rows="true"
      >
        <span slot="menu_name" slot-scope="text, record">
          {{ record.display_name || record.name }}
        </span>

        <span slot="icon" slot-scope="text">
          <a-icon v-if="text" :type="text" style="font-size: 18px;" />
          <span v-else>-</span>
        </span>

        <span slot="invisible" slot-scope="text">
          <a-tag v-if="text" color="orange">{{ $t('hidden') }}</a-tag>
          <a-tag v-else color="green">{{ $t('visible') }}</a-tag>
        </span>

        <span slot="is_available" slot-scope="text">
          <a-tag v-if="text" color="red">{{ $t('disabled') }}</a-tag>
          <a-tag v-else color="green">{{ $t('enabled') }}</a-tag>
        </span>

        <span slot="cacheable" slot-scope="text">
          <a-icon v-if="text" type="check-circle" style="color: #52c41a;" />
          <a-icon v-else type="close-circle" style="color: #ccc;" />
        </span>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">{{ $t('edit') }}</a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="$t('delete_confirm')"
            @confirm="handleDelete(record.id)"
          >
            <a style="color: #ff4d4f;">{{ $t('delete') }}</a>
          </a-popconfirm>
        </span>
      </a-table>
    </a-card>

    <!-- 添加/编辑菜单对话框 -->
    <a-modal
      :title="modalTitle"
      :visible="modalVisible"
      :confirm-loading="modalLoading"
      @ok="handleSubmit"
      @cancel="handleCancel"
      width="700px"
    >
      <a-form-model
        ref="menuForm"
        :model="formData"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-model-item :label="$t('parent_menu')" prop="parent_id">
          <a-select v-model="formData.parent_id" :placeholder="$t('select_parent')">
            <a-select-option :value="0">{{ $t('root_menu') }}</a-select-option>
            <a-select-option v-for="menu in parentMenus" :key="menu.id" :value="menu.id">
              {{ menu.display_name || menu.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item :label="$t('menu_name')" prop="name">
          <a-input v-model="formData.name" :placeholder="$t('enter_name')" />
        </a-form-model-item>

        <a-form-model-item :label="$t('menu_path')" prop="path">
          <a-input v-model="formData.path" :placeholder="$t('enter_path')" />
          <div class="form-hint">{{ $t('path_hint') }}</div>
        </a-form-model-item>

        <a-form-model-item :label="$t('menu_router')" prop="router">
          <a-input v-model="formData.router" :placeholder="$t('enter_router')" />
          <div class="form-hint">{{ $t('router_hint') }}</div>
        </a-form-model-item>

        <a-form-model-item :label="$t('menu_icon')" prop="icon">
          <a-input v-model="formData.icon" :placeholder="$t('enter_icon')">
            <a-icon v-if="formData.icon" slot="prefix" :type="formData.icon" />
          </a-input>
          <div class="form-hint">
            {{ $t('icon_hint') }}
            <a href="https://ant.design/components/icon-cn/" target="_blank">{{ $t('icon_reference') }}</a>
          </div>
        </a-form-model-item>

        <a-form-model-item :label="$t('menu_role')" prop="role">
          <a-select v-model="formData.role" mode="tags" :placeholder="$t('select_role')">
            <a-select-option value="admin">admin</a-select-option>
            <a-select-option value="user">user</a-select-option>
            <a-select-option value="admin,user">admin,user</a-select-option>
          </a-select>
          <div class="form-hint">{{ $t('role_hint') }}</div>
        </a-form-model-item>

        <a-form-model-item :label="$t('menu_permission')" prop="permission">
          <a-input v-model="formData.permission" :placeholder="$t('enter_permission')" />
          <div class="form-hint">{{ $t('permission_hint') }}</div>
        </a-form-model-item>

        <a-form-model-item :label="$t('highlight')" prop="highlight">
          <a-input v-model="formData.highlight" :placeholder="$t('enter_highlight')" />
          <div class="form-hint">{{ $t('highlight_hint') }}</div>
        </a-form-model-item>

        <a-form-model-item :label="$t('invisible')" prop="invisible">
          <a-switch v-model="formData.invisible" />
          <span style="margin-left: 8px;">{{ $t('invisible_hint') }}</span>
        </a-form-model-item>

        <a-form-model-item :label="$t('is_available')" prop="is_available">
          <a-switch v-model="formData.is_available" />
          <span style="margin-left: 8px;">{{ $t('is_available_hint') }}</span>
        </a-form-model-item>

        <a-form-model-item :label="$t('cacheable')" prop="cacheable">
          <a-switch v-model="formData.cacheable" />
          <span style="margin-left: 8px;">{{ $t('cacheable_hint') }}</span>
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { getMenus, getParentMenus, createMenu, updateMenu, deleteMenu } from '@/services/menu'
import { getI18nKey } from '@/utils/routerUtil'

export default {
  name: 'MenuManagement',
  i18n: require('./menu-i18n'),
  components: { PageLayout },
  data() {
    return {
      loading: false,
      menus: [],
      rawMenus: [], // 存储原始的中文菜单数据
      parentMenus: [],
      rawParentMenus: [], // 存储原始的中文父菜单数据
      modalVisible: false,
      modalLoading: false,
      isEdit: false,
      formData: {
        id: null,
        parent_id: 0,
        name: '',
        path: '',
        router: '',
        icon: '',
        role: 'admin,user',
        permission: '',
        invisible: false,
        is_available: false,
        highlight: '',
        cacheable: false,
      },
      rules: {
        name: [{ required: true, message: this.$t('name_required'), trigger: 'blur' }],
        path: [{ required: true, message: this.$t('path_required'), trigger: 'blur' }],
        router: [{ required: true, message: this.$t('router_required'), trigger: 'blur' }],
        role: [{ required: true, message: this.$t('role_required'), trigger: 'change' }],
      },
    }
  },
  computed: {
    columns() {
      return [
        {
          title: this.$t('menu_name'),
          dataIndex: 'name',
          key: 'name',
          width: 200,
          scopedSlots: { customRender: 'menu_name' },
        },
        {
          title: this.$t('menu_path'),
          dataIndex: 'path',
          key: 'path',
          width: 150,
        },
        {
          title: this.$t('menu_router'),
          dataIndex: 'router',
          key: 'router',
          width: 150,
        },
        {
          title: this.$t('menu_icon'),
          dataIndex: 'icon',
          key: 'icon',
          width: 80,
          scopedSlots: { customRender: 'icon' },
        },
        {
          title: this.$t('menu_role'),
          dataIndex: 'role',
          key: 'role',
          width: 120,
        },
        {
          title: this.$t('invisible'),
          dataIndex: 'invisible',
          key: 'invisible',
          width: 100,
          scopedSlots: { customRender: 'invisible' },
        },
        {
          title: this.$t('is_available'),
          dataIndex: 'is_available',
          key: 'is_available',
          width: 100,
          scopedSlots: { customRender: 'is_available' },
        },
        {
          title: this.$t('cacheable'),
          dataIndex: 'cacheable',
          key: 'cacheable',
          width: 80,
          align: 'center',
          scopedSlots: { customRender: 'cacheable' },
        },
        {
          title: this.$t('action'),
          key: 'action',
          width: 150,
          fixed: 'right',
          scopedSlots: { customRender: 'action' },
        },
      ]
    },
    modalTitle() {
      return this.isEdit ? this.$t('edit_menu') : this.$t('add_menu')
    },
    menuTree() {
      return this.buildMenuTree(this.menus, 0)
    },
  },
  mounted() {
    this.loadMenus()
    this.loadParentMenus()
  },
  watch: {
    '$i18n.locale'() {
      // 语言切换时重新翻译菜单数据
      if (this.rawMenus && this.rawMenus.length > 0) {
        this.menus = this.translateMenuData(this.rawMenus)
      }
      if (this.rawParentMenus && this.rawParentMenus.length > 0) {
        this.parentMenus = this.translateMenuData(this.rawParentMenus)
      }
    }
  },
  methods: {
    getGlobalI18n() {
      return (this.$root && this.$root.$i18n) ? this.$root.$i18n : this.$i18n
    },
    resolveMenuFullPath(menu, menuMap, cache) {
      if (!menu || !menu.id) return ''
      if (cache[menu.id]) return cache[menu.id]

      const rawPath = (menu.path || '').trim()
      if (!menu.parent_id || menu.parent_id === 0) {
        if (!rawPath) {
          cache[menu.id] = ''
          return ''
        }
        const rootPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`
        cache[menu.id] = rootPath
        return rootPath
      }

      const parent = menuMap[menu.parent_id]
      const parentFullPath = parent ? this.resolveMenuFullPath(parent, menuMap, cache) : ''

      if (!rawPath) {
        cache[menu.id] = parentFullPath
        return parentFullPath
      }

      if (rawPath.startsWith('/')) {
        cache[menu.id] = rawPath
        return rawPath
      }

      const joined = parentFullPath
        ? `${parentFullPath.replace(/\/$/, '')}/${rawPath}`
        : `/${rawPath}`
      cache[menu.id] = joined
      return joined
    },
    translateMenuName(menu, fullPath) {
      const i18n = this.getGlobalI18n()
      if (!i18n) return menu.name
      const i18nKey = fullPath ? getI18nKey(fullPath) : ''
      if (i18nKey && i18n.te(i18nKey)) {
        return i18n.t(i18nKey)
      }
      return menu.name
    },
    async loadMenus() {
      this.loading = true
      try {
        const res = await getMenus()
        if (res.data.code === 200) {
          this.rawMenus = res.data.data || [] // 保存原始数据
          this.menus = this.translateMenuData(this.rawMenus)
        } else {
          this.$message.error(res.data.message || this.$t('load_failed'))
        }
      } catch (error) {
        this.$message.error(this.$t('load_failed'))
      } finally {
        this.loading = false
      }
    },
    async loadParentMenus() {
      try {
        const res = await getParentMenus()
        if (res.data.code === 200) {
          this.rawParentMenus = res.data.data || [] // 保存原始数据
          this.parentMenus = this.translateMenuData(this.rawParentMenus)
        }
      } catch (error) {
        console.error('加载父菜单失败:', error)
      }
    },
    // 翻译菜单数据
    translateMenuData(menus) {
      if (!menus || !Array.isArray(menus)) return menus

      const menuMap = {}
      menus.forEach(menu => {
        if (menu && menu.id) {
          menuMap[menu.id] = menu
        }
      })
      const cache = {}

      return menus.map(menu => {
        const fullPath = this.resolveMenuFullPath(menu, menuMap, cache)
        return {
          ...menu,
          raw_name: menu.name,
          full_path: fullPath,
          display_name: this.translateMenuName(menu, fullPath),
        }
      })
    },
    buildMenuTree(menus, parentId) {
      const tree = []
      menus.forEach(menu => {
        if (menu.parent_id === parentId) {
          const children = this.buildMenuTree(menus, menu.id)
          const node = { ...menu }
          if (children.length > 0) {
            node.children = children
          }
          tree.push(node)
        }
      })
      return tree
    },
    handleAdd() {
      this.isEdit = false
      this.formData = {
        id: null,
        parent_id: 0,
        name: '',
        path: '',
        router: '',
        icon: '',
        role: 'admin,user',
        permission: '',
        invisible: false,
        is_available: false,
        highlight: '',
        cacheable: false,
      }
      this.modalVisible = true
    },
    handleEdit(record) {
      this.isEdit = true
      this.formData = {
        id: record.id,
        parent_id: record.parent_id,
        name: record.name,
        path: record.path,
        router: record.router,
        icon: record.icon,
        role: record.role,
        permission: record.permission || '',
        invisible: record.invisible || false,
        is_available: record.is_available || false,
        highlight: record.highlight || '',
        cacheable: record.cacheable || false,
      }
      this.modalVisible = true
    },
    handleSubmit() {
      this.$refs.menuForm.validate(async valid => {
        if (!valid) {
          return
        }

        this.modalLoading = true
        try {
          const data = { ...this.formData }
          // 处理角色字段
          if (Array.isArray(data.role)) {
            data.role = data.role.join(',')
          }

          let res
          if (this.isEdit) {
            res = await updateMenu(data.id, data)
          } else {
            res = await createMenu(data)
          }

          if (res.data.code === 200) {
            this.$message.success(res.data.message || this.$t('save_success'))
            this.modalVisible = false
            this.loadMenus()
            this.loadParentMenus()
          } else {
            this.$message.error(res.data.message || this.$t('save_failed'))
          }
        } catch (error) {
          this.$message.error(this.$t('save_failed'))
        } finally {
          this.modalLoading = false
        }
      })
    },
    handleCancel() {
      this.modalVisible = false
    },
    async handleDelete(id) {
      try {
        const res = await deleteMenu(id)
        if (res.data.code === 200) {
          this.$message.success(res.data.message || this.$t('delete_success'))
          this.loadMenus()
          this.loadParentMenus()
        } else {
          this.$message.error(res.data.message || this.$t('delete_failed'))
        }
      } catch (error) {
        this.$message.error(this.$t('delete_failed'))
      }
    },
  },
}
</script>

<style scoped>
.form-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
