<template>
  <div text="18px [#D69F05]">
    <p w="[80%]" text="30px" m="x-auto" p="b-12px" border="b-2px solid [#C1C1C1]">
      {{ textData.titleText }}
    </p>
    <div class="flex justify-center grid grid-cols-[140px,100px,50px,120px]" m="t-35px">
      {{ textData.roomNumber }}
      <p text="left [#666666]">{{ contestRoomId }}</p>
    </div>
    <div class="flex justify-center items-center grid grid-cols-[140px,100px,50px,120px]" m="t-30px b-35px">
      {{ textData.roomPassword }}
      <input text="left [#666666]" :type="passwordInputType" :value="roomPassword" readonly="true" />
      <img class="object-contain" :src="eyeIcon" @click="showPassword" />
      <button p="x-4 y-2.5" bg="[#18D577]" border="rounded-5px" text="[#FFFFFF]" @click="copyToClipboard">
        {{ textData.clickToCopy }}
      </button>
    </div>
    <div class="shadow-default" m="b-130px" p="b-30px">
      <p w="[80%]" text="30px" m="x-auto" p="y-30px" border="b-1px solid [#C1C1C1]">
        {{ textData.inviteTitle }}
      </p>
      <div w="[80%]" m="x-auto">
        <div class="grid grid-cols-[1fr,1fr]" m="t-3">
          <SchoolClassList @onSelectClass="onSelectClass" />
          <!-- 已選取 -->
          <div v-if="pickedClassList.length > 0" border="l-1px solid [#C1C1C1]">
            <div p="l-50px">
              <p text="left">
                {{ textData.pickedClassTitle }}
              </p>
              <div class="flex flex-row items-center" p="x-5 y-2" m="l-10">
                <div v-for="pickedClass in pickedClassList" :key="pickedClass.classId" m="r-15px y-5">
                  <div
                    :key="pickedClass.classId"
                    @click="onRemoveClass(pickedClass)"
                    text="[#FFF]"
                    class="flex justify-between items-center rounded-3xl shadow-default z-2"
                    bg="[#ebca28]"
                    border="2px solid [#FFF]"
                    p="x-3 y-1"
                  >
                    {{ pickedClass.classString }}
                    <img class="object-contain" :src="imgData.whiteCross" m="l-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 按鈕列 -->
    <div class="fixed center bottom-0 w-full" m="x-auto" p="y-35px" bg="[#000000] opacity-80">
      <!-- 返回按鈕 -->
      <button class="yellowGradient" p="x-15 y-3 <2xl:x-5" border="rounded-60px" text="20px [#FFFFFF]" @click="onBack">
        {{ textData.return }}
      </button>
      <!-- 發送邀請按鈕 -->
      <button
        class="blueGradient"
        m="l-15px"
        p="x-15 y-3 <2xl:x-5"
        border="rounded-60px"
        text="20px [#FFFFFF]"
        @click="onInvite"
      >
        {{ textData.invite }}
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import { contestRoomInvitation } from '@/api/contest';
import imgPath from '@/config/imgPath/imgPath';
import { Message } from '@/helper/class/Common';
import { ResponseState } from '@/helper/enum/Common';
import { handleAPIError } from '@/helper/fnc/common';
import { ClassItem } from '@/helper/interface/TeacherAdmin';
import { Component, Emit, Prop, Vue } from 'vue-property-decorator';
import SchoolClassList from '../LearningRecordStatistic/SchoolClassList.vue';
@Component({ components: { SchoolClassList } })
export default class RoomCreated extends Vue {
  /** 是否為編輯 */
  @Prop(Boolean) private isEdit!: boolean;
  /** 房間編號 */
  @Prop(Number) private contestRoomId!: number;
  /** 房間密碼 */
  @Prop(String) private roomPassword!: string;

  /**選到班級 */
  private pickedClassList: ClassItem[] = [];

  /** 顯示框種類 */
  private passwordInputType: string = 'password';

  /** 文字資料 */
  private textData = {
    titleText: '賽局資訊',
    roomNumber: '賽局編號',
    roomPassword: '賽局密碼',
    clickToCopy: '一鍵複製',
    inviteTitle: '邀請班級通知信件',
    pickedClassTitle: '已挑選班級',
    return: '返回',
    invite: '發送邀請',
  };

  /** 圖片資料 */
  private imgData = {
    whiteCross: imgPath.whiteCrossUrl,
  };

  /** 顯示/隱藏密碼圖示 */
  private get eyeIcon(): string {
    return this.passwordInputType === 'password' ? imgPath.eyeIcon : imgPath.eyeHiddenIcon;
  }

  /** 選擇班級
   * @param classItem
   */
  private onSelectClass(classItem: ClassItem): void {
    if (this.pickedClassList.includes(classItem)) {
      return;
    }
    this.pickedClassList.push(classItem);
  }

  /** 移除班級
   * @param classItem
   */
  private onRemoveClass(classItem: ClassItem): void {
    const deleteIndex = this.pickedClassList.findIndex((pickedClass: ClassItem) => pickedClass === classItem);
    if (deleteIndex === -1) {
      return;
    }
    this.pickedClassList.splice(deleteIndex, 1);
  }

  /** 點擊發送邀請 */
  private async onInvite(): Promise<void> {
    if (await this.sendContestRoomInvitationAPI()) {
      this.$alert('發送邀請成功', '成功');
    }
  }

  /** 發送客製賽局邀請API
   *  @param pickedClassId
   */
  private async sendContestRoomInvitationAPI(): Promise<boolean> {
    const data = {
      contestRoomId: this.contestRoomId,
      classIdArray: this.pickedClassList.map((pickedClass: ClassItem) => pickedClass.classId),
    };

    try {
      // API 發送自訂賽局邀請
      const response: any = await contestRoomInvitation.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }
      return true;
    } catch (e) {
      Message.error(`${e}`);
      return false;
    }
  }

  /** 切換密碼顯示方式 */
  private showPassword(): void {
    this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
  }

  /** 複製到剪貼簿 */
  private copyToClipboard(): void {
    navigator.clipboard.writeText(`賽局編號:${this.contestRoomId} 賽局密碼:${this.roomPassword}`).catch(() => {
      Message.error('複製到剪貼簿失敗');
    });
  }

  /** 點擊確定返回 */
  @Emit('onBack')
  private onBack(): void {
    return;
  }
}
</script>
