<template>
  <div class="common-layout">
    <div class="content">
      <slot></slot>
    </div>
    <page-footer :link-list="footerLinks" :copyright="copyright"></page-footer>
  </div>
</template>

<script>
import PageFooter from '@/layouts/footer/PageFooter'
import { mapState } from 'vuex'

export default {
  name: 'CommonLayout',
  components: { PageFooter },
  computed: {
    ...mapState('setting', ['footerLinks', 'copyright'])
  }
}
</script>

<style scoped lang="less">
.common-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: auto;
  .content {
    padding: 32px 0;
    flex: 1;
    @media (min-width: 768px) {
      padding: 112px 0 24px;
    }
  }
}
</style>
