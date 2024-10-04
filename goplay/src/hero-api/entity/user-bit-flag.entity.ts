import { Helper } from '../core/helper';
import { UserOwnedUpdateAtEntity } from './base.entity';

export class UserBitFlag extends UserOwnedUpdateAtEntity {
  bitFlagUid: number;

  flags: number = 0;

  key: string;

  /**
   * 取得指定位元的值
   * @param {number} index - 要取得的位元的索引
   * @returns {boolean} - 指定位元的值
   */
  getBit(index: number): boolean {
    return Helper.getBit(this.flags, index);
  }

  /**
   * 設定指定位元的值
   * @param {number} index - 要設定的位元的索引
   * @param {boolean} value - 要設定的值
   */
  setBit(index: number, value: boolean): void {
    this.flags = Helper.setBit(this.flags, index, value);
  }
}
