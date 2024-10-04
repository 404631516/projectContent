<template>
  <div class="create-wrapper">
    <!-- 返回按鈕 -->
    <div class="top-area top-sm-1">
      <el-button @click="onBack">
        <i class="el-icon-arrow-left"></i>
        {{ textData.onBackTitle }}
      </el-button>
    </div>
    <!-- 賽事編輯 -->
    <div class="content-area">
      <!-- 標題 -->
      <h2 class="title-area">{{ contestFormTitleName }}</h2>
      <!-- 新增/編輯賽事 -->
      <div>
        <ContestForm
          v-if="isShowContestForm"
          :contestListData="contestListData"
          :contestQuizBaseInfoList="contestQuizBaseInfoList"
          :courseDataList="courseDataList"
          :contestBossData="contestBossData"
          :isRoomContest="isRoomContest"
          @onCancel="onBack"
          @onUploadContest="onUploadContest"
          @onUpdateContest="onUpdateContest"
          @onReleaseContestRank="onReleaseContestRank"
          @onDeleteContest="onDeleteContest"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ContestForm from '@/components/BackEndManagement/Contest/ContestForm.vue';
import { QuickLink } from '@/helper/enum/QuickLink';
import {
  contestEditAPI,
  releaseTestingContestAPI,
  contestEventGameLinkIdAPI,
  releaseContestRankAPI,
  contestQuizBaseEditorAPI,
} from '@/api/contest';
import {
  ResponseState,
  TeamType,
  DBBoolean,
  RankRewardState,
  RankRuleType,
  ContestStateType,
  QuizSource,
} from '@/helper/enum/Common';
import { Message } from '@/helper/class/Common';
import { MenuName } from '@/helper/enum/MenuName';
import { ContestPKQuizBaseInfo, ContestUploadData } from '@/helper/interface/BackEndManagement';
import { ContestListData, QuizSetData } from '@/helper/interface/Contest';
import { BossData, BossDetail } from '@/helper/interface/Boss';
import { handleAPIError } from '@/helper/fnc/common';
import { CourseDetail } from '@/helper/interface/CourseMenu';

@Component({
  components: {
    ContestForm,
  },
})
export default class Index extends Vue {
  /** 編輯中賽事資料 */
  private contestListData!: ContestListData;

  /** 編輯中題庫資料 */
  private contestQuizBaseInfoList!: ContestPKQuizBaseInfo[];

  /** 編輯中因材網單元資料 */
  private courseDataList: CourseDetail[] = [];

  /** 編輯中魔王資料 */
  private contestBossData!: BossData;

  /** 編輯標題 */
  private contestFormTitleName: string = '';

  /** 是否為房間賽 */
  private isRoomContest: boolean = false;

  /** 顯示編輯 */
  private isShowContestForm: boolean = false;

  /** 文字資料 */
  private textData = {
    onBackTitle: '返回',
  };

  /** 新賽事預設賽事種類 */
  private get defaultTeamType(): TeamType {
    return this.isRoomContest ? TeamType.Room : TeamType.WorldBoss;
  }

  async mounted() {
    switch (this.$route.name) {
      // 新增賽事
      case `${MenuName.ContestAdd}`:
        this.contestFormTitleName = '新增賽事';
        this.isRoomContest = Number(this.$route.params.tabType) === TeamType.Room;
        this.onCreateContest();
        break;
      // 編輯賽事
      case `${MenuName.ContestEdit}`:
        this.contestFormTitleName = '編輯賽事';
        try {
          await this.onEditContest();
        } catch (e) {
          Message.warn(`${e}`);
        }
        switch (this.contestListData.teamType) {
          case TeamType.WorldBoss:
          case TeamType.AdlWorldBoss:
            this.isRoomContest = false;
            break;
          case TeamType.Room:
          case TeamType.FreeRoom:
            this.isRoomContest = true;
            break;
          default:
            this.isRoomContest = false;
            break;
        }
        break;
      // 未知路徑
      default:
        this.contestFormTitleName = `未知路徑: ${this.$route.name}`;
        break;
    }

    // 顯示編輯
    this.isShowContestForm = true;
  }

  /** 創建新賽事 */
  private onCreateContest(): void {
    this.contestListData = {
      appDownloadLink: '',
      centerLocation: '',
      createAt: '',
      delete: DBBoolean.False,
      g0: DBBoolean.True,
      g1: DBBoolean.True,
      g2: DBBoolean.True,
      g3: DBBoolean.True,
      g4: DBBoolean.True,
      g5: DBBoolean.True,
      g6: DBBoolean.True,
      g7: DBBoolean.True,
      g8: DBBoolean.True,
      g9: DBBoolean.True,
      g10: DBBoolean.True,
      g11: DBBoolean.True,
      g12: DBBoolean.True,
      gameDetail: {
        quizNumber: 7, // 目前固定7題
        quizRoundNum: 1,
        limitRound: -1,
        dailyLimitRound: -1,
        mapId: -1,
        roomBossId: -1,
      },
      gameEnd: '',
      gameReward: [],
      gameStart: '',
      gameType: -1,
      gradeDescription: '',
      id: -1,
      ignoreTeacherScore: DBBoolean.True,
      imageMap: {
        listCard: -1,
        infoBanner: '',
      },
      images: [],
      info: '',
      isTesting: DBBoolean.True,
      numberOfPlayer: 0,
      onlySearch: 0,
      otherLimit: {
        schoolCountyIds: null,
        gamePeriod: null,
        roles: null,
      },
      ownerId: -1,
      public: DBBoolean.True,
      rankReward: [],
      rankRewardState: RankRewardState.Unset,
      rankRule: RankRuleType.AdlEdu,
      referDetail: null,
      registrationEnd: '',
      registrationStart: '',
      release: DBBoolean.False,
      state: ContestStateType.ComingSoon,
      subjectType: 1,
      tags: '',
      teamDetail: {
        roomOption: {
          password: '',
          maxPlayers: 30,
          roomCount: 1,
          roundTime: 30,
        },
      },
      teamType: this.defaultTeamType,
      title: '',
      updatedAt: '',
    };
    this.contestQuizBaseInfoList = [];
    this.contestBossData = {
      bossDetail: [],
      contestId: this.contestListData.id,
      createdAt: '',
      cumulateDamage: 0,
      deadRecord: [],
      totalHp: 0,
      updateAt: '',
    };
  }

  /** 編輯舊賽事 */
  private async onEditContest(): Promise<void> {
    // 取得賽事資訊&魔王資訊
    const contestId = await this.getContestInfo();
    if (contestId < 0) {
      throw Error('取得賽事失敗');
    }

    // 取得題庫資訊
    switch (this.contestListData.teamType) {
      case TeamType.WorldBoss:
        await this.getContestPKQuizBase(contestId);
        break;
      case TeamType.AdlWorldBoss:
        await this.getContestEventGameLinkId(contestId);
        break;
      case TeamType.Room:
        await this.getContestPKQuizBase(contestId);
        // 題庫為因材網時取得單元資料
        if (this.contestQuizBaseInfoList[0].sourceType === QuizSource.AdlEdu) {
          const quizSetIds = this.contestQuizBaseInfoList.map(
            (contestQuizBaseInfo: ContestPKQuizBaseInfo) => contestQuizBaseInfo.quizSetId
          );
          this.courseDataList = await this.$$store.dispatch('getCourseInfo', quizSetIds);
          if (this.courseDataList.length === 0) {
            Message.error(`取得課程資料失敗，課程id=${quizSetIds}`);
          }
        }
        break;
      case TeamType.FreeRoom:
        // 房間模板題庫資料填空資料
        this.contestQuizBaseInfoList = [];
        break;
      default:
        console.error(`找不到賽事類型，賽事類型=${this.contestListData.teamType}`);
    }
  }

  /** 取得賽事資訊 */
  private async getContestInfo(): Promise<number> {
    // 組成封包
    const data = {
      contestId: this.$route.params.id,
    };

    // API 取得賽事編輯資料
    try {
      const response: any = await contestEditAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      // 設定賽事
      this.contestListData = response.contest;
      this.contestListData.gameDetail = JSON.parse(response.contest.gameDetail);
      this.contestListData.gameReward = JSON.parse(response.contest.gameReward);
      this.contestListData.imageMap = JSON.parse(response.contest.imageMap);
      this.contestListData.otherLimit = JSON.parse(response.contest.otherLimit);
      this.contestListData.rankReward = JSON.parse(response.contest.rankReward);
      this.contestListData.referDetail = JSON.parse(response.contest.referDetail);
      this.contestListData.teamDetail = JSON.parse(response.contest.teamDetail);

      // 設定魔王
      this.contestBossData = response.bossData;
      if (response.bossData !== null) {
        this.contestBossData.bossDetail = JSON.parse(response.bossData.bossDetail);
      }

      // // 設定魔王
      // if (response.bossData !== null) {
      //   this.contestBossData = response.bossData;
      //   this.contestBossData.bossDetail = JSON.parse(response.bossData.bossDetail);
      // } else {
      //   this.contestBossData = {
      //     bossDetail: [],
      //     contestId: this.contestListData.id,
      //     createdAt: '',
      //     cumulateDamage: 0,
      //     deadRecord: [],
      //     totalHp: 0,
      //     updateAt: '',
      //   };
      // }

      return this.contestListData.id;
    } catch (e) {
      Message.error(`${e}`);
      return -1;
    }
  }

  /** 取得賽事題庫
   * @param contestId
   */
  private async getContestPKQuizBase(contestId: number): Promise<void> {
    // 組成封包
    const data = {
      contestId,
    };

    // API 取得題庫資料
    try {
      const response: any = await contestQuizBaseEditorAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        throw Error(`賽事${contestId} 取得題庫失敗`);
      }
      this.contestQuizBaseInfoList = response.resList;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 取得因材網題庫
   * @param contestId
   */
  private async getContestEventGameLinkId(contestId: number): Promise<void> {
    // 組成封包
    const data = {
      contestId,
    };

    // API 取得題庫資料
    try {
      const response: any = await contestEventGameLinkIdAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        throw Error(`賽事${contestId} 取得因材網題庫失敗`);
      }
      this.contestQuizBaseInfoList = [
        {
          contestId,
          createAt: '',
          id: -1,
          level: 0,
          quizName: response.eventGameLinkId,
          quizSetId: response.eventGameLinkId,
          sourceType: -1,
        },
      ];
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 完成並測試發佈
   * @param newContestForm
   * @param newQuizSetData
   * @param bossData
   */
  private async onUploadContest(
    newContestForm: ContestListData,
    newQuizSetData: QuizSetData[],
    bossData: BossData
  ): Promise<void> {
    let newContestId = -1;
    let resultMsg = '';

    try {
      // 新增賽事
      if (newContestForm.id < 0) {
        newContestId = await this.addNewContest(newContestForm, bossData.bossDetail);
        resultMsg = '新建賽事成功';
      }
      // 測試轉正
      else {
        // 更新當前賽事設定
        await this.updateContest(newContestForm, bossData);
        // 測試賽轉正
        newContestId = await this.releaseTestingContest(newContestForm.id);
        resultMsg = '轉正賽事成功';
      }
      // 鏈結賽事與題庫
      await this.addQuizBase(newContestId, newContestForm.teamType, newQuizSetData);
    } catch (e) {
      Message.warn(`${e}`);
      return;
    }

    // 提示成功
    Message.success(resultMsg);
    // 返回清單
    this.onBack();
  }

  /** 更新賽事
   * @param newContestForm
   * @param bossData
   */
  private async onUpdateContest(newContestForm: ContestListData, bossData: BossData): Promise<void> {
    try {
      // 更新賽事
      await this.updateContest(newContestForm, bossData);
    } catch (e) {
      Message.warn(`${e}`);
      return;
    }

    // 提示成功
    Message.success(`更新賽事成功`);
    // 返回清單
    this.onBack();
  }

  /** 發布排行獎勵 */
  private async onReleaseContestRank(): Promise<void> {
    try {
      // API 發佈排行獎勵
      const response: any = await releaseContestRankAPI.put(this.contestListData.id);
      if (response.result !== ResponseState.Success) {
        throw Error(response.result);
      }
    } catch (e) {
      Message.warn(`${e}`);
      return;
    }

    // 提示成功
    Message.success('發佈排行獎勵成功');
    // 返回清單
    this.onBack();
  }

  /** 刪除賽事 */
  private async onDeleteContest(): Promise<void> {
    // 詢問是否要儲存
    this.$confirm('確定刪除賽事嗎？', '訊息', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      // 確認關閉
      .then(async () => {
        // 組成封包
        const data = {
          contestId: this.contestListData.id,
        };

        try {
          // API 刪除賽事
          const response: any = await contestEditAPI.remove(data);
          if (response.result !== ResponseState.Success) {
            throw Error(response.result);
          }
        } catch (e) {
          Message.warn(`${e}`);
          return;
        }

        // 提示成功
        Message.success('刪除賽事成功');
        // 返回清單
        this.onBack();
      });
  }

  /** 上傳創建新賽事
   * @param contestForm
   * @param bossDetail
   */
  private async addNewContest(contestForm: ContestListData, bossDetail: BossDetail[]): Promise<number> {
    // 組成上傳封包
    const data = this.toContestUploadData(contestForm, bossDetail);

    // API 上傳新增賽事
    const response: any = await contestEditAPI.post(data);
    if (response.result !== ResponseState.Success) {
      throw Error(response.result);
    }

    return response.contestId;
  }

  /** 鏈結賽事與題庫
   * @param contestId
   * @param quizSetData
   */
  private async addQuizBase(contestId: number, teamType: TeamType, newQuizSetData: QuizSetData[]): Promise<void> {
    // 根據不同賽事類型鏈結題庫
    switch (teamType) {
      // 一般魔王賽
      case TeamType.WorldBoss:
        await this.addContestPKQuizBase(contestId, newQuizSetData);
        break;
      // 因材魔王賽
      case TeamType.AdlWorldBoss:
        await this.addCombineContestGameLink(contestId, newQuizSetData);
        break;
      // 房間賽
      case TeamType.Room:
        await this.addContestPKQuizBase(contestId, newQuizSetData);
        break;
      case TeamType.FreeRoom:
        break;
      // 未知錯誤
      default:
        Message.error(`未知賽事類型 ${teamType}`);
        break;
    }
  }

  /** 上傳學創題庫or因材網學習點
   * @param contestId
   * @param newQuizSetData
   */
  private async addContestPKQuizBase(newContestId: number, newQuizSetData: QuizSetData[]): Promise<void> {
    // 組成封包
    const data = {
      contestId: newContestId,
      quizBaseArray: newQuizSetData.map((quizSetData: QuizSetData, index: number) => {
        return {
          sourceType: quizSetData.sourceType,
          quizSetId: quizSetData.quizSetId,
          level: index,
        };
      }),
    };

    // API 上傳學創題庫
    const response: any = await contestQuizBaseEditorAPI.post(data);
    if (response.result !== ResponseState.Success) {
      throw Error(response.result);
    }
  }

  /** 上傳因材網題庫
   * @param contestId
   * @param newQuizSetData
   */
  private async addCombineContestGameLink(newContestId: number, newQuizSetData: QuizSetData[]): Promise<void> {
    // 組成封包
    const data = {
      contestId: newContestId,
      eventGameLinkId: newQuizSetData[0].quizSetId,
    };

    // API 上傳因材網題庫
    const response: any = await contestEventGameLinkIdAPI.post(data);
    if (response.result !== ResponseState.Success) {
      throw Error(response.result);
    }
  }

  /** 更新賽事設定
   * @param newContestForm
   * @param bossData
   */
  private async updateContest(contestForm: ContestListData, bossData: BossData): Promise<void> {
    // 組成上傳封包
    const data = {
      id: contestForm.id,
      title: contestForm.title,
      info: contestForm.info,
      images: contestForm.images,
      imageMap: contestForm.imageMap,
      tags: contestForm.tags,
      centerLocation: contestForm.centerLocation,
      referDetail: contestForm.referDetail,
      registrationStart: contestForm.registrationStart,
      registrationEnd: contestForm.registrationEnd,
      gameStart: contestForm.gameStart,
      gameEnd: contestForm.gameEnd,
      teamDetail: contestForm.teamDetail,
      gameDetail: contestForm.gameDetail,
      ignoreTeacherScore: contestForm.ignoreTeacherScore,
      public: contestForm.public,
      gameReward: contestForm.gameReward,
      appDownloadLink: contestForm.appDownloadLink,
      gradeDescription: contestForm.gradeDescription,
      rankReward: contestForm.rankReward,
      g0: contestForm.g0,
      g1: contestForm.g1,
      g2: contestForm.g2,
      g3: contestForm.g3,
      g4: contestForm.g4,
      g5: contestForm.g5,
      g6: contestForm.g6,
      g7: contestForm.g7,
      g8: contestForm.g8,
      g9: contestForm.g9,
      g10: contestForm.g10,
      g11: contestForm.g11,
      g12: contestForm.g12,
      otherLimit: contestForm.otherLimit,
      bossDetail: bossData?.bossDetail ?? [],
    };

    // API 更新賽事
    const response: any = await contestEditAPI.put(data);
    if (response.result !== ResponseState.Success) {
      throw Error(response.result);
    }
  }

  /** 測事賽事轉正
   * @param contestId
   */
  private async releaseTestingContest(contestId: number): Promise<number> {
    // API 測事賽事轉正
    const response: any = await releaseTestingContestAPI.put(contestId);
    if (response.result !== ResponseState.Success) {
      throw Error(response.result);
    }

    return response.contestId;
  }

  /** 轉換成上傳賽事格式
   * @param newContestForm
   * @param bossDetail
   */
  private toContestUploadData(contestForm: ContestListData, bossDetail: BossDetail[]): ContestUploadData {
    // 根據賽事型式回傳上傳格式
    switch (contestForm.teamType) {
      // 魔王賽
      case TeamType.WorldBoss:
      case TeamType.AdlWorldBoss:
        return {
          teamType: contestForm.teamType,
          gameType: contestForm.gameType,
          subjectType: contestForm.subjectType,
          title: contestForm.title,
          info: contestForm.info,
          images: contestForm.images,
          imageMap: contestForm.imageMap,
          tags: contestForm.tags,
          centerLocation: contestForm.centerLocation,
          referDetail: contestForm.referDetail,
          registrationStart: contestForm.registrationStart,
          registrationEnd: contestForm.registrationEnd,
          gameStart: contestForm.gameStart,
          gameEnd: contestForm.gameEnd,
          teamDetail: contestForm.teamDetail,
          gameDetail: contestForm.gameDetail,
          ignoreTeacherScore: contestForm.ignoreTeacherScore,
          public: contestForm.public,
          gameReward: contestForm.gameReward,
          appDownloadLink: contestForm.appDownloadLink,
          gradeDescription: contestForm.gradeDescription,
          rankRule: contestForm.rankRule,
          rankReward: contestForm.rankReward,
          g0: contestForm.g0,
          g1: contestForm.g1,
          g2: contestForm.g2,
          g3: contestForm.g3,
          g4: contestForm.g4,
          g5: contestForm.g5,
          g6: contestForm.g6,
          g7: contestForm.g7,
          g8: contestForm.g8,
          g9: contestForm.g9,
          g10: contestForm.g10,
          g11: contestForm.g11,
          g12: contestForm.g12,
          isTesting: contestForm.isTesting,
          otherLimit: contestForm.otherLimit,
          bossDetail,
        };
      // 房間賽
      case TeamType.Room:
      case TeamType.FreeRoom:
        return {
          teamType: contestForm.teamType,
          gameType: contestForm.gameType,
          subjectType: contestForm.subjectType,
          title: contestForm.title,
          info: contestForm.info,
          images: contestForm.images,
          imageMap: contestForm.imageMap,
          tags: contestForm.tags,
          centerLocation: contestForm.centerLocation,
          referDetail: contestForm.referDetail,
          registrationStart: contestForm.registrationStart,
          registrationEnd: contestForm.registrationEnd,
          gameStart: contestForm.gameStart,
          gameEnd: contestForm.gameEnd,
          teamDetail: contestForm.teamDetail,
          gameDetail: contestForm.gameDetail,
          ignoreTeacherScore: contestForm.ignoreTeacherScore,
          public: contestForm.public,
          gameReward: contestForm.gameReward,
          appDownloadLink: contestForm.appDownloadLink,
          gradeDescription: contestForm.gradeDescription,
          rankRule: contestForm.rankRule,
          rankReward: contestForm.rankReward,
          g0: contestForm.g0,
          g1: contestForm.g1,
          g2: contestForm.g2,
          g3: contestForm.g3,
          g4: contestForm.g4,
          g5: contestForm.g5,
          g6: contestForm.g6,
          g7: contestForm.g7,
          g8: contestForm.g8,
          g9: contestForm.g9,
          g10: contestForm.g10,
          g11: contestForm.g11,
          g12: contestForm.g12,
          isTesting: contestForm.isTesting,
          otherLimit: contestForm.otherLimit,
          bossDetail: [], // 預設
        };
      default:
        console.error(`toContestUploadData unknown teamType=${contestForm.teamType}`);
    }

    return {} as ContestUploadData;
  }

  /** 返回 */
  private onBack(): void {
    this.$router.go(-1);
  }
}
</script>
<style lang="scss" scoped>
.create-wrapper {
  .top-area {
    background-color: #555;
    text-align: left;
    line-height: 80px;
    padding: 0 18vw;
    color: #fff;
    font-size: 24px;
  }
  h2 {
    font-size: 42px;
    color: #fff;
    text-align: left;
    margin: 2vw 0;
    color: #ebca28;
  }
  .content-area {
    margin: 1vw 18vw;
    min-height: 600px;
    // background-color: #555;
    // border-radius: 30px;
  }
}
</style>
