<template>
  <el-dialog :visible.sync="isLoginFormVisible">
    <!-- 標題 -->
    <div slot="title" text="4xl [#666666]" font="bold">
      {{ textData.title }}
    </div>
    <!-- 登入的 input (正式不顯示) -->
    <div v-if="isLoginOption" class="flex flex-col h-40 justify-evenly" text="2xl">
      <!-- 帳號 -->
      <label>
        {{ textData.account }}
        <input
          v-model.trim="account"
          data="ACCOUNT_INPUT"
          type="text"
          class="rounded-xl"
          p="x-2 y-1"
          border="1 solid [#707070]"
        />
      </label>
      <!-- 密碼 -->
      <label>
        {{ textData.password }}
        <input
          v-model.trim="password"
          data="PASSWORD_INPUT"
          type="password"
          class="rounded-xl"
          p="x-2 y-1"
          border="1 solid [#707070]"
        />
      </label>
    </div>
    <!-- 兩個按鈕第一個正常登入輸入框輸入密碼第二個因才網登入 -->
    <div slot="footer" class="flex flex-col items-center">
      <button
        v-if="isLoginOption"
        data="SUBMIT_LOGIN"
        class="w-96 h-20 rounded-2xl yellowGradient <sm:w-4/5"
        text="3xl [#FFF]"
        @click="onNormalLogin"
      >
        {{ textData.checkBtn }}
      </button>
      <button v-else class="w-96 h-20 rounded-2xl yellowGradient <sm:w-4/5" text="3xl [#FFF]" @click="onGoLink">
        {{ textData.signIn }}
      </button>
      <!-- 輸入框開關 -->
      <div @click="isLoginOption = !isLoginOption">-</div>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Emit, ModelSync } from 'vue-property-decorator';
import config from '@/config/setting';
import { GATagActionIdType, GATagCategoryIdType, GATagActionStrType, GATagCategoryStrType } from '@/helper/enum/Common';
import { Load, Message } from '@/helper/class/Common';
import { LoginOption } from '@/config/Common';
import { sendGAEvent } from '@/helper/fnc/common';
import { LoginInfo } from '@/helper/interface/Login';

@Component({})
export default class Login extends Vue {
  /** 彈窗開關 */
  @ModelSync('isVisible', 'change', { type: Boolean })
  private isLoginFormVisible!: boolean;

  /** 帳號 */
  private account: string = '';
  /** 密碼 */
  private password: string = '';
  /** 判斷初始顯示要不要有輸入框 */
  private isLoginOption: boolean = config.loginOption === LoginOption.Dev;

  /** 文字資料 */
  private textData = {
    title: `${this.$t('common.signPage')}`,
    account: `${this.$t('common.account')}`,
    password: `${this.$t('common.pwd')}`,
    checkBtn: `${this.$t('common.confirm')}`,
    signIn: `${this.$t('common.signIn')}`,
  };

  /** 一般登入 */
  private async onNormalLogin(): Promise<void> {
    // 防呆
    if (this.account === '' || this.password === '') {
      Message.warn('帳號密碼不能為空');
      return;
    }

    // 一般登入資訊
    const loginInfo: LoginInfo = {
      account: this.account,
      password: this.password,
    };

    try {
      // API 一般登入
      await this.$$store.dispatch('login', loginInfo);

      // 介面刷新
      location.reload();
    } catch (e) {
      Message.error(`${e}`);
      return;
    }
  }

  /** 跳轉因材網登入 */
  private async onGoLink(): Promise<void> {
    // GA 跳轉至因材網登入事件
    await sendGAEvent(
      GATagCategoryIdType.LinkAdlLogin,
      GATagActionIdType.LinkAdlLoginBefore,
      '登入',
      this.$gtag,
      GATagActionStrType.LinkAdlLoginBefore,
      GATagCategoryStrType.LinkAdlLoginBefore
    );

    location.replace(`${config.adlWebPath}`);
  }

  /** 關閉登入視窗 */
  @Emit('onCloseLogin')
  private onCloseLogin(): void {
    return;
  }
}
</script>
<style scoped>
>>> .el-dialog__body {
  padding: 0px;
}
>>> .el-dialog__headerbtn {
  right: 30px;
}
>>> .el-icon-close:before {
  font-size: 36px;
  font-weight: 700;
}
>>> .el-dialog {
  max-width: 720px;
  border-radius: 30px;
}
@media (max-width: 1024px) {
  >>> .el-dialog {
    width: 85%;
  }
}
</style>
