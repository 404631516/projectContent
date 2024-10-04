export enum BrickBreakerString {
  // images
  GridImgKey = 'gridImg_',
  /** 地圖Focus按鈕 */
  LocateIcon = 'LocateIcon',
  /** 地圖縮近按鈕 */
  ZoomInIcon = 'ZoomInIcon',
  /** 地圖拉遠按鈕 */
  ZoomOutIcon = 'ZoomOutIcon',
  /** 玩家本人標示圖案 */
  SelfTag = 'selfTag',
  /** 魔王標示圖案 */
  BossTag = 'bossTag',
  /** 角色離線標誌 */
  OfflineIcon = 'OfflineIcon',
  /** boss位置提示箭頭 */
  BossHintIcon = 'bossHintIcon',
  /** UI背景框 */
  FramePlayerInfo = 'framePlayerInfo',
  FrameRank = 'frameRank',
  FrameMap = 'frameMap',
  FrameHowToPlay = 'frameHowToPlay',
  FrameTimer = 'frameTimer',
  FrameHead = 'frameHead',
  FrameBlack = 'frameBlack',
  FramePurple = 'framePurple',
  FrameInfo = 'frameInfo',
  /** Boss UI背景框 */
  BossBG = 'bossBG',
  /** Boss UI bossIcon */
  BossIcon = 'bossIcon',
  /** 問號圖案 */
  QuestionMarkIcon = 'questionMarkIcon',
  /** mapIcon */
  MapIcon = 'mapIcon',
  /** rankIcon */
  RankIcon = 'rankIcon',
  /** rank object背景 */
  RankFrameGold = 'rankFrameGold',
  /** rank object背景 */
  RankFrameNormal = 'rankFrameNormal',
  /** rank object 排名icon */
  RankGoldMedal = 'rankGoldMedal',
  /** rank object 排名icon */
  RankSliverMedal = 'rankSliverMedal',
  /** rank object 排名icon */
  RankBronzeMedal = 'rankBronzeMedal',
  /** rankListButton */
  YellowButton = 'yellowButton',
  /** timerIcon */
  TimerIcon = 'timerIcon',
  /** gradientOverlay */
  GradientOverlay = 'gradientOverlay',
  /** redButton */
  RedButton = 'redButton',
  /** buttonArrow */
  ButtonArrow = 'buttonArrow',
  /** eventMsgLine */
  EventMsgLine = 'eventMsgLine',
  /** 機器人驚嘆號 */
  RobotWarning = 'robotWarning',
  /** 可互動格子highlight */
  GridHighlight = 'gridHighlight',
  /** 道具Icon 盾牌 */
  ItemShield = 'itemShield',
  /** 道具Icon 威力上升 */
  ItemAxe = 'itemAxe',
  /** 道具Icon 防止冰凍 */
  ItemFreezePrevent = 'itemFreezePrevent',
  /** 文字背景框 */
  NameFrame = 'nameFrame',
  /** 角色身上的防護罩(防炸彈) */
  AvatarShieldImg = 'avatarShieldImg',
  /** 角色身上的防護罩(防凍結) */
  AvatarFreezePreventImg = 'avatarFreezePreventImg',
  /** 斷線重連loading圖片 */
  ReconnectBG = 'reconnectBG',
  ReconnectIcon = 'reconnectIcon',
  ReconnectDot1 = 'reconnectDot1',
  ReconnectDot2 = 'reconnectDot2',
  ReconnectDot3 = 'reconnectDot3',

  /** 粒子特效圖片(碎石) */
  ParticleBreakBrickImg = 'particleBreakBrickImg',
  /** 粒子特效圖片(解凍) */
  ParticleUnfreezeImg = 'particleUnfreezeImg',

  /** 粒子特效key(碎石)  */
  ParticleEmitterBreakBrick = 'ParticleEmitterBreakBrick',
  /** 粒子特效key(解凍) */
  ParticleEmitterUnfreeze = 'ParticleEmitterUnfreeze',

  // jsons
  /** 特效config */
  ParticleEmitterConfigs = 'ParticleEmitterConfigs',
}

export enum BrickBreakerNumber {
  /** 走一格需要的動畫時間 */
  WalkTweenSec = 0.8,
  /** 瞬移需要的動畫時間 */
  TeleportTweenSec = 1.6,
  /** 遊戲區域攝影機最大縮放值 */
  MapViewMaxZoom = 1.4,
  /** 一格的寬度 */
  GridWidth = 60,
  /** 一格的高度 */
  GridHeight = 60,
}

/** 地圖格子圖片key enum, 有的格子需要多張圖、有的要動圖, 所以無法與gridType一樣 */
export enum BrickBreakerGridImgType {
  Destroyed = 0,
  Empty,
  BreakableBrick1,
  BreakableBrick2,
  BreakableBrick3,
  UnbreakableBrick1,
  UnbreakableBrick2,
  UnbreakableBrick3,
  Attack_Stage,
  Attack_Arrow,
  Defense,
  Treasure_Shuriken,
  Treasure_Horn,
  Treasure_Shield,
  Treasure_AxeSelf,
  Treasure_AxeAround,
  Treasure_AxeAll,
  Treasure_FreezePrevent,
  AnswerTreasure_Close,
  AnswerTreasure_Open,
  RespawnPoint,
  FogOfWar,
  FrameTopLeft,
  FrameTopRight,
  FrameBottomLeft,
  FrameBottomRight,
  FrameTop,
  FrameBottom,
  FrameLeft,
  FrameRight,
  Max,
}
