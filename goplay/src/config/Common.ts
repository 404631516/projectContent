/** Root Location */
export enum RootLocation {
  Dev = 'devAdlHeroWeb',
  Release = 'relAdlHeroWeb',
  EGame = 'eGame',
  Hero = 'hero',
  Hero2 = 'hero2',
}

/** 題庫名稱 */
export enum QuizEdit {
  Dev = `/devAdlQuizEdit/#/`,
  Release = `/relAdlQuizEdit/#/`,
  EGame = `/eGameAdlQuizEdit/#/`,
  AdlEdu = `/adlQuizEdit/#/`,
}

/** 預設登入方式 */
export enum LoginOption {
  /** 開發: 帳號密碼 */
  Dev = 0,
  /** 因材網: openId轉跳 */
  Adl = 1,
}

/** 語系 */
export enum Lang {
  EnUS = 'en-US',
  ZhTW = 'zh-TW',
  ZhCH = 'zh-CN',
}

/** 連線設定 */
export class Setting {
  /** Host網址 */
  public static readonly hostName = {
    Test: `http://210.64.10.163`,
    TN: 'https://heroj7.tn.edu.tw',
    Adl: `https://adl.edu.tw/${RootLocation.Hero}`,
    Adl2: `https://adl.edu.tw/${RootLocation.Hero2}`,
  };
  /** 雲儲存 */
  public static readonly cloudStorage = '/storage/enable-ireading/';
  /** 因材網跳轉網址 */
  public static readonly adlWebPath = '/opid/AdlEdu/Auth?op=adl';
  /** 登出第三方網址設置 */
  public static readonly adlLogOutPath = `https://adl.edu.tw/modules.php?act=logout`;
  /** 廣播Key */
  public static readonly boardcastKey = 'heroj7';
}
