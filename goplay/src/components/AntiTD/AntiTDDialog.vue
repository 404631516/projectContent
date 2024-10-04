<template>
  <el-dialog :visible.sync="isDialogVisible" :before-close="onBeforeClose" @open="onOpen" @close="onClose" top="8vh">
    <!-- 標題 -->
    <div slot="title" class="relative" p="x-20px t-20px b-10px">
      <!-- 頁籤 -->
      <div
        v-if="isShowPageTag"
        class="absolute -top-[56px] <sm:-top-[48px] left-6 <sm:left-4 grid grid-cols-2 gap-x-2"
        text="[#5D5D5D] 2xl <sm:xl"
      >
        <!-- 生物兵器頁籤 -->
        <button
          class="w-80 <sm:w-45 rounded-t-[20px] transition"
          p="y-3"
          :bg="teamTabType === PlanetWarType.Outter ? '[#FFF]' : '[#C5C5C5]'"
          @click="onChangeTeamTabType(PlanetWarType.Outter)"
        >
          {{ textData.weapon }}
        </button>
        <!-- 逆塔防頁籤 -->
        <button
          class="w-80 <sm:w-45 rounded-t-[20px] transition"
          p="y-3"
          :bg="teamTabType === PlanetWarType.Outter ? '[#C5C5C5]' : '[#FFF]'"
          @click="onChangeTeamTabType(PlanetWarType.Inner)"
        >
          {{ textData.antiTD }}
        </button>
      </div>
      <!-- 標題內容 -->
      <div
        :class="teamTabType === PlanetWarType.Outter ? 'text-[#666666]' : 'text-[#B965C9]'"
        m="b-2"
        font="bold"
        text="32px"
      >
        {{ teamTabType === PlanetWarType.Outter ? textData.weapon : textData.antiTD }}
      </div>
      <span text="18px [#666666]">{{
        teamTabType === PlanetWarType.Outter ? textData.weaponInfo : textData.antiTDInfo
      }}</span>
    </div>
    <!-- 生物兵器內容 -->
    <div v-if="teamTabType === PlanetWarType.Outter">
      <WeaponDialogContent
        :userInfo="userInfo"
        @onClickConfirmChange="onChangeWeapon"
        @onOpenWeaponHintDialog="onOpenWeaponHintDialog"
      />
    </div>
    <!-- 逆塔防隊伍 -->
    <div v-if="teamTabType === PlanetWarType.Inner">
      <!-- 逆塔防道具編輯 -->
      <AntiTDDialogContent
        ref="antiTDDialogContent"
        v-if="antiTDDialogType === AntiTDDialogType.ItemEdit"
        :userInfo="userInfo"
        :antiTDHeroTeam="editAntiTDHeroTeam"
        @onClickHero="onClickAntiTDHero"
        @onTeamUpdate="onAntiTDTeamUpdate"
        @onSaveTeam="onSaveTeam"
        @onOpenAntiTDHintDialog="onOpenAntiTDHintDialog"
      />
      <!-- 逆塔防隊伍編輯 -->
      <AntiTDTeamEdit
        v-else
        :antiTDHeroTeam="editAntiTDHeroTeam"
        :startTeamMemberIndex="selectedHeroIndex"
        @onTeamUpdate="onAntiTDTeamUpdate"
        @onSaveTeam="onSaveTeam"
      />
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop, Emit, ModelSync } from 'vue-property-decorator';
import { HeroListData, HeroAntiTDNet } from '../../helper/interface/Hero';
import WeaponDialogContent from '@/components/AntiTD/WeaponDialogContent.vue';
import AntiTDDialogContent from '@/components/AntiTD/AntiTDDialogContent.vue';
import AntiTDTeamEdit from '@/components/AntiTD/AntiTDTeamEdit.vue';
import { PlanetUserInfoData } from '@/helper/interface/PlanetWar';
import { planetWarUnlockWeaponAPI } from '@/api/planetWar';
import { PlanetWarType, ResponseState, ResponseWeaponState } from '@/helper/enum/Common';
import { Message } from '@/helper/class/Common';
import { AntiTDDialogType } from '@/helper/enum/AntiTD';
import { heroEquipAPI } from '@/api/hero';

@Component({
  components: {
    WeaponDialogContent,
    AntiTDDialogContent,
    AntiTDTeamEdit,
  },
})
export default class AntiTDDialog extends Vue {
  @ModelSync('dialogVisible', 'change', { type: Boolean })
  isDialogVisible!: boolean;
  /** 星球大戰使用者訊息 */
  @Prop() private userInfo!: PlanetUserInfoData;
  /** 隊伍上的 英雄資料列表 */
  @Prop(Array) private antiTDHeroTeam!: HeroListData[];
  /** 是否顯示頁籤 */
  @Prop(Boolean) isShowPageTag!: boolean;
  /** 初始顯現的內容 */
  @Prop() private startTabType!: PlanetWarType;

  public $refs!: {
    antiTDDialogContent: AntiTDDialogContent;
  };

  /** 當前頁籤 */
  private teamTabType: PlanetWarType = PlanetWarType.Outter;

  /** 當前逆塔防介面類別 */
  private antiTDDialogType: AntiTDDialogType = AntiTDDialogType.ItemEdit;

  /** 紀錄進入生物兵器攜帶的狀態 */
  private beforeQueueWeaponIds: number[] = [];

  /** 逆塔防隊伍暫存 */
  private editAntiTDHeroTeam: Array<HeroListData | undefined> = [];

  /** 被選中的英雄 */
  private selectedHeroIndex: number = -1;

  /** 逆塔防跟塔防 enum */
  private PlanetWarType = PlanetWarType;

  /** 逆塔防切換道具跟英雄 enum */
  private AntiTDDialogType = AntiTDDialogType;

  /**文字資料*/
  private textData = {
    weapon: '表宇宙生物兵器',
    antiTD: '裡宇宙隊伍',
    weaponInfo: '解鎖後就可以在星球大戰中表宇宙自由使用',
    antiTDInfo: '裝備後就可以在星球大戰中裡宇宙自由使用',
    cancel: '取消',
  };

  onOpen() {
    // 紀錄當前攜帶的生物兵器
    if (this.teamTabType === PlanetWarType.Outter) {
      this.beforeQueueWeaponIds = [...this.userInfo.queueWeaponIds];
    }

    // 設定編輯中逆塔防隊伍暫存
    this.editAntiTDHeroTeam = JSON.parse(JSON.stringify(this.antiTDHeroTeam));

    // 設定開始頁籤
    this.teamTabType = this.startTabType;

    // 確保每次開起會是在道具編輯
    this.antiTDDialogType = AntiTDDialogType.ItemEdit;
  }

  /** 關閉前詢問 */
  async onBeforeClose(): Promise<void> {
    // 檢查不儲存
    if ((await this.isNoSave()) === false) {
      return;
    }
    this.onClose();
  }

  /** 關閉彈窗 */
  private onClose(): void {
    if (this.teamTabType === PlanetWarType.Inner && this.antiTDDialogType === AntiTDDialogType.ItemEdit) {
      /** 逆塔防重置道具列表狀態 */
      this.$refs.antiTDDialogContent.closeItemList();
    }
    // 通知內容彈窗關閉
    this.onCloseDialog();
  }

  /** 切換頁籤
   * @param teamTabType
   */
  private async onChangeTeamTabType(newTabType: PlanetWarType): Promise<void> {
    // 防呆
    if (this.teamTabType === newTabType) {
      return;
    }

    // 檢查不儲存
    if ((await this.isNoSave()) === false) {
      return;
    }

    // 更新介面類別
    this.teamTabType = newTabType;
  }

  /** 檢查不儲存 */
  private async isNoSave(): Promise<boolean> {
    // 確認是否不儲存
    switch (this.teamTabType) {
      // 生物兵器
      case PlanetWarType.Outter:
        return await this.isNoSaveWeapon();
      // 逆塔防
      case PlanetWarType.Inner:
        if (this.antiTDDialogType === AntiTDDialogType.TeamEdit) {
          this.antiTDDialogType = AntiTDDialogType.ItemEdit;
          return false;
        }
        return await this.isNoSaveAntiTDTeam();
      // 未知類別錯誤
      default:
        return true;
    }
  }

  /** 確認不儲存生物兵器 */
  private async isNoSaveWeapon(): Promise<boolean> {
    // 判斷生物兵器是否不同, 不同確認是否不儲存
    if (this.isWeaponSame() === false) {
      try {
        // 確認不儲存
        await this.$confirm(`所有的更改尚未儲存，確定要關閉嗎？`, '訊息', {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning',
        });

        // 恢復未編輯
        this.userInfo!.queueWeaponIds = [...this.beforeQueueWeaponIds];
      } catch (e) {
        // 取消關閉
        return false;
      }
    }
    return true;
  }

  /** 確認不儲存逆塔防隊伍 */
  private async isNoSaveAntiTDTeam(): Promise<boolean> {
    // 檢查是否有編輯隊伍
    if (this.isTeamEdited()) {
      try {
        // 確認不儲存
        await this.$confirm(`所有的更改尚未儲存，確定要關閉嗎？`, '訊息', {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning',
        });

        // 設定編輯中逆塔防隊伍暫存
        this.editAntiTDHeroTeam = JSON.parse(JSON.stringify(this.antiTDHeroTeam));
      } catch (e) {
        // 取消關閉
        return false;
      }
    }
    return true;
  }

  /** 隊伍是否有編輯 */
  private isTeamEdited(): boolean {
    for (let i = 0; i < this.editAntiTDHeroTeam.length; i++) {
      // 取得英雄HID
      const editHid = this.editAntiTDHeroTeam[i]?.hid ?? 0;
      const originHid = this.antiTDHeroTeam[i]?.hid ?? 0;

      // 檢查兩個英雄是否相等
      if (editHid !== originHid) {
        return true;
      }

      // 取得英雄
      const editHero = this.editAntiTDHeroTeam[i];
      const originHero = this.antiTDHeroTeam[i];

      // 不檢查空英雄的道具
      if (editHero == null || originHero == null) {
        continue;
      }

      // 檢查道具是否相等
      for (let j = 0; j <= editHero.equipItemIds.length; j++) {
        if (editHero.equipItemIds[j] !== originHero.equipItemIds[j]) {
          return true;
        }
      }
    }
    return false;
  }

  /** 檢查是否有修改生物兵器 */
  private isWeaponSame(): boolean {
    const queueWeaponIds = this.userInfo.queueWeaponIds;
    if (this.beforeQueueWeaponIds.length !== queueWeaponIds.length) {
      return false;
    }

    for (let i = 0; i < queueWeaponIds.length; ++i) {
      if (queueWeaponIds[i] !== this.beforeQueueWeaponIds[i]) {
        return false;
      }
    }

    return true;
  }

  /** 點擊英雄卡片
   * @param heroListData
   */
  private onClickAntiTDHero(heroIndex: number): void {
    this.selectedHeroIndex = heroIndex;
    this.antiTDDialogType = AntiTDDialogType.TeamEdit;
  }

  /** 逆塔防隊伍改變
   * @param newAntiTDTeam
   */
  private onAntiTDTeamUpdate(newAntiTDTeam: HeroListData[]): void {
    this.editAntiTDHeroTeam = newAntiTDTeam;
  }

  /** 儲存隊伍
   * @param heroAntiTDTeam
   */
  private async onSaveTeam(heroAntiTDTeam: HeroListData[]): Promise<void> {
    // 打包封包
    const data = {
      heroEquipList: heroAntiTDTeam.map<HeroAntiTDNet>((hero: HeroListData) => {
        return { hid: hero?.hid ?? 0, equipItemIds: hero?.equipItemIds ?? [] };
      }),
    };

    try {
      // API 更新英雄隊伍
      const response: any = await heroEquipAPI.put(data);
      if (response.result !== ResponseState.Success) {
        throw Error(response.result);
      }
      // 刷新 列表英雄
      await this.$$store.dispatch('getHeroList');
      // 刷新 上場英雄
      await this.$$store.dispatch('getHeroTeam');

      // 顯示設置成功
      Message.success('儲存成功');
      this.onClose();
    } catch (e) {
      Message.warn(`${e}`);
    }
  }

  /** 確認生物兵器變動 */
  private async onChangeWeapon(): Promise<void> {
    // 組成選項
    const data = `[${this.userInfo?.queueWeaponIds.toString()}]`;

    try {
      // API 更變上場生物兵器
      const response: any = await planetWarUnlockWeaponAPI.put(data);
      if (response.result !== ResponseState.Success) {
        // 拋錯誤訊息
        switch (response.result) {
          case ResponseWeaponState.WeaponNotOwn:
            throw new Error('非此用戶持有生物兵器');
          case ResponseWeaponState.WeaponIsNull:
            throw new Error('此生物兵器不存在');
          case ResponseWeaponState.WeaponUpgradeError:
            throw new Error('此生物兵器前一個等級未解鎖');
          case ResponseWeaponState.WeaponUnlock:
            throw new Error('此生物兵器不可解鎖');
          case ResponseWeaponState.GoldNotBuy:
            throw new Error('金幣不足');
          case ResponseWeaponState.CrystalNotBuy:
            throw new Error('水晶不足');
          default:
            throw new Error(`result: ${response.result} resMessage: ${response.resMessage}`);
        }
      }

      // 顯示設置成功
      Message.success('儲存成功');
      this.onClose();
    } catch (e) {
      Message.error(`${e}`);
    }
  }

  /** 打開生物兵器介紹 */
  @Emit('onOpenWeaponHintDialog')
  private onOpenWeaponHintDialog(): void {
    return;
  }

  /** 打開逆塔防介紹 */
  @Emit('onOpenAntiTDHintDialog')
  private onOpenAntiTDHintDialog(): void {
    return;
  }

  /** 關掉dialog */
  @Emit('onCloseDialog')
  private onCloseDialog(): void {
    return;
  }
}
</script>
<style scoped>
::v-deep .el-dialog {
  max-width: 930px;
  width: 95%;
  border-radius: 30px;
}
::v-deep .el-dialog__body {
  padding: 0px 0px 30px 0px;
}

::v-deep .el-dialog__header {
  padding: 0px 0px 0px 0px;
}

::v-deep .el-icon-close:before {
  font-size: 32px;
  color: #bfbfbf;
  font-weight: 700;
}
</style>
