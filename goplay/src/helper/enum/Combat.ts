import Config from '@/config/setting';

/** 道具功能列表 */
export enum ItemFunction {
  None = 'None',
  /** 向周圍圓形造成傷害 */
  Aura = 'Aura',
  /** 向前方長方形造成傷害，攻擊時角度會隨發動者移動 */
  Spray = 'Spray',
  /** 向前方扇形揮砍 */
  Slash = 'Slash',
  /** 向前方扇形揮砍，整隊傷害 */
  TeamSlash = 'TeamSlash',
  /** 投射物(攻擊時範圍內有敵人會往敵人方向射擊) */
  Projectile = 'Projectile',
  /** 向前投射物(不管敵人在哪，只會向前發射) */
  ForwardProjectile = 'ForwardProjectile',
  /** 環繞投射物 */
  SurroundProjectile = 'SurroundProjectile',
  /** 並行投射物 */
  ParallelProjectile = 'ParallelProjectile',
  /** 並行召喚物 */
  ParallelMinion = 'ParallelMinion',
  /** 依照投射物數量在敵人位置生成投射物(必中) */
  TargetProjectile = 'TargetProjectile',
  /** 依照投射物數量在敵人位置左上螢幕外生成投射物(必中) */
  DiagonalTargetProjectile = 'DiagonalTargetProjectile',
  /** 針對敵人隊伍隊長的投射物 */
  AimLeaderProjectile = 'AimLeaderProjectile',
  /** 對自己施放 */
  Self = 'Self',
  /** 對自己隊伍施放 */
  Team = 'Team',
  /** 對隨機敵人施放 */
  Random = 'Random',
  /** 偵測到敵人靠近時揮砍 */
  AuraSlash = 'AuraSlash',
  /** 偵測到敵人靠近時發射投射物*/
  AuraProjectile = 'AuraProjectile',
  /** 自己隊友 */
  SelfTeam = 'SelfTeam',
  /** 瀕臨危險的隊友 */
  EndangerTeammate = 'EndangerTeammate',
  /** 已死亡的隊友 */
  DeadTeammate = 'DeadTeammate',
}

/** 投射物功能列表 */
export enum ProjectileFunction {
  None = 'None',
  /** 弓箭 */
  Arrow = 'Arrow',
  /** 物理body弓箭 */
  PhysicsArrow = 'PhysicsArrow',
  /** 拋物線弓箭 */
  CurveArrow = 'CurveArrow',
  /** 魔法彈 */
  Bolt = 'Bolt',
  /** 物理body魔法彈 */
  PhysicsBolt = 'PhysicsBolt',
  /** 斧頭 */
  Axe = 'Axe',
  /** 矛 */
  Spear = 'Spear',
  /** 盾 */
  Shield = 'Shield',
  /** 迴力鏢 */
  Boomerang = 'Boomerang',
  /** 物理body迴力鏢 */
  PhysicsBoomerang = 'PhysicsBoomerang',
  /** 追蹤弓箭 */
  HomingArrow = 'HomingArrow',
  /** 追蹤魔法彈 */
  HomingBolt = 'HomingBolt',
  /** 必中追蹤魔法彈(穿透障礙物且可在界外生存) */
  TargetHomingBolt = 'TargetHomingBolt',
  /** 擊中時攻擊整隊的弓箭 */
  TeamArrow = 'TeamArrow',
  /** 擊中時攻擊整隊的魔法彈 */
  TeamBolt = 'TeamBolt',
}

/** 召喚物功能列表 */
export enum MinionFunction {
  None = 'None',
  /** 分身，複製玩家或是召喚其他英雄分身 */
  Avatar = 'Avatar',
}

/** 擊中生成類型 */
export enum SpawnOnHitType {
  /** 完全不處理 */
  None = 0,
  /** 道具本身處理 */
  Item = 1,
  /** 道具不處理，只交由生成物件處理 */
  SpawnObject = 2,
}

/** 互動類型 */
export enum InteractionType {
  None = 0,
  /** 血量 */
  Hp = 1,
  /** 互動數值 */
  InteractionValue = 2,
  /** 發動速率 */
  LaunchRate = 3,
  /** 防禦力 */
  Defense = 4,
  /** 移動速度 */
  Speed = 5,
  /** 攻擊範圍 */
  Range = 6,
  /** 以上全狀態 */
  AllPositive = 7,
  /** 清除負值狀態 */
  ClearNegative = 8,
  /** 免疫血量傷害 */
  Invincible = 9,
  /** 復活 */
  Revive = 10,
  /** 無視從前方來的負值狀態 */
  IgnoreFront = 11,
  /** 冰凍，無法移動與攻擊 */
  Freeze = 12,
  /** 吸引，讓敵人往中心聚集 */
  Absorb = 13,
  /** 無視投射物負值狀態 */
  IgnoreProjectile = 14,
  /** 無視非投射物負值狀態 */
  IgnoreNonProjectile = 15,
  /** 清除無視狀態 */
  ClearIgnore = 16,
}

/** 特殊互動類型(無增/減益，給予特定狀態或一次性互動) */
export const specialInteractionTypes: InteractionType[] = [
  InteractionType.ClearNegative,
  InteractionType.Invincible,
  InteractionType.Revive,
  InteractionType.IgnoreFront,
  InteractionType.Freeze,
  InteractionType.IgnoreProjectile,
  InteractionType.IgnoreNonProjectile,
  InteractionType.ClearIgnore,
];

/** 忽略攻擊的互動類型 */
export const ignoreInteractionTypes: InteractionType[] = [
  InteractionType.IgnoreFront,
  InteractionType.IgnoreProjectile,
  InteractionType.IgnoreNonProjectile,
];

/** 互動類型的效果 */
export enum InteractionEffect {
  /** 增益 */
  Buff = 0,
  /** 減益 */
  DeBuff = 1,
  /** 用於程式計算 */
  MAX,
}

/** 攻擊模式 */
export enum BattleUnitAttackMode {
  /** 主動攻擊 */
  Active = 0,
  /** 被動攻擊，被打才攻擊 */
  Passive = 1,
  /** 不攻擊 */
  DoNotAttack = 2,
}

/** 血量popUp顯示模式 */
export enum HpPopUpType {
  /** 全部顯示 */
  All = 0,
  /** 負值不顯示 */
  IgnoreNegative = 1,
  /** 正值不顯示 */
  IgnorePositive = 2,
  /** 都不顯示 */
  None = 3,
}

/** 物理body類型 */
export enum BodyType {
  /** 弓箭 */
  Arrow = 0,
  /** 魔法彈 */
  Bolt,
  /** 沒有物理 */
  None,
}

/** 範圍類型 */
export enum RangeType {
  /** 中心圓圈 */
  CenterCircle = 0,
  /** 前端1/4處，半徑為長度1/8的圓圈 */
  TopCircle,
  /** 前方長方形，由前端1/4處，半徑為長度1/8的圓圈 + 前端2/4處，半徑為長度1/8的圓圈組合而成 */
  HalfRectangle,
}

/** 預先定義數值 */
export enum CombatNumber {
  /** 投射物生成散開角度Rad */
  ProjectileSpawnRad = 1.04719755,

  /** 45度，單位Rad */
  Rad_45_Degree = 0.785398163,
  /** 90度，單位Rad */
  Rad_90_Degree = 1.57079633,

  /** 360度，單位Rad */
  Rad_360_Degree = 6.28318531,

  /** 地圖Tile大小 */
  TileSize = 64,
  /** y重力值 */
  GravityY = 196,

  /** 一般旋轉lerp量 */
  NormalLerp = 4,
  /** 直線軌跡lerp量 */
  StraightLerp = 30,
}

/** 預先定義字串 */
export enum CombatString {
  /** 不可穿越類型 */
  TileTypeCanNotPass = 'CanNotPassObstacle',
  /** 只有投射物能穿越類型 */
  TileTypeOnlyProjectilePass = 'OnlyProjectilePassObstacle',
  /** 只有遠距能穿越類型 */
  TileTypeOnlyRangedProjectilePass = 'OnlyRangedProjectilePassObstacle',
  /** 只有魔法能穿越類型 */
  TileTypeOnlyMagicProjectilePass = 'OnlyMagicProjectilePassObstacle',
}

/** 戰鬥特效Id */
export enum CombatEffectId {
  /** 被標記特效Id */
  MarkedEffectId = 323,
  /** 降低血量開始 */
  HpDebuffStart = 328,
  /** 降低血量 */
  HpDebuff = 327,
  /** 增加攻擊力開始 */
  InteractionValueBuffStart = 330,
  /** 增加攻擊力 */
  InteractionValueBuff = 329,
  /** 降低攻擊力 */
  InteractionValueDebuff = 326,
  /** 增加攻擊速率開始 */
  LaunchRateBuffStart = 332,
  /** 增加攻擊速率 */
  LaunchRateBuff = 331,
  /** 降低攻擊速率 */
  LaunchRateDebuff = 322,
  /** 增加防禦力 */
  DefenseBuff = 303,
  /** 降低防禦力 */
  DefenseDebuff = 326,
  /** 增加移動速度開始 */
  SpeedBuffStart = 334,
  /** 增加移動速度 */
  SpeedBuff = 333,
  /** 降低移動速度 */
  SpeedDebuff = 321,
  /** 增加攻擊範圍開始 */
  RangeBuffStart = 336,
  /** 增加攻擊範圍 */
  RangeBuff = 335,
  /** 降低攻擊範圍 */
  RangeDebuff = 326,
  /** 增加全數值 */
  AllPositiveBuff = 320,
  /** 降低全數值開始 */
  AllPositiveDebuffStart = 338,
  /** 降低全數值 */
  AllPositiveDebuff = 337,
  /** 免疫血量傷害 */
  Invincible = 311,
  /** 冰凍 */
  Freeze = 308,
}

/** 圖片資源的資料夾路徑 */
export const combatEffectImgUrl = `${Config.imgUrl}/img/h5/combatEffect`;
/** 音效資源的資料夾路徑 */
export const combatAudioUrl = `${Config.imgUrl}/audio/combat`;
