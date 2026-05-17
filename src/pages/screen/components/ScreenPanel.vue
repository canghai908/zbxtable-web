<template>
  <div class="screen-panel">
    <div class="corner corner-tl" />
    <div class="corner corner-tr" />
    <div class="corner corner-bl" />
    <div class="corner corner-br" />
    <div class="panel-title">
      <span class="title-text">{{ title }}</span>
      <span class="title-extra" v-if="extra">{{ extra }}</span>
      <slot name="extra" />
    </div>
    <div class="panel-body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScreenPanel',
  props: {
    title: { type: String, default: '' },
    extra: { type: String, default: '' }
  }
}
</script>
