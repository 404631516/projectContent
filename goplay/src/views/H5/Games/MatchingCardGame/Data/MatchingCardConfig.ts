export enum MatchingCardString {
  //#region images
  /** 背景圖 */
  Background = 'background',

  /** 敵人發射物件 */
  EnemyLaunchObjectImage = 'enemyLaunchObjectImage',
  /** 敵人凍結圖*/
  FrozenEnemyImage = 'FrozenEnemyImage',
  /** 敵人凍結剩餘秒數BG*/
  FrozenEnemyRemainBg = 'FrozenEnemyRemainBg',
  /** 敵人對話框 */
  EnemyTalkFrame = 'enemyTalkFrame',
  /** 敵人對話key */
  EnemyTalkContentKey = 'matchingCard_Obstruct_',

  /** 卡背圖示 */
  CardBackIcon = 'CardBackIcon',
  /** 翻牌加速圖示 */
  FlipSpeedUpIcon = 'FlipSpeedUpIcon',

  /** 左方提示底圖-避免配對失敗處罰 */
  LeftHintAvoidNotMatchPenaltyBG = 'LeftHintAvoidNotMatchPenaltyBG',
  /** 左方提示底圖-翻牌加速 */
  LeftHintFlipSpeedUpBG = 'LeftHintFlipSpeedUpBG',

  /** 卡牌背面圖 */
  CardBackImage = 'cardBackImage',
  /** 卡牌英雄圖_前綴 */
  CardHeroImageKey = 'cardHero_',
  /** 英雄圖 */
  HeroImageKey = 'heroImageKey',

  /** 卡牌干擾物-上鎖圖 */
  ObstacleLockImage = 'ObstacleLockImage',
  /** 卡牌干擾物-上鎖點擊字圖 */
  LockTouchImage = 'LockTouchImage',

  /** 卡牌-配對成功字圖*/
  CardMatchImage = 'CardMatchImage',
  /** 卡牌-配對成功獲得能量底圖 */
  MatchGainEnergyBG = 'MatchGainEnergyBG',
  /** 卡牌-配對失敗處罰底圖 */
  NotMatchPenaltyEnergyBG = 'NotMatchPenaltyEnergyBG',

  /** 卡牌-瞄牌圖示 */
  CardSeeThroughIcon = 'CardSeeThroughIcon',
  //#endregion images

  // 自動解鎖
  /** 自動解鎖手指動畫JSON */
  UnlockHandAnimsJson = 'UnlockHandAnimsJson',
  /** 自動解鎖手指連續圖 */
  UnlockHandSprite = 'UnlockHandSprite',
  /** 自動解鎖手指動畫動作 */
  UnlockHandClick = 'UnlockHandClick',
}

export enum MatchingCardNumber {
  /** 英雄圖大小(含透明區的全身圖，EX:chr_P01.png) */
  HeroSpriteSize = 512,
  /** 英雄圖縮放 */
  HeroSpriteScale = 0.7,
  /** 英雄圖位置偏移 = 大小 / 2 * 縮放 */
  HeroSpriteOffsetPosition = (HeroSpriteSize / 2) * HeroSpriteScale,

  /** 卡片圖寬度 */
  CardWidth = 88,
  /** 卡片圖高度 */
  CardHeight = 115,

  /** 翻卡牌秒數 */
  FlipCardSecond = 0.25,
  /** 洗牌移動卡牌秒數 */
  ShuffleMoveCardSecond = 0.5,
  /** 偷偷瞄牌:內容物透明度 */
  SeeThroughContentAlpha = 0.5,

  /** 重力 */
  Gravity = 980,

  /** 左方提示icon大小 */
  RemainLayoutIconSize = 57,
}

/** 翻翻牌-z軸深度(數字小的在下層) */
export enum MatchingCardDepth {
  /** 上浮提示字動畫 */
  PopupTextTween = 30,
  /** 主ui */
  GuiDialog = 30,
  /** 道具ui */
  ItemDialog = 20,
  /** 使用者介面 */
  Gui = 1,
  /** 背景 */
  Bg = -1,
}

/** 卡片干擾方式 */
export enum MatchingCardObstructType {
  None = 0,
  /** 大風吹 */
  Shuffle,
  /** 上鎖 */
  Lock,
  Max,
}

/** 物品功能類型 */
export enum MatchingCardItemFunction {
  None,

  /** 自動解鎖(主動道具)：使用道具後，可解開場上所有被敵人上鎖的英雄卡牌 */
  Unlock,
  /** 偷偷瞄牌(主動道具)：使用道具後，系統隨機一張尚未配對的牌變半透明，讓玩家看N秒 */
  SeeThrough,
  /** 凍結敵人(主動道具)：使用道具後，可將場域上的敵人凍結N秒 */
  FrozenEnemy,
  /** 放飛太空(主動道具)：使用道具後，可將敵人噴射送到外太空 */
  ExileEnemy,
  /** 速戰速決(主動道具)：幫助翻牌的速度變快 */
  FlipSpeedUp,
  Max,
}

/** 遊戲難度 */
export enum MatchingCardDifficulty {
  None,
  Easy,
  Normal,
  Hard,
  Max,
}

/** 音效類型 */
export enum MatchingCardAudioType {
  /** 移動卡牌 */
  MoveCardSound = 'MoveCardSound',

  /** 點擊翻開牌 */
  ClickOpenCardSound = 'ClickOpenCardSound',
  /** 蓋牌 */
  CoverCardSound = 'CoverCardSound',
  /** 配對成功 */
  CardMatchSound = 'CardMatchSound',
  /** 配對失敗 */
  CardNotMatchSound = 'CardNotMatchSound',

  /** 敵人攻擊發射物件 */
  EnemyLaunchObjectSound = 'EnemyLaunchObjectSound',
  /** 敵人上鎖卡牌 */
  LockCardSound = 'LockCardSound',
  /** 點擊上鎖牌，扣秒數 */
  ClickLockCardSound = 'ClickLockCardSound',

  /** 點擊icon使用道具 */
  ClickItemIconSound = 'ClickItemIconSound',
  /** 敵人解凍 */
  UnfreezeEnemySound = 'UnfreezeEnemySound',
  /** 放飛敵人的丟敵人 */
  ExileThrowEnemySound = 'ExileThrowEnemySound',
}

/** 卡牌狀態 */
export enum MatchingCardState {
  /** 翻開 */
  Open = 0,
  /** 瞄牌 */
  SeeThrough = MatchingCardNumber.SeeThroughContentAlpha,
  /** 覆蓋 */
  Close = 1,
}
