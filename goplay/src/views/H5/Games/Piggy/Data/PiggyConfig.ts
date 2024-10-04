import UIHelper from '@/views/H5/Helper/UIHelper';

/** 模板是否照順序 */
export enum PiggyPatternOrderType {
  Random = 0,
  Order,
}

/** 波次難度 */
export enum PiggyWaveDifficulty {
  /** 簡單 */
  Easy = 0,
  /** 普通 */
  Normal,
  /** 困難 */
  Hard,
  /** Max */
  Max,
}

/** 小豬特效Id */
export enum PiggyEffectId {
  /** 免疫血量傷害 */
  Invincible = 345,
  /** 冰凍 */
  Freeze = 346,
  /** 死亡 */
  Dead = 347,
  /** 爆炸 */
  Explode = 601,
}

/** 小豬道具種類 */
export enum PiggyItemType {
  /** 普攻道具 */
  None = 0,
  /** 子彈類 */
  Bullet,
  /** 牛奶震波 */
  Shockwave,
  /** 西瓜落石 */
  RockFall,
  /** 青椒防護罩 */
  Invincible,
  /** 蘑菇地雷 */
  Mine,
  /** 凍結 */
  Freeze,
  /** 墨魚汁黑洞 */
  BlackHole,
  /** 蒜頭砲塔 */
  Turret,
}

/** 圖片key字串 */
export enum PiggyString {
  //#region images
  /** 背景圖 */
  Background = 'bg',
  /** 能量圖式 */
  EnergyIcon = 'energyIcon',
  /** 聲音開啟圖示 */
  SoundOnIcon = 'soundOnIcon',
  /** 聲音關閉圖示 */
  SoundOffIcon = 'soundOffIcon',
  /** 敵人出發平台 */
  Platform = 'platform',
  /** 英雄搭乘平台 */
  HeroPlatform = 'HeroPlatform',
  /** 發射按鈕 */
  Shoot = 'shoot',
  /** 使用中 */
  Using = 'Using',
  /** 子彈圖示 */
  BulletIcon = 'BulletIcon',
  /** 上鍵圖示 */
  UpKeyIcon = 'UpKeyIcon',
  /** 下鍵圖示 */
  DownKeyIcon = 'DownKeyIcon',
  /** 空白鍵圖示 */
  SpaceKeyIcon = 'SpaceKeyIcon',
  /** 子彈標籤 */
  BulletTag = 'BulletTag',
  /** 道具標籤 */
  ItemTag = 'ItemTag',
  /** 死亡效果 */
  onDeadEffect = 'onDeadEffect',
  //#endregion images
}

/** 小豬數值 */
export enum PiggyNumber {
  /** 續命能量 */
  ReviveEnergy = 200,
  /** 偷襲點數量 */
  AttackPointCount = 4,
  /** 偷襲點x座標 */
  AttackPointX = 125,
  /** 滿員爆炸扣魔力值 */
  FullAttackPointPenalty = -100,
  /** 敵人基礎移動速度 */
  EnemyBaseSpeed = 120,
  /** 英雄基礎移動速度 */
  HeroBaseSpeed = 500,
  /** 英雄初始血量 */
  HeroBaseHp = 1000,
  /** 砲塔攻擊次數 */
  TurretAttackCount = 10,
  /** 距離判斷誤差值 */
  DistanceToleranceValue = 10,
  /** UI背景/遮罩顏色 */
  IconBgColor = UIHelper.blackNumber,
  /** UI遮罩透明度 */
  IconAlpha = 0.5,
  /** 每一難度波次數 */
  WaveCountPerDifficulty = 3,
}

/** 小豬場景深度 */
export enum PiggyDepth {
  /** 背景 */
  Bg = -1,
  /** 使用者介面 */
  Gui = 370,
}
