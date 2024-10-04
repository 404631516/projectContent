/** 增/減益狀態 */
export class MatchingCardBuff {
  /** 是否啟用buff */
  public get isActive(): boolean {
    return this._remainTimeMSec > 0;
  }
  /** 是否冷卻中 */
  private get isCooldown(): boolean {
    // 只算冷卻時間
    return this.isActive === false && this._remainCooldownMSec > 0;
  }

  /** 剩餘時間(秒)(進位) */
  private _remainTimeMSec: number = 0;
  public get remainSec(): number {
    return Math.ceil(this._remainTimeMSec / 1000);
  }

  /** 剩餘冷卻時間(秒) */
  private _remainCooldownMSec: number = 0;

  /** 更新卡片
   * @param delta 差值(MS)
   */
  public update(delta: number): void {
    // 都倒數完畢，不執行
    if (this.isActive === false && this.isCooldown === false) {
      return;
    }

    // 扣除剩餘時間
    this._remainTimeMSec -= delta;
    // 剩餘時間結束時
    if (this._remainTimeMSec < 0) {
      // 清除剩餘時間
      this._remainTimeMSec = 0;
    }

    // 剩餘時間結束時
    if (this._remainTimeMSec <= 0) {
      // 扣除冷卻時間
      this._remainCooldownMSec -= delta;
    }
  }

  /** 啟用buff
   * @param durationSec 持續時間
   * @param cooldownSec 冷卻時間
   */
  public enableBuff(durationSec: number, cooldownSec: number): void {
    // 設定剩餘時間
    this._remainTimeMSec = durationSec * 1000;
    // 冷卻時間
    this._remainCooldownMSec = cooldownSec * 1000;
  }

  /** 清除buff */
  public clearBuff(): void {
    this._remainTimeMSec = 0;
    this._remainCooldownMSec = 0;
  }

  /** 減少buff秒數
   * @param durationSec 持續時間
   */
  public minusBuff(durationSec: number): void {
    // 減少 剩餘時間
    this._remainTimeMSec -= durationSec * 1000;
  }
}
