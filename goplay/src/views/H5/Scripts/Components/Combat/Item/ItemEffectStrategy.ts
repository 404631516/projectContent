import BaseItem from './BaseItem';

/** 播放道具特效Strategy */
export default abstract class ItemEffectStrategy {
  /** 暫存特效 */
  protected effectTweenList?: Phaser.Tweens.Tween[];
  /** 特效是否正在播放中 */
  public get isPlaying(): boolean {
    if (this.effectTweenList === undefined) {
      return false;
    }

    // 假如其中任一特效還在播放
    this.effectTweenList.forEach((tween: Phaser.Tweens.Tween) => {
      if (tween.progress < 1) {
        return true;
      }
    });

    return false;
  }

  /** 播放特效
   * @param baseItem 道具
   * @param effectIdList 特效id清單
   * @returns 返回特效物件或undefined
   */
  public abstract playEffect(baseItem: BaseItem, effectIdList: number[]): Promise<void>;

  /** 強制完成特效播放 */
  public completeEffect(): void {
    this.effectTweenList?.forEach((tween: Phaser.Tweens.Tween) => {
      if (tween.progress < 1) {
        tween.complete();
      }
    });
    this.effectTweenList = undefined;
  }
}

/** 不播放特效 */
export class SkipEffect extends ItemEffectStrategy {
  public async playEffect(): Promise<void> {
    this.effectTweenList = undefined;
  }
}

/** 即時播放特效 */
export class InstantPlayEffect extends ItemEffectStrategy {
  public async playEffect(baseItem: BaseItem, effectIdList: number[]): Promise<void> {
    this.effectTweenList = await baseItem.playEffectTween(effectIdList, false, true);
  }
}

/** 即時播放特效(不隨道具範圍縮放) */
export class InstantPlayWithoutScaleEffect extends ItemEffectStrategy {
  public async playEffect(baseItem: BaseItem, effectIdList: number[]): Promise<void> {
    this.effectTweenList = await baseItem.playEffectTween(effectIdList, false, false);
  }
}

/** 播放特效並等待特效至關鍵幀數 */
export class PendingUntillKeyFrameEffect extends ItemEffectStrategy {
  public async playEffect(baseItem: BaseItem, effectIdList: number[]): Promise<void> {
    // pending到關鍵時刻
    this.effectTweenList = await baseItem.playEffectTween(effectIdList, true, true);
  }
}

/** 播放特效(不隨道具範圍縮放)並等待特效至關鍵幀數 */
export class PendingUntillKeyFrameWithoutScaleEffect extends ItemEffectStrategy {
  public async playEffect(baseItem: BaseItem, effectIdList: number[]): Promise<void> {
    // pending到關鍵時刻
    this.effectTweenList = await baseItem.playEffectTween(effectIdList, true, false);
  }
}

/** 範圍內即時填滿特效(不隨道具範圍縮放) */
export class InstantFillWithoutScaleEffect extends ItemEffectStrategy {
  public async playEffect(baseItem: BaseItem, effectIdList: number[]): Promise<void> {
    this.effectTweenList = await baseItem.playFillEffectTween(effectIdList);
  }
}
