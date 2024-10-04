import { GameGem } from '../Components/GemsManager';
import { BejeweledNumber } from '../Data/BejeweledConfig';

export class BejeweledHelper {
  /** 檢查兩顆寶石是否相同
   * @param gem1 寶石1
   * @param gem2 寶石2
   */
  public static isSameGem(gem1: GameGem, gem2: GameGem): boolean {
    return this.getGemRow(gem1) === this.getGemRow(gem2) && this.getGemCol(gem1) === this.getGemCol(gem2);
  }

  /** 取得寶石列位置
   * @param gem 寶石
   */
  public static getGemRow(gem: GameGem): number {
    // TODO GameGem自己存自己的座標, 不再做換算
    return Math.floor((gem.gemSprite.y - BejeweledNumber.MarginTop) / BejeweledNumber.GemSize);
  }

  /** 取得寶石欄位置
   * @param gem 寶石
   */
  public static getGemCol(gem: GameGem): number {
    // TODO GameGem自己存自己的座標, 不再做換算
    return Math.floor((gem.gemSprite.x - BejeweledNumber.MarginLeft) / BejeweledNumber.GemSize);
  }

  /** 檢查兩顆寶石是否相鄰
   * @param gem1 寶石1
   * @param gem2 寶石2
   */
  public static areNext(gem1: GameGem, gem2: GameGem): boolean {
    // Math.abs取絕對值
    return (
      Math.abs(this.getGemRow(gem1) - this.getGemRow(gem2)) + Math.abs(this.getGemCol(gem1) - this.getGemCol(gem2)) ===
      1
    );
  }
}
