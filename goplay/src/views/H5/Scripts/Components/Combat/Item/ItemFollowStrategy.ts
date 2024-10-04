import BaseItem from './BaseItem';

/** 道具跟隨發動者Strategy */
export default abstract class ItemFollowStrategy {
  /** 跟隨發動者
   * @param baseItem 道具
   */
  public follow(baseItem: BaseItem): void {
    if (baseItem.isIgnorefollow) {
      return;
    }

    this.onFollow(baseItem);
  }

  /** Strategy客製行為
   * @param baseItem 道具
   */
  protected abstract onFollow(baseItem: BaseItem): void;
}

/** 一般跟隨，更新位置、角度與道具發起者同步 */
export class NormalFollow extends ItemFollowStrategy {
  public onFollow(baseItem: BaseItem): void {
    baseItem.followInstigator(true, true);
  }
}

/** 只更新位置與道具發起者同步  */
export class OnlyPositionFollow extends ItemFollowStrategy {
  public onFollow(baseItem: BaseItem): void {
    baseItem.followInstigator(true, false);
  }
}
