<template>
  <div class="button-list">
    <router-link to="MyQuestion">
      <div class="button-item flex-pos question">
        <img :src="require(`@/assets/images/icon/question-mark.png`)" />
        <p font="bold">我的提問</p>
      </div>
    </router-link>
  </div>
</template>
<script lang="ts">
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
@Component
export default class ButtonList extends Vue {}
</script>
<style lang="scss" scoped>
.button-list {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  .button-item {
    width: 224px;
    height: 51px;
    line-height: 51px;
    box-shadow: 0px 3px 6px #000000e0;
    border: 2px solid #ffffff;
    border-radius: 30px;
    font-size: 26px;
    color: #fff;
    cursor: pointer;
    @media (max-width: 435px) {
      width: 170px;
      font-size: 20px;
    }
    img {
      margin-right: 4px;
      width: 23px;
      height: 35px;
    }
    &.question {
      background: #47d800d9;
    }
    &.following {
      background: #f16ce8d9;
      margin-left: 14px;
    }
  }
}
</style>
