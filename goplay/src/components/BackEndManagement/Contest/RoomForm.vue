<template>
  <div class="overflow-auto" p="x-[10%]">
    <div class="flex items-center mb-2" text="36px [#FDC221]">
      {{ textData.createRoom }}
    </div>
    <div p="x-[5%]" text="[#000000]">
      <el-form ref="rForm" class="px-20px" :rules="roomFormRules" :model="roomForm" label-width="140px">
        <!-- 房間名稱 -->
        <el-form-item prop="roomName" :label="textData.roomName">
          <el-input v-model="roomForm.roomName"></el-input>
        </el-form-item>
        <!-- 日期 -->
        <div class="flex">
          <el-form-item prop="startAt" :label="textData.startTime">
            <el-date-picker
              v-model="roomForm.startAt"
              popper-class="roomform-start-at"
              format="yyyy/MM/dd HH:mm"
              type="datetime"
              :placeholder="textData.selectDate"
              :picker-options="pickerOptions"
              :disabled="hasRoomStart"
            >
            </el-date-picker>
          </el-form-item>
          <!-- 單場時間 -->
          <el-form-item prop="roundTime" class="roundTime" :label="textData.roundTime">
            <el-select v-model="roomForm.roundTime" :placeholder="textData.pleaseSelect">
              <el-option
                v-for="(roundTime, index) in roundTimeOptions"
                :key="index"
                :label="getRoundTimeText(roundTime)"
                :value="roundTime"
                :disabled="hasRoomStart"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </div>
        <!-- 內容敘述 -->
        <el-form-item prop="info" :label="textData.info">
          <el-input type="textarea" maxlength="100" v-model="roomForm.info"></el-input>
        </el-form-item>
        <!-- 題庫來源 -->
        <el-form-item :label="textData.quizTypeTitle" v-if="isEdit && userRole === UserRole.SUP">
          <el-col :span="10">
            <SelectList
              :selectItemList="quizOptions"
              :selectedItem="quizSource"
              :placeholder="textData.quizSourcePlaceHolder"
              :isLock="false"
              @onSelect="onSelectQuizSource"
            />
          </el-col>
        </el-form-item>
        <!-- 賽局單元 -->
        <el-form-item class="subject flex items-center" :label="textData.subject">
          <!-- 選擇科目按鈕 -->
          <button
            v-if="quizSource === QuizSource.AdlEdu"
            class="shadow-default yellowGradient"
            m="l-15px"
            p="x-10 y-10px"
            border="rounded-60px"
            text="[#FFFFFF] 20px"
            @click.prevent="isShowCourseSet = true"
          >
            {{ textData.pickSubject }}
          </button>
          <template v-else>
            <el-button type="info" :disabled="hasRoomStart" @click="isShowQuizSet = true">
              {{ textData.selectQuizSetTitle }}
            </el-button>
            <span m="l-5" p="2" text="20px">{{ quizDataList[0].quizSetName }}</span>
          </template>
        </el-form-item>
        <!-- 已選擇單元 -->
        <CourseList
          v-if="selectedCourseDataList.length > 0"
          :selectedCourseDataList="selectedCourseDataList"
          :isShowDelete="false"
          class="w-1024px ml-35"
        />
        <!-- 單局參賽人數 -->
        <div class="flex">
          <el-form-item prop="maxPlayers" class="maxPlayers" :label="textData.maxPlayers">
            <el-input v-model.number="roomForm.maxPlayers" type="Number"></el-input>
            <p text="[#606266]">{{ textData.playerLimit }}</p>
          </el-form-item>
          <el-form-item class="password" prop="checkPassword">
            <!-- 設定密碼選取框 -->
            <el-checkbox
              v-model="isSetPassword"
              class="ml-5"
              :label="textData.setPassword"
              @change="onSetEmptyPassword"
            >
            </el-checkbox>
          </el-form-item>
          <!-- 密碼輸入框 -->
          <el-form-item v-if="isSetPassword" class="password" prop="roomPassword">
            <el-input
              v-model="roomForm.roomPassword"
              class="ml-5"
              :disabled="!isSetPassword"
              :placeholder="textData.inputPassword"
              show-password
            ></el-input>
          </el-form-item>
        </div>
      </el-form>
      <!-- 下方按鈕-->
      <div class="flex justify-around" m="b-10" text="28px [#FFFFFF]">
        <button v-if="isEdit" p="x-2 y-2" bg="pink-400" border="rounded-50px" @click="onClickFinishEdit">
          {{ textData.finishEdit }}
        </button>
        <button v-else class="blueGradient" p="x-2 y-2" border="rounded-50px" @click="onClickCreateRoom">
          {{ textData.confirmCreate }}
        </button>
      </div>
    </div>
    <div v-if="isShowCourseSet">
      <CourseSet
        v-model="isShowCourseSet"
        :initialCourseDataList="selectedCourseDataList"
        @onConfirmSelectCourse="confirmSelectCourse"
      />
    </div>
    <!--  題庫彈窗 -->
    <template v-if="isShowQuizSet">
      <QuizSet :quizSetData="quizDataList[0]" @onConfirm="onSelectQuizSet" @onCancel="isShowQuizSet = false" />
    </template>
  </div>
</template>
<script lang="ts">
import DatePicker from '@/components/BackEndManagement/_FormProp/DatePicker.vue';
import { Message } from '@/helper/class/Common';
import { QuizSource, UserRole } from '@/helper/enum/Common';
import { SelectOption } from '@/helper/interface/BackEndManagement';
import { QuizSetData, RoomData, RoomDataNet } from '@/helper/interface/Contest';
import { CourseDetail } from '@/helper/interface/CourseMenu';
import dayjs from 'dayjs';
import { Component, Vue, Emit, Ref, Prop } from 'vue-property-decorator';
import CheckboxGroup from '../_FormProp/CheckboxGroup.vue';
import CourseList from '../_FormProp/CourseList.vue';
import CourseSet from '../_FormProp/CourseSet.vue';
import QuizSet from '../_FormProp/QuizSet.vue';
import SelectList from '../_FormProp/SelectList.vue';
import { toDayjs } from '../../../manager/TimeSyncManager';

/** 表單插件 */
export type RForm = Vue & {
  validate: () => boolean;
  resetValidation: () => boolean;
  reset: () => void;
};

@Component({
  components: {
    DatePicker,
    CourseSet,
    CourseList,
    CheckboxGroup,
    SelectList,
    QuizSet,
  },
})
export default class RoomForm extends Vue {
  /** 賽事編輯表單 */
  @Ref('rForm') private readonly rForm!: RForm;
  /** 是否為編輯 */
  @Prop(Boolean) private isEdit!: boolean;
  /** 編輯中房間資料 */
  @Prop() private editRoomDataNet!: RoomDataNet;
  /** 題庫資料 */
  @Prop() private quizSetDataList!: QuizSetData[];
  /** 因材網單元資料 */
  @Prop() private courseDataList!: CourseDetail[];

  /** 編輯中房間資料 */
  private roomForm: RoomData = {} as RoomData;
  /** 題庫來源 */
  private quizSource: QuizSource = QuizSource.None;
  /** 編輯中題庫資料  */
  private quizDataList!: QuizSetData[];
  /** 編輯中因材網單元資料 */
  private selectedCourseDataList: CourseDetail[] = [];
  /** 學創題庫選擇彈窗開關 */
  private isShowQuizSet: boolean = false;
  /** 因材網單元選擇彈窗開關 */
  private isShowCourseSet: boolean = false;
  /** 有無設置密碼 */
  private isSetPassword: boolean = false;

  /** 遊戲時長選項  */
  private readonly roundTimeOptions: number[] = [5, 10, 15, 20, 25, 30, 35, 40, 45];
  /** 最小參賽人數 */
  private readonly maxPlayersMin: number = 2;
  /** 最大參賽人數 */
  private readonly maxPlayersMax: number = 30;

  private UserRole = UserRole;

  private QuizSource = QuizSource;

  /** 文字資料 */
  private textData = {
    return: '返回上一頁',
    createRoom: '創立賽局編輯',
    roomName: '名稱',
    startTime: '開始時間',
    selectDate: '選擇日期',
    roundTime: '單場時間',
    pleaseSelect: '請選擇',
    info: '內容敘述',
    quizTypeTitle: '題庫來源',
    quizSourcePlaceHolder: '請選擇題庫來源',
    subject: '賽局單元',
    selectQuizSetTitle: '選擇題庫',
    pickSubject: '選擇單元',
    maxPlayers: '參賽人數',
    playerLimit: '人數下限2人，上限30人',
    setPassword: '設定賽局密碼',
    inputPassword: '請輸入密碼',
    copyRoom: '複製賽局',
    finishEdit: '修改完成',
    confirmCreate: '確定創立',
  };

  /** 表單欄位驗證規則 */
  private roomFormRules = {
    // 房間名稱
    roomName: [{ required: true, message: '請輸入賽局名稱', trigger: 'blur' }],
    // 開始時間
    startAt: [{ required: true, message: '請選擇開始日期&時間', trigger: 'change' }],
    // 單場時間
    roundTime: [{ required: true, message: '請選擇遊戲時長', trigger: 'change' }],
    // 參加人數
    maxPlayers: [
      {
        required: true,
        type: 'number',
        message: `請輸入${this.maxPlayersMin}-${this.maxPlayersMax}的整數`,
        min: this.maxPlayersMin,
        max: this.maxPlayersMax,
        trigger: 'blur',
        transform: Number,
      },
    ],
  };

  /** 取得編輯者身分 */
  private get userRole(): UserRole {
    return this.$$store.getters.userRole;
  }

  /** 遊戲是否已開始 */
  private get hasRoomStart(): boolean {
    return this.roomForm.gameId !== -1;
  }

  /** 日期時間選擇限制 */
  private pickerOptions = {
    selectableRange: '07:00:00-22:00:00',
    disabledDate: (time: Date) => {
      const currentTime = dayjs().subtract(1, 'day');
      return dayjs(time.getTime()) < currentTime;
    },
  };

  /** 取得遊戲時間文字 */
  private getRoundTimeText(roundTime: number): string {
    return `${roundTime}分鐘`;
  }

  /** 題庫來源類型 */
  private readonly quizOptions: SelectOption[] = [
    { label: '學創', value: QuizSource.Enableets },
    { label: '因材網', value: QuizSource.AdlEdu },
  ];

  created() {
    // 讀取修改資料
    this.roomForm = JSON.parse(JSON.stringify(this.editRoomDataNet.roomData));
    this.quizDataList = this.quizSetDataList;
    // 讀取題庫來源
    this.quizSource = this.quizDataList[0].sourceType;
    // 密碼不為空自動勾選選取框
    this.isSetPassword = this.roomForm.roomPassword !== '';
    // 讀取因材網單元資料
    this.selectedCourseDataList = this.courseDataList;
  }

  /** 清空題庫資料 */
  private clearQuizData(): void {
    const emptyQuizSetData = {
      sourceType: this.quizSource,
      quizSetId: '-1',
      quizSetName: '',
    };
    this.quizSetDataList.splice(0, this.quizSetDataList.length, emptyQuizSetData);
    this.selectedCourseDataList = [];
  }

  /** 選擇題庫來源
   * @param newQuizSource
   */
  private onSelectQuizSource(newQuizSource: QuizSource) {
    if (this.quizSource === newQuizSource) {
      return;
    }

    // 切換題庫來源
    this.quizSource = newQuizSource;
    // 清空題庫資料
    this.clearQuizData();
  }

  /** 選擇題庫
   * @param newQuizSetData
   */
  private onSelectQuizSet(newQuizSetData: QuizSetData): void {
    this.quizDataList.splice(0, 1, newQuizSetData);
    this.isShowQuizSet = false;
  }

  /** 確認選擇單元
   *  @param selectedCourseDataList
   */
  private confirmSelectCourse(selectedCourseDataList: CourseDetail[]): void {
    this.selectedCourseDataList = selectedCourseDataList;
    this.isShowCourseSet = false;

    // 未選擇單元填空資料
    if (selectedCourseDataList.length === 0) {
      this.clearQuizData();
      return;
    }

    this.quizDataList = selectedCourseDataList.map((courseData: CourseDetail) => {
      return {
        sourceType: this.quizSource,
        quizSetId: courseData.course.game_link_id,
        quizSetName: courseData.course.unit_name,
      };
    });
  }

  /** 檢查房間編輯填寫正確 */
  private async isContestFormInvalid(): Promise<boolean> {
    // 填表防呆
    try {
      await this.rForm.validate();
    } catch (e) {
      return true;
    }
    // 未選擇單元防呆
    if (this.quizDataList[0].quizSetId === '-1') {
      Message.warn('尚未選擇任何單元');
      return true;
    }

    // 有玩家加入後無法減少遊玩人數
    if (this.hasRoomStart) {
      console.log(this.roomForm.maxPlayers, this.editRoomDataNet.roomData.maxPlayers);
      if (this.roomForm.maxPlayers < this.editRoomDataNet.roomData.maxPlayers) {
        Message.warn('已有玩家加入，無法減少遊玩人數');
        return true;
      }
    }
    // 開始時間防呆
    else {
      if (toDayjs(this.roomForm.startAt).add(this.roomForm.roundTime, 'minute').isBefore(dayjs())) {
        Message.warn('時間設定錯誤');
        return true;
      }
    }

    return false;
  }

  /** 未勾選設定密碼時設定密碼為空 */
  private onSetEmptyPassword(): void {
    if (this.isSetPassword === false) {
      this.roomForm.roomPassword = '';
    }
  }

  /** 點擊修改完成按鈕 */
  private async onClickFinishEdit(): Promise<void> {
    if (await this.isContestFormInvalid()) {
      return;
    }
    this.onFinishEdit(this.roomForm, this.quizDataList);
  }

  /** 點擊創建按鈕 */
  private async onClickCreateRoom(): Promise<void> {
    if (await this.isContestFormInvalid()) {
      return;
    }
    this.onCreateRoom(this.roomForm, this.quizDataList);
  }

  /** 創建房間
   *  @param roomForm
   *  @param selectedCourseDataList
   */
  @Emit('onCreateRoom')
  private onCreateRoom(roomForm: RoomData, quizDataList: QuizSetData[]): void {
    return;
  }

  /** 修改完成
   *  @param roomForm
   *  @param selectedCourseDataList
   */
  @Emit('onFinishEdit')
  private onFinishEdit(roomForm: RoomData, quizDataList: QuizSetData[]): void {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-form .el-form-item__label {
  font-size: 24px;
}
::v-deep .el-form .subject .el-form-item__content {
  margin-left: 5px !important;
}
::v-deep .el-form .password .el-form-item__content {
  margin-left: 0px !important;
}
::v-deep .el-checkbox__label {
  font-size: 24px;
}
::v-deep .el-form .el-form-item__content .el-button::before {
  padding-bottom: 12px;
}
.btn-game-again {
  font-size: 20px;
}
</style>
<style>
.roomform-start-at .el-picker-panel__link-btn {
  display: none;
}
.roomform-start-at .el-picker-panel__link-btn.is-plain {
  display: inline-block;
}
</style>
