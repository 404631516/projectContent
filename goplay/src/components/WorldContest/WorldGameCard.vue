<template>
  <div class="world-game-card" v-if="hideContestType !== gameTagData.gameType">
    <!-- 賽事卡片 -->
    <div class="world-game-banner" :style="`backgroundImage: url(${bannerImgUrl})`">
      <!-- 遊戲類別Tag -->
      <div class="game-title" font="bold" :style="`backgroundColor: ${gameTagData.tagColor}`">
        <img :src="imgData.signIcon" />
        <span>{{ gameTagData.tagName }}</span>
      </div>
      <!-- 賽事獎勵 -->
      <div class="reward" v-if="isRelease && rankRewardData.htmlClass" :class="rankRewardData.htmlClass">
        <img :src="imgData.rewardIcon" />
        <span>{{ rankRewardData.stateName }}</span>
      </div>
      <!-- 賽事限區 -->
      <div v-if="isSchoolCountyLimit" class="game-limit flex-pos">
        <img m="r-2" class="h-full object-contain" :src="imgData.noticeIcon" />
        {{ textData.schoolCountyLimit }}
      </div>
      <!-- 賽事狀態 -->
      <div
        class="game-state flex-pos"
        :style="{
          backgroundColor: contestStateData.stateColor,
          color: contestStateData.stateTextColor,
        }"
      >
        {{ contestStateData.stateName }}
      </div>
    </div>
    <!-- 已參與人數 -->
    <div class="participate-count">
      {{ textData.participateCount }}
      <span>{{ participateNumber }}</span>
    </div>
    <!-- 房間模板標籤-->
    <div v-if="contestListData.teamType === TeamType.FreeRoom" p="1" bg="[#3DB5CE]" text="[#FFF]">
      {{ textData.freeRoom }}
    </div>
    <!-- 官方房間賽標籤-->
    <div
      v-if="contestListData.teamType === TeamType.Room && cardType === ContestCardType.BackEndRoomContestSUP"
      p="1"
      bg="pink-500"
      text="[#FFF]"
    >
      {{ textData.Room }}
    </div>
    <!-- 賽事標題 -->
    <div class="h-9" m=" y-2 x-4">
      <p class="title" text="[#ffde39]">{{ contestListData.title }}</p>
    </div>
    <!-- 賽事說明 -->
    <div class="box">
      <p class="card-description">{{ contestListData.info }}</p>
    </div>
    <!-- 下方按鈕 -->
    <!-- 前台魔王挑戰按鈕-->
    <div v-if="cardType === ContestCardType.WorldContest">
      <el-button class="btn-info-view" @click="onClickView">
        <span class="flex-pos">{{ textData.viewContest }}</span>
      </el-button>
    </div>
    <div v-if="cardType === ContestCardType.BackEndTaskCondition">
      <el-button class="btn-info-view" @click="onClickTaskAdd">
        <span class="flex-pos">{{ textData.taskAdd }}</span>
      </el-button>
    </div>
    <!-- 後台一般魔王賽按鈕-->
    <div v-if="cardType === ContestCardType.BackEndWorldBoss || cardType === ContestCardType.BackEndRoomContestSUP">
      <el-button class="btn-info-view" @click="onClickEdit">
        <span class="flex-pos">{{ textData.editContest }}</span>
      </el-button>
    </div>
    <!-- 後台新魔王賽創建房間-->
    <div v-if="cardType === ContestCardType.BackEndRoomContestTCH">
      <el-button
        :class="contestListData.state !== ContestStateType.GameOver ? 'btn-info-view' : 'btn-disabled'"
        @click="contestListData.state !== ContestStateType.GameOver && onCreateRoom()"
      >
        <span class="flex-pos">{{ textData.createRoom }}</span>
      </el-button>
    </div>
    <!-- 後台新魔王賽管理房間-->
    <div
      v-if="cardType === ContestCardType.BackEndRoomContestTCH || cardType === ContestCardType.BackEndRoomContestSUP"
    >
      <el-button
        :class="contestListData.state !== ContestStateType.GameOver ? 'btn-info-view' : 'btn-disabled'"
        @click="contestListData.state !== ContestStateType.GameOver && onManageRoom()"
      >
        <span class="flex-pos">{{ textData.manageRoom }}</span>
      </el-button>
    </div>
    <!-- 切換公開隱藏按鈕 -->
    <div
      v-if="
        isSuper && (cardType === ContestCardType.BackEndWorldBoss || cardType === ContestCardType.BackEndRoomContestSUP)
      "
    >
      <el-button
        :class="contestListData.public === DBBoolean.True ? 'btn-info-view' : 'btn-disabled'"
        @click="onSwitchPublic()"
      >
        <span class="flex-pos">{{
          contestListData.public === DBBoolean.True ? textData.hideContest : textData.showContest
        }}</span>
      </el-button>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import {
  ContestStateType,
  ContestStateColor,
  ContestStateName,
  RankRewardState,
  ContestStateTextColor,
  ContestCardType,
  TeamType,
  DBBoolean,
  UserRole,
} from '@/helper/enum/Common';
import ImgPath from '@/config/imgPath/imgPath';
import { ContestListData, ContestImageMap, OtherLimitData } from '../../helper/interface/Contest';
import GameTypeHelper from '../../views/H5/Helper/GameTypeHelper';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';

/** 遊戲Tag資料 */
export interface GameTagData {
  /** 遊戲名稱 */
  tagName: string;
  /** Tag顏色 */
  tagColor: string;
  /** 遊戲類型 */
  gameType: number;
}

/** 賽事獎勵狀態資料 */
export interface RewardStateData {
  /** 顯示類別 */
  htmlClass: string;
  /** 獎勵狀態名稱 */
  stateName: string;
}

/** 賽事狀態資料 */
export interface ContestStateData {
  /** 賽事狀態名稱 */
  stateName: string;
  /** 賽事狀態顏色 */
  stateColor: string;
  /** 賽事狀態文字顏色 */
  stateTextColor: string;
}

@Component({})
export default class WorldGameCard extends Vue {
  /** 賽事資訊 */
  @Prop() private contestListData!: ContestListData;
  /** 賽事卡片種類 */
  @Prop() private cardType!: ContestCardType;
  /** 不想顯示的賽事類型 */
  @Prop() private hideContestType!: number;

  /** 圖片資料 */
  private imgData = {
    signIcon: ImgPath.signIconBaseUrl,
    rewardIcon: ImgPath.rewardIconBaseUrl,
    noticeIcon: ImgPath.noticeUrl,
  };

  /** 文字資料 */
  private textData = {
    participateCount: '已參與人數',
    Room: '官方賽局',
    freeRoom: '賽局模板',
    editContest: '編輯賽事資訊',
    viewContest: '查看',
    createRoom: '創立賽局',
    manageRoom: '管理賽局',
    schoolCountyLimit: '限制縣市遊玩',
    taskAdd: '新增任務',
    showContest: '公開',
    hideContest: '隱藏',
  };

  private TeamType = TeamType;
  private ContestStateType = ContestStateType;
  private ContestCardType = ContestCardType;
  private DBBoolean = DBBoolean;

  /** 取得賽事底板圖片 */
  private get bannerImgUrl(): string {
    // 預設魔王ID
    let bossId: number = -1;

    // 取得魔王ID
    if (this.contestListData.imageMap != null) {
      const imageMap: ContestImageMap = JSON.parse(this.contestListData.imageMap.toString());
      bossId = imageMap.listCard ?? bossId;
    }

    // 魔王防呆
    if (bossId < 0) {
      Helper.assert(ErrorId.VariableUndefined, `contest: ${this.contestListData.id} have invalid listCardId ${bossId}`);
    }

    return require(`@/assets/images/contest/bossCard_${bossId}.png`);
  }

  /** 遊戲Tag資料 */
  private get gameTagData(): GameTagData {
    const gameTypeData = GameTypeHelper.getGameTypeData(this.contestListData.gameType);
    if (gameTypeData === undefined) {
      return {
        tagName: '錯誤類別',
        tagColor: '錯誤類別',
        gameType: -1,
      };
    } else {
      return {
        tagName: gameTypeData.displayName,
        tagColor: gameTypeData.tagColor,
        gameType: gameTypeData.gameType,
      };
    }
  }

  /** 參與人數 */
  private get participateNumber(): number {
    return this.contestListData.numberOfPlayer ?? 0;
  }

  /** 賽事獎勵是否發放 */
  private get isRelease(): boolean {
    return this.contestListData.release === 1;
  }

  /** 是否有限制縣市遊玩 */
  private get isSchoolCountyLimit(): boolean {
    // 檢查其他限制
    const limitData: OtherLimitData = JSON.parse(this.contestListData.otherLimit.toString());

    // 沒有限制
    if (limitData == null) {
      return false;
    }

    // 沒有校區限制
    if (limitData.schoolCountyIds == null) {
      return false;
    }

    // 檢查是否有校區限制
    return limitData.schoolCountyIds.length > 0;
  }

  /** 賽事獎勵狀態資料 */
  private get rankRewardData(): RewardStateData {
    switch (this.contestListData.rankRewardState) {
      // 可領獎
      case RankRewardState.AbleGet:
        return {
          htmlClass: 'light',
          stateName: '可領取獎勵',
        };
      // 已領獎
      case RankRewardState.AlreadyGet:
        return {
          htmlClass: 'deep',
          stateName: '已領取獎勵',
        };
      case RankRewardState.UnableGet:
      case RankRewardState.Unset:
      case RankRewardState.UnReleased:
      case RankRewardState.NoScoreData:
      default:
        return {
          htmlClass: '',
          stateName: '',
        };
    }
  }

  /** 賽事狀態資料 */
  private get contestStateData(): ContestStateData {
    const state = ContestStateType[this.contestListData.state];
    const stateKey = state as keyof typeof ContestStateName;
    return {
      stateName: ContestStateName[stateKey],
      stateColor: ContestStateColor[stateKey],
      stateTextColor: ContestStateTextColor[stateKey],
    };
  }

  /** 是否為管理者 */
  private get isSuper(): boolean {
    return this.$$store.getters.userRole === UserRole.SUP;
  }

  /** 新增任務按鈕 */
  @Emit('onClickTaskAdd')
  private onClickTaskAdd(): void {
    return;
  }

  /** 查看按鈕 */
  @Emit('onClickView')
  private onClickView(): void {
    return;
  }

  /** 編輯賽事資訊按鈕 */
  @Emit('onClickEdit')
  private onClickEdit(): void {
    return;
  }

  /** 創建房間按鈕 */
  @Emit('onCreateRoom')
  private onCreateRoom(): void {
    return;
  }

  /** 管理房間按鈕 */
  @Emit('onManageRoom')
  private onManageRoom(): void {
    return;
  }

  /** 切換公開隱藏按鈕 */
  @Emit('onSwitchPublic')
  private onSwitchPublic(): void {
    return;
  }
}
</script>
<style lang="scss">
.world-game-card {
  width: 235px;
  border-radius: 15px;
  background: #ffffff;
  box-shadow: 0px 0px 10px #0000004d;
  margin: 10px;
  padding-bottom: 15px;
  .reward {
    &.deep {
      background-color: #12561e;
    }
    &.light {
      background-color: #18cb18;
    }
  }
  @media (max-width: 435px) {
    margin: 10px 5px;
    width: 200px;
  }
  .world-game-banner {
    height: 140px;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
    .reward {
      width: 130px;
      height: 30px;
      position: absolute;
      border-radius: 15px;
      right: 2px;
      top: 2px;
      z-index: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 20px;
        height: 20px;
        object-fit: contain;
      }
      span {
        font-size: 18px;
        color: #fff;
        font-weight: 500;
        margin-left: 2px;
      }
    }
    .game-title {
      width: 150px;
      height: 35px;
      position: absolute;
      top: 18px;
      clip-path: polygon(0% 0%, 100% 0, 85% 100%, 0% 100%);
      display: flex;
      align-items: center;
      justify-content: left;
      padding-left: 15px;
      img {
        width: 10px;
        height: 30px;
        object-fit: contain;
        margin-right: 10px;
      }
      span {
        font-size: 16px;
        color: #fff;
      }
    }
    .game-limit {
      height: 30px;
      width: 100%;
      position: absolute;
      bottom: 30px;
      color: #fff;
      background: rgb(197, 26, 26, 0.8);
      font-weight: 900;
    }
    .game-state {
      height: 30px;
      width: 100%;
      position: absolute;
      bottom: 0;
      color: #000;
      font-weight: 900;
      opacity: 0.9;
    }
  }
  .participate-count {
    height: 30px;
    background: #353739;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    span {
      width: 60px;
      color: #fdc221;
    }
  }
  .title {
    color: #d69f05;
    text-align: left;
    line-height: 1.2;
    overflow: hidden;
    font-size: 18px;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
  }

  .box {
    height: 5.5rem;
  }
  .card-description {
    color: #737373;
    text-align: left;
    margin: 0px 15px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    white-space: normal;
  }
  .btn-info-view {
    margin-bottom: 4px;
  }
  .btn-disabled {
    width: 80%;
    height: 30px;
    border: none;
    border-radius: 20px;
    margin-bottom: 4px;
    background-color: #575e64;
    span {
      color: #fff;
    }
  }
}
</style>
