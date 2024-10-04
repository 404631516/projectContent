/** 角色動畫類別 */
export enum CharacterAnimType {
  /** 閒置 */
  Idle = 'idle',
  /** 走路 */
  Walk = 'walk',
  /** 跑步 */
  Run = 'run',
  /** 跳躍 */
  Jump = 'jump',
}

/** 預設角色動畫Config */
export const characterDefaultAnimConfig: Phaser.Types.Animations.Animation = { frameRate: 1 };

/** 各動畫類型的角色動畫Config */
export const characterAnimConfigMap: Map<CharacterAnimType, Phaser.Types.Animations.Animation> = new Map([
  [CharacterAnimType.Idle, { frameRate: 5, repeat: -1 }],
  [CharacterAnimType.Walk, { frameRate: 10, repeat: -1 }],
  [CharacterAnimType.Run, { frameRate: 15, repeat: -1 }],
  [CharacterAnimType.Jump, { frameRate: 15 }],
]);

/** 角色類別 */
export enum CharacterType {
  /** 英雄 */
  Hero = 'hero',
  /** 敵人 */
  Enemy = 'enemy',
}

/** 角色顏色 */
export enum CharacterColorType {
  /** 預設 */
  Default = 'default',
  /** 顏色A */
  ColorA = '_colorA',
  /** 顏色B */
  ColorB = '_colorB',
}
