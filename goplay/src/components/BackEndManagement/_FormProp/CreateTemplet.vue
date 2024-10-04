<template>
  <div class="create-wrapper">
    <div class="top-area top-sm-1">
      <el-button @click="onBlock"><i class=" el-icon-arrow-left"></i>返回</el-button>
    </div>
    <div class="content-area">
      <h2 class="title-area">
        {{ titleName }}
      </h2>
      <div>
      <slot name="content"></slot>         
      </div>      
    </div>
  </div>
</template>
<script lang="ts">
import { QuickLink } from '@/helper/enum/QuickLink';
import { Component, Prop, Vue} from 'vue-property-decorator';
@Component({})
export default class ContestCreate extends Vue {
  @Prop(String) private titleName!: string;
  private onBlock() {
    this.$router.push(QuickLink.BackEndManagement);
  }
}
</script>
<style lang="scss" scoped>
.create-wrapper {
  .top-area {
    background-color: #555;
    text-align: left;
    line-height: 80px;
    padding: 0 18vw;
    color: #fff;
    font-size: 24px;
  }
  h2 {
    font-size: 42px;
    color: #fff;
    text-align: left;
    margin: 2vw 0;
    color: #ebca28;
  }
  .content-area {
    margin: 1vw 18vw;
    min-height: 600px;
    // background-color: #555;
    // border-radius: 30px;
  }
}
</style>

