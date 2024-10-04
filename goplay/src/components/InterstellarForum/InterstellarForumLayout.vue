<template>
  <div bg="[#5e5e5e]">
    <div
      class="w-[90%] <lg:w-full min-h-[calc(100vh-3.75rem)]"
      m="x-auto"
      bg="[#F9F8F4]"
    >
      <slot />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class InterstellarForumLayout extends Vue {}
</script>
<style lang="scss" scoped></style>
