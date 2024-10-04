export enum HeroUniverseString {
  //#region Tilemap
  /** 地圖圖層 */
  TileLayer = 'tileLayer',
  /** 地圖圖層-障礙物 */
  Obstacle = 'obstacle',

  /** 裝飾物件層 */
  DecorationLayer = 'decorationLayer',
  /** 障礙物物件層 */
  ObstacleLayer = 'obstacleLayer',

  /** 出生點物件層 */
  SpawnLayer = 'spawnLayer',
  /** 出生點物件層-出生點 */
  SpawnPoint = 'spawnPoint',

  /** 傳送門圖層 */
  PortalLayer = 'portalLayer',
  /** 傳送門圖層-點擊觸發式傳送門 */
  OnClickPortal = 'onClickPortal',
  /** 傳送門圖層-重疊觸發式傳送門 */
  OnOverlapPortal = 'onOverlapPortal',

  /** NPC圖層 */
  NpcLayer = 'npcLayer',
  /** NPC圖層-點擊觸發式NPC */
  OnClickNpc = 'onClickNpc',
  /** NPC圖層-重疊觸發式NPC */
  OnOverlapNpc = 'onOverlapNpc',

  /** 判斷是否為空欄位 */
  None = 'None',

  /** 圖集spritesheets */
  Tileset = 'tileset',

  /** 英雄與障礙物碰撞 */
  ColliderObstacleWithHero = 'ColliderObstacleWithHero',
  /** 英雄與傳送門重疊偵測 */
  OverlapPortalWithHero = 'OverlapPortalWithHero',
  /** 英雄與NPC重疊偵測 */
  OverlapNpcWithHero = 'OverlapNpcWithHero',
  //#endregion Tilemap

  /** 飛船 */
  Ship = 'Ship',
  /** 返回按鈕 */
  ReturnButton = 'returnButton',
  /** 返回按鈕箭頭Icon */
  ReturnButtonArrow = 'returnButtonArrow',
  /** 驚嘆號 */
  ExclamationMark = 'exclamationMark',
  /** 問號 */
  QuestionMark = 'questionMark',
  /** 任務進行中記號 */
  ProgressMark = 'progressMark',
}

export enum HeroUniverseNumber {
  /** 攝影機縮放 */
  CameraZoom = 0.65,
  /** 攝影機OffsetY */
  CameraOffsetY = 80,
  /** 預設Tile大小 */
  TileSize = 64,
}
