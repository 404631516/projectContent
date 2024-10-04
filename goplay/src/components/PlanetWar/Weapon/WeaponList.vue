<template>
  <div class="weapon-content flex-row center">
    <!-- 生物兵器清單 -->
    <div v-for="(weaponItem, index) in weaponList" :key="index">
      <!-- 生物兵器資訊 -->
      <div class="weapon-item">
        <!-- 生物兵器標示屬性 -->
        <div class="icon-pos">
          <img :src="attributeImageUrl(weaponItem)" alt />
        </div>
        <!-- 未解鎖生物兵器資訊 -->
        <div v-if="isWeaponLock(weaponItem)">
          <!-- 點擊生物兵器 -->
          <div class="weapon-img" alt @click="onClickWeapon(weaponItem)">
            <!-- 解鎖提示 -->
            <div class="text flex-pos">
              <!-- 晶球 -->
              <span v-show="isBuyable(weaponItem) && weaponItem.crystalCost >= 0">
                {{ textData.crystalCost }}
                <br />
                {{ textData.unlockTitle }}
              </span>
              <!-- 金幣 -->
              <span v-show="isBuyable(weaponItem) && weaponItem.goldCost >= 0">
                {{ textData.goldCost }}
                <br />
                {{ textData.unlockTitle }}
              </span>
              <!-- 未發售-->
              <span v-show="!isBuyable(weaponItem)">{{ textData.notSelling }}</span>
            </div>
            <div class="mask"></div>
            <!-- 生物兵器ICON -->
            <img :src="`${weaponBaseUrl}${weaponItem.url}`" />
          </div>
        </div>
        <!-- 已解鎖生物兵器資訊 -->
        <div v-else>
          <!-- 點擊生物兵器 -->
          <div class="weapon-img" alt @click="onClickWeapon(weaponItem)">
            <!-- 生物兵器ICON -->
            <img :src="`${weaponBaseUrl}${weaponItem.url}`" />
          </div>
          <!-- 裝備訊息 -->
          <template>
            <WeaponItemInfo>
              <template slot="attack">{{ weaponItem.attack }}</template>
              <template slot="magic">{{ weaponItem.magic }}</template>
            </WeaponItemInfo>
          </template>
        </div>
      </div>
      <!-- 裝備按鈕 -->
      <!-- 未解鎖 -->
      <template v-if="isWeaponLock(weaponItem)">
        <BtnState :btnState="btnStateType.Coin">
          <!-- 解鎖資訊 -->
          <template slot="options">
            <!-- 晶球 -->
            <div v-show="isBuyable(weaponItem) && weaponItem.crystalCost >= 0">
              <div class="ball-area">
                <img :src="imgData.ballIcon" />
              </div>
              {{ weaponItem.crystalCost }}
            </div>
            <!-- 金幣 -->
            <div v-show="isBuyable(weaponItem) && weaponItem.goldCost >= 0" slot="options">
              <div class="gold-area">
                <img :src="imgData.goldIcon" />
              </div>
              {{ weaponItem.goldCost }}
            </div>
            <!-- 未發售-->
            <div v-show="!isBuyable(weaponItem)" slot="options">
              {{ textData.notSelling }}
            </div>
          </template>
        </BtnState>
      </template>
      <!-- 已解鎖 -->
      <template v-else>
        <!-- 未裝備 -->
        <div v-show="!isWeaponEquipped(weaponItem)" @click="onClickEquipWeapon(weaponItem)">
          <BtnState :btnState="btnStateType.Put" />
        </div>
        <!-- 裝備中 -->
        <div v-show="isWeaponEquipped(weaponItem)">
          <BtnState :btnState="btnStateType.InPut" />
        </div>
      </template>
    </div>
    <!-- 分頁-->
    <div class="weapon-pagination block flex-pos">
      <el-pagination
        layout="prev, pager, next"
        :total="allWeaponList.length"
        :pager-count="9"
        :hide-on-single-page="true"
        @current-change="onSwitchPage"
      ></el-pagination>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
import { BtnStateType } from '@/helper/enum/Weapon';
import BtnState from '@/components/PlanetWar/_Props/BtnState.vue';
import { Message } from '@/helper/class/Common';
import WeaponItemInfo from '@/components/PlanetWar/Weapon/WeaponItemInfo.vue';
import { planetWarUnlockWeaponAPI } from '@/api/planetWar';
import { ResponseState, ResponseWeaponState } from '@/helper/enum/Common';
import { WeaponTableData } from '../../../helper/interface/Weapon';
import { PlanetUserInfoData } from '../../../helper/interface/PlanetWar';
import WeaponManager from '../../../manager/WeaponManager';
import ImgPath from '@/config/imgPath/imgPath';
import AttributeHelper from '@/views/H5/Helper/AttributeHelper';

@Component({
  components: {
    BtnState,
    WeaponItemInfo,
  },
})

/** 生物兵器 購買列表 */
export default class WeaponList extends Vue {
  /** 星球大戰使用者資料 */
  @Prop() private weaponIds!: number[];
  /** 生物兵器資料 */
  @Prop(Array) public weaponPlaceList!: number[];

  /** 生物兵器圖片位置 */
  private weaponBaseUrl: string = ImgPath.weaponBaseUrl;

  /** 按鈕狀態 */
  private btnStateType: typeof BtnStateType = BtnStateType;

  /** 文字資料 */
  private textData = {
    crystalCost: '消耗晶球',
    goldCost: '消耗金幣',
    unlockTitle: '解鎖',
    notSelling: '未發售',
  };

  /** 圖片資料 */
  private imgData = {
    /** 晶球icon  */
    ballIcon: ImgPath.ballIconBaseUrl,
    /** 金幣icon */
    goldIcon: ImgPath.goldIconBaseUrl,
  };

  /** 所有的生物兵器資料 */
  private allWeaponList: WeaponTableData[] = [];

  /** 當前顯示的生物兵器 */
  private weaponList: WeaponTableData[] = [];

  /** 一頁所顯示的生物兵器數量 */
  private readonly itemPerPage: number = 10;

  created() {
    // 取得所有生物兵器資料
    this.allWeaponList = WeaponManager.getWeaponTableList();
    // 顯示第一頁
    this.onSwitchPage(1);
  }

  /** 取得屬性ICON url
   * @param weaponData
   */
  private attributeImageUrl(weaponData: WeaponTableData): string {
    return AttributeHelper.getAttributeIconImgUrl(weaponData.attribute);
  }

  /** 是否可用購買取得
   * @param weaponData
   */
  private isBuyable(weaponData: WeaponTableData): boolean {
    return WeaponManager.isWeaponBuyable(weaponData);
  }

  /** 生物兵器是否未解鎖
   * @param weaponData
   */
  private isWeaponLock(weaponData: WeaponTableData): boolean {
    return this.weaponIds.includes(weaponData.id) === false;
  }

  /** 生物兵器是否裝備中
   * @param weaponData
   */
  private isWeaponEquipped(weaponData: WeaponTableData): boolean {
    return this.weaponPlaceList.includes(weaponData.id);
  }

  /** 換頁
   * @param pageIndex
   */
  private onSwitchPage(pageIndex: number): void {
    // 設定當前顯示生物兵器
    const startIndex = (pageIndex - 1) * this.itemPerPage;
    const endIndex = startIndex + this.itemPerPage;
    this.weaponList = this.allWeaponList.slice(startIndex, endIndex);
  }

  /** 點擊顯示生物兵器資訊
   * @param weaponData
   */
  @Emit('onClickWeapon')
  private onClickWeapon(weaponData: WeaponTableData): void {
    return;
  }

  /** 點擊裝備生物兵器
   * @param weaponData
   */
  @Emit('onClickEquipWeapon')
  private onClickEquipWeapon(weaponData: WeaponTableData): void {
    return;
  }
}
</script>
<style lang="scss">
.weapon-content-area {
  .weapon-content {
    width: 90%;
    .ball-area,
    .gold-area {
      display: inline-block;
      width: auto;
      height: 2vh;
      > img {
        display: inline-block;
        width: 100%;
        height: 100%;
        vertical-align: middle;
      }
    }
  }
}
.weapon-pagination {
  width: 100%;
  height: auto;
  padding: 2vh 2vw;
}
</style>
