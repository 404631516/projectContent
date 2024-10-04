<template>
  <div class="friend-box">
    <template v-if="friendList.length > 0">
      <el-popover placement="bottom" title="正在此關卡的好友" width="200" trigger="click" :content="friendLists">
        <div slot="reference">
          <div v-for="(item, friendIndex) in friendList" :key="item.id">
            <div class="friend-img" :class="`_${friendIndex}`" :style="friendsBoxBg" v-if="friendIndex < 3">
              <span>{{ item.name }}</span>
            </div>
          </div>
        </div>
      </el-popover>
    </template>
    <div class="prompt flex-pos" text="1vw" v-if="friendList.length > 3">{{ friendList.length - 3 }} +</div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { UserFriendInfo } from '@/helper/interface/PlanetWar';
@Component({})
export default class BtnState extends Vue {
  @Prop({ default: [] }) public friendList!: UserFriendInfo[];
  @Prop({ default: '' }) public friendsBoxBg!: string;

  /** 取得好友名稱 */
  private get friendLists(): string {
    return `${this.friendList.map<string>((info) => info.name)}`;
  }
}
</script>
<style lang="scss" scoped>
.friend-box {
  position: relative;
  width: 100%;
  color: #000;
  .friend-img {
    position: absolute;
    top: -2vw;
    left: 0;
    width: 100%;
    height: 5vw;
    background-repeat: no-repeat !important;
    background-size: contain !important;
    span {
      width: 3.5vw;
      position: absolute;
      z-index: 2;
      display: inline-block;
      top: 1.7vw;
      left: 0.9vw;
      // margin-left: .8vw;
      color: #000000;
      font-weight: bold;
      font-size: 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &::after {
      position: absolute;
      top: 0.3vw;
      left: 0.4vw;
      content: '';
      width: 3.9vw;
      height: 3.9vw;
      border-radius: 3.9vw;
      background-color: #d8d8d8;
    }
    &._1 {
      left: 1vw;
      z-index: 2;
      &::after {
        position: absolute;
        top: 0.3vw;
        left: 0.4vw;
        content: '';
        width: 3.9vw;
        height: 3.9vw;
        border-radius: 3.9vw;
        background-color: #d8d8d8;
      }
    }
    &._2 {
      left: 2vw;
      z-index: 2;
      &::after {
        position: absolute;
        top: 0.3vw;
        left: 0.4vw;
        content: '';
        width: 3.9vw;
        height: 3.9vw;
        border-radius: 3.9vw;
        background-color: #d8d8d8;
      }
    }
  }
  .prompt {
    position: absolute;
    top: -2vw;
    right: 0.8vw;
    z-index: 4;
    width: 2.5vw;
    height: 2.5vw;
    border-radius: 2vw;
    background-color: #f63e3ecc;
    color: #fff;
  }
  .friend-name-area {
    position: absolute;
    top: 0;
    left: 1vw;
    width: 5vw;
    height: 5vw;
    border-radius: 5vw;
    line-height: 5vh;
    background-color: #000;
    &::before {
      position: absolute;
      top: 0.5vh;
      left: 0.3vw;
      width: 90%;
      height: 90%;
      border-radius: 5vw;
      background-color: #fff;
      content: '';
    }
    &::after {
      position: absolute;
      left: 1.8vw;
      bottom: -0.5vw;
      content: '';
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 15px 12px 0 15px;
      border-color: #000 transparent transparent transparent;
    }
  }
}
</style>
