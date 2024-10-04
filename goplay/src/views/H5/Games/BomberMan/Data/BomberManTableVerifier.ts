import { BomberManItemFunction, EnemyMoveType, MapItemType, BomberManNumber } from './BomberManConfig';
import TableManager from '@/manager/TableManager';
import BomberManGameScene from '../Scenes/BomberManGameScene';
import Localization, { LocalKeyType } from '@/views/H5/Scripts/Components/Localization';
import FileHelper from '@/views/H5/Helper/FileHelper';
import { PathDirectionType } from '@/views/H5/Helper/TileMapPathFinder';

/** 檢查炸彈超人靜態表 */
export default class BomberManTableVerifier {
  public static verifyAllTable(): void {
    this.verifySettingTable();
    this.verifyItemTable();
    this.verifyStageTable();
    this.verifyEnemyTable();
  }

  /** 驗證設定表 */
  private static verifySettingTable(): void {
    console.log(`verifySettingTable`);

    const tileMap = BomberManGameScene.instance.tilemap;
    if (tileMap == null) {
      console.error(`tileMap null`);
      return;
    }

    const tableID = 1;
    const setting = TableManager.bomberManSetting.findOne(tableID);
    if (setting == null) {
      console.error(`setting null`);
      return;
    }

    // 分數
    this.checkScore(setting.targetScore, tableID);
    this.checkPositiveNumber(setting.energyScoreRatio, tableID);
    this.checkScore(setting.destroyWallScore, tableID);
    this.checkScore(setting.pickItemScore, tableID);

    // 能量
    this.checkSecond(setting.energyDropIntervalSec, tableID);
    this.checkEnergy(setting.energyDropIncresePerInterVal, tableID);
    this.checkEnergy(setting.maxEnergyAmount, tableID);
    this.checkEnergy(setting.reviveEnergy, tableID);
    this.checkEnergyCost(setting.heroHitEnemyDamage, tableID);
    this.checkEnergyCost(setting.heroHitBlastDamage, tableID);
    this.checkEnergyCost(setting.heroPutBombCost, tableID);
    this.checkEnergy(setting.killEnemyGainEnergy, tableID);
    this.checkEnergy(setting.destroyWallGainEnergy, tableID);

    // 英雄
    this.checkRange(setting.heroSpawnTileX, 0, tileMap.terrainTileCountX - 1, tableID);
    this.checkRange(setting.heroSpawnTileY, 0, tileMap.terrainTileCountY - 1, tableID);
    this.checkLevel(setting.heroBaseBlastLv, tableID);
    this.checkLevel(setting.heroBaseBombCountLv, tableID);
    this.checkSpeed(setting.heroBaseMoveSpeed, tableID);

    // 敵人
    this.checkSecond(setting.nextWavePromptSec, tableID);
    this.checkRange(setting.spawnEnemyDistance, 3, 10, tableID);

    // 地圖物件參數
    this.checkRange(setting.spawnMapObjectDistance, 1, 10, tableID);
    this.checkSecond(setting.bombExplosionSec, tableID);

    //#region 交互影響
    // 續命能量 不超過 總能量
    if (setting.reviveEnergy > setting.maxEnergyAmount) {
      console.error(`setting.reviveEnergy=${setting.reviveEnergy} out of range`);
    }
    //#endregion 交互影響
  }

  /** 驗證道具表 */
  private static verifyItemTable(): void {
    console.log(`verifyItemTable`);

    const itemList = TableManager.bomberManItem.getAll();
    if (itemList == null || itemList.length === 0) {
      console.error(`itemList null`);
      return;
    }

    itemList.forEach((itemTable) => {
      const tableID = itemTable.id;
      console.log(`verifySettingTable: id=${tableID}`);
      this.checkLocalization(itemTable.nameKey, tableID);
      this.checkLocalization(itemTable.contentKey, tableID);
      this.checkString(itemTable.url, tableID);

      // 價格
      if (itemTable.isMapItem === MapItemType.StoreItem) {
        this.checkEnergy(itemTable.energy, tableID);
      } else if (itemTable.isMapItem === MapItemType.MapItem) {
        this.checkFixNumber(itemTable.energy, 0, tableID);
      }

      this.checkRange(
        itemTable.itemFunction,
        BomberManItemFunction.None + 1,
        BomberManItemFunction.Max - 1,
        itemTable.id
      );
      this.checkRange(itemTable.isMapItem, MapItemType.StoreItem, MapItemType.MapItem, tableID);

      // 主動技能
      if (
        itemTable.itemFunction >= BomberManItemFunction.ThroughWall &&
        itemTable.itemFunction <= BomberManItemFunction.Invincible
      ) {
        this.checkFixNumber(itemTable.plusItemLv, 0, tableID);
        this.checkSecond(itemTable.duration, tableID);
      }
      // 被動技能
      else {
        this.checkPositiveNumber(itemTable.plusItemLv, tableID);
        this.checkFixNumber(itemTable.duration, 0, tableID);
      }
    });
  }

  /** 驗證關卡表 */
  private static verifyStageTable(): void {
    console.log(`verifyStageTable`);

    const stageList = TableManager.bomberManStage.getAll();
    if (stageList == null || stageList.length === 0) {
      console.error(`stageList null`);
      return;
    }

    const tileMap = BomberManGameScene.instance.tilemap;
    if (tileMap == null) {
      console.error(`tileMap null`);
      return;
    }

    stageList.forEach((stageTable) => {
      const tableID = stageTable.id;
      console.log(`verifyStageTable: id=${tableID}`);
      const mapJsonId = stageTable.mapJsonId;
      if (mapJsonId !== 1) {
        console.error(`stageTable mapJsonId=${mapJsonId},  id=${tableID}`);
      }

      this.checkSecond(stageTable.countDownSec, tableID);

      // 計時型波次
      if (stageTable.waveIntervalSec !== BomberManNumber.invalidId) {
        this.checkSecond(stageTable.waveIntervalSec, tableID);
      }

      //#region wave enemy
      // 各波敵人id 轉數值陣列
      const enemyIDArray = stageTable.waveEnemyIDList;
      // 各波敵人數量 轉數值陣列
      const enemyCountArray = stageTable.waveEnemyCountList;

      // 陣列長度防呆
      if (enemyIDArray.length !== enemyCountArray.length) {
        console.error(`initEnemyWaveData: enemy id/count is different, stageID=${tableID}`);
      }
      this.checkRange(enemyIDArray.length, 1, 100, tableID);

      enemyIDArray.forEach((enemyID) => {
        if (null == TableManager.bomberManEnemy.findOne(enemyID)) {
          console.error(`stageTable enemyID=${enemyID}, stageID=${tableID}`);
        }
      });

      enemyCountArray.forEach((enemyCount) => {
        this.checkRange(enemyCount, 1, 100, tableID);
      });
      //#endregion wave enemy

      this.checkRange(stageTable.wallDensity, 0, 1, tableID);

      // 地圖道具
      // 道具id清單文字 轉陣列
      const itemIDList = stageTable.bonusItemIDList;
      this.checkRange(itemIDList.length, 1, 20, stageTable.id);
      itemIDList.forEach((itemID) => {
        if (null == TableManager.bomberManItem.findOne(itemID)) {
          console.error(`stageTable bonus itemID=${itemID}, stageID=${tableID}`);
        }
      });
    });
  }

  /** 驗證敵人表 */
  private static verifyEnemyTable(): void {
    console.log(`verifyEnemyTable`);

    const enemyList = TableManager.bomberManEnemy.getAll();
    if (enemyList == null || enemyList.length === 0) {
      console.error(`enemyList null`);
      return;
    }

    enemyList.forEach((enemyTable) => {
      const tableID = enemyTable.id;
      console.log(`verifyEnemyTable: id=${tableID}`);
      this.checkLocalization(enemyTable.nameKey, tableID);
      this.checkString(enemyTable.url, tableID);
      this.checkScore(enemyTable.killEnemyScore, tableID);
      this.checkSpeed(enemyTable.enemyMoveSpeedMin, tableID);
      this.checkSpeed(enemyTable.enemyMoveSpeedMax, tableID);
      this.checkRange(enemyTable.enemyMoveType, EnemyMoveType.Random, EnemyMoveType.Max - 1, tableID);

      // 偏好方向-遇牆向右/左轉 or 隨機抽選
      if (
        enemyTable.enemyMoveType === EnemyMoveType.TurnWhenHitWall ||
        enemyTable.enemyMoveType === EnemyMoveType.Random
      ) {
        this.checkRange(enemyTable.enemyMovePreferArrow, PathDirectionType.Left, PathDirectionType.Right, tableID);
      }
      // 其他不填
      else {
        this.checkFixNumber(enemyTable.enemyMovePreferArrow, 0, tableID);
      }
    });
  }

  //#region detail
  /** 檢查多國字
   * @param key 多國字key
   * @param tableID 表格id
   */
  private static checkLocalization(key: string, tableID: number): void {
    if (key.length === 0 || key === Localization.getText(LocalKeyType.Common, key)) {
      console.error(`多國字 key=${key}, tableID=${tableID}`);
    }
  }

  /** 檢查字串
   * @param text 字串
   * @param tableID 表格id
   */
  private static checkString(text: string, tableID: number): void {
    if (text.length === 0) {
      console.error(`字串=${text}, tableID=${tableID}`);
    }
  }

  /** 檢查正數
   * @param value 檢查的數值
   * @param tableID 表格id
   */
  private static checkPositiveNumber(value: number, tableID: number): void {
    if (value <= 0) {
      console.error(`正數=${value}, tableID=${tableID}`);
    }
  }

  /** 檢查固定數值
   * @param value 檢查的數值
   * @param fix 固定數值
   * @param tableID 表格id
   */
  private static checkFixNumber(value: number, fix: number, tableID: number): void {
    if (value !== fix) {
      console.error(`固定數值, value=${value}, tableID=${tableID}`);
    }
  }

  /** 檢查分數
   * @param score 分數
   * @param tableID 表格id
   */
  private static checkScore(score: number, tableID: number): void {
    if (score <= 0 || score >= 10000) {
      console.error(`分數=${score}, tableID=${tableID}`);
    }
  }

  /** 檢查能量
   * @param energy 能量
   * @param tableID 表格id
   */
  private static checkEnergy(energy: number, tableID: number): void {
    if (energy <= 0 || energy > 1000) {
      console.error(`能量=${energy}, tableID=${tableID}`);
    }
  }

  /** 檢查能量消耗
   * @param minus 能量消耗
   * @param tableID 表格id
   */
  private static checkEnergyCost(minus: number, tableID: number): void {
    if (minus >= 0 || minus <= -1000) {
      console.error(`能量消耗=${minus}, tableID=${tableID}`);
    }
  }

  /** 檢查移動速度
   * @param speed 速度
   * @param tableID 表格id
   */
  private static checkSpeed(speed: number, tableID: number): void {
    if (speed <= 0 || speed >= 10) {
      console.error(`速度=${speed}, tableID=${tableID}`);
    }
  }

  /** 檢查道具等級
   * @param level 道具等級
   * @param tableID 表格id
   */
  private static checkLevel(level: number, tableID: number): void {
    if (level <= 0 || level >= 10) {
      console.error(`道具等級=${level}, tableID=${tableID}`);
    }
  }

  /** 檢查秒數
   * @param second 秒數
   * @param tableID 表格id
   */
  private static checkSecond(second: number, tableID: number): void {
    if (second <= 0 || second >= 600) {
      console.error(`秒數=${second}, tableID=${tableID}`);
    }
  }

  /** 檢查範圍的數字
   * @param value 檢查的數值
   * @param min 最小值
   * @param max 最大值
   * @param tableID 表格id
   */
  private static checkRange(value: number, min: number, max: number, tableID: number): void {
    if (value < min || value > max) {
      console.error(`範圍的數字=${value}, not in ${min}~${max}, tableID=${tableID}`);
    }
  }
  //#endregion detail
}
