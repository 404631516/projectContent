export enum SnakeString {
  //#region 圖片
  /** 蛇頭向右 */
  SnakeRight = 'SnakeRight',
  /** 蛇頭向左 */
  SnakeLeft = 'SnakeLeft',
  /** 蛇頭向上 */
  SnakeUp = 'SnakeUp',
  /** 蛇頭向下 */
  SnakeDown = 'SnakeDown',
  /** 蛇身水平 */
  BodyHorizontal = 'BodyHorizontal',
  /** 蛇身垂直 */
  BodyVertical = 'BodyVertical',
  /** 蛇身右上 */
  BodyRightUp = 'BodyRightUp',
  /** 蛇身右下 */
  BodyRightDown = 'BodyRightDown',
  /** 蛇身下右 */
  BodyDownRight = 'BodyDownRight',
  /** 蛇身上右 */
  BodyUpRight = 'BodyUpRight',
  /** 蛇尾向右 */
  TailRight = 'TailRight',
  /** 蛇尾向左 */
  TailLeft = 'TailLeft',
  /** 蛇尾向上 */
  TailUp = 'TailUp',
  /** 蛇尾向下 */
  TailDown = 'TailDown',
  /** 背景 */
  Background = 'Background',
  /** 分數圖示 */
  IconScore = 'IconScore',
  //#endregion

  //#region sprite sheet
  /** 食物生成特效 */
  FoodGenerateEffect = 'FoodGenerateEffect',
  /** 吃食物特效 */
  EatEffect = 'EatEffect',
  //#endregion

  //#region 音樂
  /** 吃東西音效 */
  AudioEat = 'AudioEat',
  /** 受傷音效 */
  AudioHurt = 'AudioHurt',
  /** 使用道具音效 */
  AudioUseItem = 'AudioUseItem',
  //#endregion
}

export enum SnakeNumber {
  /** 遊戲移動範圍(左上)X */
  GameRangeLeftTopX = 77,
  /** 遊戲移動範圍(左上)Y */
  GameRangeLeftTopY = 72,
  /** 遊戲移動範圍(右下)X */
  GameRangeRightBottomX = 957,
  /** 遊戲移動範圍(右下)Y */
  GameRangeRightBottomY = 392,
  /** 格子長寬 */
  GridSize = 40,
  /** 目標分數 */
  TargetScore = 350,
  /** 遊戲總時間 */
  TotalGameTime = 180,
  /** 續命題觸發時間 */
  ReviveTime = 30,
  /** 影響蛇身前進速度的道具持續時間 */
  SpeedItemEffectDuration = 5000,
  /** 復活時最大蛇身長度, 重生時若超過這個長度, 螺旋蛇身會超出螢幕外 */
  ReviveMaxSnakeLength = 42,
}

/** 蛇身前進週期(毫秒) */
export enum SnakeMovePeriod {
  /** 正常速度 */
  Normal = 200,
  /** 加速 */
  SpeedUp = 100,
  /** 減速 */
  SpeedDown = 400,
}

/** 畫面深度 */
export enum SnakeDepth {
  /** 背景 */
  Background = -1,
  /** 蛇頭 */
  SnakeHead = 2,
  /** UI */
  UI = 3,
}

/** 特效種類 */
export enum SnakeFx {
  /** 沒有特效 */
  None = 0,
  /** 吃食物特效 */
  EatFX = 1,
}

/** 食物功能類型 */
export enum SnakeFoodFunctionType {
  None = 0,
  /** 加速 */
  SpeedUp,
  /** 減速 */
  SpeedDown,
  /** 蛇身縮短(一格) */
  Shrink,
  /** 清空場上垃圾食物 */
  ClearJunkFood,
}
