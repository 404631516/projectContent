import BaseGroups from '@/views/H5/Scripts/Components/BaseGroups';
import { VerticalParkourHero } from '../Hero/VerticalParkourHero';
import { VerticalParkourObstacle } from './Object/VerticalParkourObstacle';
import { VerticalParkourKey } from './Object/VerticalParkourKey';
import { VerticalParkourTreasure as VerticalParkourTreasure } from './Object/VerticalParkourTreasure';
import Helper, { ErrorId } from '@/views/H5/Helper/Helper';
import VerticalParkourGameScene from '../../Scenes/VerticalParkourGameScene';
import { VerticalParkourCoin } from './Object/VerticalParkourCoin';
import { VerticalParkourGroupsObject } from './VerticalParkourGroupsObject';
import { VerticalParkourGroup } from '../../Data/VerticalParkourConfig';
import { VerticalParkourAvatar } from './Object/VerticalParkourAvatar';
import TimeHelper from '@/views/H5/Helper/TimeHelper';

type OverlapGameObject = Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile;

export default class VerticalParkourGroups extends BaseGroups {
  /** 垂直跑酷遊戲場景 */
  public declare scene: VerticalParkourGameScene;

  /** 時間事件間隔 */
  private readonly timeEventInterval = 100;
  /** 回收桶高度 */
  private readonly recycleBinHeight = 500;

  /** 磁鐵時間事件 */
  private magnetTimeEvent: Phaser.Time.TimerEvent;
  /** 是否為磁鐵狀態 */
  public get isMagnet(): boolean {
    return this.magnetTimeEvent && this.magnetTimeEvent.getRepeatCount() > 0;
  }

  /** 障礙物群組 */
  private obstacleGroup: Phaser.Physics.Arcade.Group;
  /** 鑰匙群組 */
  private keyGroup: Phaser.Physics.Arcade.Group;
  /** 寶藏群組 */
  private treasureGroup: Phaser.Physics.Arcade.Group;
  /** 金幣群組 */
  private coinGroup: Phaser.Physics.Arcade.Group;
  /** 分身群組 */
  private avatarGroup: Phaser.Physics.Arcade.Group;

  public init(): void {
    // 創建所有物理群組
    this.createPhysicGroup(VerticalParkourGroup.ObstacleGroup, { classType: VerticalParkourObstacle });
    this.createPhysicGroup(VerticalParkourGroup.KeyGroup, { classType: VerticalParkourKey });
    this.createPhysicGroup(VerticalParkourGroup.TreasureGroup, {
      classType: VerticalParkourTreasure,
    });
    this.createPhysicGroup(VerticalParkourGroup.CoinGroup, { classType: VerticalParkourCoin });
    this.createPhysicGroup(VerticalParkourGroup.AvatarGroup, { classType: VerticalParkourAvatar });

    this.obstacleGroup = this.getGroup(VerticalParkourGroup.ObstacleGroup) as Phaser.Physics.Arcade.Group;
    this.keyGroup = this.getGroup(VerticalParkourGroup.KeyGroup) as Phaser.Physics.Arcade.Group;
    this.treasureGroup = this.getGroup(VerticalParkourGroup.TreasureGroup) as Phaser.Physics.Arcade.Group;
    this.coinGroup = this.getGroup(VerticalParkourGroup.CoinGroup) as Phaser.Physics.Arcade.Group;
    this.avatarGroup = this.getGroup(VerticalParkourGroup.AvatarGroup) as Phaser.Physics.Arcade.Group;

    // 綁定物理群組事件
    this.scene.physics.add.overlap(this.scene.hero, this.obstacleGroup, this.onHeroOverlapObstacle, undefined, this);
    this.scene.physics.add.overlap(this.scene.hero, this.keyGroup, this.onHeroOverlapKey, undefined, this);
    this.scene.physics.add.overlap(this.scene.hero, this.treasureGroup, this.onHeroOverlapTreasure, undefined, this);
    this.scene.physics.add.overlap(this.scene.hero, this.coinGroup, this.onHeroOverlapCoin, undefined, this);
    this.scene.physics.add.overlap(this.avatarGroup, this.obstacleGroup, this.onAvatarOverlapObstacle, undefined, this);
    this.scene.physics.add.overlap(this.avatarGroup, this.keyGroup, this.onAvatarOverlapKey, undefined, this);
    this.scene.physics.add.overlap(this.avatarGroup, this.coinGroup, this.onAvatarOverlapCoin, undefined, this);

    // 回收桶，用來確認物件是否超出場景
    const recycleBin = this.scene.physics.add.sprite(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height + this.recycleBinHeight,
      '',
    );
    recycleBin.setSize(this.scene.cameras.main.width, this.recycleBinHeight);
    // 綁定回收事件
    this.scene.physics.add.overlap(
      recycleBin,
      [this.obstacleGroup, this.keyGroup, this.treasureGroup, this.coinGroup],
      this.onRecycleBinOverlapObject,
      undefined,
      this,
    );
  }

  /**
   * 從指定的群組創建物件
   * @param group 指定的群組
   * @param speed 移動速度
   * @param leftEdge 隨機生成位置左邊界
   * @param rightEdge 隨機生成位置右邊界
   */
  public createGroupObject(group: VerticalParkourGroup, speed: number, leftEdge: number, rightEdge: number): void {
    const object = this.getMemberFromGroup<VerticalParkourGroupsObject>(group);
    if (object === undefined) {
      Helper.assert(ErrorId.VariableUndefined, group);
      return;
    }

    object.init(speed, leftEdge, rightEdge);
  }

  /**
   * 英雄碰撞障礙物事件(扣能量)
   * @param heroGameObject 英雄物件
   * @param obstacleGameObject 障礙物物件
   */
  public onHeroOverlapObstacle(heroGameObject: OverlapGameObject, obstacleGameObject: OverlapGameObject): void {
    const hero = heroGameObject as VerticalParkourHero;
    const obstacle = obstacleGameObject as Phaser.Physics.Arcade.Sprite;

    // 避免重複碰撞
    if (obstacle.active === false) {
      return;
    }
    this.hideMemberFromGroup(VerticalParkourGroup.ObstacleGroup, obstacle);

    // 英雄無敵狀態
    if (hero.isInvincible) {
      return;
    }

    // 通知英雄受傷
    this.scene.heroHurt();
  }

  /**
   * 英雄碰撞鑰匙事件(獲得鑰匙)
   * @param heroGameObject 英雄物件
   * @param keyGameObject 鑰匙物件
   */
  public onHeroOverlapKey(heroGameObject: OverlapGameObject, keyGameObject: OverlapGameObject): void {
    const key = keyGameObject as Phaser.Physics.Arcade.Sprite;

    // 避免重複碰撞
    if (key.active === false) {
      return;
    }
    this.hideMemberFromGroup(VerticalParkourGroup.KeyGroup, key);

    // 鑰匙數量增加
    this.scene.increaseKey();
  }

  /**
   * 英雄碰撞寶藏事件(如果有鑰匙就能停下來解鎖寶藏，並增加能量與分數)
   * @param heroGameObject 英雄物件
   * @param treasureGameObject 寶藏物件
   */
  public onHeroOverlapTreasure(heroGameObject: OverlapGameObject, treasureGameObject: OverlapGameObject): void {
    const hero = heroGameObject as VerticalParkourHero;
    const treasure = treasureGameObject as VerticalParkourTreasure;

    // 避免重複碰撞
    if (treasure.active === false) {
      return;
    }

    // 使用鑰匙解鎖寶藏
    if (this.scene.useKey()) {
      // 隱藏寶藏
      this.hideMemberFromGroup(VerticalParkourGroup.TreasureGroup, treasure);

      // 通知解鎖寶箱
      this.scene.unlockTreasure();
    }
  }

  /**
   * 英雄碰撞金幣事件(增加分數)
   * @param heroGameObject 英雄物件
   * @param coinGameObject 金幣物件
   */
  public onHeroOverlapCoin(heroGameObject: OverlapGameObject, coinGameObject: OverlapGameObject): void {
    const coin = coinGameObject as VerticalParkourCoin;

    // 避免重複碰撞
    if (coin.active === false) {
      return;
    }
    this.hideMemberFromGroup(VerticalParkourGroup.CoinGroup, coin);

    // 通知獲得金幣
    this.scene.gainCoin();
  }

  /**
   * 分身碰撞障礙物事件
   * @param avatarGameObject 分身物件
   * @param obstacleGameObject 障礙物物件
   */
  public async onAvatarOverlapObstacle(
    avatarGameObject: OverlapGameObject,
    obstacleGameObject: OverlapGameObject,
  ): Promise<void> {
    const avatar = avatarGameObject as VerticalParkourAvatar;
    const obstacle = obstacleGameObject as Phaser.Physics.Arcade.Sprite;

    // 避免重複碰撞
    if (obstacle.active === false || avatar.isDead) {
      return;
    }
    this.hideMemberFromGroup(VerticalParkourGroup.ObstacleGroup, obstacle);
    // 等待分身死亡
    await avatar.die();
    this.hideMemberFromGroup(VerticalParkourGroup.AvatarGroup, avatar);
  }

  /**
   * 分身碰撞鑰匙事件(獲得鑰匙)
   * @param heroGameObject 分身物件
   * @param keyGameObject 鑰匙物件
   */
  public onAvatarOverlapKey(avatarGameObject: OverlapGameObject, keyGameObject: OverlapGameObject): void {
    const avatar = avatarGameObject as VerticalParkourAvatar;
    const key = keyGameObject as Phaser.Physics.Arcade.Sprite;

    // 避免重複碰撞
    if (key.active === false || avatar.isDead) {
      return;
    }
    this.hideMemberFromGroup(VerticalParkourGroup.KeyGroup, key);

    // 鑰匙數量增加
    this.scene.increaseKey();
  }

  /**
   * 分身碰撞金幣事件(增加分數)
   * @param heroGameObject 分身物件
   * @param coinGameObject 金幣物件
   */
  public onAvatarOverlapCoin(avatarGameObject: OverlapGameObject, coinGameObject: OverlapGameObject): void {
    const avatar = avatarGameObject as VerticalParkourAvatar;
    const coin = coinGameObject as VerticalParkourCoin;

    // 避免重複碰撞
    if (coin.active === false || avatar.isDead) {
      return;
    }
    this.hideMemberFromGroup(VerticalParkourGroup.CoinGroup, coin);

    // 通知獲得金幣
    this.scene.gainCoin();
  }

  /**
   * 回收桶碰撞物件事件，回收超出場景的物件
   * @param recycleBin 回收桶，用來確認物件是否超出場景
   * @param object 超出場景的物件
   */
  private onRecycleBinOverlapObject(recycleBin: OverlapGameObject, object: OverlapGameObject): void {
    const sprite = object as Phaser.Physics.Arcade.Sprite;
    if (sprite.active === false) {
      return;
    }

    // 資源回收
    sprite.setActive(false);
    sprite.setVisible(false);
  }

  /**
   * 開啟磁鐵功能
   * @param duration 磁鐵持續時間(秒)
   */
  public magnet(duration: number): void {
    // time event
    this.magnetTimeEvent = this.scene.time.addEvent({
      delay: this.timeEventInterval,
      callback: () => {
        // 磁鐵效果，吸引鑰匙跟金幣
        const groups = [this.keyGroup, this.coinGroup];
        groups.forEach((group) => {
          group.getChildren().forEach((object) => {
            // 場景上的物件往英雄移動
            if (object.active) {
              this.scene.physics.moveToObject(object, this.scene.hero, 500);
            }
          });
        });
      },
      callbackScope: this,
      repeat: Math.floor((duration * TimeHelper.millisecondPerSecond) / this.timeEventInterval) - 1,
    });
  }

  /**
   * 開啟炸彈功能
   * @param diameter 直徑
   */
  public bomb(diameter: number): void {
    const bodyList = this.scene.physics.overlapCirc(
      this.scene.hero.x,
      this.scene.hero.y,
      diameter / 2,
      true,
      false,
    ) as Phaser.Physics.Arcade.Body[];

    bodyList.forEach((body) => {
      const object = body.gameObject;
      if (object instanceof VerticalParkourObstacle) {
        this.hideMemberFromGroup(VerticalParkourGroup.ObstacleGroup, object);
      } else if (object instanceof VerticalParkourKey) {
        this.hideMemberFromGroup(VerticalParkourGroup.KeyGroup, object);
      } else if (object instanceof VerticalParkourTreasure) {
        this.hideMemberFromGroup(VerticalParkourGroup.TreasureGroup, object);
      } else if (object instanceof VerticalParkourCoin) {
        this.hideMemberFromGroup(VerticalParkourGroup.CoinGroup, object);
      } else if (object instanceof VerticalParkourAvatar) {
        this.hideMemberFromGroup(VerticalParkourGroup.AvatarGroup, object);
      }
    });
  }
}
