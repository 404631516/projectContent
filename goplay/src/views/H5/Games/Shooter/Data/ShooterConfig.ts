export enum ShootString {
  // images
  Background = 'bg',
  Grass = 'grass',
  Barrel = 'barrel',
  Cannon = 'cannon',
  EnergyFrame = 'energyFrame',
  EnergyBar = 'energyBar',
  Fire = 'fire',
  ShootTargets = 'shootTargets',
  MagicIcon = 'magicIcon',
  ItemHighLight = 'itemHighLight',
  SoundOnIcon = 'soundOnIcon',
  SoundOffIcon = 'soundOffIcon',

  // audio
  OnShootSound = 'onShootSound',
  OnHitSound = 'onHitSound',
}

export enum ShootNumber {
  /** 單階段射擊目標總血量 */
  StageTargetHp = 2400,
  /** 目標分數 */
  GoalScore = 2400,
  /** 砲彈存活時間 */
  BombLifeTimeMilliSec = 3000,
  /** 砲彈速度 */
  BombVelocity = 1000,
  /** 砲彈重力 */
  BombGravity = 980,
}
