export enum TestString {
  //#region 動畫
  /** 動畫設定檔 */
  JsonAnims = 'JsonAnims',
  /** 受傷FX動畫Key */
  AnimHurt = 'AnimHurt',
  /** 加速FX動畫Key */
  AnimSpeedUp = 'AnimSpeedUp',
  /** 身體強化FX動畫Key */
  AnimInvincible = 'AnimInvincible',
  /** 魚呼吸FX動畫Key */
  AnimFishBreath = 'AnimFishBreath',
  //#endregion
  //#region 圖片
  /** 背景 */
  Background = 'Background',
  /** 浪花 */
  Wave = 'Wave',
  /** 分數圖示 */
  IconScore = 'IconScore',
  /** 環保加成圖示 */
  IconEnvironmentalAddition = 'IconEnvironmentalAddition',
  /** 船 */
  Boat = 'Boat',
  /** 釣魚線 */
  String = 'string',
  /** 漁網 */
  FishingNet = 'FishingNet',
  /** 爆炸特效圖 */
  BoomFX = 'BoomFX',
  /** 加速特效圖 */
  SpeedUpFx = 'SpeedUpFx',
  /** 身體強化特效圖 */
  InvincibleFx = 'InvincibleFx',
  /** 魚呼吸特效 */
  FishBreathFx = 'FishBreathFx',
  //#endregion

  //#region 音樂
  /** 受傷音效 */
  AudioHurt = 'AudioHurt',
  /** 魚網音效 */
  AudioFishingNet = 'AudioFishingNet',
  /** 發射魚鉤音效 */
  AudioCast = 'AudioCast',
  /** 魚掉落音效 */
  AudioFishDrop = 'AudioDrop',
  /** 魚掙扎音效 */
  AudioFishJump = 'AudioJump',
  /** 身體強化音效 */
  AudioInvisible = 'AudioInvisible',
  /** 加速音效 */
  AudioSpeedUp = 'AudioSpeedUp',
  /** 捕到魚的音效 */
  AudioCatch = 'AudioCatch',
  //#endregion
}

export enum TestNumber {
  /** 海平面中央 */
  SeaCenter = 512,
  /** 海平面位置Y */
  SeaLevel = 230,
  /** 海水高度 */
  SeaHeight = 200,
  /** 魚動畫SpriteSheet寬高 */
  FishFramePixel = 119,
}

/** 畫面深度 */
export enum TestDepth {
  /** 背景 */
  Background = -1,
  /** 英雄 */
  Hero = 1,
  /** UI */
  UI = 3,
}

/** 道具功能 */
export enum TestItemFunction {
  /** 傾盆大魚 */
  DropFish = 0,
  /** 加速 */
  SpeedUp,
  /** 身體強化 */
  Invincible,
  /** 漁網 */
  FishingNet,
}

/** 魚特效種類 */
export enum TestFishFx {
  /** 沒有特效 */
  None = 0,
  /** 呼吸特效 */
  BreathFX = 1,
}

/** 環保加成種類 */
export enum EnvironmentalAdditionType {
  /** 沒有加成 */
  None = 0,
  /** 一般環保加成 */
  Normal = 1,
}
