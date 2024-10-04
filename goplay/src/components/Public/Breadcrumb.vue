<template>
  <div>
    <!-- 麵包削 -->
    <router-link
      v-for="(routerData, index) in linkLists"
      :key="index"
      :to="routerData.path"
      font="bold"
      text="2xl"
      :class="{
        'cursor-default': linkLists.length - 1 === index ,
        'hover:text-[#3DB5CE]': linkLists.length - 1 !== index,
      }"
    >
      <template v-if="routerData.meta.name">
        <i v-if="index" class="el-icon-arrow-right" font="before:bold"></i
        >{{ routerData.meta.name }}
      </template>
    </router-link>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({})
export default class Breadcrumb extends Vue {
  /**路由陣列 */
  private get linkLists() {
    if (this.$route.path !== '/') {
      return [{ path: '/', meta: { name: '首頁' } }, ...this.$route.matched];
    }
    return this.$route.matched;
  }
}
</script>
