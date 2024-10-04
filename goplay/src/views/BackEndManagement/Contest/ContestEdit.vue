<template>
  <div>
    <div class="tab-content">
      <!-- 頁籤 -->
      <div class="flex justify-center items-center mt-2" text="30px [#D69F05]">
        {{ textData.ContestEditText }}
        <div
          v-for="(tabData, index) in contestTabList"
          :key="index"
          :bg="activeTab === tabData.teamType ? '[#FFC43A]' : '[#FFEBB5]'"
          class="w-72 h-14 rounded-t-xl transform -skew-x-12 transition-all cursor-pointer"
          m="x-2"
          @click="onClickTab(tabData.teamType)"
        >
          <!-- 魔王賽類型名稱 -->
          <span
            class="h-full flex items-center justify-center transform skew-x-12 text-3xl <sm:text-xl transition-all"
            :text="activeTab === tabData.teamType ? '[#FFF]' : '[#D69F05]'"
          >
            {{ tabData.title }}
          </span>
        </div>
        <button m="l-10px" p="10px" rounded="20px" bg="pink-500" text="[#FFFFFF]" @click="onManageRoom(0)">
          {{ textData.myCreatedRoom }}
        </button>
      </div>
      <!-- 我創的房間列表 -->
      <div v-if="isRoomListDialog">
        <RoomListDialog
          v-model="isRoomListDialog"
          :roomList="roomList"
          :roomListSize="roomListSize"
          :roomPerPage="roomPerPage"
          @onSwitchRoomPage="onSwitchRoomPage"
        />
      </div>
      <!-- 篩選遊戲類型 -->
      <div class="flex justify-center" m="t-1">
        <GameFilter
          :selectGameType="currentGameType"
          :selectContestType="activeTab"
          :isShowAll="false"
          @onSelectGameType="onSelectGameType"
        />
      </div>
      <!-- 賽事卡片 -->
      <GameCardList
        :contestDataList="contestListData"
        :isAddCard="isAddCard"
        :cardType="cardType"
        @onClickEdit="onClickEdit"
        @onAddContest="onAddContest"
        @onCreateRoom="onCreateRoom"
        @onManageRoom="onManageRoom"
        @onSwitchPublic="onSwitchPublic"
      />
      <!-- 分頁-->
      <div class="page-box block flex-pos">
        <el-pagination
          layout="prev, pager, next"
          :total="contestListSize"
          :page-size="contestPerPage"
          :hide-on-single-page="true"
          :current-page="currentPageIndex + 1"
          @current-change="onSwitchContestPage"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GameFilter from '@/components/WorldContest/GameFilter.vue';
import GameCardList from '@/components/WorldContest/GameCardList.vue';
import { contestEditAPI, contestEditListAPI, contestRoomBossReferListAPI, contestRoomEditListAPI } from '@/api/contest';
import { Load, Message } from '@/helper/class/Common';
import {
  HeroJ7GameType,
  GameType,
  ResponseState,
  TeamType,
  UserRole,
  ContestSortType,
  ContestSortOrder,
  ContestCardType,
  RoomFinishState,
  RoomSortType,
} from '@/helper/enum/Common';
import {
  ContestEditOptions,
  ContestListData,
  RoomListData,
  RoomContestOptions,
  RoomListOptions,
} from '../../../helper/interface/Contest';
import RoomListDialog from '@/components/BackEndManagement/Contest/RoomListDialog.vue';
import { handleAPIError } from '@/helper/fnc/common';
import { MenuName } from '@/helper/enum/MenuName';

/** 頁籤類型資訊 */
interface ContestTabData {
  /** 頁籤標題 */
  title: string;
  /** 頁籤篩選類型 */
  teamType: TeamType;
  /** 有權限看見的帳號身分 */
  userRole: UserRole[];
}

@Component({
  components: {
    GameCardList,
    GameFilter,
    RoomListDialog,
  },
})
export default class ContestEdit extends Vue {
  /** 賽事清單資料 */
  private contestListData: ContestListData[] = [];
  /** 每頁顯示賽事數量上限 */
  private readonly contestPerPage: number = 12;
  /** 賽事總量 */
  private contestListSize: number = 0;
  /** 當前頁數 */
  private currentPageIndex: number = 0;

  /** 房間列表資料 */
  private roomList: RoomListData[] = [];
  /** 每頁顯示房間數量上限 */
  private readonly roomPerPage: number = 10;
  /** 房間總量 */
  private roomListSize: number = 0;
  /** 篩選的賽事id */
  private contestId: number = 0;

  /** 當前使用者選到的遊戲類型 */
  private currentGameType: HeroJ7GameType = HeroJ7GameType.BrickBreaker;
  /** 帳號身分 */
  private userRole: UserRole = UserRole.TCH;
  /** 當前點擊頁籤 */
  private activeTab: TeamType = TeamType.Room;
  /** 創建房間列表彈窗開關 */
  private isRoomListDialog: boolean = false;

  /** 頁籤類別資料 */
  private readonly contestTab: ContestTabData[] = [
    {
      // 一般魔王賽
      title: '一般魔王賽',
      teamType: TeamType.WorldBoss,
      userRole: [UserRole.SUP],
    },
    // 新魔王賽
    {
      title: '新魔王賽',
      teamType: TeamType.Room,
      userRole: [UserRole.SUP, UserRole.TCH],
    },
  ];

  /** 文字資料 */
  private textData = {
    ContestEditText: '賽事編輯',
    myCreatedRoom: '我創的賽局列表',
  };

  /** 篩選要顯示的頁籤 */
  private get contestTabList(): ContestTabData[] {
    return this.contestTab.filter((contestTabItem) => {
      return contestTabItem.userRole.includes(this.userRole);
    });
  }

  /** 判斷是否出現新增賽事按鈕 */
  private get isAddCard(): boolean {
    // 帳號身分是否符合
    if (this.userRole !== UserRole.SUP) {
      return false;
    }

    // 是否在第一頁
    return this.currentPageIndex === 0;
  }

  /** 取得卡片類型 */
  private get cardType(): ContestCardType {
    if (this.activeTab === TeamType.Room) {
      if (this.userRole === UserRole.TCH) {
        return ContestCardType.BackEndRoomContestTCH;
      }
      if (this.userRole === UserRole.SUP) {
        return ContestCardType.BackEndRoomContestSUP;
      }
    }
    return ContestCardType.BackEndWorldBoss;
  }

  /** 清單賽事種類 */
  private get listTeamType(): TeamType[] {
    return this.activeTab === TeamType.WorldBoss
      ? [TeamType.WorldBoss, TeamType.AdlWorldBoss]
      : [TeamType.Room, TeamType.FreeRoom];
  }

  created() {
    // 取得帳號身分
    this.userRole = this.$$store.getters.userRole;
    // 取得賽事清單
    this.getContestData();
  }

  /** 取得賽事清單 */
  private getContestData(): void {
    // 取得房間列表清單
    if (this.userRole === UserRole.TCH && this.activeTab === TeamType.Room) {
      this.getRoomReferList();
      return;
    }

    // 取得賽事清單
    this.getContestList();
  }

  /** 取得賽事列表 */
  private async getContestList(): Promise<void> {
    // 設定搜尋參數設定
    const options: ContestEditOptions = {
      // 賽事額外選項
      extraOptions: {
        numberOfPlayer: true,
      },
      // 賽事搜尋過濾選項
      filterOptions: {
        teamType: this.listTeamType,
        gameType: this.currentGameType === HeroJ7GameType.Total ? [] : [this.currentGameType],
        subjectType: [],
        state: [],
        gradeFilter: [],
        onlyHaveScore: false,
        gameStartDayId: 0,
        gameEndDayId: 0,
      },
      // 賽事頁數選項
      pageOptions: {
        page: this.currentPageIndex,
        pageSize: this.contestPerPage,
      },
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 取得編輯賽事列表
      const response: any = await contestEditListAPI.post(options);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      // 儲存賽事列表
      this.contestListData = response.contestList as ContestListData[];
      // 儲存賽事總數
      this.contestListSize = response.totalSize as number;
      // 關閉讀取中
      Load.use(false);
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取中
      Load.use(false);
    }
  }

  /** 取得房間模板列表 */
  private async getRoomReferList(): Promise<void> {
    const options: RoomContestOptions = {
      // 賽事頁數選項
      pageOptions: {
        page: this.currentPageIndex,
        pageSize: this.contestPerPage,
      },
      // 賽事排序選項
      sortOptions: {
        keywordType: ContestSortType.GameStart,
        sortType: ContestSortOrder.Descending,
      },
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 取得編輯賽事列表
      const response: any = await contestRoomBossReferListAPI.post(options);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      // 儲存賽事列表
      this.contestListData = response.contestList as ContestListData[];
      // 儲存賽事總數
      this.contestListSize = response.totalSize as number;
      // 關閉讀取中
      Load.use(false);
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取中
      Load.use(false);
    }
  }

  /** 取得我的房間列表
   *  @param page
   */
  private async getCreatedRoomList(page: number): Promise<void> {
    const options: RoomListOptions = {
      // 房間過濾選項
      filterOptions: {
        // 賽事id(0表示不指定)
        contestId: this.contestId,
        // 是否結算
        isFinish: RoomFinishState.Unset,
      },
      // 賽事頁數選項
      pageOptions: {
        page,
        pageSize: this.roomPerPage,
      },
      // 賽事排序選項
      sortOptions: {
        keywordType: RoomSortType.ContestRoomId,
        sortType: ContestSortOrder.Descending,
      },
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 取得我創的房間列表
      const response: any = await contestRoomEditListAPI.post(options);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      // 儲存我創的房間列表
      this.roomList = response.contestRoomList as RoomListData[];
      this.roomListSize = response.totalSize as number;
      // 關閉讀取中
      Load.use(false);
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取中
      Load.use(false);
    }
  }

  /** 點擊賽事編輯
   * @param contestId
   */
  private onClickEdit(contestId: number): void {
    this.$router.push({
      path: `${this.$route.fullPath}/${MenuName.ContestEdit}/${contestId}`,
    });
  }

  /** 點擊新增賽事 */
  private onAddContest(): void {
    this.$router.push({
      path: `${this.$route.fullPath}/${MenuName.ContestAdd}/${this.activeTab}`,
    });
  }

  /** 點擊創建房間
   *  @param contestId
   */
  private onCreateRoom(contestId: number): void {
    this.$router.push({
      path: `${this.$route.fullPath}/${MenuName.RoomCreate}/${contestId}/-1`,
    });
  }

  /** 點擊管理房間
   *  @param contestId
   */
  private onManageRoom(contestId: number): void {
    this.contestId = contestId;
    this.getCreatedRoomList(0);
    this.isRoomListDialog = true;
  }

  /** 切換公開隱藏按鈕 */
  private async onSwitchPublic(contestId: number): Promise<void> {
    // 取得賽事資料
    const contestData: any = await contestEditAPI.fetch({ contestId: contestId });
    // 更新賽事資料，contestData.contest.public 是 0 或 1，1 - contestData.contest.public 是 revert 的意思
    await contestEditAPI.put({ id: contestId, public: 1 - contestData.contest.public });
    // 刷新頁面
    this.getContestData();
  }

  /** 彈窗換頁
   *  @param pageIndex
   */
  private onSwitchRoomPage(pageIndex: number) {
    this.getCreatedRoomList(pageIndex - 1);
  }

  /** 換頁
   * @param pageIndex
   */
  private onSwitchContestPage(pageIndex: number): void {
    this.currentPageIndex = pageIndex - 1;
    this.getContestList();
  }

  /** 點擊篩選遊戲類型
   * @param gameType
   */
  private onSelectGameType(gameType: HeroJ7GameType): void {
    // 設定當前遊戲類型
    this.currentGameType = gameType;

    // 返回第一頁
    this.currentPageIndex = 0;

    // 取得賽事列表
    this.getContestData();
  }

  /** 點擊切換頁籤
   * @param tabType
   */
  private onClickTab(tabType: TeamType): void {
    this.activeTab = tabType;
    if (tabType === TeamType.WorldBoss) {
      this.onSelectGameType(HeroJ7GameType.Total);
    }
    if (tabType === TeamType.Room) {
      this.onSelectGameType(HeroJ7GameType.BrickBreaker);
    }
  }
}
</script>
<style lang="scss" scoped></style>
