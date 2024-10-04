import { DefenseNumber } from '../Games/Defense/Data/DefenseConfig';

/** 子元件與容器四周的邊距 */
export interface Padding {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export const enum Align {
  Center,
  TopCenter,
  LeftCenter,
  BottomCenter,
  RightCenter,
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
}

/** 羅盤八方位方向Radian */
export const enum CompassRad {
  /** 無方向 */
  None = -999,
  /** 東(右、0度) */
  Right = 0,
  /** 東南(右下、45度) */
  RightDown = 0.785398163,
  /** 南(下、90度) */
  Down = 1.57079633,
  /** 西南(左下、135度) */
  LeftDown = 2.35619449,
  /** 西(左、180度) */
  Left = 3.14159265,
  /** 西北(左上、-135度) */
  LeftUp = -2.35619449,
  /** 北(上、-90度) */
  Up = -1.57079633,
  /** 東北(右上、-45度) */
  RightUp = -0.785398163,
}

export function clamp(target: number, max: number, min: number): number {
  if (target > max) {
    return max;
  }
  if (target < min) {
    return min;
  }
  return target;
}

/** path座標轉換, 因為原始檔案的path座標是1200x600的圖片用的, 實際上的視窗是1024x512, 故需要轉換 */
export function imagePathToScenePath(pathNodes: Phaser.Math.Vector2[]): Phaser.Math.Vector2[] {
  const xProp = DefenseNumber.sceneSizeX / DefenseNumber.mapBGSizeX;
  const yProp = DefenseNumber.sceneSizeY / DefenseNumber.mapBGSizeY;
  const pathOffsetY = -DefenseNumber.TileSizeY / 2;

  for (let i = 0; i < pathNodes.length; ++i) {
    pathNodes[i] = new Phaser.Math.Vector2(pathNodes[i].x * xProp, pathNodes[i].y * yProp + pathOffsetY);
  }
  return pathNodes;
}

/** enemy建立路徑 */
export function createPath(points: Phaser.Math.Vector2[]): Phaser.Curves.Path | undefined {
  // 檢查座標
  if (points === null || points.length < 1) {
    return undefined;
  }

  // 將座標連成路徑
  const path: Phaser.Curves.Path = new Phaser.Curves.Path(points[0].x, points[0].y);
  for (const point of points) {
    path.lineTo(point);
  }

  return path;
}

/** 輸出phaser中遊戲物件的正規化角度
 * @param angle 角度
 */
export function parseAngle(angle: number) {
  const simplifiedAngle = angle % 360;
  // a = 0 ~ 180 或 -180~-0 皆回傳簡化後的值
  if (Math.abs(simplifiedAngle) <= 180) {
    return simplifiedAngle;
  }

  // a = 180 ~ 360 回傳負值角度 0 ~ -180
  if (simplifiedAngle > 0) {
    return simplifiedAngle - 360;
  }

  // a = -180 ~ -360 回傳正值角度 0 ~ 180
  return simplifiedAngle + 360;
}

/** 補0到數字前面
 * @param num 原數值
 * @param places 需要位數
 */
export function zeroPad(num: number, places: number): string {
  return String(num).padStart(places, '0');
}

/** 四捨五入到小數1位
 * @param origin 原數值
 * @param place 小數位數
 */
export function roundToDecimalPlace(origin: number, place: number): number {
  const ratio = Math.pow(10, place);
  return Math.round(origin * ratio) / ratio;
}

/** 無條件捨去到小數1位
 * @param origin 原數值
 * @param place 小數位數
 */
export function floorToDecimalPlace(origin: number, place: number): number {
  const ratio = Math.pow(10, place);
  return Math.floor(origin * ratio) / ratio;
}

/** 無條件進位到小數1位
 * @param origin 原數值
 * @param place 小數位數
 */
export function ceilToDecimalPlace(origin: number, place: number): number {
  const ratio = Math.pow(10, place);
  return Math.ceil(origin * ratio) / ratio;
}

/** 隨機取得是否 */
export function randomBoolean(): boolean {
  return Math.floor(Math.random() * 2) >= 1;
}

/** 有機率的取得是否 */
export function possibleBoolean(possibility: number): boolean {
  return Math.random() < Math.min(possibility, 1);
}

/** 指定範圍內隨機取得一個數字 (0 ~ max -1)*/
export function randomNumber(max: number): number {
  return Math.floor(Math.random() * max);
}

/** 指定範圍內隨機取得一個數字 (min ~ max -1)*/
export function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

interface ParabolaConfig {
  originX: number;
  originY: number;
  endX: number;
  angle: number;
  velocity: number;
  gravity: number;
}

/** 建立拋物線 */
export function createParabola(config: ParabolaConfig) {
  // 計算會應用的物理數值
  const v = {
    x: config.velocity * Math.cos(config.angle),
    y: config.velocity * Math.sin(config.angle),
  };

  // 起點(X0, Y0)
  const start = new Phaser.Math.Vector2(config.originX, config.originY);

  // 進行克拉瑪計算
  // 假設拋物線方程式為 aX^2 + bX + c = y.............................(1)
  // x軸為等速運動，公式為 X = X0 + Vx * t (t為時間) ..................(2)
  // y軸為等加速度運動，公式為 Y = Vy * t + 0.5 * gravity * t^2 + Y0...(3)
  // 將第(2)式 t = (X - X0) / Vx 代入第(3)式可以得到
  // a = 0.5 * gravity / Vx^2
  // b = (Vx * Vy - gravity * X0) / Vx^2
  // c則由第(1)式代入起點算出
  const a = (0.5 * config.gravity) / Math.pow(v.x, 2);
  const b = (v.x * v.y - config.gravity * start.x) / Math.pow(v.x, 2);
  const c = start.y - a * Math.pow(start.x, 2) - b * start.x;

  // 計算終點
  const end = new Phaser.Math.Vector2(config.endX, Math.pow(config.endX, 2) * a + config.endX * b + c);

  // 計算貝茲線的控制點
  const control = new Phaser.Math.Vector2(
    (start.x + end.x) * 0.5,
    (end.x - start.x) * 0.5 * (2 * a * start.x + b) + config.originY,
  );
  // 建立貝茲線
  return new Phaser.Curves.QuadraticBezier(start, control, end);
}

/** 根據物件陣列及對應的機率陣列, 骰出一個隨機物件
 * 要注意機率陣列的value加總要為1
 * @param objectArray 物件陣列
 * @param probabilityArray 機率陣列
 */
export function getRandomObjectByProbabilityArray<T>(objectArray: T[], probabilityArray: number[]): T | undefined {
  // 骰一個0~1之間的隨機數字
  let randomNum = Math.random();
  // 從機率陣列中找出對應的結果
  for (let i = 0; i < probabilityArray.length; ++i) {
    // 找到目標了
    if (randomNum < probabilityArray[i]) {
      return objectArray[i];
    }
    // 減掉這個機率, 找下一個目標
    randomNum -= probabilityArray[i];
  }
  // 防呆
  return undefined;
}

/** 將秒數轉成"時:分:秒"格式的文字
 * @param s input秒數
 * @returns HHMMSS格式的時間
 */
export function formatSeconds(s: number): string {
  const hhmmss = [Math.floor(s / 3600), Math.floor((s / 60) % 60), Math.floor(s % 60)];
  return hhmmss.join(':').replace(/\b(\d)\b/g, '0$1');
}

/** 洗牌
 * @param array 原始array
 */
export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}
