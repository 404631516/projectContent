import { Setting, QuizEdit, LoginOption, Lang, RootLocation } from '@/config/Common';

/** 鏈結伺服器設定 */
interface SettingInfo {
  /** api 導向 */
  HttpPath: string;
  /** 強聯網server url */
  socketServerUrl: string;
  /** 動態圖片路徑 */
  imgUrl: string;
  /** 雲儲存 */
  cloudStorage: string;
  /** 題庫編輯 */
  quizEdit: string;
  /** 因材網登入導向網址 */
  adlWebPath: string;
  /** 首頁網址 */
  homePath: string;
  /** 因材網登出導向網址 */
  logOutPath: string | null;
  /** 登入方式設定 0=開發 1=正式 */
  loginOption: LoginOption;
  /** 語系設定 */
  lang: string;
  /** 是否顯示log */
  log: boolean;
  /** 是否掩飾未填資料 */
  isCoverUp: boolean;
  /** 是否開放抓取服務端Cookies(因為本地開發會有跨域問題,build版時再開啟) */
  isWithCredentials: boolean;
}
/** 本地測試+本地伺服器 */
const localConfig = {
  HttpPath: `http://${window.location.hostname}:10010/`,
  socketServerUrl: `http://${window.location.hostname}:8081`,
  imgUrl: '',
  cloudStorage: `http://${window.location.hostname}:9000/enable-ireading/`,
  quizEdit: `http://${window.location.hostname}:3333`,
  adlWebPath: '',
  homePath: '/',
  logOutPath: null,
  loginOption: LoginOption.Dev,
  lang: Lang.ZhTW,
  log: true,
  isCoverUp: false,
  isWithCredentials: false,
};
/** 本地測試+測試伺服器 */
const testDB = {
  HttpPath: `${Setting.hostName.Test}:10010/`,
  socketServerUrl: `${Setting.hostName.Test}:8081`,
  imgUrl: '',
  cloudStorage: `${Setting.hostName.Test}:9000/enable-ireading/`,
  quizEdit: `${Setting.hostName.Test}:3333`,
  adlWebPath: '',
  homePath: '/',
  logOutPath: null,
  loginOption: LoginOption.Dev,
  lang: Lang.ZhTW,
  log: true,
  isCoverUp: false,
  isWithCredentials: false,
};
/** AdlEdu 台南測試版 */
const adlEduDev = {
  HttpPath: `https://${window.location.hostname}/devAdlHeroApi`,
  socketServerUrl: `https://${window.location.hostname}/devAdlHeroApi`,
  imgUrl: `https://${window.location.hostname}/devAdlHeroWeb`,
  cloudStorage: `${Setting.hostName.TN}${Setting.cloudStorage}`,
  quizEdit: `${Setting.hostName.TN}${QuizEdit.Dev}`,
  adlWebPath: '',
  homePath: `/${RootLocation.Dev}/`,
  logOutPath: null,
  loginOption: LoginOption.Dev,
  lang: Lang.ZhTW,
  log: false,
  isCoverUp: false,
  isWithCredentials: false,
};
/** AdlEdu 台南線上測試版 */
const adlEduRelease = {
  HttpPath: `https://${window.location.hostname}/relAdlHeroApi`,
  socketServerUrl: `https://${window.location.hostname}/relAdlHeroApi`,
  imgUrl: `https://${window.location.hostname}/relAdlHeroWeb`,
  cloudStorage: `${Setting.hostName.TN}${Setting.cloudStorage}`,
  quizEdit: `${Setting.hostName.TN}${QuizEdit.Release}`,
  adlWebPath: '',
  homePath: `/${RootLocation.Release}/`,
  logOutPath: null,
  loginOption: LoginOption.Dev,
  lang: Lang.ZhTW,
  log: false,
  isCoverUp: false,
  isWithCredentials: false,
};
/** AdlEdu 台南EGame線上活動 */
const adlEduEGame = {
  HttpPath: `https://${window.location.hostname}/eGameAdlHeroApi`,
  socketServerUrl: `https://${window.location.hostname}/eGameAdlHeroApi`,
  imgUrl: `https://${window.location.hostname}/eGame`,
  cloudStorage: `${Setting.hostName.TN}${Setting.cloudStorage}`,
  quizEdit: `${Setting.hostName.TN}${QuizEdit.EGame}`,
  adlWebPath: '',
  homePath: `/${RootLocation.EGame}/`,
  logOutPath: null,
  loginOption: LoginOption.Dev,
  lang: Lang.ZhTW,
  log: false,
  isCoverUp: false,
  isWithCredentials: false,
};

/** AdlEdu 因材網正式線上 */
const adlEdu = {
  HttpPath: `${Setting.hostName.Adl}/api`,
  socketServerUrl: `${Setting.hostName.Adl}/api`,
  imgUrl: `${Setting.hostName.Adl}`,
  cloudStorage: `${Setting.hostName.Adl}${Setting.cloudStorage}`,
  quizEdit: `${Setting.hostName.Adl}${QuizEdit.AdlEdu}`,
  adlWebPath: `${Setting.hostName.Adl}${Setting.adlWebPath}`,
  homePath: `/${RootLocation.Hero}/`,
  logOutPath: Setting.adlLogOutPath,
  loginOption: LoginOption.Adl,
  lang: Lang.ZhTW,
  log: false,
  isCoverUp: true,
  isWithCredentials: true,
};
/** AdlEdu2 因材網正式線上(無休版) */
const adlEdu2 = {
  HttpPath: `${Setting.hostName.Adl2}/api`,
  socketServerUrl: `${Setting.hostName.Adl2}/api`,
  imgUrl: `${Setting.hostName.Adl2}`,
  cloudStorage: `${Setting.hostName.Adl2}${Setting.cloudStorage}`,
  quizEdit: `${Setting.hostName.Adl2}${QuizEdit.AdlEdu}`,
  adlWebPath: `${Setting.hostName.Adl2}${Setting.adlWebPath}`,
  homePath: `/${RootLocation.Hero2}/`,
  logOutPath: Setting.adlLogOutPath,
  loginOption: LoginOption.Adl,
  lang: Lang.ZhTW,
  log: false,
  isCoverUp: true,
  isWithCredentials: true,
};

/** 主設定(包正式版本時需包 adlEdu 及 adlEdu2 兩個) */
const config: SettingInfo = {
  // ...localConfig,
  ...testDB,
  // ...adlEduDev,
  // ...adlEduRelease,
  // ...adlEduEGame,
  // ...adlEdu,
  // ...adlEdu2,
};
export default config;
