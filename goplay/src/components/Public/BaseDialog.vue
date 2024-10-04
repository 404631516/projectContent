<template>
  <el-dialog :visible.sync="isDialog" width="0%" top="0" :show-close="false" :destroy-on-close="true" :close-on-press-escape="false">
    <slot></slot>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, ModelSync } from 'vue-property-decorator';
@Component({
  components: {},
})
export default class BaseDialog extends Vue {
  @ModelSync('isOpen', 'change', { type: Boolean }) isDialog!: boolean;
}
</script>

<style scoped>
>>> .el-dialog {
  margin: 0px;
}
>>> .el-dialog__header {
  display: none;
}
>>> .el-dialog__body {
  padding: 0px;
  width: 100vw;
  height: 100%;
  pointer-events: none;
}
</style>
