<template>
  <el-dialog
    class="weapon-item-content-wrapper"
    width="40%"
    :modal-append-to-body="false"
    :append-to-body="true"
    :visible="msgVisible"
    :show-close="false"
    :destroy-on-close="true"
    :lock-scroll="true"
  >
    <!-- 標題 -->
    <div slot="title">
      {{ textData.weaponTitle }}
      <!-- 關閉按鈕 -->
      <div class="close-btn" @click="onClose">
        <i class="el-icon-close"></i>
      </div>
    </div>
    <!-- 生物兵器資訊 -->
    <div class="content-box flex-pos">
      <div>
        <!-- 圖示 & 名稱 -->
        <div class="weapon-img">
          <!-- ICON -->
          <img :src="`${weaponBaseUrl}${weaponItem.url}`" />
          <!-- 生物兵器名稱+等級 -->
          <div>
            {{ $t(`common.${weaponItem.nameKey}`) }}
            <span>Lv{{ weaponItem.level }}</span>
          </div>
        </div>
        <!-- 數值資料 -->
        <div class="flex-pos">
          <div class="img-box">
            <img :src="imgData.atkIcon" />
            <span class="attack">{{ weaponItem.attack }}</span>
          </div>
          <div class="img-box">
            <img :src="imgData.magicIcon" />
            <span class="magic">{{ weaponItem.magic }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 生物兵器說明 -->
    <div class="note-area">{{ $t(`common.${weaponItem.contentKey}`) }}</div>
    <!-- 操作介面 -->
    <div v-if="isLock" class="btn-box">
      <div class="flex-pos">
        <!-- 解鎖按鈕 -->
        <div class="unlock-btn" @click="onClickUnlock(weaponItem)">
          <span>{{ textData.unlockTitle }}</span>
          <!-- 解鎖資訊 -->
          <div class="lock-content">
            <!-- 晶球 -->
            <div v-show="isBuyable && weaponItem.crystalCost >= 0">
              <div class="ball-area">
                <img :src="imgData.ballIcon" />
              </div>
              {{ weaponItem.crystalCost }}
            </div>
            <!-- 金幣 -->
            <div v-show="isBuyable && weaponItem.goldCost >= 0" slot="options">
              <div class="gold-area">
                <img :src="imgData.goldIcon" />
              </div>
              {{ weaponItem.goldCost }}
            </div>
            <!-- 未發售-->
            <div v-show="!isBuyable" slot="options">
              {{ textData.notSelling }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import { WeaponTableData } from '@/helper/interface/Weapon';
import ImgPath from '@/config/imgPath/imgPath';
import { WeaponLockState } from '../../../../helper/enum/Weapon';
import { Message } from '@/helper/class/Common';
import WeaponManager from '../../../../manager/WeaponManager';

/** 生物兵器 解鎖面板 */
@Component({})
export default class WeaponItemContent extends Vue {
  /** 顯示開關 */
  @Prop(Boolean) private msgVisible!: boolean;
  /** 生物兵器資訊 */
  @Prop() private weaponItem!: WeaponTableData;
  /** 是否未解鎖 */
  @Prop(Boolean) private isLock!: boolean;

  /** 生物兵器圖片位置 */
  private weaponBaseUrl: string = ImgPath.weaponBaseUrl;

  /** 圖片資料 */
  private imgData = {
    /** 攻擊力icon */
    atkIcon: ImgPath.atkIconBaseUrl,
    /** 魔力icon */
    magicIcon: ImgPath.magicIconBaseUrl,
    /** 晶球icon  */
    ballIcon: ImgPath.ballIconBaseUrl,
    /** 金幣icon */
    goldIcon: ImgPath.goldIconBaseUrl,
  };

  /** 文字資料 */
  private textData = {
    weaponTitle: '生物兵器',
    unlockTitle: '進行解鎖',
    notSelling: '未發售',
  };

  /** 是否可用購買取得 */
  private get isBuyable(): boolean {
    return WeaponManager.isWeaponBuyable(this.weaponItem);
  }

  /** 點擊解鎖
   * @param weaponItem
   */
  private onClickUnlock(weaponItem: WeaponTableData): void {
    // 未發售防呆
    if (this.isBuyable === false) {
      Message.warn('此生物兵器不發售，但參加魔王賽或玩星球大戰就有機會獲得呦!');
      return;
    }

    // 前去解鎖生物兵器
    this.onUnlockWeapon(weaponItem);
  }

  /** 生物兵器解鎖
   * @param weaponItem
   */
  @Emit('onUnlockWeapon')
  private onUnlockWeapon(weaponItem: WeaponTableData): void {
    return;
  }

  /** 關閉彈窗 */
  @Emit('onClose')
  private onClose(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
.weapon-item-content-wrapper {
  .content-box {
    font-size: 32px;
    .weapon-img {
      width: auto;
      height: auto;
      text-align: center;
      color: #808080;
      margin-bottom: 0.8vw;
      img {
        width: auto;
        height: 10vw;
      }
    }
    .img-box {
      margin-right: 1.5vw;
      > img {
        display: inline-block;
        vertical-align: middle;
      }
      span {
        padding-left: 0.5vw;
        &.magic {
          color: #2ceaec;
        }
        &.attack {
          color: #ffdd00;
        }
      }
    }
  }
  .note-area {
    padding-top: 0.5vw;
    border: 1px solid #fff;
    border-radius: 10px;
    width: 100%;
    height: 5vh;
    text-align: center;
    color: #C7C7C7;
    font-size: 18px;
  }
  .btn-box {
    width: 100%;
    height: auto;
    margin-top: 1vw;
    .unlock-btn {
      cursor: pointer;
      background-color: #ffde39;
      box-shadow: 0px 5px 10px #0000004d;
      width: 30%;
      height: 8vh;
      border-radius: 20px;
      text-align: center;
      color: #613c0a;
      padding: 0.5vw 1vw 0;
    }
    .lock-content {
      background-color: #00000080;
      margin-top: 0.5vw;
      width: 100%;
      height: 3vh;
      line-height: 3vh;
      border-radius: 10px;
      color: #fff;
      .img {
        width: 2vw;
        height: auto;
      }
    }
  }
}
.ball-area,
.gold-area {
  display: inline-block;
  width: auto;
  height: 3.2vh;
  > img {
    display: inline-block;
    width: 100%;
    height: 80%;
    vertical-align: middle;
  }
}
</style>
