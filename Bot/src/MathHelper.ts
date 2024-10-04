export default class MathHelper {
  /** 回傳範圍內隨機整數
   * @param min 最小值
   * @param max 最大值
   */
  public static random(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min));
  }

  /** 根據物件陣列及對應的機率陣列, 骰出一個隨機物件
   * 要注意機率陣列的value加總要為1
   * @param objectArray 物件陣列
   * @param probabilityArray 機率陣列
   */
  public static getRandomObjectByProbabilityArray<T>(objectArray: T[], probabilityArray: number[]): T | undefined {
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

  /** clamp
   * @param originNum 原始數字
   * @param min 最小值
   * @param max 最大值
   */
  public static clamp(originNum: number, min: number, max: number): number {
    if (originNum < min) {
      return min;
    }
    if (originNum > max) {
      return max;
    }
    return originNum;
  }

  /** 洗牌
   * @param array 原始array
   */
  public static shuffle<T>(array: T[]): T[] {
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
}
