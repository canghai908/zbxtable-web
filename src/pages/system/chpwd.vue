<template>
  <page-layout :title="title">
    <div>
      <a-card :bordered="false">
        <a-form>
          <a-form-item :label="$t('pass_cur')" :labelCol="{span: 7}" :wrapperCol="{span: 3}" :required="true">
            <a-input-password v-model="password.old" placeholder="当前密码" />
          </a-form-item>
          <a-form-item :label="$t('pass_new')" :labelCol="{span: 7}" :wrapperCol="{span: 3}" :required="true">
            <a-input-password v-model="password.new" placeholder="新密码" />
          </a-form-item>
          <a-form-item style="margin-top: 24px" :wrapperCol="{span: 10, offset: 7}">
            <a-button style="margin-left: 20px" type="primary" @click="submit">{{$t('save')}}</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { managerChpwd, } from "@/services/admin";
export default {
  name: 'chpwd',
  i18n: require('./i18n'),
  components: { PageLayout, },
  data() {
    return {
      password: {
        old: '',
        new: '',
      },
      title: ''
    }
  },
  methods: {
    submit() {
      managerChpwd(this.password).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message)
        } else {
          this.$message.warn(res.message)
        }
      })
    },
  }
}
</script>

<style lang="less" scoped>
.card {
  margin-bottom: 24px;
}
</style>
