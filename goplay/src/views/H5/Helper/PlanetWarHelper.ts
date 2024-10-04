import TableManager from '@/manager/TableManager';

export default class PlanetWarHelper {
  /** 將英雄等級換算成星球大戰等級
   * @param heroLevel 英雄等級
   * @returns 星球大戰等級
   */
  public static getHeroPlanetWarLevel(heroLevel: number): number {
    let planetWarLevel = -1;

    const heroLevels = TableManager.heroLevel.getAll();
    // 換算英雄等級區間
    for (let i = 0; i < heroLevels.length; ++i) {
      if (heroLevel <= heroLevels[i].heroLevel) {
        planetWarLevel = heroLevels[i].planetWarLevel;
        break;
      }
      // 超過最後一筆的等級就以最後一筆的星球大戰等級處理
      if (i === heroLevels.length - 1) {
        planetWarLevel = heroLevels[i].planetWarLevel;
        break;
      }
    }

    // 防呆, 找不到等級區間的情況
    if (planetWarLevel === -1) {
      console.error(`planetWarLevel not found! heroLevel = ${heroLevel}`);
    }

    return planetWarLevel;
  }

  /** 用星球大戰等級換算血量
   * @param hp 初始血量
   * @param planetWarLevel 星球大戰等級
   * @returns 換算後的血量
   */
  public static getHpByPlanetWarLevel(hp: number, planetWarLevel: number): number {
    // 初始化血量 = 血量參數 + ((等級-1)*血量參數) / 5
    return hp + ((planetWarLevel - 1) * hp) / 5;
  }

  /** 用星球大戰等級換算防禦力
   * @param defense 初始防禦力
   * @param planetWarLevel 星球大戰等級
   * @returns 換算後的防禦力
   */
  public static getDefenseByPlanetWarLevel(defense: number, planetWarLevel: number): number {
    // 初始化防禦力 = 防禦力參數 + ((等級-1)*防禦力) / 10
    return defense + ((planetWarLevel - 1) * defense) / 10;
  }
}
