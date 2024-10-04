<template>
  <div class="create-wrapper">
    <!-- 返回按鈕 -->
    <div class="top-area top-sm-1">
      <el-button v-if="isRoomCreated === false" @click="onBack">
        <i class="el-icon-arrow-left"></i>
        {{ textData.onBackTitle }}
      </el-button>
    </div>
    <!-- 創建/修改完成 -->
    <div v-if="isRoomCreated" p="t-10">
      <RoomCreated :isEdit="isEdit" :contestRoomId="contestRoomId" :roomPassword="roomPassword" @onBack="onBack" />
    </div>
    <!-- 新增/編輯房間 -->
    <div p="t-10 l-10" v-else>
      <RoomForm
        v-if="isShowRoomForm"
        :isEdit="isEdit"
        :editRoomDataNet="editRoomDataNet"
        :quizSetDataList="quizSetDataList"
        :courseDataList="courseDataList"
        @onCreateRoom="onCreateRoom"
        @onFinishEdit="onFinishEdit"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { contestRoomEditAPI, customContestRoomEditAPI } from '@/api/contest';
import RoomCreated from '@/components/BackEndManagement/Contest/RoomCreated.vue';
import RoomForm from '@/components/BackEndManagement/Contest/RoomForm.vue';
import { Load, Message } from '@/helper/class/Common';
import { QuizSource, ResponseState } from '@/helper/enum/Common';
import { MenuWord } from '@/helper/enum/MenuName';
import { handleAPIError } from '@/helper/fnc/common';
import { QuizSetData, RoomData, RoomDataNet } from '@/helper/interface/Contest';
import { CourseDetail } from '@/helper/interface/CourseMenu';

@Component({
  components: {
    RoomForm,
    RoomCreated,
  },
})
export default class Index extends Vue {
  /** 賽事模板id */
  private contestId: number = 0;
  /** 房間編號 */
  private contestRoomId: number = 0;
  /** 房間密碼 */
  private roomPassword: string = '';
  /** 是否完成創建房間 */
  private isRoomCreated: boolean = false;
  /** 是否為編輯房間 */
  private isEdit: boolean = false;
  /** 編輯房間資料 */
  private editRoomDataNet!: RoomDataNet;
  /** 編輯中題庫資料 */
  private quizSetDataList: QuizSetData[] = [];
  /** 編輯中因材網單元資料 */
  private courseDataList: CourseDetail[] = [];
  /** 顯示房間表格 */
  private isShowRoomForm: boolean = false;

  /** 文字資料 */
  private textData = {
    onBackTitle: '返回',
  };

  async created() {
    // 儲存賽事Id
    this.contestId = Number(this.$route.params.id);
    switch (this.$route.meta!.name) {
      // 創建房間
      case MenuWord.RoomCreate:
        // 再創一局
        if (this.$route.params.roomId !== '-1') {
          await this.getRoomData();
          this.editRoomDataNet.roomData.gameId = -1;
        }
        // 創新房間
        else {
          this.onCreateNewRoom();
        }
        this.isShowRoomForm = true;
        break;
      // 修改
      case MenuWord.RoomEdit:
        await this.getRoomData();
        this.isEdit = true;
        this.isShowRoomForm = true;
        break;
      default:
        Message.error(`未知router名稱，名稱=${this.$route.name}`);
        break;
    }
  }

  /** 創建新房間初始化 */
  private onCreateNewRoom(): void {
    this.editRoomDataNet = {
      roomData: {
        gameId: -1,
        roomName: '',
        startAt: '',
        roundTime: 5,
        info: '',
        maxPlayers: 0,
        roomPassword: '',
      },
      sourceType: QuizSource.AdlEdu,
      quizSetIds: [],
      quizSetNames: [],
    };
    this.quizSetDataList = [
      {
        quizSetName: '',
        quizSetId: '-1',
        sourceType: QuizSource.AdlEdu,
      },
    ];
  }

  private async getRoomData(): Promise<void> {
    // 取得房間ID
    this.contestRoomId = Number(this.$route.params.roomId);

    // 取得房間資料
    const editRoomData = await this.getEditRoomData(this.contestRoomId);
    if (editRoomData === undefined) {
      Message.error(`取得賽局資料失敗，賽局編號=${this.contestRoomId}`);
      return;
    }
    this.editRoomDataNet = editRoomData;
    for (let index = 0; index < editRoomData.quizSetIds.length; index++) {
      const quizSetData = {
        quizSetName: editRoomData.quizSetNames[index],
        quizSetId: editRoomData.quizSetIds[index],
        sourceType: editRoomData.sourceType,
      };
      this.quizSetDataList.push(quizSetData);
    }

    // 題庫為因材網時取得單元資料
    if (this.quizSetDataList[0].sourceType === QuizSource.AdlEdu) {
      this.courseDataList = await this.$$store.dispatch('getCourseInfo', this.editRoomDataNet.quizSetIds);
      if (this.courseDataList.length === 0) {
        Message.error(`取得課程資料失敗，課程id=${this.editRoomDataNet.quizSetIds}`);
      }
    }
  }

  /** 取得房間編輯需要資訊
   *  @param contestRoomId
   */
  private async getEditRoomData(contestRoomId: number): Promise<RoomDataNet | undefined> {
    // 組成封包
    const data = {
      contestRoomId,
    };

    try {
      // API 取得房間編輯資料
      const response: any = await contestRoomEditAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      const useQuiz = JSON.parse(response.contestRoom.useQuiz);
      const roomDataNet: RoomDataNet = {
        roomData: response.contestRoom as RoomData,
        sourceType: useQuiz.sourceType,
        quizSetIds: useQuiz.quizSetIds,
        quizSetNames: response.contestRoom.quizNames,
      };
      return roomDataNet;
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 點擊創建房間
   *  @param roomForm
   *  @param quizDataList
   */
  private async onCreateRoom(roomForm: RoomData, quizDataList: QuizSetData[]): Promise<void> {
    this.isRoomCreated = await this.createContestRoom(roomForm, quizDataList);
  }

  /** 點擊修改完成
   *  @param roomForm
   *  @param quizDataList
   */
  private async onFinishEdit(roomForm: RoomData, quizDataList: QuizSetData[]): Promise<void> {
    this.isRoomCreated = await this.editContestRoom(roomForm, quizDataList);
  }

  /** 創建房間
   * @param roomForm
   * @param quizDataList
   */
  private async createContestRoom(roomForm: RoomData, quizDataList: QuizSetData[]): Promise<boolean> {
    // 組成封包
    const data = {
      contestId: this.contestId,
      roomName: roomForm.roomName,
      roomPassword: roomForm.roomPassword,
      info: roomForm.info,
      useQuiz: {
        sourceType: quizDataList[0].sourceType,
        quizSetIds: quizDataList.map((quizSetData: QuizSetData) => quizSetData.quizSetId),
      },
      maxPlayers: roomForm.maxPlayers,
      startAt: roomForm.startAt,
      roundTime: roomForm.roundTime,
    };

    // 開啟讀取中
    Load.use(true);

    try {
      // API 創建房間
      const response: any = await customContestRoomEditAPI.post(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }
      this.contestRoomId = response.contestRoom.contestRoomId;
      this.roomPassword = response.contestRoom.roomPassword;
      // 關閉讀取中
      Load.use(false);
      return true;
    } catch (e) {
      Message.error(`${e}`);
      // 關閉讀取中
      Load.use(false);
      return false;
    }
  }

  /** 送出房間編輯資訊
   *  @param roomForm
   *  @param quizDataList
   */
  private async editContestRoom(roomForm: RoomData, quizDataList: QuizSetData[]): Promise<boolean> {
    // 組成封包
    const data = {
      contestRoomId: this.contestRoomId,
      updateValue: {
        roomName: roomForm.roomName,
        roomPassword: roomForm.roomPassword,
        info: roomForm.info,
        useQuiz: {
          sourceType: quizDataList[0].sourceType,
          quizSetIds: quizDataList.map((quizSetData: QuizSetData) => quizSetData.quizSetId),
        },
        maxPlayers: roomForm.maxPlayers,
        startAt: roomForm.startAt,
        roundTime: roomForm.roundTime,
      },
    };

    try {
      // API 修改房間設定
      const response: any = await contestRoomEditAPI.put(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      // 存密碼並跳轉至修改成功
      this.roomPassword = roomForm.roomPassword;
      return true;
    } catch (e) {
      const err = e as Error;
      this.$alert(`${err.message}`, '編輯錯誤').then(() => this.onBack());
      return false;
    }
  }

  /** 返回 */
  private onBack(): void {
    this.$router.go(-1);
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-button {
  font-size: 18px;
}
.create-wrapper {
  .top-area {
    background-color: #555;
    text-align: left;
    line-height: 80px;
    padding: 0 18vw;
    color: #fff;
    font-size: 24px;
  }
}
</style>
