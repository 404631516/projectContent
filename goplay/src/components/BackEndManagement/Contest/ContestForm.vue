<template>
  <div class="overflow-auto" text="24px left [#666666]">
    <!-- 標題 -->
    <h3>{{ textData.contestContentTitle }}</h3>
    <!-- 賽事表單 -->
    <el-form
      ref="vForm"
      class="px-[20px]"
      :rules="formRules"
      :model="contestForm"
      :disabled="isRelease"
      label-width="100px"
    >
      <!-- 賽事名稱 -->
      <el-form-item prop="title" :label="textData.contestNameTitle">
        <el-input v-model="contestForm.title"></el-input>
      </el-form-item>
      <!-- 開放縣市 -->
      <el-form-item class="grade-box" :label="textData.countyTitle">
        <!-- 北部 -->
        <div class="flex">
          <span>{{ textData.northCountyTitle }}</span>
          <CheckboxGroup
            :checkOptionList="getCountyOptions(countyData.north)"
            :checkedList="checkedCounty"
            @onCheckUpdate="onCheckCounty"
          />
        </div>
        <!-- 中部 -->
        <div class="flex">
          <span>{{ textData.middleCountyTitle }}</span>
          <CheckboxGroup
            :checkOptionList="getCountyOptions(countyData.middle)"
            :checkedList="checkedCounty"
            @onCheckUpdate="onCheckCounty"
          />
        </div>
        <!-- 南部 -->
        <div class="flex">
          <span>{{ textData.southCountyTitle }}</span>
          <CheckboxGroup
            :checkOptionList="getCountyOptions(countyData.south)"
            :checkedList="checkedCounty"
            @onCheckUpdate="onCheckCounty"
          />
        </div>
        <!-- 東部 -->
        <div class="flex">
          <span>{{ textData.eastCountyTitle }}</span>
          <CheckboxGroup
            :checkOptionList="getCountyOptions(countyData.east)"
            :checkedList="checkedCounty"
            @onCheckUpdate="onCheckCounty"
          />
        </div>
      </el-form-item>
      <!-- 開放年級 -->
      <el-form-item class="grade-box" :label="textData.gradeTitle">
        <!-- 無年級 -->
        <div class="flex">
          <span>{{ textData.noSchoolTitle }}</span>
          <el-checkbox v-model="g0" :true-label="1" :false-label="0" @change="contestForm.g0 = g0">
            {{ textData.confirmTitle }}
          </el-checkbox>
        </div>
        <!-- 小學 -->
        <div class="flex">
          <span>{{ textData.primarySchoolTitle }}</span>
          <CheckboxGroup
            :checkOptionList="getGradeOptions(gradeData.primarySchool)"
            :checkedList="checkedGrade"
            @onCheckUpdate="onCheckGrade"
          />
        </div>
        <!-- 中學 -->
        <div class="flex">
          <span>{{ textData.middleSchoolTitle }}</span>
          <CheckboxGroup
            :checkOptionList="getGradeOptions(gradeData.middleSchool)"
            :checkedList="checkedGrade"
            @onCheckUpdate="onCheckGrade"
          />
        </div>
        <!-- 高中 -->
        <div class="flex">
          <span>{{ textData.highSchoolTitle }}</span>
          <CheckboxGroup
            :checkOptionList="getGradeOptions(gradeData.highSchool)"
            :checkedList="checkedGrade"
            @onCheckUpdate="onCheckGrade"
          />
        </div>
        <!-- 年級描述 -->
        <div class="flex">
          <span>{{ textData.gradeDescriptionTitle }}</span>
          <el-input type="textarea" v-model="contestForm.gradeDescription"></el-input>
        </div>
      </el-form-item>
      <!-- 開放身分 -->
      <el-form-item class="grade-box" :label="textData.rolesTitle">
        <div class="flex">
          <CheckboxGroup :checkOptionList="roleOptions" :checkedList="checkedRole" @onCheckUpdate="onCheckRole" />
        </div>
      </el-form-item>
      <!-- 賽事類型 -->
      <el-form-item prop="teamType" :label="textData.teamTypeTitle">
        <el-col :span="10">
          <SelectList
            :selectItemList="teamTypeOptions"
            :selectedItem="contestForm.teamType"
            :placeholder="textData.teamTypePlaceHolder"
            :isLock="isEdit"
            @onSelect="onPickTeamType"
          />
        </el-col>
      </el-form-item>
      <!-- 答題模式 -->
      <el-form-item prop="gameType" :label="textData.gameTypeTitle">
        <el-col :span="10">
          <SelectList
            :selectItemList="gameTypeOptions"
            :selectedItem="contestForm.gameType"
            :placeholder="textData.gameTypePlaceHolder"
            :isLock="isEdit"
            @onSelect="contestForm.gameType = $event"
          />
        </el-col>
      </el-form-item>
      <!-- 房間賽週期 -->
      <div v-if="contestForm.teamType === TeamType.Room">
        <el-form-item :label="textData.roomCycleTitle">
          <el-radio-group v-model="roomCycle" @change="onPickRoomCycle" :disabled="isEdit">
            <el-radio :label="RoomCycleType.Single">{{ toRoomCycleName(RoomCycleType.Single) }}</el-radio>
            <el-radio :label="RoomCycleType.Cycle">{{ toRoomCycleName(RoomCycleType.Cycle) }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 房間賽事開始時間 -->
        <el-form-item v-if="roomCycle === RoomCycleType.Single" :label="textData.startTime">
          <el-date-picker
            v-model="contestForm.gameStart"
            value-format="yyyy/MM/dd HH:mm"
            format="yyyy/MM/dd HH:mm"
            type="datetime"
            :placeholder="textData.selectDateTime"
            :picker-options="pickerOptions"
            @change="setGameEnd"
          />
        </el-form-item>
      </div>
      <!-- 賽事時間 -->
      <el-form-item
        v-if="contestForm.teamType !== TeamType.Room || roomCycle === RoomCycleType.Cycle"
        :label="textData.contestDateTitle"
      >
        <DatePicker :startDate="contestForm.gameStart" :endDate="contestForm.gameEnd" @onPick="onPickContestDate" />
      </el-form-item>
      <!-- 題庫來源 -->
      <el-form-item :label="textData.quizTypeTitle" v-if="contestForm.teamType === TeamType.Room">
        <el-col :span="10">
          <SelectList
            :selectItemList="quizOptions"
            :selectedItem="quizSource"
            :placeholder="textData.quizSourcePlaceHolder"
            :isLock="isEdit"
            @onSelect="onSelectQuizSource"
          />
        </el-col>
      </el-form-item>
      <!-- 賽事敘述-->
      <el-form-item :label="textData.infoTitle">
        <el-input type="textarea" v-model="contestForm.info"></el-input>
      </el-form-item>
      <!-- 教師是否不計分不累積挑戰次數 -->
      <el-form-item class="teacher" label-width="200" :label="textData.ignoreTeacherScoreTitle">
        <el-checkbox
          v-model="ignoreTeacherScore"
          :true-label="1"
          :false-label="0"
          @change="contestForm.ignoreTeacherScore = ignoreTeacherScore"
        >
          {{ textData.confirmTitle }}
        </el-checkbox>
      </el-form-item>
      <!-- 題庫 -->
      <el-form-item :label="textData.quizSetTitle" v-if="contestForm.teamType !== TeamType.FreeRoom">
        <!-- 學創題庫 -->
        <template v-if="quizSource === QuizSource.Enableets">
          <!-- 選擇題庫 -->
          <el-col :span="4">
            <el-button type="info" :disabled="isEdit" @click="isShowQuizSet = true">
              {{ textData.selectQuizSetTitle }}
            </el-button>
          </el-col>
          <!-- 編輯題庫 -->
          <el-col :span="6">
            <el-button type="info" @click="onEditQuizSet">
              {{ textData.editQuizSetTitle }}
            </el-button>
          </el-col>
          <br />
          <div>{{ quizSetDataList[0].quizSetName }}</div>
        </template>
        <!-- 因材網學習點題庫 -->
        <template v-if="quizSource === QuizSource.AdlEdu">
          <!-- 因材網題庫ID -->
          <template v-if="contestForm.teamType === TeamType.AdlWorldBoss">
            <el-input v-model="quizSetDataList[0].quizSetId" type="Number" :disabled="isEdit"></el-input>
          </template>
          <!-- 因材網題庫 -->
          <template v-else-if="contestForm.teamType === TeamType.Room">
            <el-button
              class="btn-game-again w-128px h-40px ml-25 mb-5"
              :disabled="isEdit"
              @click="isShowCourseSet = true"
            >
              {{ textData.pickSubject }}
            </el-button>
            <!-- 已選擇單元 -->
            <CourseList
              v-if="selectedCourseDataList.length > 0"
              :selectedCourseDataList="selectedCourseDataList"
              :isShowDelete="false"
              class="w-1024px"
            />
          </template>
        </template>
      </el-form-item>
      <!-- 教材資料 -->
      <el-form-item :label="textData.referDetailTitle">
        <!-- 是否有教材資料 -->
        <el-checkbox v-model="hasReferDetail" @change="onCheckReferDetail">
          {{ textData.confirmTitle }}
        </el-checkbox>
        <!-- 教材內容 -->
        <template v-if="hasReferDetail">
          <!-- 按鈕文字 -->
          <div>
            {{ textData.btnTextTitle }}
            <el-input v-model="contestForm.referDetail.btnText"></el-input>
          </div>
          <!-- 網頁鏈結 -->
          <div>
            {{ textData.btnUrlTitle }}
            <el-input v-model="contestForm.referDetail.btnUrl"></el-input>
          </div>
          <!-- 教材說明 -->
          <div>
            {{ textData.referInfoTitle }}
            <el-input type="textarea" v-model="contestForm.referDetail.info"></el-input>
          </div>
        </template>
      </el-form-item>
      <div v-show="contestForm.teamType !== TeamType.FreeRoom">
        <!-- 開放時間設定 -->
        <div v-show="contestForm.teamType !== TeamType.Room">
          <template>
            <h3>{{ textData.openTimeTitle }}</h3>
            <OpenTimeSet
              ref="openTimeSet"
              :openPeriodData="contestForm.otherLimit.gamePeriod"
              @onSave="onSaveOpenPeriod"
            />
          </template>
        </div>
        <!-- 獎勵相關區塊 -->
        <template>
          <!-- 賽事挑戰獎勵 -->
          <div class="game-reward-box">
            <h3>{{ textData.gameRewardTitle }}</h3>
            <GameReward ref="gameReward" :gameRewardList="contestForm.gameReward" @onSave="onSaveGameReward" />
          </div>
          <!-- 賽事排行獎勵 -->
          <div>
            <h3>{{ textData.rankRewardTitle }}</h3>
            <RankReward ref="rankReward" :rankRewardList="contestForm.rankReward" @onSave="onSaveRankReward" />
          </div>
        </template>
        <!-- 競賽設定 -->
        <template v-if="contestForm.teamType !== TeamType.Room || roomCycle === RoomCycleType.Cycle">
          <h3>{{ textData.contestSettingTitle }}</h3>
          <!-- 使用題目數 (目前不能更改) -->
          <el-form-item :label="textData.topicCountTitle">
            <el-input v-model.number="contestForm.gameDetail.quizNumber" type="Number" :disabled="true"></el-input>
          </el-form-item>
          <!-- 賽事總挑戰次數 -->
          <el-form-item prop="limitRound" :label="textData.limitRoundTitle">
            <el-input v-model.number="contestForm.gameDetail.limitRound" type="Number"></el-input>
          </el-form-item>
          <!-- 賽事每日挑戰次數 -->
          <el-form-item :label="textData.dailyLimitRoundTitle">
            <el-input v-model.number="contestForm.gameDetail.dailyLimitRound" type="Number"></el-input>
          </el-form-item>
          <!-- 挑戰次數提示 -->
          <el-form-item>
            <span text="16px [#d69f05]">{{ textData.limitRoundHint }}</span>
          </el-form-item>
        </template>
      </div>
      <!-- 房間賽設定 -->
      <template v-if="isRoomContest">
        <h3>{{ textData.roomSetTitle }}</h3>
        <!-- 房間地圖 -->
        <el-form-item :label="textData.roomMapTitle">
          <el-col :span="5">
            <SelectList
              :selectItemList="gameMapOptions"
              :selectedItem="contestForm.gameDetail.mapId"
              :placeholder="textData.roomMapPlaceHolder"
              :isLock="isEdit"
              @onSelect="contestForm.gameDetail.mapId = $event"
            />
          </el-col>
        </el-form-item>
        <!-- 房間魔王 -->
        <el-form-item :label="textData.roomBossTitle">
          <el-col :span="5">
            <SelectList
              :selectItemList="bossOptions"
              :selectedItem="contestForm.gameDetail.roomBossId"
              :placeholder="textData.roomBossPlaceHolder"
              :isLock="isEdit"
              @onSelect="onSelectRoomBoss"
            />
          </el-col>
        </el-form-item>
        <!-- 官方房間賽才顯示的房間設定 -->
        <div v-if="contestForm.teamType === TeamType.Room">
          <div class="flex">
            <!-- 單場時間 -->
            <el-form-item :label="textData.roomRoundTime">
              <el-select
                v-model="contestForm.teamDetail.roomOption.roundTime"
                :placeholder="textData.selectRoundTime"
                :disabled="isEdit"
              >
                <el-option
                  v-for="(roundTime, index) in roundTimeOptions"
                  :key="index"
                  :label="`${roundTime}分鐘`"
                  :value="roundTime"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <!-- 單局參賽人數 -->
            <el-form-item :label="textData.roomMaxPlayers">
              <el-input
                v-model.number="contestForm.teamDetail.roomOption.maxPlayers"
                type="Number"
                :disabled="isEdit"
              ></el-input>
            </el-form-item>
            <!-- 創建房間數 -->
            <el-form-item :label="textData.roomCreateCount">
              <el-input
                v-model.number="contestForm.teamDetail.roomOption.roomCount"
                type="Number"
                :disabled="isEdit"
              ></el-input>
            </el-form-item>
            <!-- 房間密碼 -->
            <el-form-item class="password" :label="textData.roomPassword">
              <el-checkbox v-model="isSetPassword" :disabled="isEdit" @change="onSetEmptyPassword" />
              <el-input
                v-model="contestForm.teamDetail.roomOption.password"
                show-password
                :disabled="isEdit || !isSetPassword"
              />
            </el-form-item>
          </div>
          <!-- 房間賽週期設定 -->
          <div v-show="this.roomCycle === RoomCycleType.Cycle">
            <template>
              <h3>{{ textData.openTimeTitle }}</h3>
              <StartTimeSet
                ref="startTimeSet"
                :roundTime="contestForm.teamDetail.roomOption.roundTime"
                :openPeriodData="contestForm.otherLimit.gamePeriod"
                @onSave="onSaveOpenPeriod"
              />
            </template>
          </div>
        </div>
      </template>
      <!-- 競賽設定 -->
      <template v-else>
        <!-- 魔王編輯 -->
        <template>
          <h3>{{ textData.bossSetTitle }}</h3>
          <BossSet
            ref="bossSet"
            :isEdit="isEdit"
            :bossDetail="bossData.bossDetail"
            :bossOptions="bossOptions"
            @onSave="onSaveBoss"
          />
        </template>
      </template>
    </el-form>
    <!--  題庫彈窗 -->
    <template v-if="isShowQuizSet">
      <QuizSet :quizSetData="quizSetDataList[0]" @onConfirm="onSelectQuizSet" @onCancel="isShowQuizSet = false" />
    </template>
    <!-- 選擇科目彈窗 -->
    <div v-if="isShowCourseSet">
      <CourseSet
        v-model="isShowCourseSet"
        :initialCourseDataList="selectedCourseDataList"
        @onConfirmSelectCourse="onConfirmSelectCourse"
      />
    </div>
    <!-- 下方按鈕區 -->
    <div class="w-full h-[100px] mb-[100px] flex-pos">
      <div class="w-[80%]">
        <el-row>
          <!-- 取消編輯賽事 -->
          <el-col :lg="6" :sm="6" :xs="24">
            <el-button class="btn-info-cancel" @click="onCancel">
              <span class="flex-pos" text="[#FFF]">{{ textData.cancelEditTitle }}</span>
            </el-button>
          </el-col>
          <!-- 完成並發佈測試 -->
          <el-col :lg="6" :sm="6" :xs="24">
            <el-button v-if="isEdit === false" class="btn-game-back" @click="onClickUploadTest">
              <span class="flex-pos">{{ textData.uploadTestTitle }}</span>
            </el-button>
          </el-col>
          <!-- 更新賽事資訊 -->
          <el-col :lg="6" :sm="6" :xs="24">
            <el-button v-if="isEdit && isRelease === false" class="btn-game-again" @click="onClickUpdateContest">
              <span class="flex-pos">{{ textData.updateContestTitle }}</span>
            </el-button>
          </el-col>
          <!-- 完成並正式發佈/測試轉正式發佈 -->
          <el-col :lg="6" :sm="6" :xs="24">
            <el-button v-if="isEdit === false || isTesting" class="btn-game-again" @click="onClickUploadContest">
              <span class="flex-pos">{{ textData.uploadContestTitle }}</span>
            </el-button>
          </el-col>
          <!-- 開放賽事排行領獎 -->
          <el-col :lg="6" :sm="6" :xs="24">
            <el-button
              v-if="isEdit && isTesting === false && isRelease === false"
              class="btn-game-detail"
              @click="onReleaseContestRank"
            >
              <span class="flex-pos">{{ textData.releaseRewardTitle }}</span>
            </el-button>
          </el-col>
          <!-- 刪除賽事 -->
          <el-col :lg="6" :sm="6" :xs="24">
            <el-button v-if="isEdit && isRelease === false" class="btn-info-cancel" @click="onDeleteContest">
              <span class="flex-pos">{{ textData.deleteContestTitle }}</span>
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, Ref } from 'vue-property-decorator';
import {
  TeamType,
  UserRole,
  CountyType,
  GradeType,
  GradeTypeName,
  DBBoolean,
  HeroJ7GameType,
  QuizSource,
  RoomCycleType,
  RoomCycleTypeName,
  CookieStr,
  GameBoxType,
} from '@/helper/enum/Common';
import DatePicker from '@/components/BackEndManagement/_FormProp/DatePicker.vue';
import SelectList from '@/components/BackEndManagement/_FormProp/SelectList.vue';
import CheckboxGroup, { CheckboxOption } from '@/components/BackEndManagement/_FormProp/CheckboxGroup.vue';
import GameReward from '@/components/BackEndManagement/_FormProp/_Reward/GameReward.vue';
import RankReward from '@/components/BackEndManagement/_FormProp/_Reward/RankReward.vue';
import QuizSet from '@/components/BackEndManagement/_FormProp/QuizSet.vue';
import OpenTimeSet from '@/components/BackEndManagement/_FormProp/_OpenTime/OpenTimeSet.vue';
import { ContestPKQuizBaseInfo, SelectOption } from '@/helper/interface/BackEndManagement';
import BossSet from '@/components/BackEndManagement/_FormProp/BossSet.vue';
import Config from '@/config/setting';
import {
  ContestListData,
  OpenPeriodInfo,
  ContestGameAward,
  ContestRankRewardData,
  ContestTeamDetail,
  QuizSetData,
} from '@/helper/interface/Contest';
import TableManager from '../../../manager/TableManager';
import { BossData, BossDetail } from '../../../helper/interface/Boss';
import { Message } from 'element-ui';
import dayjs from 'dayjs';
import CourseList from '../_FormProp/CourseList.vue';
import CourseSet from '../_FormProp/CourseSet.vue';
import { CourseDetail } from '@/helper/interface/CourseMenu';
import StartTimeSet from '../_FormProp/_OpenTime/StartTimeSet.vue';
import { toDayjs, isPassed } from '../../../manager/TimeSyncManager';
import GameTypeHelper from '../../../views/H5/Helper/GameTypeHelper';

/** 表單插件 */
export type VForm = Vue & {
  validate: () => boolean;
  resetValidation: () => boolean;
  reset: () => void;
};

@Component({
  components: {
    DatePicker,
    SelectList,
    CheckboxGroup,
    QuizSet,
    GameReward,
    RankReward,
    BossSet,
    OpenTimeSet,
    StartTimeSet,
    CourseSet,
    CourseList,
  },
})
export default class ContestForm extends Vue {
  /** 賽事編輯表單 */
  @Ref('vForm') private readonly vForm!: VForm;
  /** 賽事資料 */
  @Prop() private contestListData!: ContestListData;
  /** 題庫資料 */
  @Prop() private contestQuizBaseInfoList!: ContestPKQuizBaseInfo[];
  /** 因材網單元資料 */
  @Prop() private courseDataList!: CourseDetail[];
  /** 魔王資料 */
  @Prop() private contestBossData!: BossData;
  /** 是否為房間賽 */
  @Prop(Boolean) private isRoomContest!: boolean;

  /** 編輯中賽事資料 */
  private contestForm: ContestListData = {} as ContestListData;

  /** 房間週期種類 */
  private roomCycle: RoomCycleType = RoomCycleType.Single;

  /** 編輯中題庫來源 */
  private quizSource: QuizSource = QuizSource.None;

  /** 編輯中題庫資料 */
  private quizSetDataList: QuizSetData[] = [];

  /** 編輯中單元資料 */
  private selectedCourseDataList: CourseDetail[] = [];

  /** 編輯中魔王資料 */
  private bossData: BossData = {} as BossData;

  /** 無年級限制 */
  private g0: number = 0;

  /** 不要算老師得分 */
  private ignoreTeacherScore: number = 0;

  /** 是否有教材資料 */
  private hasReferDetail: boolean = false;

  /** 選擇題庫開關 */
  private isShowQuizSet: boolean = false;

  /** 題庫選擇彈窗開關 */
  private isShowCourseSet: boolean = false;

  /** 有無設置密碼 */
  private isSetPassword: boolean = false;

  /** 最小參賽人數 */
  private readonly maxPlayersMin: number = 2;

  /** 最大參賽人數 */
  private readonly maxPlayersMax: number = 30;

  /** 最大房間數 */
  private readonly maxRoomCount: number = 500;

  /** 表單欄位驗證規則 */
  private formRules = {
    // 賽事名稱
    title: [{ required: true, message: '請輸入賽事名稱', trigger: 'blur' }],
    // 賽事類型
    teamType: [
      {
        required: true,
        message: '請選擇賽事類型',
        trigger: 'blur',
        type: 'number',
        min: TeamType.WorldBoss,
      },
    ],
    // 答題模式
    gameType: [
      {
        required: true,
        message: '請選擇答題模式',
        trigger: 'blur',
        type: 'number',
        min: HeroJ7GameType.TowerDefense,
      },
    ],
  };

  public $refs!: {
    openTimeSet: OpenTimeSet;
    startTimeSet: StartTimeSet;
    bossSet: BossSet;
    gameReward: GameReward;
    rankReward: RankReward;
  };

  /** 文字資料 */
  private textData = {
    contestContentTitle: '賽事內容',
    contestNameTitle: '賽事名稱',
    countyTitle: '開放縣市',
    northCountyTitle: '北區',
    middleCountyTitle: '中區',
    southCountyTitle: '南區',
    eastCountyTitle: '東區及離島區',
    gradeTitle: '開放年級',
    confirmTitle: '是',
    noSchoolTitle: '無年級',
    primarySchoolTitle: '國小',
    middleSchoolTitle: '國中',
    highSchoolTitle: '高中',
    gradeDescriptionTitle: '描述',
    rolesTitle: '開放身分',
    gameTypeTitle: '答題模式',
    roomCycleTitle: '賽局週期',
    quizTypeTitle: '題庫來源',
    gameDetailTitle: '遊戲設定',
    gameMapTitle: '遊戲地圖',
    gameTypePlaceHolder: '請選擇答題模式',
    quizSourcePlaceHolder: '請選擇題庫來源',
    roomMapPlaceHolder: '請選擇賽局地圖',
    roomBossPlaceHolder: '請選擇賽局魔王',
    teamTypeTitle: '賽事類型',
    teamTypePlaceHolder: '請選擇賽事類型',
    subjectTypeTitle: '出場英雄',
    subjectTypePlaceHolder: '請選擇學科',
    startTime: '開始時間',
    selectDateTime: '選擇日期時間',
    contestDateTitle: '賽事時間',
    infoTitle: '賽事敘述',
    ignoreTeacherScoreTitle: '教師是否不計分不累積挑戰次數',
    quizSetTitle: '題庫',
    quizSetHint: '請選擇賽事類型',
    sourceSetHint: '請選擇題庫來源',
    referDetailTitle: '教材資料',
    btnTextTitle: '按鈕文字',
    btnUrlTitle: '教材鏈結',
    referInfoTitle: '教材說明',
    selectQuizSetTitle: '選擇題庫',
    editQuizSetTitle: '編輯題庫',
    pickSubject: '選擇科目',
    openTimeTitle: '開放遊玩時間',
    roomSetTitle: '賽局設定',
    roomRoundTime: '遊戲時間',
    selectRoundTime: '請選擇單局時間',
    roomMaxPlayers: '參賽人數',
    roomPassword: '賽局密碼',
    roomCreateCount: '創立賽局數',
    roomMapTitle: '賽局地圖',
    roomBossTitle: '賽局魔王',
    bossSetTitle: '魔王設定',
    gameRewardTitle: '賽事挑戰獎勵',
    rankRewardTitle: '賽事排行獎勵',
    contestSettingTitle: '競賽設定',
    topicCountTitle: '使用題目數',
    limitRoundTitle: '總挑戰次數',
    dailyLimitRoundTitle: '每日挑戰次數',
    limitRoundHint: '-1為無限次數',
    cancelCreateTitle: '取消創立賽事',
    cancelEditTitle: '取消編輯賽事',
    uploadTestTitle: '完成並測試發佈',
    uploadContestTitle: '完成並正式發佈',
    updateContestTitle: '更新賽事設定',
    releaseRewardTitle: '開放賽事排行領獎',
    deleteContestTitle: '刪除賽事',
  };

  /** 縣市分區資料 */
  private readonly countyData = {
    north: [CountyType.KL, CountyType.TP, CountyType.NTPC, CountyType.TYC, CountyType.HCC, CountyType.HC],
    middle: [CountyType.MLC, CountyType.TC, CountyType.CHC, CountyType.YLC, CountyType.NTCT],
    south: [CountyType.CYC, CountyType.CY, CountyType.TN, CountyType.KH, CountyType.PTC],
    east: [CountyType.ILC, CountyType.HLC, CountyType.TTCT, CountyType.PHC, CountyType.KM, CountyType.MATSU],
  };

  /** 年級資料 */
  private readonly gradeData = {
    primarySchool: [GradeType.g1, GradeType.g2, GradeType.g3, GradeType.g4, GradeType.g5, GradeType.g6],
    middleSchool: [GradeType.g7, GradeType.g8, GradeType.g9],
    highSchool: [GradeType.g10, GradeType.g11, GradeType.g12],
  };

  /** 身分選項 */
  private readonly roleOptions: CheckboxOption[] = [
    { optionText: '學生', optionValue: UserRole.STU },
    { optionText: '教師', optionValue: UserRole.TCH },
  ];

  /** 魔王賽事類型 */
  private readonly worldBossOptions: SelectOption[] = [
    { label: '學創魔王賽', value: TeamType.WorldBoss },
    { label: '因材網魔王賽', value: TeamType.AdlWorldBoss },
  ];

  /** 房間賽事類型 */
  private readonly roomOptions: SelectOption[] = [
    { label: '官方開局賽', value: TeamType.Room },
    { label: '自由開局賽', value: TeamType.FreeRoom },
  ];

  /** 題庫來源類型 */
  private readonly quizOptions: SelectOption[] = [
    { label: '學創', value: QuizSource.Enableets },
    { label: '因材網', value: QuizSource.AdlEdu },
  ];

  /** 賽事類型選項 */
  private get teamTypeOptions(): SelectOption[] {
    return this.isRoomContest ? this.roomOptions : this.worldBossOptions;
  }

  /** 遊戲時長選項  */
  private readonly roundTimeOptions: number[] = [5, 10, 15, 20, 25, 30, 35, 40, 45];

  /** 日期時間選擇限制 */
  private pickerOptions = {
    selectableRange: '07:00:00-22:00:00',
    disabledDate: (time: Date) => {
      const currentTime = dayjs().subtract(1, 'day');
      return dayjs(time.getTime()) < currentTime;
    },
  };

  /** 取得當前選中的限制年級
   * @param gradeList
   */
  private get checkedGrade(): number[] {
    const checkList: number[] = [];
    if (this.contestForm.g1 === DBBoolean.True) {
      checkList.push(GradeType.g1);
    }
    if (this.contestForm.g2 === DBBoolean.True) {
      checkList.push(GradeType.g2);
    }
    if (this.contestForm.g3 === DBBoolean.True) {
      checkList.push(GradeType.g3);
    }
    if (this.contestForm.g4 === DBBoolean.True) {
      checkList.push(GradeType.g4);
    }
    if (this.contestForm.g5 === DBBoolean.True) {
      checkList.push(GradeType.g5);
    }
    if (this.contestForm.g6 === DBBoolean.True) {
      checkList.push(GradeType.g6);
    }
    if (this.contestForm.g7 === DBBoolean.True) {
      checkList.push(GradeType.g7);
    }
    if (this.contestForm.g8 === DBBoolean.True) {
      checkList.push(GradeType.g8);
    }
    if (this.contestForm.g9 === DBBoolean.True) {
      checkList.push(GradeType.g9);
    }
    if (this.contestForm.g10 === DBBoolean.True) {
      checkList.push(GradeType.g10);
    }
    if (this.contestForm.g11 === DBBoolean.True) {
      checkList.push(GradeType.g11);
    }
    if (this.contestForm.g12 === DBBoolean.True) {
      checkList.push(GradeType.g12);
    }
    return checkList;
  }

  /** 取得當前選中的限制身分 */
  private get checkedRole(): number[] {
    return this.contestForm.otherLimit.roles ?? this.roleOptions.map<number>((option) => option.optionValue);
  }

  /** 取得當前選中的限制縣市 */
  private get checkedCounty(): number[] {
    return (
      this.contestForm.otherLimit.schoolCountyIds ?? [
        ...this.countyData.north,
        ...this.countyData.middle,
        ...this.countyData.south,
        ...this.countyData.east,
      ]
    );
  }

  /** 答題類型選項 */
  private get gameTypeOptions(): SelectOption[] {
    // 不同賽事類型有不同遊戲類型
    switch (this.contestForm.teamType) {
      // 魔王賽
      case TeamType.WorldBoss:
      case TeamType.AdlWorldBoss:
        return GameTypeHelper.getGameBox(GameBoxType.AdlGameBox).map<SelectOption>((gameTypeData) => {
          return {
            label: gameTypeData.displayName,
            value: gameTypeData.gameType,
          };
        });
      // 房間賽
      case TeamType.Room:
      case TeamType.FreeRoom:
        return GameTypeHelper.getGameBox(GameBoxType.RoomGameBox).map<SelectOption>((gameTypeData) => {
          return {
            label: gameTypeData.displayName,
            value: gameTypeData.gameType,
          };
        });
    }

    return [];
  }

  /** 遊戲地圖選項 */
  private get gameMapOptions(): SelectOption[] {
    const gameMapOptions: SelectOption[] = [];

    // 取得指定遊戲類型的地圖選項
    switch (this.contestForm.gameType) {
      // 坦克大戰
      case HeroJ7GameType.BrickBreaker:
        const mapTableData = TableManager.brickBreakerMap.getAll();
        mapTableData.forEach((mapData) => {
          gameMapOptions.push({
            label: mapData.mapName,
            value: mapData.id,
          });
        });
        break;
    }

    return gameMapOptions;
  }

  /** 魔王選項 */
  private get bossOptions(): SelectOption[] {
    const bossTableData = TableManager.boss.getAll();
    return bossTableData.map<SelectOption>((bossData) => {
      return {
        label: bossData.bossName,
        value: bossData.id,
      };
    });
  }

  /** 是否為編輯賽事 */
  private get isEdit(): boolean {
    return this.contestForm.id > 0;
  }

  /** 是否以開放獎勵 */
  private get isRelease(): boolean {
    return this.contestForm.release === DBBoolean.True;
  }

  /** 是否為測試賽事 */
  private get isTesting(): boolean {
    return this.contestForm.isTesting === DBBoolean.True;
  }

  /** 賽事類型 */
  private TeamType = TeamType;

  /** 題庫來源 */
  private QuizSource = QuizSource;

  /** 房間週期 */
  private RoomCycleType = RoomCycleType;

  async created() {
    // 設定初始值or讀取編輯資料
    this.contestForm = this.contestListData;
    // 讀取題庫資料
    this.quizSetDataList = this.contestQuizBaseInfoList.map((item: ContestPKQuizBaseInfo) => {
      return { sourceType: item.sourceType, quizSetId: item.quizSetId, quizSetName: item.quizName };
    });
    // 房間賽週期
    this.roomCycle = this.contestForm.otherLimit.gamePeriod == null ? RoomCycleType.Single : RoomCycleType.Cycle;
    // 設定題庫來源
    if (this.quizSetDataList.length > 0) {
      this.quizSource = this.quizSetDataList[0].sourceType;
    } else {
      this.onSelectQuizSource(QuizSource.Enableets);
    }
    // 讀取因材網單元資料
    this.selectedCourseDataList = this.courseDataList;
    // 讀取魔王資料
    this.bossData = this.contestBossData;
    this.g0 = this.contestForm.g0;
    this.ignoreTeacherScore = this.contestForm.ignoreTeacherScore;
    this.hasReferDetail = this.contestForm.referDetail != null;
  }

  //#region 縣市限制
  /** 轉換成縣市選項
   * @param countyList
   */
  private getCountyOptions(countyList: CountyType[]): CheckboxOption[] {
    return countyList.map<CheckboxOption>((county) => {
      const tableData = TableManager.county.findOne(county);
      if (tableData == null) {
        return {
          optionText: `invalid ${county}`,
          optionValue: county,
        };
      }

      return {
        optionText: tableData.countyName,
        optionValue: county,
      };
    });
  }

  /** 更新縣市限制
   * @param newCountyList
   */
  private onCheckCounty(newCountyList: CountyType[]): void {
    // 計算全選總長
    const allCountyLength: number = [
      ...this.countyData.north,
      ...this.countyData.middle,
      ...this.countyData.south,
      ...this.countyData.east,
    ].length;

    // 如果全選, 設定為null
    this.contestForm.otherLimit.schoolCountyIds = newCountyList.length === allCountyLength ? null : newCountyList;
  }
  //#endregion

  //#region 年級限制
  /** 轉換成年級選項
   * @param gradeList
   */
  private getGradeOptions(gradeList: GradeType[]): CheckboxOption[] {
    return gradeList.map<CheckboxOption>((gradeType) => {
      return {
        optionText: Object.entries(GradeTypeName).find(([key, val]) => key === GradeType[gradeType])?.[1] ?? '錯誤類別',
        optionValue: gradeType,
      };
    });
  }

  /** 更新年級限制
   * @param newGradeList
   */
  private onCheckGrade(newGradeList: GradeType[]): void {
    this.contestForm.g1 = newGradeList.includes(GradeType.g1) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g2 = newGradeList.includes(GradeType.g2) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g3 = newGradeList.includes(GradeType.g3) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g4 = newGradeList.includes(GradeType.g4) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g5 = newGradeList.includes(GradeType.g5) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g6 = newGradeList.includes(GradeType.g6) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g7 = newGradeList.includes(GradeType.g7) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g8 = newGradeList.includes(GradeType.g8) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g9 = newGradeList.includes(GradeType.g9) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g10 = newGradeList.includes(GradeType.g10) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g11 = newGradeList.includes(GradeType.g11) ? DBBoolean.True : DBBoolean.False;
    this.contestForm.g12 = newGradeList.includes(GradeType.g12) ? DBBoolean.True : DBBoolean.False;
  }
  //#endregion

  /** 更新身分限制
   * @param newRoleList
   */
  private onCheckRole(newRoleList: UserRole[]): void {
    const excludeSuperList = newRoleList.filter((role) => role > UserRole.SUP);
    this.contestForm.otherLimit.roles = excludeSuperList.length > this.roleOptions.length ? null : newRoleList;
  }

  /** 更新賽事類型
   *@param newTeamType
   */
  private onPickTeamType(newTeamType: TeamType): void {
    this.contestForm.teamType = newTeamType;
    this.contestForm.otherLimit.gamePeriod = null;
    switch (newTeamType) {
      case TeamType.WorldBoss:
        this.onSelectQuizSource(QuizSource.Enableets);
        break;
      case TeamType.AdlWorldBoss:
        this.onSelectQuizSource(QuizSource.AdlEdu);
        break;
      // 開局賽題庫來源設定預設值
      case TeamType.Room:
      case TeamType.FreeRoom:
        this.onSelectQuizSource(QuizSource.None);
        break;
      default:
        Message.error(`未知的賽事類型，類型=${newTeamType}`);
    }
  }

  /** 補上結束時間 */
  private setGameEnd(): void {
    this.contestForm.gameEnd = toDayjs(this.contestForm.gameStart)
      .add(this.contestForm.teamDetail.roomOption.roundTime, 'minute')
      .format('YYYY-MM-DD HH:mm');
  }

  /** 選擇週期類型清空時間資料 */
  private onPickRoomCycle(): void {
    this.setGameEnd();
    this.contestForm.otherLimit.gamePeriod = null;
  }

  /** 選擇賽事時間
   * @param pickedDate
   */
  private onPickContestDate(pickedDate: string[]): void {
    if (pickedDate == null) {
      this.contestForm.gameStart = '';
      this.contestForm.gameEnd = '';
      return;
    }
    this.contestForm.gameStart = pickedDate[0].toString();
    this.contestForm.gameEnd = pickedDate[1].toString();
  }

  /** 選擇題庫來源
   * @param newQuizSource
   */
  private onSelectQuizSource(newQuizSource: QuizSource) {
    // 切換題庫來源
    this.quizSource = newQuizSource;

    if (this.quizSource === QuizSource.Enableets || this.contestForm.teamType === TeamType.AdlWorldBoss) {
      const emptyQuizSetData = {
        sourceType: this.quizSource,
        quizSetId: '-1',
        quizSetName: '',
      };
      this.quizSetDataList.splice(0, this.quizSetDataList.length, emptyQuizSetData);
    } else {
      this.quizSetDataList.splice(0, this.quizSetDataList.length);
    }
    this.selectedCourseDataList = [];
  }

  /** 選擇學創題庫
   * @param newQuizSetData
   */
  private onSelectQuizSet(newQuizSetData: QuizSetData): void {
    this.quizSetDataList.splice(0, 1, newQuizSetData);
    this.isShowQuizSet = false;
  }

  /** 選擇房間魔王 */
  private onSelectRoomBoss(bossId: number): void {
    this.contestForm.gameDetail.roomBossId = bossId;
    // 設定魔王banner
    this.contestForm.imageMap.listCard = bossId;
  }

  /** 編輯題庫 */
  private onEditQuizSet(): void {
    // 跳轉iplay題庫編輯
    this.$cookie.set(`${CookieStr.QuizEdit}`, this.$$store.getters.userToken, {
      expires: 0.2,
    });
    // 跳轉iplay題庫編輯
    window.open(`${Config.quizEdit}`, '_blank');
  }

  /** 確認選擇因材網單元
   *  @param selectedCourseDataList
   */
  private onConfirmSelectCourse(selectedCourseDataList: CourseDetail[]): void {
    this.selectedCourseDataList = selectedCourseDataList;
    this.isShowCourseSet = false;

    this.quizSetDataList = selectedCourseDataList.map((courseData: CourseDetail) => {
      return {
        sourceType: this.quizSource,
        quizSetId: courseData.course.game_link_id,
        quizSetName: courseData.course.unit_name,
      };
    });
  }

  /** 更新教材資料 */
  private onCheckReferDetail(): void {
    if (this.hasReferDetail) {
      this.contestForm.referDetail = {
        btnText: '',
        btnUrl: '',
        info: '',
      };
    } else {
      this.contestForm.referDetail = null;
    }
  }

  /** 未勾選設定密碼時設定密碼為空 */
  private onSetEmptyPassword(): void {
    if (this.isSetPassword === false) {
      this.contestForm.teamDetail.roomOption.password = '';
    }
  }

  /** 取得年級中文字
   * @param gradeType
   */
  private toRoomCycleName(roomCycle: RoomCycleType): string {
    const nameKey = RoomCycleType[roomCycle];
    return Object.entries(RoomCycleTypeName).find(([key, val]) => key === nameKey)?.[1] ?? '錯誤選項';
  }

  /** 儲存時間限制
   * @param newOpenPeriod
   */
  private onSaveOpenPeriod(newOpenPeriod: OpenPeriodInfo[][]): void {
    this.contestForm.otherLimit.gamePeriod = newOpenPeriod;
  }

  /** 儲存魔王清單
   * @param newBossList
   */
  private onSaveBoss(newBossList: BossDetail[]): void {
    let newTotalHp = 0;
    newBossList.forEach((boss) => {
      newTotalHp += boss.hp;
    });

    // 魔王總血量不能低於已累積傷害值
    if (newTotalHp < this.bossData.cumulateDamage) {
      Message.error(`魔王總血量不能低於當前總傷害值 ${this.bossData.cumulateDamage}`);
      return;
    }

    // 更新BOSS清單
    this.bossData.bossDetail = newBossList;

    // 設定賽事Boss Banner
    if (newBossList.length > 0) {
      this.contestForm.imageMap.listCard = newBossList[0].bossId;
    } else {
      this.contestForm.imageMap.listCard = 0;
    }
  }

  /** 儲存參賽獎勵
   * @param newGameRewardList
   */
  private onSaveGameReward(newGameRewardList: ContestGameAward[]): void {
    this.contestForm.gameReward = newGameRewardList;
  }

  /** 儲存排行獎勵
   * @param newRankRewardList
   */
  private onSaveRankReward(newRankRewardList: ContestRankRewardData[]): void {
    // 有排名沒獎勵防呆
    for (const reward of newRankRewardList) {
      if (reward.rewardList.length === 0) {
        Message.error(`排名 ${reward.rankValue} 沒有設定獎勵`);
        return;
      }
    }

    this.contestForm.rankReward = newRankRewardList;
  }

  /** 檢查賽事編輯填寫正確 */
  private async isContestFormValid(): Promise<boolean> {
    // 檢查是否有東西未儲存
    let isUnsaved: boolean = false;

    // 參賽獎勵
    if (this.$refs.gameReward.checkNeedSave(this.contestForm.gameReward)) {
      isUnsaved = true;
    }
    // 排行獎勵
    if (this.$refs.rankReward.checkNeedSave(this.contestForm.rankReward)) {
      isUnsaved = true;
    }

    // 檢查是否資料都有儲存
    if (isUnsaved) {
      Message.error('有資料未儲存');
      return false;
    }

    // 填表防呆
    try {
      await this.vForm.validate();
    } catch (e) {
      return false;
    }

    // 總挑戰次數防呆
    if (this.contestForm.gameDetail.limitRound.toString() === '') {
      Message.error('請選取總挑戰次數');
      return false;
    } else if (this.contestForm.gameDetail.limitRound < -1) {
      Message.error('請選取總挑戰次數不低於-1 (無限制)');
      return false;
    }

    // 每日挑戰次數防呆
    if (this.contestForm.gameDetail.dailyLimitRound.toString() === '') {
      Message.error('請選取每日挑戰次數');
      return false;
    } else if (this.contestForm.gameDetail.dailyLimitRound < -1) {
      Message.error('請選取每日挑戰次數不低於-1 (無限制)');
      return false;
    }

    const otherLimit = this.contestForm.otherLimit;
    // 各別賽事檢查
    switch (this.contestForm.teamType) {
      // 魔王賽
      case TeamType.WorldBoss:
      case TeamType.AdlWorldBoss:
        // 時間限制是否儲存
        if (this.$refs.openTimeSet.checkNeedSave(otherLimit.gamePeriod)) {
          isUnsaved = true;
        }
        // 檢查是否資料都有儲存
        if (isUnsaved) {
          Message.error('有資料未儲存');
          return false;
        }
        if (this.isWorldBossContestValid() === false) {
          return false;
        }
        break;
      // 房間賽
      case TeamType.Room:
        // 週期房間賽開始時間是否儲存
        if (this.roomCycle === RoomCycleType.Cycle) {
          if (this.$refs.startTimeSet.checkNeedSave(otherLimit.gamePeriod)) {
            isUnsaved = true;
          }
        }
        // 檢查是否資料都有儲存
        if (isUnsaved) {
          Message.error('有資料未儲存');
          return false;
        }
        if (this.isRoomContestValid() === false) {
          return false;
        }
        break;
      case TeamType.FreeRoom:
        if (this.isRoomContestValid() === false) {
          return false;
        }
        break;
    }

    // 一切ok
    return true;
  }

  /** 檢查賽事時間 */
  private checkTime(): boolean {
    if (this.contestForm.gameStart.length === 0) {
      Message.error('請選擇開始日期');
      return false;
    }
    if (this.contestForm.gameEnd.length === 0) {
      Message.error('請選擇結束日期');
      return false;
    }
    if (isPassed(this.contestForm.gameEnd)) {
      Message.error('結束日期不能為過期日期');
      return false;
    }
    return true;
  }

  /** 魔王賽要檢查的事情 */
  private isWorldBossContestValid(): boolean {
    // 賽事時間
    if (!this.checkTime()) {
      return false;
    }

    // 魔王
    if (this.$refs.bossSet.checkNeedSave(this.bossData.bossDetail)) {
      Message.error('有資料未儲存');
      return false;
    }

    // 題庫防呆
    if (this.quizSetDataList[0].quizSetId === '-1') {
      Message.error('請選取題庫');
      return false;
    }

    // 魔王防呆
    if (this.bossData.bossDetail.length <= 0) {
      Message.error('請選取魔王');
      return false;
    }

    // 一切OK
    return true;
  }

  /** 房間賽要檢查的事情 */
  private isRoomContestValid(): boolean {
    // 地圖
    if (this.contestForm.gameDetail.mapId === -1) {
      Message.error('請選擇賽局地圖');
      return false;
    }

    // 魔王
    if (this.contestForm.gameDetail.roomBossId === -1) {
      Message.error('請選擇賽局魔王');
      return false;
    }

    switch (this.contestForm.teamType) {
      // 官方開局賽
      case TeamType.Room:
        // 賽事時間
        if (!this.checkTime()) {
          return false;
        }

        // 週期賽事
        if (this.roomCycle === RoomCycleType.Cycle) {
          if (this.contestForm.otherLimit.gamePeriod !== null) {
            // 是否有設定週期
            if (this.contestForm.otherLimit.gamePeriod.every((weekDay: OpenPeriodInfo[]) => weekDay.length === 0)) {
              Message.error('請選擇至少一個遊玩時段');
              return false;
            }

            // 是否有重疊時段
            if (this.$refs.startTimeSet.hasOverlap()) {
              Message.error('開放時段請勿設定重疊');
              return false;
            }
          }
        }

        // 選擇題庫單元
        if (this.quizSetDataList.length === 0 || this.quizSetDataList[0].quizSetId === '-1') {
          Message.error('請選擇題庫單元');
          return false;
        }

        // 遊戲時間
        if (this.roundTimeOptions.includes(this.contestForm.teamDetail.roomOption.roundTime) === false) {
          Message.error('請選擇遊戲時間');
          return false;
        }

        // 參賽人數
        if (
          this.contestForm.teamDetail.roomOption.maxPlayers < this.maxPlayersMin ||
          this.contestForm.teamDetail.roomOption.maxPlayers > this.maxPlayersMax
        ) {
          Message.error(`參賽人數請輸入${this.maxPlayersMin}~${this.maxPlayersMax}之間`);
          return false;
        }

        // 房間數
        if (this.contestForm.teamDetail.roomOption.roomCount <= 0) {
          Message.error('請輸入賽局數');
          return false;
        }
        if (this.contestForm.teamDetail.roomOption.roomCount > this.maxRoomCount) {
          Message.error(`賽局數上限為${this.maxRoomCount}`);
          return false;
        }
        break;
      // 自由房間賽
      case TeamType.FreeRoom:
        // 設定預設值
        this.contestForm.teamDetail = {} as ContestTeamDetail;
        break;
      default:
        console.error(`未知賽事類型`);
    }

    // 一切OK
    return true;
  }

  /** 點擊完成並測試發佈 */
  private async onClickUploadTest(): Promise<void> {
    // 表格檢查
    if ((await this.isContestFormValid()) === false) {
      return;
    }

    // 設定測試發佈
    this.contestForm.isTesting = DBBoolean.True;
    this.onUploadContest(this.contestForm, this.quizSetDataList, this.bossData);
  }

  /** 點擊完成並正式發佈/測試賽事轉正式 */
  private async onClickUploadContest(): Promise<void> {
    // 表格檢查
    if ((await this.isContestFormValid()) === false) {
      return;
    }
    // 設定正式發佈
    this.contestForm.isTesting = DBBoolean.False;
    this.onUploadContest(this.contestForm, this.quizSetDataList, this.bossData);
  }

  /** 更新賽事設定 */
  private async onClickUpdateContest(): Promise<void> {
    // 表格檢查
    if ((await this.isContestFormValid()) === false) {
      return;
    }

    // 更新賽事設定
    this.onUpdateContest(this.contestForm, this.bossData);
  }

  /** 取消編輯賽事 */
  @Emit('onCancel')
  private onCancel(): void {
    return;
  }

  /** 完成並正式/測試發佈
   * @param newContestForm
   * @param newQuizSetData
   * @param bossData
   */
  @Emit('onUploadContest')
  private onUploadContest(newContestForm: ContestListData, newQuizSetData: QuizSetData[], bossData: BossData): void {
    return;
  }

  /** 更新賽事設定
   * @param newContestForm
   * @param bossData
   */
  @Emit('onUpdateContest')
  private onUpdateContest(newContestForm: ContestListData, bossData: BossData): void {
    return;
  }

  /** 開放賽事排行領獎 */
  @Emit('onReleaseContestRank')
  private onReleaseContestRank(): void {
    return;
  }

  /** 刪除賽事 */
  @Emit('onDeleteContest')
  private onDeleteContest(): void {
    return;
  }
}
</script>
<style lang="scss" scoped>
h3 {
  padding: 1vw 0;
  border-bottom: 4px solid #707070;
  margin-bottom: 2vw;
  font-weight: 700;
  font-size: 28px;
}
.grade-box {
  border: 1px solid #707070;
  border-radius: 6px;
  padding: 10px 10px 10px 10px;
  span {
    width: 80px;
    font-size: 22px;
    font-weight: bold;
  }
}

::v-deep .el-form .teacher .el-form-item__label {
  width: 210px !important;
}

::v-deep .el-form .password .el-form-item__content .el-input {
  margin-left: 10px;
  width: 80%;
}
</style>
