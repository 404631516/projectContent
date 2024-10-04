import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import FlashableSprite from '@/views/H5/Scripts/Components/FlashableSprite';
import BaseItem, { BaseItemConfig } from '../BaseItem';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { ICombatScene } from '../../Combat';
import { SpawnOnHitType } from '@/helper/enum/Combat';

export default class ItemBaseMinion extends Object2D {
  /** 遊戲場景 */
  public declare scene: Phaser.Scene & ICombatScene;

  //#region 元件與暫存
  /** 召喚物特效 */
  public get halfDisplayHeight(): number {
    // 獲取特效圖片
    const effectSprite: Phaser.GameObjects.Sprite = this.effectTweenSpriteGroup.getFirstAlive();
    if (effectSprite === null) {
      return 0;
    }

    return effectSprite.displayHeight / 2;
  }
  /** 特效圖片群組 */
  private effectTweenSpriteGroup: Phaser.GameObjects.Group;
  /** 召喚物特效Tween */
  private effectTweenList: Phaser.Tweens.Tween[] = [];
  /** 道具資料Config */
  protected itemConfig!: BaseItemConfig;
  /** 召喚物使用的道具 */
  private minionItem?: BaseItem;
  /** 召喚物可存活時間 */
  private survivalTimeMS: number = 0;
  /** 召喚物啟動後時間 */
  private activeTimeMS: number = 0;
  /** 召喚物死亡 */
  public get isDead(): boolean {
    return this.activeTimeMS > this.survivalTimeMS;
  }
  //#endregion 元件與暫存

  //#region constructor、Phaser function
  constructor(scene: Phaser.Scene & ICombatScene, x: number, y: number) {
    super(scene, x, y);
    // 設置深度
    this.setDepth(this.scene.worldTopEdgeY);
    // 設置表演圖片群組
    this.effectTweenSpriteGroup = this.scene.add.group({
      classType: Phaser.GameObjects.Sprite,
      createCallback: (sprite: Phaser.GameObjects.GameObject) => {
        // 生成的物件都加到container底下
        this.add(sprite);
      },
    });
    // 預先創建3張圖片以供立即取用
    for (let index = 0; index < 3; index++) {
      this.effectTweenSpriteGroup.create(0, 0, undefined, undefined, false, false);
    }
  }

  update(time: number, delta: number) {
    // 超過存活時間時銷毀
    this.activeTimeMS += delta;
  }
  //#endregion constructor、Phaser function

  //#region 分身功能
  /** 初始化分身
   * @param itemConfig 道具Config
   */
  public init(itemConfig: BaseItemConfig): void {
    // 資料暫存
    this.itemConfig = itemConfig;

    // 啟動分身
    this.activeTimeMS = 0;
    this.survivalTimeMS = this.itemConfig.itemData.spawnObjectSurvivalTime * 1000;
    this.setPosition(0, 0);
    this.setRotation(0);
    this.setVisible(true);
    this.setActive(true);
    // 取得道具Instance
    if (this.itemConfig.itemData.spawnOnHitType === SpawnOnHitType.SpawnObject) {
      this.minionItem = this.scene.combatComponent.spawnOnHitItem(this.x, this.y, this.itemConfig, -1);
    } else {
      console.error(
        `spawnOnHitType = ${this.itemConfig.itemData.spawnOnHitType}, 使得分身無法創建攻擊道具. 道具Id = ${this.itemConfig.itemData.id}`
      );
    }
  }

  /** 複製分身影像
   * @param nameKey 影像Key
   * @param scale 影像Scale
   */
  public async cloneMinionEffect(nameKey: string, scale: number): Promise<void> {
    // 獲取特效圖片
    const effectSprite: Phaser.GameObjects.Sprite = this.effectTweenSpriteGroup.get();
    if (effectSprite === null) {
      return;
    }
    // 複製分身影像
    effectSprite.setTexture(nameKey + CharacterAnimType.Walk);
    effectSprite.anims.play(nameKey + CharacterAnimType.Walk);
    effectSprite.setScale(scale);
    effectSprite.setAlpha(0.75);
    effectSprite.setVisible(true);
    effectSprite.setActive(true);
  }

  /** 使用道具資料創建分身影像 */
  public async itemMinionEffect(): Promise<void> {
    if (this.itemConfig.itemData.effectIdList.length === 0) {
      console.error(`無法獲取特效資料，分身所使用的特效資料清單長度不該為0。itemData: ${this.itemConfig.itemData}`);
      return;
    }

    this.itemConfig.itemData.effectIdList.forEach((effectId: number) => this.setEffect(effectId));
  }

  /** 設置特效
   * @param effectId 特效Id
   */
  private async setEffect(effectId: number): Promise<void> {
    const effectData = this.scene.combatComponent.getEffectData(effectId);
    if (effectData === undefined) {
      return;
    }
    // 特效是否顯示在角色之上
    this.setDepth(effectData.aboveCharacter ? this.scene.worldBottomEdgeY : this.scene.worldTopEdgeY);

    // 獲取特效圖片
    const effectSprite: Phaser.GameObjects.Sprite = this.effectTweenSpriteGroup.get();
    if (effectSprite === null) {
      return;
    }

    effectSprite.setTexture(effectData.nameKey);
    effectSprite.anims.play(effectData.nameKey);
    effectSprite.setScale(this.itemConfig.itemData.spawnObjectSize / effectData.bodySize);
    effectSprite.setAlpha(1);
    effectSprite.setRotation(0);
    effectSprite.setPosition(0, 0);
    // 設置特效Tween
    const effectTween = await AnimationHelper.setTweenFromEffectData(effectSprite, effectData, false);
    this.effectTweenList.push(effectTween);
  }

  /** 更新召喚物位置
   * @param x 位置x
   * @param y 位置y
   * @param rotation 角度
   */
  public updatePosition(x: number, y: number, rotation: number): void {
    // 召喚物排序單數跟隨在目標右邊、雙數跟隨在目標左邊，排序越後越向外側
    this.x = x;
    this.y = y;

    if (this.minionItem !== undefined) {
      this.minionItem.x = this.x + this.parentContainer?.x;
      this.minionItem.y = this.y + this.parentContainer?.y;
      // 更新分身使用的道具位置及角度
      this.minionItem.rotation = rotation;
    }
  }

  /** 更新召喚物特效
   * @param flashableSprite 參考對象flashableSprite
   */
  public updateEffect(flashableSprite: FlashableSprite): void {
    this.effectTweenSpriteGroup.getMatching('active', true).forEach((sprite: Phaser.GameObjects.Sprite) => {
      // 更新動畫播放狀態
      if (flashableSprite.isAnimsPaused) {
        sprite.anims.pause();
      } else {
        sprite.anims.resume();
      }

      // 更新翻轉狀態
      sprite.setFlipX(flashableSprite.flipX);
    });
  }

  /** 回收此召喚物 */
  public killAndHide(): void {
    // 回收召喚物使用的道具
    this.minionItem?.killAndHide();
    // 關閉召喚物特效
    this.effectTweenList.forEach((tween: Phaser.Tweens.Tween) => tween.complete());
    this.effectTweenList = [];

    this.effectTweenSpriteGroup
      .getMatching('active', true)
      .forEach((sprite: Phaser.GameObjects.Sprite) => sprite.setActive(false).setVisible(false));
    // 將自己回收
    this.scene.combatGroups.hideMemberFromGroup(this.itemConfig.itemData.spawnObjectFunction, this);
  }
  //#endregion 召喚物功能
}

export class Avatar extends ItemBaseMinion {}
