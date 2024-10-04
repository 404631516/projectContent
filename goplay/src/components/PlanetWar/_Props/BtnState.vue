<template>
  <div class="weapon-btn-state">
    <!-- 顯示金幣 -->
    <template v-if="btnState === btnStateType.Coin">
      <div class="flex-pos">
        <div class="show-text grey">
          <slot name="options"></slot>
        </div>
      </div>
    </template>
    <!-- 卸下按鈕 -->
    <template v-if="btnState === btnStateType.Remove">
      <el-button class="btn-weapon-remove">
        <span class="flex-pos">卸下</span>
      </el-button>
    </template>
    <!-- 裝備按鈕 -->
    <template v-if="btnState === btnStateType.Put">
      <el-button class="btn-info-chang">
        <span class="flex-pos">裝備</span>
      </el-button>
    </template>
    <!-- 裝備中 -->
    <template v-if="btnState === btnStateType.InPut">
      <div class="flex-pos">
        <div class="show-text brown">裝備中</div>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { BtnStateType } from '@/helper/enum/Weapon';

@Component({})
export default class BtnState extends Vue {
  @Prop() public btnState!: BtnStateType;

  /** 按鈕狀態 */
  private btnStateType: typeof BtnStateType = BtnStateType;
}
</script>
<style lang="scss" scoped>
.weapon-btn-state {
  width: 100%;
  height: auto;
  margin-bottom: 3vh;
  .show-text {
    width: 90%;
    height: 3.2vh;
    line-height: 3.2vh;
    color: #fff;
    border-radius: 30px;
    &.brown {
      background-color: #d59434cc;
    }
    &.green {
      background-color: #2b675d;
    }
    &.grey {
      background-color: #808080;
    }
  }
  .btn-weapon-remove,
  .btn-info-chang {
    border: 1px solid #fff !important;
    color: #fff !important;
  }
}
</style>
