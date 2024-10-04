export enum BubbleDragonScene {
  Game = 'BubbleDragonGameScene',
}

export enum BubbleDragonString {
  //#region images
  /** 背景圖 */
  Background = 'bg',
  /** 聲音開啟圖示 */
  SoundOnIcon = 'soundOnIcon',
  /** 聲音關閉圖示 */
  SoundOffIcon = 'soundOffIcon',
  /** 上面牆壁 */
  TopWall = 'topWall',
  /** 下面牆壁 */
  BottomWall = 'bottomWall',
  /** 漸層 */
  Gradient = 'gradient',
  /** 站台 */
  Platform = 'platform',
  /** 彈匣 */
  Magazine = 'magazine',
  /** 瞄準鏡 */
  Scope = 'scope',
  /** 防禦線 */
  DefenceLine = 'defenceLine',
  /** 一般泡泡 */
  Bubble = 'bubble',
  /** 被擊泡泡 */
  BubbleDamage = 'bubbleDamage',
  /** 泡泡消失動畫 */
  BubbleRemoveFX = 'bubbleRemoveFX',
  /** 瞄準線路徑 */
  SupportLinePath = 'supportLinePath',
  /** 瞄準線尾端 */
  SupportLineEnd = 'supportLineEnd',
  /** 提示圖案 */
  HintImage = 'hintImage',
  /** 提示背景 */
  HintBackground = 'hintBackground',
  //#endregion images

  //#region key
  /** 射擊泡泡 */
  ShootBubble = 'shootBubble',
  /** 炸彈泡泡 */
  BombBubble = 'bombBubble',
  /** 穿甲泡泡 */
  PenetrateBubble = 'penetrateBubble',
  //#endregion key

  //#region audio
  /** 清除音效 */
  SoundCleanBubble = 'soundCleanBubble',
  /** 生成音效 */
  SoundGrowUpBubble = 'soundGrowUpBubble',
  /** 反彈音效 */
  SoundReflectionBubble = 'soundReflectionBubble',
  /** 射擊音效 */
  SoundShootBubble = 'soundShootBubble',
  /** 填充音效 */
  SoundCharge = 'soundCharge',
  /** 使用道具音效 */
  SoundSwitchItem = 'soundSwitchItem',
  //#endregion audio

  /** 準備動畫，需對應Json檔資料 */
  JsonAnims = 'JsonAnims',
  /** 泡泡消失動畫 */
  AnimBubbleRemove = 'AnimBubbleRemove',
}

export enum BubbleDragonNumber {
  //#region backgroundObject
  /** 畫布寬度 */
  CanvasWidth = 1024,
  /** 畫布高度 */
  CanvasHeight = 512,
  //#endregion backgroundObject

  //#region map
  /** 地圖生成幾排 */
  MapMaxRow = 3,
  /** 地圖生成一排個數 */
  MapMaxColumn = 6,
  /** 總排數 */
  MapTotalRow = 15,
  //#endregion map

  //#region shoot
  /** 英雄站的位置X */
  HeroPositionX = 60,
  /** 英雄站的位置Y */
  HeroPositionY = 330,
  /** 射擊初始點X */
  ShootedBasePositionX = 150,
  /** 射擊初始點Y */
  ShootedBasePositionY = 252,
  /** 瞄準鏡位置X */
  ScopePositionX = 150,
  /** 瞄準鏡位置Y */
  ScopePositionY = 190,
  /** 預備泡泡位置X */
  PrepareBubblePositionX = 150,
  /** 預備泡泡位置Y */
  PrepareBubblePositionY = 410,
  /** 射擊角度限制 */
  ShootAngleLimit = 60,
  //#endregion shoot

  /** 泡泡圖片寬度 */
  BubbleWidth = 54,
  /** 泡泡圖片高度 */
  BubbleHeight = 54,
  /** 泡泡半徑 */
  BubbleRadius = 27,
  /** 泡泡畫圓半徑 */
  BubbleCircleRadius = 27,
  /** 泡泡位置上方偏移量 */
  BubblePositionTopOffset = 120,
  /** 泡泡位置每直行偏移量 */
  BubblePositionRowOffset = 8,
  /** 總共的泡泡種類數量(0~17) */
  BubbleTotalTypeCount = 18,
  /** 使用的泡泡種類數量 */
  BubbleUseTypeCount = 4,
  /** 彩色泡泡(18) */
  RainbowBubble = BubbleTotalTypeCount,
  /** 泡泡消除數量限制 */
  BubbleRemoveCount = 3,

  /** 泡泡射擊速度 */
  BubbleShootVelocity = 700,
  /** 生成移動速度(ms) */
  GenerateMoveSpeed = 500,
  /** 裝填速度(ms) */
  CharegeSpeed = 700,
}

/** 泡泡六方位 */
export enum BubblePositionAngle {
  /** 右邊 */
  Right = 0,
  /** 右上 */
  TopRight = 54,
  /** 左上 */
  TopLeft = 126,
  /** 左邊 */
  Left = 180,
  /** 負數左邊 */
  MinusLeft = -180,
  /** 左下 */
  BottomLeft = -126,
  /** 右下 */
  BottomRight = -54,
}

/** 泡泡六方位 */
export enum BubblePositionDirection {
  /** 上面 */
  Top = 0,
  /** 右上 */
  TopRight,
  /** 右下 */
  BottomRight,
  /** 下面 */
  Bottom,
  /** 左下 */
  BottomLeft,
  /** 左上 */
  TopLeft,
  /** MAX */
  Max,
}

/** 泡泡生成規則 */
export enum BubbleGenerateRule {
  /** 奇數排為少 */
  BubbleGenerateOdd = 1,
  /** 偶數排為少 */
  BubbleGenerateEven = 0,
}

/** 泡泡道具功能 */
export enum BubbleItemFunction {
  /** 軌跡 */
  Track = 0,
  /** 彩色 */
  Rainbow,
  /** 炸彈Lv1 */
  BombLv1,
  /** 炸彈Lv2 */
  BombLv2,
  /** 穿透 */
  Penetrate,
}

export enum BubbleDragonDepth {
  /** 背景 */
  Bg = -1,
  /** 前景 */
  Foreground,
  /** 遊戲畫面 */
  Game,
  /** 使用者介面 */
  Gui,
}
