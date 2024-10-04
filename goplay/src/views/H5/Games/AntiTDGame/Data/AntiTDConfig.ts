export enum AntiTDString {
  //#region image
  /** 道具類型圖標 */
  ItemTypeIcon = 'ItemTypeIcon',
  /** 選角標示箭頭 */
  TeamIcon = 'TeamIcon',
  /** 英雄位置指示 */
  HeroIndicator = 'HeroIndicator',
  /** 敵人位置指示 */
  EnemyIndicator = 'EnemyIndicator',
  /** 掉落地上的魔力球 */
  EnergyBall = 'EnergyBall',
  /** 尚未解鎖圖示 */
  Lock = 'Lock',
  /** 敵人生成點圖案 */
  EnemySpawnPoint = 'EnemySpawnPoint',
  /** 切換道具鍵 */
  SwitchKeyIcon = 'SwitchKeyIcon',
  /** 切換道具鍵 */
  SwitchKeyBg = 'SwitchKeyBg',
  /** 道具鍵 */
  ItemKey = 'ItemKey',
  /** 進度條敵人圖示 */
  EnemyIcon = 'EnemyIcon',
  /** 警告Icon */
  WarningIcon = 'WarningIcon',
  /** 紫色背景框 */
  FramePurple = 'FramePurple',
  /** 分隔線 */
  Line = 'Line',
  //#endregion image

  //#region Tilemap
  /** 地塊圖層 */
  TileLayer = 'TileLayer',
  /** 物件圖層 */
  ObjectLayer = 'ObjectLayer',
  /** 敵人生成點物件群組 */
  EnemySpawnPointGroup = 'EnemySpawnPointGroup',
  /** 圖塊集 */
  Tileset = 'Tileset',
  /** 可生成英雄 */
  TileTypeHeroSpawnPoint = 'heroSpawnPoint',
  /** 障礙物與戰鬥單位碰撞 */
  ColliderObstacleWithUnit = 'ColliderObstacleWithUnit',
  /** 可生成敵人 */
  ObjectTypeEnemySpawnPoint = 'enemySpawnPoint',
  //#endregion

  // #region audio
  /** 補血音效 */
  HpSfx = 'HpSfx',
  /** 扣血音效 */
  HpSfxNegative = 'HpSfxNegative',
  /** 血條背景圖 */
  HpBarBg = 'AntiTDHpBarBg',
  /** 血條值圖 */
  HpBarValue = 'AntiTDHpBarValue',
}

export enum AntiTDNumber {
  /** 攝影機縮放 */
  CameraZoom = 0.65,
  /** 攝影機在結果表演時的縮放 */
  CameraZoomOnResult = 1.5,
  /** 攝影機OffsetY */
  CameraOffsetY = 80,

  /** 波數敵人隊伍擊殺要求率 */
  WaveEnemyTeamKillsRequireRate = 0.7,
}
