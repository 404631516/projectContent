import { BrickBreakerAvatarData } from '@/views/H5/Net/NetProtocol/BrickBreakerStructure';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import BrickBreakerGameScene from '../../Scenes/BrickBreakerGameScene';
import BrickBreakerGamePlayerComponent from './BrickBreakerGamePlayerComponent';

export default class BrickBreakerGamePlayerManager extends Object2D {
  /** 指定為BrickBreakerGameScene使用，確保傳給BrickBreakerGamePlayerComponent的是BrickBreakerGameScene */
  public declare scene: BrickBreakerGameScene;

  /** 玩家component */
  private playerMap: Map<number, BrickBreakerGamePlayerComponent> = new Map<number, BrickBreakerGamePlayerComponent>();

  /** scene 限定為BrickBreakerGameScene */
  constructor(scene: BrickBreakerGameScene) {
    super(scene);
  }

  /** update */
  public onUpdate(): void {
    // render順序依照y值排序
    // 必須轉成any, 否則GameObject本身沒有y
    const allGameObject: any[] = this.list;
    allGameObject.sort((a: any, b: any) => {
      return a.y - b.y;
    });
  }

  /** 將圖片或container加進Player這層Layer, 設定座標, 跟著playerComponent一起動態排序y值render順序
   * @param targetObject 目標物件
   * @param x 座標x
   * @param y 座標y
   */
  public addObjectToPlayerLayer(
    targetObject: Phaser.GameObjects.Container | Phaser.GameObjects.Sprite | Phaser.GameObjects.Text,
    x: number,
    y: number
  ): void {
    this.add(targetObject);
    targetObject.x = x;
    targetObject.y = y;
  }

  /** 取得特定玩家PlayerComponent
   * @param uid 玩家uid
   */
  public getPlayer(uid: number): BrickBreakerGamePlayerComponent | undefined {
    return this.playerMap.get(uid);
  }

  /** 創建新的playerComponent
   * @param avatarData 玩家資料
   * @param posX 初始位置x
   * @param posY 初始位置y
   */
  public onAvatarJoin(avatarData: BrickBreakerAvatarData, posX: number, posY: number): void {
    if (this.playerMap.has(avatarData.uid)) {
      console.error(`player ${avatarData.uid} already created!`);
      return;
    }
    // 生成BrickBreakerPlayerComponent
    const newPlayerComponent = new BrickBreakerGamePlayerComponent(this.scene, avatarData, posX, posY);
    // 將playerComponent加入PlayerManager底下, 確保render順序
    this.addAt(newPlayerComponent);
    // 存入map管理
    this.playerMap.set(avatarData.uid, newPlayerComponent);
  }
}
