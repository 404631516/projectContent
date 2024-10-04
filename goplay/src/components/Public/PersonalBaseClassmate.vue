<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :close-on-click-modal="false"
    :before-close="onCloseDialog"
    @open="onOpenDialog"
  >
    <!-- 標題 -->
    <template slot="title">
      <div class="rounded-[10px]" p="y-2" bg="[#EEA73D]" text="1.25rem [#FFF] shadow-lightDefault">
        {{ classString }}{{ textData.classmateList }}
      </div>
    </template>
    <!-- 同學列表 -->
    <div class="grid grid-cols-[2rem,1fr,2rem] rounded-10px" p="y-5" bg="[#000000DC]">
      <!-- 有同班同學 -->
      <template v-if="filterClassmateData.length > 0">
        <!-- 上一頁 -->
        <button m="x-auto" :disabled="currentPage === 1" @click="currentPage -= 1">
          <img
            class="transform rotate-180"
            :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            :src="imgData.bigArrow"
          />
        </button>
        <!-- 同班同學列表 -->
        <div class="grid grid-cols-5 grid-rows-2 gap-x-3 gap-y-6 <sm:(grid-cols-2 justify-self-center)">
          <div class="flex flex-col" v-for="(classmate, index) in filterClassmateData[currentPage - 1]" :key="index">
            <div
              class="w-32 aspect-square flex flex-col-reverse items-center relative"
              :style="{ backgroundImage: `url(${imgData.photoFrame})` }"
              bg="cover"
            >
              <img
                :src="getHeroImgUrl(classmate.heroId)"
                class="object-contain absolute"
                :class="classmate.heroId === 0 ? 'w-16 object-contain' : 'w-32 aspect-square -bottom-1'"
              />
              <span class="w-[95%] rounded-[30px] z-5" m="b-1" bg="[#00000080]" text="base [#FFFFFF]">
                {{ classmate.name }}
              </span>
            </div>
            <!-- 拜訪 -->
            <button
              class="rounded-[20px]"
              m="t-2"
              p="x-8"
              border="2px solid [#FFFFFF]"
              bg="[#47D800]"
              text="base [#FFFFFF]"
              @click="goToVisitClassmate(classmate)"
            >
              {{ textData.visitText }}
            </button>
          </div>
        </div>
        <!-- 下一頁 -->
        <button m="x-auto" :disabled="currentPage === filterClassmateData.length" @click="currentPage += 1">
          <img
            :src="imgData.bigArrow"
            :class="{
              'opacity-50 cursor-not-allowed': currentPage === filterClassmateData.length,
            }"
          />
        </button>
        <!-- 頁碼 -->
        <el-pagination
          class="col-span-3 justify-self-center"
          text="![#FFF]"
          layout="pager"
          :currentPage.sync="currentPage"
          :pageCount="filterClassmateData.length"
        >
        </el-pagination>
      </template>
      <!-- 沒有同班同學 -->
      <div v-else class="h-94 col-span-3 flex justify-center items-center" text="[#FFF] xl">
        {{ textData.noClassmate }}
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Vue, ModelSync, Component, Emit } from 'vue-property-decorator';
import ImgPath from '@/config/imgPath/imgPath';
import { ClassmateData } from '@/helper/interface/Adornment';
import FileHelper from '@/views/H5/Helper/FileHelper';
import { Message } from 'element-ui';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import { farmMapClassmateAPI } from '@/api/adornment';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';

@Component({
  components: {},
})
export default class PersonalBaseClassmate extends Vue {
  /** 此頁面彈窗開關 */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 當前頁 */
  private currentPage = 1;
  /** 每頁顯示同學數量 */
  private readonly pageSize: number = window.innerWidth < 435 ? 4 : 10;
  /** 同班同學列表 */
  private classmateList: ClassmateData[] = [];

  /** 文字資料 */
  private textData = {
    classmateList: '同學列表',
    visitText: '拜訪',
    noClassmate: '你目前沒有任何同學喔！',
  };

  /** 圖片資料 */
  private imgData = {
    bigArrow: ImgPath.bigArrow,
    photoFrame: ImgPath.photoFrame,
    noPerson: ImgPath.noPerson,
  };

  /** 取得分頁後的同學列表 */
  private get filterClassmateData(): ClassmateData[][] {
    return FileHelper.sliceChunkArray(this.classmateList, this.pageSize);
  }

  /** 取得班級字串 */
  private get classString(): string {
    return this.$$store.state.LoginModule.userInfo.className
      ? this.$$store.state.LoginModule.userInfo.className.replace('-', '年') + '班'
      : '';
  }

  async onOpenDialog(): Promise<void> {
    try {
      // API 取得同班同學資料
      const response: any = await farmMapClassmateAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      this.classmateList = response.users as ClassmateData[];
    } catch (e) {
      Message.error(`${e}`);
      this.onCloseDialog();
    }
  }

  onCloseDialog(): void {
    this.isDialogVisible = false;
  }

  /** 取得英雄圖片
   * @param heroId
   */
  private getHeroImgUrl(heroId: number): string {
    return heroId === 0 ? this.imgData.noPerson : HeroManager.getHeroImgUrlByHeroId(heroId, HeroImgType.Half);
  }

  /** 拜訪同班同學 */
  @Emit('goToVisitClassmate')
  private goToVisitClassmate(classmate: ClassmateData): void {
    this.isDialogVisible = false;
    return;
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  max-width: 50rem;
  width: 95%;
  border-radius: 10px;
}
::v-deep .el-dialog__header {
  padding: 10px 18px 15px;
}
::v-deep .el-dialog__headerbtn {
  top: 15px;
}
::v-deep .el-dialog__close {
  color: #fff;
  font-size: 1.75rem;
  font-weight: 700;
}
::v-deep .el-dialog__body {
  padding: 0px 18px 15px;
}
::v-deep .el-pager li {
  background-color: transparent;
}
</style>
