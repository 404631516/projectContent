<template>
  <el-dialog
    :visible.sync="isDialogVisible"
    :destroy-on-close="true"
    @open="onOpenDialog"
    :before-close="onCloseDialog"
    top="8vh"
  >
    <!-- 標題 -->
    <div slot="title" text="36px [#FFF]">
      {{ textData.title }}
    </div>
    <div class="sm:(grid grid-cols-2) items-center">
      <!-- 玩家列表 -->
      <div class="h-145 flex flex-col scrollbar overflow-auto" p="r-3">
        <div
          v-for="(player, index) in playerScoreList"
          :key="index"
          class="grid grid-cols-[48px,82px,150px,100px] items-center rounded-10px"
          m="1"
          border="1px solid #FFF"
          :bg="index === clickIndex ? '[#2DFFE24D]' : ''"
          text="20px [#FFF]"
        >
          <div m="l-3">
            <!-- 前三名顯示圖片 -->
            <img v-if="index <= 2" :src="rankImgUrl[index]" class="w-8 object-contain" />
            <!-- 非前三名顯示排名 -->
            <span v-else>{{ index + 1 }}</span>
          </div>
          <!-- 玩家頭像 -->
          <div m="l-4">
            <div
              class="w-17 aspect-square rounded-40px"
              border="2px solid #FFF"
              :m="player.isOnline === false ? 't-4' : 'y-4'"
              bg="[#00000080]"
            >
              <img :src="getHeroImgUrl(player.heroId)" class="block object-contain rounded-30px" />
            </div>
            <img v-if="player.isOnline === false" m="-t-5 b-4" :src="imgData.fx_offline" class="w-18 object-contain" />
          </div>
          <!-- 玩家名字和得分 -->
          <div text="left" m="l-4">
            {{ player.name }}
            <div m="t-1">
              <span text="25px [#FFDD00]" m="r-1">{{ player.score }}</span>
              {{ textData.point }}
            </div>
          </div>
          <!-- 查看按鈕 -->
          <button
            class="w-18 rounded-30px shadow-default <sm:hidden"
            bg="[#47D800D9]"
            border="2px solid [#FFF]"
            p="x-3 y-2"
            m="l-6"
            @click="showPlayerDetail(player, index)"
          >
            {{ textData.watchData }}
          </button>
        </div>
      </div>
      <!-- 玩家詳細資訊 -->
      <div
        v-if="playertest != null"
        class="rounded-10px <sm:hidden"
        p="y-5"
        m="x-5"
        border="1px solid [#FFF]"
        text="20px [#FFF] left"
      >
        <div class="grid grid-cols-[45px,74px,250px] items-center rounded-10px" m="b-5">
          <div m="l-3">
            <!-- 前三名顯示圖片 -->
            <img v-if="clickIndex <= 2" :src="rankImgUrl[clickIndex]" class="w-8 object-contain" />
            <!-- 非前三名顯示排名 -->
            <p v-else text="center">{{ clickIndex + 1 }}</p>
          </div>
          <!-- 玩家頭像 -->
          <div class="flex flex-col" m="l-2">
            <div class="w-17 aspect-square rounded-40px" border="2px solid #FFF">
              <img :src="getHeroImgUrl(playertest.heroId)" class="block object-contain rounded-30px" />
            </div>
            <img v-if="playertest.isOnline === false" m="-t-5" :src="imgData.fx_offline" class="w-18 object-contain" />
          </div>
          <!-- 玩家學校和姓名和得分 -->
          <div class="grid gap-y-1" m="l-3">
            <span>{{ playertest.school }}</span>
            <span>{{ playertest.name }}</span>
            <div>
              <span text="25px [#FFDD00]">{{ playertest.score }}</span>
              {{ textData.point }}
            </div>
          </div>
        </div>
        <!-- 詳細得分列表 -->
        <div
          v-for="(score, index) in detailPlayerScore"
          :key="index"
          class="grid grid-cols-[7fr,2fr,1fr]"
          m="l-13.5 r-3 y-5"
        >
          {{ scoreBoardIndex[index].title }}
          <span text="[#2CEAEC] right">{{ score }}</span>
          {{ scoreBoardIndex[index].unit }}
        </div>
        <!-- 道具列表 -->
        <div class="flex" m="l-13.5">
          <img
            v-for="(item, index) in playertest.itemList"
            :key="index"
            :src="item === 0 ? '' : itemImgUrl[index]"
            :class="item === 0 ? '' : 'w-9 object-contain'"
          />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import { Component, Vue, ModelSync, Watch } from 'vue-property-decorator';
import HeroManager, { HeroImgType } from '@/manager/HeroManager';
import { BrickBreakerAvatarDataWithScore } from '@/views/H5/Games/BrickBreaker/Dialogs/BrickBreakerRankDialog';
import imgPath from '@/config/imgPath/imgPath';

@Component({})
export default class BrickBreakerScoreBoard extends Vue {
  /** 顯示dialog */
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;

  /** 目前選中的觀看詳細資訊 */
  private clickIndex: number = 0;
  /** 分數列表 */
  private detailPlayerScore: number[] = [];
  private playertest: BrickBreakerAvatarDataWithScore = {} as BrickBreakerAvatarDataWithScore;
  /** 詳細資訊的分數標題 */
  private scoreBoardIndex: Array<{ title: string; unit: string }> = [
    {
      title: '對魔王造成傷害量',
      unit: '',
    },
    {
      title: '成功對魔王7連擊次數',
      unit: '次',
    },
    {
      title: '答對的題目次數',
      unit: '次',
    },
    {
      title: '使用號角解凍同伴次數',
      unit: '次',
    },
    {
      title: '成功閃避魔王攻擊次數',
      unit: '次',
    },
    {
      title: '成功打開寶箱次數',
      unit: '次',
    },
    {
      title: '獲得寶物次數',
      unit: '次',
    },
    {
      title: '敲磚塊次數',
      unit: '次',
    },
  ];

  /** 名次圖片路徑 */
  private rankImgUrl: string[] = [
    // 第一名:皇冠
    imgPath.crownIcon,
    // 第二名:銀牌
    imgPath.silverMedal,
    // 第三名:銅牌
    imgPath.bronzeMedal,
  ];

  /** 道具圖片路徑 */
  private itemImgUrl: string[] = [
    '',
    imgPath.brickBreakerShield,
    imgPath.brickBreakerAxe,
    imgPath.brickBreakerFreezePrevent,
  ];

  /** 文字資料 */
  private textData = {
    title: '參賽玩家目前得分',
    point: '分',
    watchData: '查看',
  };

  /** 圖片資料 */
  private imgData = {
    fx_offline: imgPath.fx_offline,
  };

  /** 抓出玩家列表 */
  private get playerScoreList(): BrickBreakerAvatarDataWithScore[] {
    return this.$$store.state.BrickBreakerModule.playerScoreList;
  }

  /** 開啟Dialog */
  onOpenDialog() {
    if (this.playerScoreList.length > 0) {
      this.showPlayerDetail(this.playerScoreList[0], 0);
    }
  }

  /** 關掉dialog */
  onCloseDialog() {
    this.$$store.commit('setShowBrickBreakerScoreBoard', false);
  }

  /** 玩家使用英雄的頭像
   *  @param heroId 英雄編號
   */
  private getHeroImgUrl(heroId: number): string {
    return HeroManager.getHeroImgUrlByHeroId(heroId, HeroImgType.Head);
  }

  /** 更改要查看的玩家得分資訊
   * @param player 參賽玩家分數資料
   * @param index 觀看玩家順序
   */
  private showPlayerDetail(player: BrickBreakerAvatarDataWithScore, index: number): void {
    this.clickIndex = index;
    this.detailPlayerScore.splice(0);
    this.detailPlayerScore.push(
      ...[
        // 對魔王造成傷害量
        player.bossDamage,
        // 成功對魔王7連擊次數
        player.bossHitSuccessCount,
        // 答對的題目次數
        player.correctCount,
        // 使用號角解凍同伴次數
        player.hornCount,
        // 成功閃避魔王攻擊次數
        player.defenseCount,
        // 成功打開寶箱次數
        player.answerTreasureCount,
        // 獲得寶物次數
        player.treasureCount,
        // 敲磚塊次數
        player.brickBreakCount,
      ]
    );
    this.playertest = player;
  }

  /** 排名列表更新同步刷新查看玩家詳細分數資料 */
  @Watch('playerScoreList')
  private refreshDetailPlayerScore(): void {
    const index = this.playerScoreList.findIndex((player) => player.uid === this.playertest.uid);
    if (index > -1) {
      const player = this.playerScoreList[index];
      this.showPlayerDetail(player, index);
    }
  }
}
</script>

<style scoped>
::v-deep .el-dialog {
  max-width: 900px;
  width: 95%;
  background: #000000cc;
  border-radius: 30px;
}
::v-deep .el-dialog__header {
  padding: 30px 0px 0px 0px;
}
::v-deep .el-dialog__body {
  padding: 20px 20px 20px 20px;
}
::v-deep .el-icon-close:before {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
}
.scrollbar::-webkit-scrollbar {
  padding: 0px 0px 20px 0px;
  width: 10px;
  border: 1px solid #fdc221;
  border-radius: 30px;
  background: #fff;
}
.scrollbar::-webkit-scrollbar-track {
  border-radius: 30px;
}
.scrollbar::-webkit-scrollbar-thumb {
  background-color: #fdc221;
  border-radius: 30px;
}
</style>
