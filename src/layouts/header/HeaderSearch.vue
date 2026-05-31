<template>
  <div class="header-search">
    <a-auto-complete
      ref="input"
      :value="keyword"
      :dataSource="options"
      :getPopupContainer="getPopupContainer"
      dropdownClassName="header-search-dropdown"
      class="search-input"
      optionLabelProp="value"
      @search="handleSearch"
      @select="handleSelect"
      @change="handleChange"
    >
      <a-input :placeholder="$t('header_search_placeholder')">
        <a-icon slot="suffix" type="search" class="search-icon" />
      </a-input>
      <template slot="dataSource">
        <a-select-option
          v-for="item in results"
          :key="buildOptionKey(item)"
          :value="buildOptionValue(item)"
        >
          <div class="search-option">
            <div class="search-option__title">{{ item.name || item.host || '--' }}</div>
            <div class="search-option__meta">
              <span>{{ item.instance_name || $t('header_search_instance_unknown') }}</span>
              <span>{{ item.interfaces || '--' }}</span>
              <span>{{ item.resource_id || '--' }}</span>
            </div>
          </div>
        </a-select-option>
      </template>
    </a-auto-complete>
  </div>
</template>

<script>
import { hostSearch } from '@/services/admin'

export default {
  name: 'HeaderSearch',
  i18n: require('../AdminLayout-i18n'),
  data() {
    return {
      keyword: '',
      results: [],
      requestId: 0
    }
  },
  computed: {
    options() {
      return this.results.map(item => ({
        value: this.buildOptionValue(item),
        text: this.buildOptionValue(item)
      }))
    }
  },
  methods: {
    getPopupContainer() {
      return document.body
    },
    buildOptionKey(item) {
      return `${item.zid || 0}-${item.hostid}-${item.type_code || 'unknown'}`
    },
    buildOptionValue(item) {
      const segments = [
        item.name || item.host || '--',
        item.interfaces || '--',
        item.resource_id || '--'
      ]
      return segments.join(' | ')
    },
    handleChange(value) {
      this.keyword = value
    },
    async handleSearch(value) {
      this.keyword = value
      const query = (value || '').trim()
      if (!query) {
        this.results = []
        return
      }

      const currentRequestId = ++this.requestId
      try {
        const resp = await hostSearch({ name: query, limit: 8 })
        if (currentRequestId !== this.requestId) {
          return
        }
        const biz = resp && resp.data ? resp.data : resp
        if (biz && biz.code === 200 && biz.data) {
          this.results = biz.data.items || []
        } else {
          this.results = []
        }
      } catch (e) {
        if (currentRequestId === this.requestId) {
          this.results = []
        }
      }
    },
    handleSelect(value) {
      const target = this.results.find(item => this.buildOptionValue(item) === value)
      if (!target) {
        return
      }
      this.navigateToHost(target)
      this.keyword = ''
      this.results = []
    },
    navigateToHost(host) {
      const route = this.resolveRoute(host)
      if (!route) {
        // 资产管理已合并到顶级"资产管理"页面
        this.$router.push('/assets/tree')
        return
      }
      this.$router.push(route)
    },
    resolveRoute(host) {
      const params = [`id=${host.hostid}`]
      if (host.zid) {
        params.push(`zid=${host.zid}`)
      }

      switch (host.type_code) {
        case 'VM_LIN':
          params.push('type=1')
          return `/host/lindetail?${params.join('&')}`
        case 'VM_WIN':
          params.push('type=2')
          return `/host/windetail?${params.join('&')}`
        case 'HW_NET':
          return `/net/detail?${params.join('&')}`
        case 'HW_SRV':
          return `/server/detail?${params.join('&')}`
        default:
          // 自定义/未知类型：回退到统一资产管理页面
          return '/assets/tree'
      }
    }
  }
}
</script>

<style lang="less">
.header-search {
  display: flex;
  align-items: center;
  width: 360px;

  .search-icon {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.35);
  }

  .search-input {
    width: 100%;

    .ant-input-affix-wrapper {
      background: transparent;
    }

    .ant-input {
      height: 38px;
      border-radius: 8px;
      border: 1px solid @border-color-split;
      background: fade(#fff, 88%);
      transition: border-color .2s ease, box-shadow .2s ease, background-color .2s ease;
    }

    .ant-input:hover,
    .ant-input:focus {
      border-color: @primary-color;
      background: #fff;
      box-shadow: 0 0 0 2px fade(@primary-color, 10%);
    }

    .ant-input::placeholder {
      color: rgba(0, 0, 0, 0.38);
    }

    .ant-input-suffix {
      right: 14px;
    }
  }
}

.admin-header.dark,
.admin-header.night {
  .header-search {
    .search-icon {
      color: rgba(255, 255, 255, 0.65);
    }

    .search-input {
      .ant-input {
        color: #fff;
        border-color: fade(#fff, 18%);
        background: fade(#fff, 10%);
      }

      .ant-input:hover,
      .ant-input:focus {
        border-color: fade(#fff, 40%);
        background: fade(#fff, 16%);
        box-shadow: 0 0 0 2px fade(#fff, 8%);
      }

      .ant-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
}

.search-option {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.search-option__title {
  font-weight: 600;
}

.search-option__meta {
  display: flex;
  gap: 8px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.header-search-dropdown {
  z-index: 1600 !important;

  .ant-select-dropdown-menu {
    max-height: 320px;
  }
}
</style>
