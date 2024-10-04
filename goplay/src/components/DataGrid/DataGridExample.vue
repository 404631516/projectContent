<template>
  <div class="app-container">
    <!-- 帳號列表(不鎖定欄位可以自由查詢) -->
    <DataGrid
      :fetchApi="HeroApiListDataAPI.getUserListData"
      :columns="columns"
      :actions="actions"
      :actionColumnWidth="200"
      @gotoCoinLogPage="gotoCoinLogPage"
      @gotoHeroListPage="gotoHeroListPage"
      :debugFlag="true"
    ></DataGrid>
    <!-- 帳號列表(鎖定帳號欄位且給予預設值) -->
    <DataGrid
      :fetchApi="HeroApiListDataAPI.getUserListData"
      :columns="columns"
      :actions="actions"
      :actionColumnWidth="200"
      :lockFilterField="'account'"
      @gotoCoinLogPage="gotoCoinLogPage"
      @gotoHeroListPage="gotoHeroListPage"
      :debugFlag="true"
    ></DataGrid>
    <!-- 帳號列表(鎖定角色欄位且給予Enum查詢選項) -->
    <DataGrid
      :fetchApi="HeroApiListDataAPI.getUserListData"
      :columns="columns"
      :actions="actions"
      :actionColumnWidth="200"
      :lockFilterField="'role'"
      @gotoCoinLogPage="gotoCoinLogPage"
      @gotoHeroListPage="gotoHeroListPage"
      :debugFlag="true"
    ></DataGrid>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Action, Column } from '@/helper/interface/DataGrid';
import { HeroApiListDataAPI } from '@/api/heroApiListData';
import DataGrid from './DataGrid.vue';
import { User, UserRole } from '@/hero-api/entity/user.entity';
import { Message } from '@/helper/class/Common';
import imgPath from '@/config/imgPath/imgPath';
import { FilterType } from '@/helper/enum/DataGrid';

@Component({
  components: {
    DataGrid,
  },
})
export default class DataGridExample extends Vue {
  /** Import給Vue使用 */
  protected readonly HeroApiListDataAPI = HeroApiListDataAPI;

  /** 使用者角色文字轉換表 */
  protected readonly userRoleTransformMap: Record<number, string> = {
    [UserRole.Admin]: '管理者',
    [UserRole.Student]: '學生',
    [UserRole.Parents]: '家長',
    [UserRole.Teacher]: '老師',
    [UserRole.Principal]: '校長',
    [UserRole.Agent]: '代理商',
    [UserRole.Mayor]: '縣市管理員',
  };

  /** 資料表欄位 */
  protected columns: Column[] = [
    { label: this.$t('form.UID').toString(), key: 'uid', width: 80, sortable: false, filterType: FilterType.Text },
    {
      label: this.$t('form.account').toString(),
      key: 'account',
      width: 220,
      sortable: true,
      defaultFieldValue: 'admin',
      filterType: FilterType.Text,
    },
    {
      label: this.$t('form.username').toString(),
      key: 'username',
      width: 140,
      sortable: true,
      filterType: FilterType.Text,
    },
    {
      label: this.$t('form.role').toString(),
      key: 'role',
      sortable: true,
      filterType: FilterType.Enum,
      transform: (key: UserRole) => this.userRoleTransformMap[key],
      filterEnum: [
        { label: this.userRoleTransformMap[UserRole.Admin], value: UserRole.Admin.toString() },
        { label: this.userRoleTransformMap[UserRole.Student], value: UserRole.Student.toString() },
        { label: this.userRoleTransformMap[UserRole.Parents], value: UserRole.Parents.toString() },
        { label: this.userRoleTransformMap[UserRole.Teacher], value: UserRole.Teacher.toString() },
        { label: this.userRoleTransformMap[UserRole.Principal], value: UserRole.Principal.toString() },
        { label: this.userRoleTransformMap[UserRole.Agent], value: UserRole.Agent.toString() },
        { label: this.userRoleTransformMap[UserRole.Mayor], value: UserRole.Mayor.toString() },
      ],
    },
    { label: '建立時間', key: 'createdAt', expand: true, sortable: false, filterType: FilterType.Text },
  ];

  /** 資料表操作功能 */
  protected actions: Action[] = [
    { text: '', eventId: 'gotoCoinLogPage', type: 'primary', icon: imgPath.currencyUsd, tip: '查找貨幣歷程' },
    { text: '', eventId: 'gotoHeroListPage', type: 'success', icon: imgPath.accountEye, tip: '查找英雄列表' },
  ];

  /** 查找貨幣歷程 */
  protected gotoCoinLogPage(user: User): void {
    Message.info(`查找 ${user.username} 貨幣歷程`);
  }

  /** 查找英雄列表 */
  protected gotoHeroListPage(user: User): void {
    Message.info(`查找 ${user.username} 英雄列表`);
  }
}
</script>

<style scoped></style>
