import {
  UserInfo,
  UniverseEnergyData,
  LoginInfo,
  AdlLoginInfo,
  WebAppConfig,
  UserInfo2022Data,
} from '@/helper/interface/Login';
import {
  UserRole,
  GradeType,
  CountyType,
  ResponseState,
  UniverseEnergyType,
  BroadcastEventType,
  AppIdType,
  GATagCategoryIdType,
  GATagActionIdType,
  GATagActionStrType,
  GATagCategoryStrType,
  LocalStorageStr,
  CookieStr,
} from '@/helper/enum/Common';
import { ReturnGetters, ActionContext } from '@/types/store';
import {
  universeEnergyAPI,
  universeEnergyInfoAPI,
  loginOpAPI,
  adlEduAPI,
  loginUserAPI,
  logoutUserAPI,
  webAppConfigAPI,
  userInfo2022API,
} from '@/api/login';
import { handleAPIError, handleDeviceStr, sendGAEvent } from '@/helper/fnc/common';
import { Message } from '@/helper/class/Common';
import router from '@/router';
import { Setting } from '@/config/Common';
import { userAuthorityAPI } from '@/api/userAuthority';
import config from '@/config/setting';
import { LoginType } from '@/helper/enum/Login';
import { mailNotificationAPI } from '@/api/notice';
import { MessageBox } from 'element-ui';

interface LoginState {
  /** 使用者資訊 */
  userInfo: UserInfo;
  /** 使用者權限 */
  authority: UserRole;
  /** 因材網轉跳資料 */
  loginAdlInfo: AdlLoginInfo;
  /** 宇宙能量 */
  universeEnergy: number;
  /** 補充宇宙能量 */
  recoveryEnergy: number;
  /** 節慶活動資料 */
  webAppConfig: WebAppConfig;
  /** 是否有新通知 */
  isNewNotice: boolean;
}

const moduleState: LoginState = {
  userInfo: {} as UserInfo,
  authority: UserRole.None,
  loginAdlInfo: {} as AdlLoginInfo,
  universeEnergy: 0,
  recoveryEnergy: 0,
  webAppConfig: {
    homeBanner: [],
    contestBanner: [],
    homeBGM: '',
    sprinklesUrl: '',
    timeBackgroundColor: '',
    buttonBackgroundImg: '',
    coursebuttonImg: '',
    contestbuttonImg: '',
    planetbuttonImg: '',
    roomcontestbuttonImg: '',
    interstellarbuttonImg: '',
    titleImg: '',
    topNavBackgroundColor: '',
  },
  isNewNotice: false,
};

const moduleGetters = {
  /** 使用者ID
   * @param state
   */
  userUid(state: LoginState): number {
    return state.userInfo?.uid ?? -1;
  },

  /** 使用者名稱
   * @param state
   */
  userName(state: LoginState): string {
    return state.userInfo?.name ?? '';
  },

  /** 使用者權限
   * @param state
   */
  userRole(state: LoginState): UserRole {
    return state.userInfo?.roleId ?? UserRole.None;
  },

  /** 使用者學校代號
   * @param state
   */
  userSchoolId(state: LoginState): number {
    return state.userInfo?.schoolId ?? 0;
  },

  /** 使用者校區代號
   * @param state
   */
  userSchoolCountyId(state: LoginState): CountyType {
    return state.userInfo?.schoolCountyId ?? CountyType.None;
  },

  /** 使用者學校名稱
   * @param state
   */
  userSchoolName(state: LoginState): string {
    return state.userInfo?.schoolName ?? '---';
  },

  /** 使用者年級
   * @param state
   */
  userGradeNumber(state: LoginState): GradeType {
    return state.userInfo?.gradeNum ?? GradeType.g0;
  },

  /** 使用者TOKEN
   * @param state
   */
  userToken(state: LoginState): string {
    return state.userInfo?.token ?? '';
  },

  /** 使用者權限
   * @param state
   */
  userAuthority(state: LoginState): UserRole {
    return state.authority;
  },

  /** 是否有學校資料
   * @param state
   */
  hasSchool(state: LoginState): boolean {
    return state.userInfo?.schoolId !== 0 ?? false;
  },

  /** 是否有登入
   * @param state
   */
  isLogin(state: LoginState): boolean {
    return state.userInfo.uid > 0;
  },
};
type Getters = ReturnGetters<typeof moduleGetters>;

const mutations = {
  /** 設定個人資訊
   * @param state
   * @param userInfo
   */
  setUserInfo(state: LoginState, userInfo: UserInfo) {
    state.userInfo = userInfo;
  },

  /** 設定使用者權限
   * @param state
   * @param userAuthority
   */
  setUserAuthority(state: LoginState, userAuthority: UserRole) {
    state.authority = userAuthority;
  },

  /** 設定因材網登入
   * @param state
   * @param loginAdlInfo
   */
  setAdlLoginInfo(state: LoginState, loginAdlInfo: AdlLoginInfo) {
    state.loginAdlInfo = loginAdlInfo;
  },

  /** 設定宇宙能量
   * @param state
   * @param newUniverseEnergy
   */
  setUniverseEnergy(state: LoginState, newUniverseEnergy: number) {
    state.universeEnergy = newUniverseEnergy;
  },

  /** 設定補充宇宙能量
   * @param state
   * @param newRecoveryEnergy
   */
  setRecoveryEnergy(state: LoginState, newRecoveryEnergy: number) {
    state.recoveryEnergy = newRecoveryEnergy;
  },

  /** 設定Web介面設定
   * @param state
   * @param newPartySetting
   */
  setWebAppConfig(state: LoginState, newWebAppConfig: WebAppConfig) {
    state.webAppConfig = newWebAppConfig;
  },

  /** 設定登出 */
  setLogout(state: LoginState) {
    state.userInfo = {} as UserInfo;
    state.authority = UserRole.None;
    state.universeEnergy = 0;
    state.recoveryEnergy = 0;
  },

  /** 設定是否有新通知 */
  setHasNewNotice(state: LoginState, isNew: boolean) {
    state.isNewNotice = isNew;
  },
};

const actions = {
  /** 取得宇宙能量
   * @param context
   */
  async getUniverseEnergy(context: ActionContext<LoginState, Getters>): Promise<UniverseEnergyData> {
    try {
      // API 取得宇宙能量資訊
      const response: any = await universeEnergyAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 取得宇宙能量資訊
      const result = response as UniverseEnergyData;

      // 設定當前宇宙能量
      context.commit('setUniverseEnergy', result.energy);
      // 更新補充宇宙能量
      context.commit('setRecoveryEnergy', result.recoveryEnergy);

      // 返回資訊
      return result;
    } catch (e) {
      Message.error(`${e}`);
      return { energy: -1, recoveryEnergy: -1 };
    }
  },

  /** 取得Web介面設定
   * @param context
   */
  async getWebAppConfig(context: ActionContext<LoginState, Getters>): Promise<void> {
    try {
      // API 取得Web介面設定
      const response: any = await webAppConfigAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 設定當前Web介面設定
      context.commit('setWebAppConfig', response.config);
    } catch (e) {
      Message.error(`${e}`);
    }
  },

  /** 使用宇宙能量
   * @param context
   * @param universeEnergyType
   */
  async useUniverseEnergy(
    context: ActionContext<LoginState, Getters>,
    universeEnergyType: UniverseEnergyType
  ): Promise<boolean> {
    // 確認使用宇宙能量
    const isConfirm = await context.dispatch('checkUseUniverseEnergy', universeEnergyType);
    if (isConfirm === false) {
      return false;
    }

    // 組成封包
    const data = {
      eventName: universeEnergyType,
    };

    try {
      // API 扣除宇宙能量
      const response: any = await universeEnergyAPI.post(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 更新當前宇宙能量
      context.commit('setUniverseEnergy', response.energy);
      return true;
    } catch (e) {
      Message.error(`${e}`);
      return false;
    }
  },

  /** 確認使用宇宙能量
   * @param context
   * @param universeEnergyType
   */
  async checkUseUniverseEnergy(
    context: ActionContext<LoginState, Getters>,
    universeEnergyType: UniverseEnergyType
  ): Promise<boolean> {
    try {
      // 取得宇宙能量耗能
      const energyCost: number = await context.dispatch('getUniverseEnergyCost', universeEnergyType);
      // 消耗0，不需再次確認
      if (energyCost === 0) {
        return true;
      }

      // 宇宙能量不足
      if (energyCost > context.state.universeEnergy) {
        await MessageBox({
          title: '訊息',
          message: `<p style="color: #a5a5a5; line-height: 1.5">宇宙<span style="color: #FF5656">能量不足</span><br/>需要消耗<span style="color: #00CCCE">${energyCost}</span>點</p>`,
          showCancelButton: false,
          confirmButtonText: '確定',
          center: true,
          dangerouslyUseHTMLString: true,
        });
        return false;
      }
      // 確認消耗宇宙能量
      else {
        // 確認訊息框
        await MessageBox({
          title: '提示',
          message: `<p style="color: #a5a5a5; line-height: 1.5">是否消耗<span style="color: #00CCCE">${energyCost}</span>點宇宙能量</p>`,
          showCancelButton: true,
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          center: true,
          type: 'success',
          dangerouslyUseHTMLString: true,
        });

        // 確定消耗
        return true;
      }
    } catch {
      // 取消消耗
      return false;
    }
  },

  /** 取得宇宙能量消耗量
   * @param context
   * @param universeEnergyType
   */
  async getUniverseEnergyCost(
    context: ActionContext<LoginState, Getters>,
    universeEnergyType: UniverseEnergyType
  ): Promise<number> {
    // 組成封包
    const data = {
      eventName: universeEnergyType,
    };

    try {
      // API 扣除宇宙能量
      const response: any = await universeEnergyInfoAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }

      // 取得
      return Number(response.subEnergy);
    } catch (e) {
      Message.error(`${e}`);
      return 9999;
    }
  },

  /** 轉跳因材網遊戲
   * @param context
   * @param gameLinkId
   */
  async getAdlEduGameLink(context: ActionContext<LoginState, Getters>, gameLinkId: string): Promise<number> {
    // 組成封包
    const data = {
      game_link_id: gameLinkId,
    };

    try {
      // API 取得因材網課程單元遊戲點對應的賽事編號
      const response: any = await adlEduAPI.fetch(data);
      if (response.result !== ResponseState.Success) {
        handleAPIError(response.result, response.resMessage);
      }

      return +response.contestId;
    } catch (e) {
      Message.error(`${e}`);
      return -1;
    }
  },

  /** 取得使用者權限配置
   * @param context
   */
  async getUserAuthority(context: ActionContext<LoginState, Getters>): Promise<void> {
    try {
      // 使用者身分
      const userRole = context.getters.userRole;

      // API 取得使用者權限配置
      const response: any = await userAuthorityAPI.fetch({});
      switch (response.result) {
        // 有編輯權限
        case ResponseState.Success:
          // 設定為當前身分的編輯權限
          context.commit('setUserAuthority', userRole);
          break;
        // 無編輯權限
        case ResponseState.AclAccessDeny:
          // SUPER仍然設定權限, 不然設定為無權限的學生
          context.commit('setUserAuthority', userRole === UserRole.SUP ? UserRole.SUP : UserRole.STU);
          break;
        // 未知錯誤
        default:
          handleAPIError(response.result, response.resMessage);
          break;
      }
    } catch (e) {
      Message.error(`${e}`);
    }
  },

  /** 取得用戶是否有新通知
   *  @param context
   */
  async getNotification(context: ActionContext<LoginState, Getters>): Promise<void> {
    try {
      // API 用戶登入
      const response: any = await mailNotificationAPI.fetch({});
      if (response.result !== ResponseState.Success) {
        // 報錯
        handleAPIError(response.result, response.resMessage);
      }

      context.commit('setHasNewNotice', response.newMailFlag > 0);
    } catch (e) {
      context.commit('setHasNewNotice', false);
      Message.error(`${e}`);
    }
  },

  /** OpenId登入
   * @param context
   * @param openIdtoken
   */
  async loginOp(context: ActionContext<LoginState, Getters>, openIdtoken: string): Promise<void> {
    // 組成封包
    const data = {
      openIdtoken,
      loginType: LoginType.device,
      appId: AppIdType.AdlEdu_VSP_Student,
      deviceModel: `${handleDeviceStr(navigator.userAgent)}`,
    };

    // API 用戶登入
    const response: any = await loginOpAPI.post(data);
    if (response.result !== ResponseState.Success) {
      // 報錯
      handleAPIError(response.result, response.resMessage);
    }

    // 登入成功, 儲存個人資訊
    await context.dispatch('onLogin', JSON.parse(response.data));

    // GA 因材網登入完畢跳轉回來事件
    await sendGAEvent(
      GATagCategoryIdType.LinkAdlLogin,
      GATagActionIdType.LinkAdlLoginAfter,
      `登入`,
      router.app.$gtag,
      GATagActionStrType.LinkAdlLoginAfter,
      GATagCategoryStrType.LinkAdlLoginAfter
    );
  },

  /** 一般登入
   * @param context
   * @param data
   */
  async login(context: ActionContext<LoginState, Getters>, loginInfo: LoginInfo): Promise<void> {
    // 組成封包
    const data = {
      account: loginInfo.account,
      password: loginInfo.password,
      device: LoginType.device,
      origin: '33',
      qRCode: '',
      appId: AppIdType.AdlEdu_VSP_Student,
      deviceModel: `${handleDeviceStr(navigator.userAgent)}`,
    };

    // API 一般登入
    const response: any = await loginUserAPI.post(data);
    if (response.result !== ResponseState.Success) {
      handleAPIError(response.result, response.resMessage);
    }

    // 登入成功, 儲存個人資訊
    await context.dispatch('onLogin', JSON.parse(response.data));
  },

  /** 登出
   * @param context
   */
  async logout(context: ActionContext<LoginState, Getters>): Promise<void> {
    // API 登出
    const response: any = await logoutUserAPI.post({});
    if (response.result !== ResponseState.Success) {
      handleAPIError(response.result, response.resMessage);
    }

    // 登出成功
    await context.dispatch('onLogout');
  },

  /** 登入成功
   * @param context
   * @param userInfo
   */
  async onLogin(context: ActionContext<LoginState, Getters>, userInfo: UserInfo): Promise<void> {
    // 儲存個人資料
    context.commit('setUserInfo', userInfo);

    // 儲存個人資料到localStorage
    localStorage.setItem(`${LocalStorageStr.UserInfo}`, JSON.stringify(userInfo));

    // 處理GA獲取UserId
    router.app.$gtag.set({ user_id: userInfo.uid });

    // 移除因材網轉轉跳登入Cookie
    router.app.$cookie.remove(`${CookieStr.AdlGame}`);
  },

  /** 登出清出資料
   * @param context
   */
  async onLogout(context: ActionContext<LoginState, Getters>): Promise<void> {
    // 移除使用者資訊
    localStorage.removeItem(`${LocalStorageStr.UserInfo}`);

    // 設定登出
    context.commit('setLogout');

    // 判斷是否需要第三方登出
    if (config.logOutPath !== null) {
      window.open(`${config.logOutPath}`);
    }

    // 廣播分頁登出
    try {
      new BroadcastChannel(Setting.boardcastKey).postMessage([BroadcastEventType.logout]);
    } catch (e) {
      console.log(`BroadcastChannel Error: ${e}`);
    }
  },

  /** 取得使用者2022成就
   * @param context
   */
  async getUserInfo2022(context: ActionContext<LoginState, Getters>): Promise<UserInfo2022Data | undefined> {
    try {
      // API 取得使用者2022成就
      const response: any = await userInfo2022API.fetch({});
      if (response.result !== ResponseState.Success) {
        // 顯示錯誤
        handleAPIError(response.result, response.resMessage);
      }
      // 返回資訊
      return response.profile;
    } catch (e) {
      Message.error(`${e}`);
    }
  },
};

export default {
  state: moduleState,
  getters: moduleGetters,
  mutations,
  actions,
};
