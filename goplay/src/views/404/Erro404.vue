<template>
  <div class="erro-box">
    <el-button type="primary"
               @click="onBackHome()">回首頁</el-button>
  </div>
</template>
<script lang="ts">
import { Vue } from 'vue-property-decorator';
import { QuickLink } from '@/helper/enum/QuickLink'; // 快捷連結參數
export default class Erro404 extends Vue {
  private onBackHome() {
    this.$router.push(`${QuickLink.Home}`);
  }
}
</script>
<style lang="scss" scoped>
.erro-box {
  margin-top: 2vw;
}
</style>
