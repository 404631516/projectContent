import { AsyncHelper } from '@/views/H5/Helper/AsyncHelper';
import { VerticalParkourString } from '../../../Data/VerticalParkourConfig';
import { VerticalParkourGroupsObject } from '../VerticalParkourGroupsObject';
import VerticalParkourGameScene from '../../../Scenes/VerticalParkourGameScene';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';

export class VerticalParkourAvatar extends VerticalParkourGroupsObject {
  /** 垂直跑酷遊戲場景 */
  public declare scene: VerticalParkourGameScene;

  /** 英雄圖片 */
  private hero: Phaser.GameObjects.Sprite;

  /** 是否正在死亡 */
  private _isDead: boolean = false;
  public get isDead(): boolean {
    return this._isDead;
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    // 設置滑板圖片
    this.sprite = this.addSprite(VerticalParkourString.Skateboard, 0, 0);
    this.sprite.setOrigin(0.5);
    this.sprite.setDepth(1);
    // 設置英雄動畫
    const heroData = this.scene.hero.heroData;
    // 設置角色圖, 固定顯示Idle動畫的第一幀, 不必播放
    const characterSpriteKey = AnimationHelper.getCharacterAnimKey(heroData, CharacterAnimType.Idle);
    this.hero = this.addSprite(characterSpriteKey, 0, 0);
    this.hero.setOrigin(0.5);
    this.hero.setScale(0.44);
    this.hero.setDepth(1);
  }

  init(speed: number, leftEdge: number, rightEdge: number): void {
    this._isDead = false;

    // 重置sprite & hero的位置及角度
    this.sprite.setPosition(0, 0);
    this.sprite.setAngle(0);
    this.hero.setPosition(0, -43);
    this.hero.setAngle(0);

    // 設置物理碰撞範圍
    this.body.setSize(this.sprite.displayWidth, this.sprite.displayHeight);
    this.body.setOffset(-this.sprite.displayWidth / 2, -this.sprite.displayHeight / 2);
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(1);
    this.setPosition(this.scene.hero.x, this.scene.hero.y);

    // 設置物體的隨機角度
    const angle = Phaser.Math.Between(0, 360);

    // 將角度轉換為弧度
    const radians = Phaser.Math.DegToRad(angle);

    // 計算 x 和 y 方向上的速度分量
    const velocityX = Math.cos(radians) * speed;
    const velocityY = Math.sin(radians) * speed;

    // 設置物體的速度
    this.body.setVelocity(velocityX, velocityY);

    this.setVisible(true);
    this.setActive(true);
  }

  /** 進入死亡狀態 */
  public async die(): Promise<void> {
    // 播放死亡音效
    this.scene.sound.play(VerticalParkourString.AudioHurt);

    this._isDead = true;
    this.body.setVelocity(0, 0);

    const durationMilliSecs = 1000;

    // tween, sprite向左上飛出
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.sprite.x - 20,
      y: this.sprite.y - 20,
      duration: durationMilliSecs,
      ease: 'Power2',
    });

    // tween, sprite逆時針旋轉
    this.scene.tweens.add({
      targets: this.sprite,
      angle: -420,
      duration: durationMilliSecs,
      ease: 'Power2',
    });

    // tween, hero向右上飛出
    this.scene.tweens.add({
      targets: this.hero,
      x: this.hero.x + 20,
      y: this.hero.y - 20,
      duration: durationMilliSecs,
      ease: 'Power2',
    });

    // tween, hero順時針旋轉
    this.scene.tweens.add({
      targets: this.hero,
      angle: 60,
      duration: durationMilliSecs,
      ease: 'Power2',
    });

    await AsyncHelper.sleep(durationMilliSecs / 1000);
    this.setActive(false);
    this.setVisible(false);
  }
}
