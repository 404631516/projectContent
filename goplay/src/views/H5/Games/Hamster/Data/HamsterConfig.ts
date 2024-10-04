export enum HamsterString {
  // images
  Background = 'bg',
  HoleMask = 'holeMask',
  Icon = 'energyIcon',
  HitEffect = 'hitEffect',
  HeartIcon = 'heartIcon',
  SoundOnIcon = 'soundOnIcon',
  SoundOffIcon = 'soundOffIcon',
  TargetIcon = 'targetIcon',
  Blood = 'blood',
  Gradient = 'gradient',

  // particle emitter
  ParticleEmitterHurt = 'ParticleEmitterHurt',

  // sprite
  NormalHit = 'normalHit',
  SpecialHit = 'specialHit',

  // json
  HolePlace = 'holePlace',
  ParticleEmitterConfigs = 'ParticleEmitterConfigs',

  // audio
  OnHitHamsterSound = 'onHitHamsterSound',
  OnHamsterAttackSound = 'onHamsterAttackSound',
}

export enum HamsterNumber {
  Gravity = 980,
  /** 遊戲倒數秒數 */
  GameSec = 120,
  /** 基本能量 */
  BaseEnergy = 1000,
  /** 每秒消耗的能量 */
  TimeDecrease = -40,
  /** 地鼠自己消失所扣除的能量 */
  DisappearHurt = -20,
  /** 地鼠攻擊所扣除的能量 */
  AttackHurt = -20,
  /** 打錯地鼠所扣除的能量 */
  ErrHurt = -40,
  /** 地鼠消滅成功回饋的能量 */
  KillBonus = 30,
  /** 目標擊殺數 */
  TargetKillCount = 60,
}
