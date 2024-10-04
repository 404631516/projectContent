import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';

/** 英雄能力資料 */
export class BomberHeroBuff {
  /** 是否啟用buff */
  private _isActive: boolean = false;
  public get isActive(): boolean {
    return this._isActive;
  }

  constructor(private scene: Phaser.Scene) {}

  /** 啟用buff，並記錄 使用道具時間
   * @param durationSec 持續時間
   */
  public async enableBuff(durationSec: number): Promise<void> {
    this._isActive = true;

    const timeEvent = this.scene.time.addEvent({
      delay: durationSec * 1000,
      callback: () => {
        // 停用buff
        this._isActive = false;
        this.scene.time.removeEvent(timeEvent);
      },
    });

    await AsyncHelper.pendingUntil(() => timeEvent === undefined || timeEvent.getOverallProgress() === 1);
  }
}
