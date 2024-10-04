import { BrickBreakerAvatarUpdateType, BrickBreakerBossData } from '../../NetProtocol/BrickBreakerStructure';

export default class BrickBreakerBoss {
  /** 與client端同步的顯示用資料 */
  private bossData: BrickBreakerBossData;
  public getBossData(): BrickBreakerBossData {
    return this.bossData;
  }

  /** 弩砲攻擊力 */
  private readonly attackDamage: number = 200;
  /** 手裏劍攻擊力 */
  private readonly shurikenDamage: number = 100;
  /** 魔王答題攻擊力(每題) */
  private readonly bossDamageEachCorrect: number = 100;
  /** 每增加一個玩家, 魔王的血量增加量 */
  private readonly bossHpIncreasePerPlayer: number = 4000;

  constructor(bossId: number) {
    // 根據hp公式決定總hp(基本值)
    this.bossData = {
      bossId,
      totalHp: 0,
      hp: 0,
    };
  }

  /** 新玩家加入, 調整魔王血量 */
  public onNewPlayerJoin(): void {
    // 根據hp公式決定總hp(根據人數的變化量)
    this.bossData.totalHp += this.bossHpIncreasePerPlayer;
    this.bossData.hp += this.bossHpIncreasePerPlayer;
  }

  /** 魔王遭到攻擊
   * @param updateType 攻擊事件類型
   * @param correctCount 答對題數, 部分攻擊事件會看答對題數決定攻擊力
   * @param isPowerUp 是否使用威力上升道具
   * @returns 回傳對魔王造成的傷害
   */
  public onAttackBoss(updateType: BrickBreakerAvatarUpdateType, correctCount: number, isPowerUp: boolean): number {
    let damage: number;
    // 根據事件類型(及答對題數)決定魔王扣血量
    switch (updateType) {
      case BrickBreakerAvatarUpdateType.Attack:
        damage = this.attackDamage;
        break;
      case BrickBreakerAvatarUpdateType.Shuriken:
        damage = this.shurikenDamage;
        break;
      case BrickBreakerAvatarUpdateType.HitBossSuccess:
      case BrickBreakerAvatarUpdateType.HitBossFailedBomb:
      case BrickBreakerAvatarUpdateType.HitBossFailedShield:
        damage = this.bossDamageEachCorrect * correctCount;
        break;
      default:
        console.error(
          `BrickBreakerBoss.onAttackBoss() error, unexpected updateType ${BrickBreakerAvatarUpdateType[updateType]}`
        );
        damage = 0;
    }
    // 是否攻擊力加倍
    if (isPowerUp) {
      damage *= 2;
    }
    // 魔王扣血
    this.bossData.hp -= damage;
    if (this.bossData.hp <= 0) {
      this.bossData.hp = 0;
    }
    // 回傳魔王所受傷害
    return damage;
  }

  /** 魔王是否死亡 */
  public isDead(): boolean {
    return this.bossData.hp <= 0;
  }
}
