<template>
  <div class="pointinfo-wrapper">
    <el-dialog :visible="msgVisible" :before-close="onClickClose" :destroy-on-close="false" :lock-scroll="true">
      <div slot="title" class="relative px-20px py-20px" border="b-4px solid [#A3C2F8]" text="[#666666] 36px">
        <div
          :style="{ backgroundImage: `url(${wormholeIcon})` }"
          class="w-128px aspect-square absolute -top-[40%] <sm:w-85px <sm:-top-[10%] <sm:-left-[10%]"
          bg="contain no-repeat center"
        />
        {{ textData.levelName }}
      </div>
      <div class="flex flex-col items-center">
        <div
          class="w-120px h-120px"
          bg="cover no-repeat center"
          :style="{ backgroundImage: `url(${infoData.listInfo.planetBg})` }"
        ></div>
        <span p="x-33px y-5px" m="b-2" bg="[#00000080]" border="rounded-14px" text="16px [#FFFFFF]">{{
          infoData.listInfo.levelName
        }}</span>
        <div class="flex flex-row">
          <div v-for="star in starList" :key="star.id">
            <div
              v-show="star === 1"
              class="w-32px h-32px mr-1"
              bg="contain no-repeat center"
              :style="{ backgroundImage: `url(${imgData.starActive})` }"
            ></div>
            <div
              v-show="star === 0"
              class="w-32px h-32px mr-1"
              bg="contain no-repeat center"
              :style="{ backgroundImage: `url(${imgData.starEmpty})` }"
            ></div>
          </div>
        </div>
        <div m="t-50px" p="x-48px y-24px" border="1px solid [#C7C7C7] rounded-10px">
          <p text="24px [#A5A5A5] <sm:16px">
            {{ infoData.detailData.levelContent }}
          </p>
        </div>
      </div>
      <div slot="footer">
        <div class="btn-box flex-pos">
          <button
            class="flex items-center"
            p="x-130px y-12px <sm:x-30px"
            bg="[#000000CC]"
            border="3px solid #FFFFFF rounded-80px"
            @click="onClickGo(infoData)"
          >
            <span text="[#FFFFFF] 30px <sm:24px" m="r-15px">{{ textData.goChallenge }}</span>
            <img class="inline-block" :src="imgData.arrowTwoGreenBaseUrl" />
          </button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { PlanetDetailInfo } from '@/helper/interface/PlanetWar';
import StarBox from '@/components/PlanetWar/_Props/StarList.vue';
import ImgPath from '@/config/imgPath/imgPath';
import { PlanetWarType } from '@/helper/enum/Common';

@Component({
  components: {
    StarBox,
  },
})
export default class PointInfo extends Vue {
  /** 顯示開關 */
  @Prop(Boolean) private msgVisible!: boolean;
  /** 星球細節資訊 */
  @Prop() private infoData!: PlanetDetailInfo;
  /**  星球大戰類型 */
  @Prop() private planetWarType!: PlanetWarType;
  /** 每關星星總數 */
  @Prop() private starMax!: number;

  /** 圖片資料 */
  private imgData = {
    arrowTwoGreenBaseUrl: ImgPath.arrowTwoGreenBaseUrl,
    starActive: ImgPath.planetWarStarActive,
    starEmpty: ImgPath.planetWarStarEmpty,
  };

  /** 文字資料 */
  private textData = {
    levelName: '關卡資訊',
    instruction: '說明文字',
    goChallenge: '前往挑戰',
  };

  /** 獲取表/裏宇宙類型圖示 */
  private get wormholeIcon(): string {
    switch (this.planetWarType) {
      // 表宇宙傳送門
      case PlanetWarType.Outter:
        return ImgPath.planetOuterWorldPortal;
      // 裡宇宙傳送門
      case PlanetWarType.Inner:
        return ImgPath.planetInnerWorldPortal;
      default:
        return '';
    }
  }

  /** 獲取通關星星個數 */
  private get starList() {
    const data: number[] = [];
    for (let i = 0; i < this.starMax; i++) {
      data.push(i < this.infoData.listInfo.starCount ? 1 : 0);
    }
    return data;
  }

  /** 前往挑戰
   * @param data
   */
  @Emit('onClickGo')
  private onClickGo(data: PlanetDetailInfo): void {
    return;
  }

  /** 關閉彈窗 */
  @Emit('onClickClose')
  private onClickClose(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__header {
  padding: 0px 20px 0px 20px;
  margin: 0px 0px 0px 0px;
}

::v-deep .el-dialog__body {
  padding: 20px 20px 30px 20px;
}

::v-deep .el-icon-close:before {
  font-size: 32px;
  color: #bfbfbf;
  font-weight: 700;
}
</style>
