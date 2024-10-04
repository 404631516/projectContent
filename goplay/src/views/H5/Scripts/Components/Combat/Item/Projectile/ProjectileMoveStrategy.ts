import { CombatNumber } from '@/helper/enum/Combat';
import BaseProjectile from './BaseProjectile';
import { CompassRad } from '@/views/H5/Helper/MathHelper';

/** 投射物移動Strategy */
export default abstract class ProjectileMoveStrategy {
  /** 初始化路徑點 */
  public abstract init(projectile: BaseProjectile): void;
  /** 跟隨路徑點移動
   * @param projectile 投射物
   * @param delta 幀間隔
   */
  public abstract move(projectile: BaseProjectile, delta: number): void;
  /** 清除路徑點 */
  public abstract finish(projectile: BaseProjectile): void;
}

/** 環繞移動 */
export class SurroundMove extends ProjectileMoveStrategy {
  private surroundTween!: Phaser.Tweens.Tween;

  public init(projectile: BaseProjectile): void {
    // 創建圓形曲線
    const curve = new Phaser.Curves.Ellipse(
      0,
      0,
      projectile.target ? projectile.target.displayHeight : 64,
      projectile.target ? projectile.target.displayHeight : 64,
      0,
      360,
      false,
      Phaser.Math.RadToDeg(projectile.rotation)
    );
    // 曲線上的路徑點
    const path = { t: 0, vec: new Phaser.Math.Vector2() };
    // 設置tween
    this.surroundTween = projectile.scene.add.tween({
      targets: path,
      t: 1,
      duration: 1000,
      onUpdate: () => {
        // 抓到路徑點並移動
        curve.getPoint(path.t, path.vec);
        projectile.x = path.vec.x + (projectile.target ? projectile.target.x : 0);
        projectile.y = path.vec.y + (projectile.target ? projectile.target.y : 0);
      },
      repeat: -1,
    });
  }

  public move(): void {
    return;
  }

  public finish(projectile: BaseProjectile): void {
    this.surroundTween.stop();
  }
}

/** 向前方移動 */
export class ForwardMove extends ProjectileMoveStrategy {
  public init(projectile: BaseProjectile): void {
    return;
  }

  public move(projectile: BaseProjectile, delta: number): void {
    projectile.moveByRotation(delta);
  }

  public finish(projectile: BaseProjectile): void {
    return;
  }
}

/** 追蹤移動 */
export class TraceMove extends ProjectileMoveStrategy {
  public init(projectile: BaseProjectile): void {
    // 提示目標被標記
    projectile.target?.addMarkedAmount();
    return;
  }

  public move(projectile: BaseProjectile, delta: number): void {
    if (projectile.target !== undefined) {
      // 面向目標
      projectile.faceBattleUnit(projectile.target, delta);
      // 如果目標死亡則不做追蹤
      if (projectile.target.isAlive === false) {
        projectile.clearTarget();
      }
    }

    projectile.moveByRotation(delta);
  }

  public finish(projectile: BaseProjectile): void {
    // 提示目標被取消標記
    projectile.target?.reduceMarkedAmount();
    return;
  }
}

/** 迴力鏢移動，移動到道具範圍外後，會回到發動者身上 */
export class BoomerangMove extends ProjectileMoveStrategy {
  /** 出發點 */
  private originalPointX: number = 0;
  private originalPointY: number = 0;

  public init(projectile: BaseProjectile): void {
    projectile.isReturn = false;
    this.originalPointX = projectile.x;
    this.originalPointY = projectile.y;
    return;
  }

  public move(projectile: BaseProjectile, delta: number): void {
    // 計算與出發點之間距離
    const distanceFromOriginal = Phaser.Math.Distance.Between(
      projectile.x,
      projectile.y,
      this.originalPointX,
      this.originalPointY
    );

    // 距離超過道具範圍，投射物往回，向發動者移動
    if (projectile.isReturn === false && distanceFromOriginal > projectile.itemRange) {
      projectile.isReturn = true;
    }

    // 投射物往回時，轉向發動者
    if (projectile.isReturn && projectile.instigator.isAlive) {
      projectile.faceBattleUnit(projectile.instigator, delta);
    }

    projectile.moveByRotation(delta);
  }

  public finish(projectile: BaseProjectile): void {
    projectile.isReturn = false;
  }
}

/** 固定隨目標移動，且轉向目標前方 */
export class FixedFrontMove extends ProjectileMoveStrategy {
  public init(projectile: BaseProjectile): void {
    return;
  }

  public move(projectile: BaseProjectile, delta: number): void {
    projectile.x = projectile.target ? projectile.target.x : 0;
    projectile.y = projectile.target ? projectile.target.y : 0;
    projectile.rotation = projectile.target ? projectile.target.forwardRotation : 0;
  }

  public finish(projectile: BaseProjectile): void {
    return;
  }
}

/** 水平拋物線移動 */
export class CurveMove extends ProjectileMoveStrategy {
  public init(projectile: BaseProjectile): void {
    const isFaceRight: boolean = projectile.instigator.horizontalRotation === CompassRad.Right;
    projectile.rotation = projectile.instigator.horizontalRotation;
    projectile.body.velocity.setTo(projectile.speed * (isFaceRight ? 1 : -1), -CombatNumber.GravityY / 2);
    projectile.body.setGravityY(CombatNumber.GravityY);
  }

  public move(projectile: BaseProjectile, delta: number): void {
    return;
  }

  public finish(projectile: BaseProjectile): void {
    projectile.body.stop();
  }
}
