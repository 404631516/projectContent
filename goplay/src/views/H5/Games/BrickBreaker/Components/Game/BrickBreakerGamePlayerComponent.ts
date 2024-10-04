import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import HeroManager from '@/manager/HeroManager';
import { HeroData } from '@/manager/TableManager';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import UIHelper from '@/views/H5/Helper/UIHelper';
import {
  BrickBreakerAvatarData,
  BrickBreakerEffectKey,
  BrickBreakerItemType,
} from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { BrickBreakerString, BrickBreakerNumber } from '../../Data/BrickBreakerConfig';
import BrickBreakerGameScene from '../../Scenes/BrickBreakerGameScene';
import GridComponent from './GridComponent';

export default class BrickBreakerGamePlayerComponent extends Object2D {
  /** 指定為BrickBreakerGameScene使用 */
  public declare scene: BrickBreakerGameScene;

  /** 獲得道具特效對照表 */
  private readonly getItemEffectKeyTable: Map<BrickBreakerItemType, BrickBreakerEffectKey> = new Map([
    [BrickBreakerItemType.Axe, BrickBreakerEffectKey.IconAxe],
    [BrickBreakerItemType.FreezePrevent, BrickBreakerEffectKey.IconFreezePrevent],
    [BrickBreakerItemType.Shield, BrickBreakerEffectKey.IconShield],
  ]);

  /** 使用道具特效對照表 */
  private readonly useItemEffectKeyTable: Map<BrickBreakerItemType, BrickBreakerEffectKey> = new Map([
    [BrickBreakerItemType.Axe, BrickBreakerEffectKey.AvatarPowerAttack],
    [BrickBreakerItemType.FreezePrevent, BrickBreakerEffectKey.IconFreezePrevent],
    [BrickBreakerItemType.Shield, BrickBreakerEffectKey.AvatarDefense],
  ]);

  /** 英雄圖片 */
  private heroIcon!: Phaser.GameObjects.Sprite;

  /** 玩家selfTag */
  private selfTag!: Phaser.GameObjects.Image;

  /** 離線Tag */
  private offlineTag!: Phaser.GameObjects.Image;

  /** 防護罩圖片(炸彈) */
  private shieldImg!: Phaser.GameObjects.Image;
  /** 防護罩圖片(冰凍) */
  private freezePreventImg!: Phaser.GameObjects.Image;

  /** 玩家avatarData */
  private avatarData: BrickBreakerAvatarData;

  /** 個人對魔王造成的總傷害, 比對此值以便顯示新攻擊的傷害量 */
  private lastBossDamage: number;

  /** 本PlayerComponent是否對應玩家本人 */
  private _isSelf: boolean = false;
  public get isSelf(): boolean {
    return this._isSelf;
  }

  /** 特效圖片群組 */
  private effectTweenSpriteGroup!: Phaser.GameObjects.Group;

  /** 冰凍特效Tween暫存 */
  private freezeTween: Phaser.Tweens.Tween | undefined;
  /** freezeTween 播放中flag */
  private isPlayingfreezeTween: boolean = false;

  /** 對應heroData */
  private heroData!: HeroData;
  /** idle動畫key */
  private heroAnimIdleKey!: string;
  /** 走路動畫key */
  private heroAnimWalkKey!: string;

  /** 英雄圖片縮放 */
  private readonly heroIconScale = 0.28;
  /** 玩家selfTag縮放 */
  private readonly selfTagScale = 0.68;
  /** 玩家selfTag Y值 */
  private readonly selfTagY = -50;

  constructor(scene: BrickBreakerGameScene, avatarData: BrickBreakerAvatarData, posX: number, posY: number) {
    super(scene);

    // 設定基本資料
    this.avatarData = avatarData;
    this.lastBossDamage = avatarData.bossDamage;
    this._isSelf = this.avatarData.uid === this.scene.gameData.uid;

    // 設定初始位置
    this.setPlayerPosition(posX, posY);

    // 尋找對應heroData
    const heroData = HeroManager.getHeroData(this.avatarData.heroId);
    if (heroData === undefined) {
      console.error(
        'BrickBreakerGamePlayerComponent error, heroData undefined, ' + 'heroId = ' + this.avatarData.heroId
      );
      return;
    }

    // 設定heroData & anims key
    this.heroData = heroData;
    this.heroAnimIdleKey = heroData.nameKey + CharacterAnimType.Idle;
    this.heroAnimWalkKey = heroData.nameKey + CharacterAnimType.Walk;

    // 設定英雄圖片
    this.heroIcon = this.addSprite(this.heroAnimIdleKey, 0, -10);
    this.heroIcon.setScale(this.heroIconScale);
    // create anims
    this.heroIcon.anims.create({
      key: this.heroAnimIdleKey,
      frames: this.heroAnimIdleKey,
      frameRate: 10,
      repeat: -1,
    });
    this.heroIcon.anims.create({
      key: this.heroAnimWalkKey,
      frames: this.heroAnimWalkKey,
      frameRate: 10,
      repeat: -1,
    });
    // play idle
    if (this.heroIcon.anims.isPlaying === false) {
      this.heroIcon.anims.play(this.heroAnimIdleKey);
    }

    // 設定離線Tag
    this.offlineTag = this.addImage(BrickBreakerString.OfflineIcon, 0, 0);

    // 是否在線上
    this.heroIcon.setAlpha(avatarData.isOnline ? 1 : 0.5);
    this.offlineTag.setVisible(avatarData.isOnline === false);

    // 玩家本人顯示selfTag, 其他人顯示姓名
    if (this.isSelf) {
      // 顯示selfTag
      this.selfTag = this.addImage(BrickBreakerString.SelfTag, 0, this.selfTagY);
      this.selfTag.setScale(this.selfTagScale);
    } else {
      // 顯示玩家姓名
      const playerName = this.addText(this.avatarData.name, 0, -50, {
        fontSize: '24px',
        color: UIHelper.whiteString,
      });
      // 為提升文字解析度, 先將fontSize設大, 再用scale縮小
      playerName.setScale(0.5);
    }

    // 防護罩(炸彈)
    this.shieldImg = this.addImage(BrickBreakerString.AvatarShieldImg, 0, 0);
    // 防護罩(冰凍)
    this.freezePreventImg = this.addImage(BrickBreakerString.AvatarFreezePreventImg, 0, 0);

    // 設置表演圖片群組
    this.effectTweenSpriteGroup = this.scene.add.group({
      classType: Phaser.GameObjects.Sprite,
      createCallback: (sprite: Phaser.GameObjects.GameObject) => {
        // 生成的物件都加到container底下
        this.add(sprite);
      },
    });

    // 更新角色外觀
    this.updateAvatarOutward();
  }

  /** 設定角色位置時要額外呼叫此function,
   * 在這邊偷偷調整selfPlayerComponent的y值, 使自己不要被其他同位置的角色蓋住
   * @param x new position x
   * @param y new position y
   */
  private setPlayerPosition(x: number, y: number): void {
    this.x = x;
    this.y = this.isSelf ? y + 0.01 : y;
  }

  /** selfTag pop提示特效
   * @param tweenSec 動畫表演總時長
   */
  public selfTagPop(tweenSec: number): void {
    const repeat = 3;
    this.scene.add.tween({
      targets: this.selfTag,
      scale: this.selfTagScale * 1.2,
      y: this.selfTagY - 10,
      yoyo: true,
      repeat,
      duration: (tweenSec / repeat / 2) * 1000,
    });
  }

  /** avatar資料更新
   * @param avatarData 新avatar資料
   */
  public async onAvatarUpdate(avatarData: BrickBreakerAvatarData): Promise<void> {
    // 更新資料
    this.avatarData = avatarData;
    // 更新玩家外觀
    this.updateAvatarOutward();
  }

  /** 根據avatarData決定角色外觀, 例如防護罩的顯示等 */
  private updateAvatarOutward() {
    const hasShield = this.avatarData.itemList[BrickBreakerItemType.Shield] > 0;
    const hasFreezePrevent = this.avatarData.itemList[BrickBreakerItemType.FreezePrevent] > 0;
    this.shieldImg.setVisible(hasShield);
    this.freezePreventImg.setVisible(hasFreezePrevent);
  }

  //#region 各種表演
  /** 使此playerComponent播放特效
   * @param effectKey 特效Key
   * @param customToX 目標x
   * @param customToY 目標y
   * @param angleOffset 角度偏移
   * @returns 特效Tween
   */
  private async playEffectTween(
    effectKey: BrickBreakerEffectKey,
    customToX?: number,
    customToY?: number,
    angleOffset?: number
  ): Promise<Phaser.Tweens.Tween | undefined> {
    // 從特效Sprite物件池中獲取Sprite
    const sprite: Phaser.GameObjects.Sprite = this.effectTweenSpriteGroup.get();
    // 避免sprite在同一幀被重複抓取
    sprite.setActive(true);
    // 獲取特效資料
    const effectData = this.scene.effectDataMap.get(effectKey);
    if (effectData === undefined) {
      return undefined;
    }

    const customEffectData = Object.assign({}, effectData);
    // 修改目的地x(為了表演發射攻擊魔王)
    customEffectData.toX = customToX ?? customEffectData.toX;
    // 修改目的地y(為了表演發射攻擊魔王)
    customEffectData.toY = customToY ?? customEffectData.toY;
    // 修改成固定角度(為了表演遠程武器對準魔王)
    customEffectData.fromAngle = angleOffset ? angleOffset + customEffectData.fromAngle : customEffectData.fromAngle;
    customEffectData.toAngle = angleOffset ? angleOffset + customEffectData.toAngle : customEffectData.toAngle;

    // 依照給予的特效資料設置Tween
    return await AnimationHelper.setTweenFromEffectData(sprite, customEffectData, true);
  }

  /** 表演上下線
   * @param isOnline 是否上線
   */
  public playOnline(isOnline: boolean): void {
    // 若斷線, 將英雄改成半透明，並開啟offlineTag
    this.heroIcon.setAlpha(isOnline ? 1 : 0.5);
    this.offlineTag.setVisible(isOnline === false);

    if (isOnline === false) {
      this.freezeTween?.complete();
      this.playTeleport();
    }
  }

  /** 表演移動
   * @param targetGrid 移動目標格子
   */
  public async playMove(targetGrid: GridComponent): Promise<void> {
    const walkTween = this.scene.add.tween({
      targets: this,
      x: targetGrid.x,
      y: targetGrid.y,
      duration: BrickBreakerNumber.WalkTweenSec * 1000,
    });
    // 等移動完畢
    await this.onWalk(targetGrid, walkTween);
    // 更新角色位置
    this.setPlayerPosition(targetGrid.x, targetGrid.y);
  }

  /** 表演撞牆 */
  public async playHitWall(): Promise<void> {
    // 撞擊目標格
    const targetGrid = this.scene.gridManager.getGridComponent(this.avatarData.targetGridId);
    // 撞擊點定為兩格的中間
    const hitPointX = (targetGrid.x + this.x) / 2;
    const hitPointY = (targetGrid.y + this.y) / 2;
    const walkTween = this.scene.add.tween({
      targets: this,
      x: hitPointX,
      y: hitPointY,
      yoyo: true,
      duration: (BrickBreakerNumber.WalkTweenSec / 2) * 1000,
    });
    // 等移動完畢
    await this.onWalk(targetGrid, walkTween);
  }

  /** 表演移動
   * @param targetGrid 移動目標格子
   * @param walkTween 移動tween
   */
  private async onWalk(targetGrid: GridComponent, walkTween: Phaser.Tweens.Tween): Promise<void> {
    // 英雄圖片翻轉
    this.heroIcon.setFlipX(targetGrid.x > this.x);
    // 播放走路動畫
    this.heroIcon.anims.play(this.heroAnimWalkKey);
    // 等移動完畢
    await AsyncHelper.pendingUntil(() => walkTween.totalProgress === 1);
    // 播放Idle動畫
    this.heroIcon.anims.play(this.heroAnimIdleKey);
  }

  /** 表演敲磚
   * @param brickPosition 目標磚塊世界位置
   */
  public async playBreakBrickTo(brickPosition: Phaser.Math.Vector2): Promise<void> {
    // 磚相對位置
    const brickRelativePosition = this.getRelativePosition(brickPosition);
    // 磚相對夾角
    const brickRelativeIncludedAngle = this.getRelativeIncludedAngle(brickRelativePosition);
    // 向磚發出敲磚特效
    await this.playEffectTween(BrickBreakerEffectKey.AvatarBreakBrick, 0, 0, brickRelativeIncludedAngle);
  }

  /** 表演爆炸 */
  public async playBomb(): Promise<void> {
    // 等待爆炸表演完成
    await this.playEffectTween(BrickBreakerEffectKey.GridBomb);
    // 瞬移
    return this.playTeleport();
  }

  /** 表演瞬移 */
  public async playTeleport(): Promise<void> {
    // avatarData.currentGridId即要瞬移的目標位置
    const targetGrid = this.scene.gridManager.getGridComponent(this.avatarData.currentGridId);
    // 防呆
    if (targetGrid === undefined) {
      console.error(
        `player ${this.avatarData.uid} playTeleport() error, targetGrid undefined, currentGridId ${this.avatarData.currentGridId}`
      );
      return;
    }

    // 若為玩家自己則focus
    const isSelf = this.isSelf;
    if (isSelf) {
      await this.scene.focusOnPlayer(0.75, true, false);
    }

    // 創建曲線
    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(this.x, this.y),
      new Phaser.Math.Vector2((this.x + targetGrid.x) / 2, this.y - 1000),
      new Phaser.Math.Vector2(targetGrid.x, targetGrid.y)
    );
    // 曲線上的路徑點
    const path = { t: 0, vec: new Phaser.Math.Vector2() };
    this.scene.add.tween({
      targets: path,
      t: 1,
      ease: 'Sine.easeInOut',
      duration: BrickBreakerNumber.TeleportTweenSec * 1000,
      onUpdate: () => {
        // 抓到路徑點並移動
        curve.getPoint(path.t, path.vec);
        this.x = path.vec.x;
        this.y = path.vec.y;
      },
      onComplete: () => {
        this.setPlayerPosition(targetGrid.x, targetGrid.y);
      },
    });

    // 等瞬移完畢
    await AsyncHelper.sleep(BrickBreakerNumber.TeleportTweenSec);
    // 若為玩家自己則解除focus
    if (isSelf) {
      await this.scene.stopFocusOnPlayer();
    }
  }

  /** 表演遠程攻擊 */
  public async playAttack(): Promise<void> {
    // Boss相對位置
    const bossRelativePosition = this.getRelativePosition(this.scene.gridManager.getBossPosition());
    // Boss相對夾角
    const bossRelativeIncludedAngle = this.getRelativeIncludedAngle(bossRelativePosition);
    // 向魔王發出遠程攻擊特效
    await this.playEffectTween(
      BrickBreakerEffectKey.AvatarAttack,
      bossRelativePosition.x,
      bossRelativePosition.y,
      bossRelativeIncludedAngle
    );
    // 表演魔王扣血
    this.playBossDamaged();
  }

  /** 表演手裡劍攻擊 */
  public async playShuriken(): Promise<void> {
    // Boss相對位置
    const bossRelativePosition = this.getRelativePosition(this.scene.gridManager.getBossPosition());

    // 向魔王發出手裡劍攻擊特效
    await this.playEffectTween(BrickBreakerEffectKey.AvatarShuriken, bossRelativePosition.x, bossRelativePosition.y);

    // 表演魔王扣血
    this.playBossDamaged();
  }

  /** 表演防禦成功 */
  public async playDefenseSuccess(): Promise<void> {
    // 播放文字提示
    this.scene.effectLayer.playPopUpString('防禦成功', this.x, this.y - BrickBreakerNumber.GridHeight / 2);
    // 播放觸手
    await this.playEffectTween(BrickBreakerEffectKey.GridTentacle);
  }

  /** 表演防禦失敗(回重生點) */
  public async playDefenseFailedBomb(): Promise<void> {
    // 播放文字提示
    this.scene.effectLayer.playPopUpString('防禦失敗', this.x, this.y - BrickBreakerNumber.GridHeight / 2);
    // 播放觸手
    await this.playEffectTween(BrickBreakerEffectKey.GridTentacle);
    // 炸回重生點
    return this.playBomb();
  }

  /** 表演防禦失敗(使用護盾) */
  public async playDefenseFailedShield(): Promise<void> {
    // 播放文字提示
    this.scene.effectLayer.playPopUpString('防禦失敗', this.x, this.y - BrickBreakerNumber.GridHeight / 2);
    // 防護罩破掉
    this.playEffectTween(BrickBreakerEffectKey.AvatarDefense);
    // 播放觸手
    await this.playEffectTween(BrickBreakerEffectKey.GridTentacle);
  }

  /** 表演冰凍 */
  public async playFreeze(): Promise<void> {
    this.isPlayingfreezeTween = true;
    this.freezeTween = await this.playEffectTween(BrickBreakerEffectKey.AvatarFreeze);
    this.isPlayingfreezeTween = false;
  }

  /** 表演解冰凍 */
  public async playUnfreeze(): Promise<void> {
    // 若遊戲中點別的分頁再點回來, 有可能造成playFreeze()跟playUnfreeze()在同一個frame先後call到的情況,
    // 為了確保有關到freezeTween, 所以等freezeTween生好後再關掉
    await AsyncHelper.pendingUntil(() => {
      return this.isPlayingfreezeTween === false;
    });
    // 關掉freezeTween
    this.freezeTween?.complete();
    // 解凍分子特效，分子特效現無法搭配EffectData使用
    this.scene.effectLayer.playUnfreezeEffect(this.x, this.y);
  }

  /** 表演使用號角 */
  public async playHorn(): Promise<void> {
    await this.playEffectTween(BrickBreakerEffectKey.AvatarHorn);
  }

  /** 表演獲得道具
   * @param itemType 道具類型
   */
  public async playGetItem(itemType: BrickBreakerItemType): Promise<void> {
    const effectKey = this.getItemEffectKeyTable.get(itemType);
    if (effectKey === undefined) {
      return;
    }
    await this.playEffectTween(effectKey);
  }

  /** 表演獲得道具
   * @param itemType 道具類型
   */
  public playGetItemAround(itemType: BrickBreakerItemType): void {
    const effectKey = this.getItemEffectKeyTable.get(itemType);
    if (effectKey === undefined) {
      return;
    }

    // 找出對應Grid
    this.scene.gridManager.playEffectAroundGrid(this.avatarData.currentGridId, effectKey);
  }

  /** 表演使用道具
   * @param itemType 道具類型
   */
  public async playUseItem(itemType: BrickBreakerItemType): Promise<void> {
    const effectKey = this.useItemEffectKeyTable.get(itemType);
    if (effectKey === undefined) {
      return;
    }
    await this.playEffectTween(effectKey);
  }

  /** 表演近距離攻擊 */
  public async playHitBoss(): Promise<void> {
    // Boss相對位置
    const bossRelativePosition = this.getRelativePosition(this.scene.gridManager.getBossPosition());
    // Boss相對夾角
    const bossRelativeIncludedAngle = this.getRelativeIncludedAngle(bossRelativePosition);
    // 向魔王發出近距離攻擊特效
    await this.playEffectTween(BrickBreakerEffectKey.AvatarHitBoss, 0, 0, bossRelativeIncludedAngle);
    // 表演魔王扣血
    this.playBossDamaged();
  }

  /** 表演魔王扣血 */
  private playBossDamaged(): void {
    const damage = this.getHitBossDamage();
    const bossPosition = this.scene.gridManager.getBossPosition();
    // 播放受擊特效
    this.scene.effectLayer.playEffectTween(BrickBreakerEffectKey.GridBomb, bossPosition.x, bossPosition.y);
    // 計算扣血數字, 避免顯示小數點
    const contentNumber = Math.trunc(-damage);
    // 播放扣血數字
    this.scene.effectLayer.playPopUpNumber(
      contentNumber,
      bossPosition.x,
      bossPosition.y - BrickBreakerNumber.GridHeight / 2
    );
  }
  //#endregion

  /** 表演 玩家狀態不可移動 */
  public async playUserStateNotMovable(): Promise<void> {
    // hero搖一搖
    this.scene.add.tween({
      targets: this,
      angle: {
        from: -5,
        to: 5,
      },
      // 實際表演時間 = duration * yoyo * repeat = 0.08 * 2 * 2 = 0.32
      yoyo: true,
      repeat: 1,
      duration: 80,
      onComplete: () => {
        this.angle = 0;
      },
    });
    await AsyncHelper.sleep(0.4);
  }

  /** 獲取相對位置(因為遠程攻擊物件掛在playerCompnent底下，因此使用相對位置計算)
   * @param position 世界位置
   * @returns 以自身為基準計算出的相對位置
   */
  private getRelativePosition(position: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(position.x - this.x, position.y - this.y);
  }

  /** 獲取相對夾角
   * @param relativePosition 自身為基準計算出的相對位置
   * @returns 相對夾角
   */
  private getRelativeIncludedAngle(relativePosition: Phaser.Math.Vector2): number {
    const relativeIncludedRotation = Phaser.Math.Angle.Between(0, 0, relativePosition.x, relativePosition.y);
    return Phaser.Math.RadToDeg(relativeIncludedRotation);
  }

  /** 計算攻擊魔王數值 */
  private getHitBossDamage(): number {
    // 攻擊數值即avatarData.bossDamage與上次攻擊時的變化量
    const damage = this.avatarData.bossDamage - this.lastBossDamage;
    // 更新lastBossDamage
    this.lastBossDamage = this.avatarData.bossDamage;
    return damage;
  }
}
