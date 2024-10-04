import { RankRuleType } from '@/helper/enum/Common';
import Object2D from '@/views/H5/Scripts/Components/Object2D';
import { Scene } from 'phaser';
import { RankNumber, RankString } from '../Data/RankConfig';
import RankGameScene from '../Scenes/RankGameScene';
import { RankListData } from '@/helper/interface/Rank';
import TableManager from '@/manager/TableManager';
import { CharacterAnimType } from '@/helper/enum/PhaserGame';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';

export default class RankItem extends Object2D {
  /** 指定為RankGameScene使用 */
  public declare scene: RankGameScene;

  /** 當前名次(數字圖片)(個位數) */
  private rankUnitsDigitImage!: Phaser.GameObjects.Image;
  /** 當前名次(數字圖片)(十位數) */
  private rankTensDigitImage!: Phaser.GameObjects.Image;
  /** 當前名次(數字圖片)(百位數) */
  private rankHundredsDigitImage!: Phaser.GameObjects.Image;
  /** 分數長條 */
  private sliderImage!: Phaser.GameObjects.Image;
  /** 大頭貼 */
  private headIcon!: Phaser.GameObjects.Sprite;
  /** 姓名Text */
  private nameText!: Phaser.GameObjects.Text;
  /** 學校Text */
  private schoolText!: Phaser.GameObjects.Text;
  /** 分數Text */
  private scoreText!: Phaser.GameObjects.Text;

  /** 此筆排行資料, 存起來, 以便在資料更新時與舊資料比對 */
  private rankListData!: RankListData;
  /** 排名規則, 最高分 or 總分 */
  private rankRuleType: RankRuleType = RankRuleType.AdlEdu;

  /** 排名異動表演秒數(毫秒), 此值最好要小於排行刷新週期, 否則畫面容易一團亂 */
  private readonly tweenMilliSec: number = 1000;
  /** 長條圖左側對齊位置x */
  private readonly sliderOffsetX: number = 150;

  /** 排名數字圖片keys */
  private readonly rankNumberKeys = [
    RankString.RankNumber0,
    RankString.RankNumber1,
    RankString.RankNumber2,
    RankString.RankNumber3,
    RankString.RankNumber4,
    RankString.RankNumber5,
    RankString.RankNumber6,
    RankString.RankNumber7,
    RankString.RankNumber8,
    RankString.RankNumber9,
  ];
  /** 分數長條圖片keys */
  private readonly rankFrameKeys = [
    RankString.RankFrame1,
    RankString.RankFrame2,
    RankString.RankFrame3,
    RankString.RankFrameOther,
  ];

  constructor(scene: Scene) {
    super(scene);
  }

  /** 初始化RankItem
   * @param rankData 對應的排名資料
   * @param rankRule
   */
  public async init(rankData: RankListData, rankRule: RankRuleType): Promise<void> {
    // 記下一開始的排名資料, 以便之後拿來跟新資料比對
    this.rankListData = rankData;
    // 取得排名模式, 看是比最高分還是總分
    this.rankRuleType = rankRule;

    // 起始位置
    this.x = 0;
    this.y = this.getTargetY(rankData.rank);

    // 生成rankNumber image
    this.rankUnitsDigitImage = this.addImage(this.rankNumberKeys[0], this.sliderOffsetX - 30, 0);
    this.rankTensDigitImage = this.addImage(this.rankNumberKeys[0], this.sliderOffsetX - 65, 0);
    this.rankHundredsDigitImage = this.addImage(this.rankNumberKeys[0], this.sliderOffsetX - 100, 0);
    this.changeRankImage(rankData.rank);

    // 生成slider image
    this.sliderImage = this.addImage(this.rankFrameKeys[0], this.sliderOffsetX, 0);
    // 長條圖原點靠左
    this.sliderImage.setOrigin(0, 0.5);
    // 設定初始長條圖寬高
    this.changeSliderImage(rankData.rank);
    const sliderSize = this.getSliderSize(rankData.rank);
    this.sliderImage.displayWidth = sliderSize.x;
    this.sliderImage.displayHeight = sliderSize.y;

    // 玩家相關資訊位置X值
    const infoPosx = this.sliderOffsetX + sliderSize.x;
    // 分數
    const score = this.rankRuleType === RankRuleType.AdlEdu ? rankData.totalScore : rankData.bestScore;
    this.scoreText = this.addText(score.toString(), this.getScoreTextX(infoPosx), 0);
    // 頭像
    this.setHeadIcon(this.getHeadIconX(infoPosx));
    // 學校
    this.schoolText = this.addText(rankData.playerInfo.school, this.getSchoolAndNameTextX(infoPosx), -10);
    // 姓名
    this.nameText = this.addText(rankData.playerInfo.name, this.getSchoolAndNameTextX(infoPosx), 10);
  }

  /** 收到更新資料
   * @param newRankData 同一玩家的新排名資料
   */
  public refresh(newRankData: RankListData): void {
    // 不論名次是否有變, 都要更新分數
    const score = this.rankRuleType === RankRuleType.AdlEdu ? newRankData.totalScore : newRankData.bestScore;
    this.scoreText.text = score.toString();

    // 若名次有變, tween移動至對應位置
    if (this.rankListData.rank !== newRankData.rank) {
      // 取得slider的原始size及目標size
      const originSliderSize = this.getSliderSize(this.rankListData.rank);
      const targetSliderSize = this.getSliderSize(newRankData.rank);
      // 取得目標posY
      const targetY = this.getTargetY(newRankData.rank);
      // 取得玩家資訊位置X
      const infoPosX = this.sliderOffsetX + targetSliderSize.x;

      // 排名數字更換
      this.changeRankImage(newRankData.rank);

      // 各個排名物件 tween的共通設定
      const commonTweenConfig = {
        ease: 'Sine.easeOut',
        easeParams: [3.5],
        duration: this.tweenMilliSec,
      };

      // 分數Text pos x y
      this.scene.add.tween({
        targets: this.scoreText,
        x: this.getScoreTextX(infoPosX),
        y: 0,
        ...commonTweenConfig,
      });
      // 頭像 pos x y
      this.scene.add.tween({
        targets: this.headIcon,
        x: this.getHeadIconX(infoPosX),
        ...commonTweenConfig,
      });
      // 學校Text pos x y
      this.scene.add.tween({
        targets: this.schoolText,
        x: this.getSchoolAndNameTextX(infoPosX),
        y: -10,
        ...commonTweenConfig,
      });
      // 姓名Text pos x y
      this.scene.add.tween({
        targets: this.nameText,
        x: this.getSchoolAndNameTextX(infoPosX),
        y: 10,
        ...commonTweenConfig,
      });
      // this移動Y值
      this.scene.add.tween({
        targets: this,
        y: targetY,
        ...commonTweenConfig,
      });

      // 先設定成舊排名的大小, 再tween表演成新排名的大小
      this.changeSliderImage(newRankData.rank);
      this.sliderImage.displayWidth = originSliderSize.x;
      this.sliderImage.displayHeight = originSliderSize.y;
      // 長條圖寬高 若是排名上升或下降, tween表演稍微有點差異
      const isRankUp: boolean = this.rankListData.rank > newRankData.rank;
      // 長條圖寬高 設定成指定大小
      this.scene.add.tween({
        targets: this.sliderImage,
        displayWidth: targetSliderSize.x,
        displayHeight: targetSliderSize.y,
        ease: isRankUp ? 'Back.easeOut' : 'Linear',
        easeParams: isRankUp ? [3.5] : undefined,
        duration: this.tweenMilliSec,
      });
    }

    // 更新rankData
    this.rankListData = newRankData;
  }

  /** 此玩家被踢出排名外, 表演刪除此RankItem */
  public selfDestroy(): void {
    // TODO 退場動畫
    this.destroy();
  }

  /** 取得RankItem在對應排名的position Y
   * @param rank 排名
   */
  private getTargetY(rank: number): number {
    return rank * RankNumber.ItemSpacingY + RankNumber.ItemOffsetY;
  }

  /** 根據排名顯示不同長條圖片
   * @param rank 排名
   */
  private changeSliderImage(rank: number): void {
    // 使用rank對應的長條圖案
    let targetImageIndex = rank - 1;
    // 若rank超過長條圖案數, 使用最後一個圖案
    if (targetImageIndex >= this.rankFrameKeys.length) {
      targetImageIndex = this.rankFrameKeys.length - 1;
    }
    // setTexture
    this.sliderImage.setTexture(this.rankFrameKeys[targetImageIndex]);
  }

  /** 根據排名顯示不同排名數字圖片
   * @param rank 排名
   */
  private changeRankImage(rank: number): void {
    // 計算個位數、十位數、百位數
    const rankUnitsDigit = rank % 10;
    const rankTensDigit = Math.floor((rank % 100) / 10);
    const rankHundredsDigit = Math.floor((rank % 1000) / 100);
    // 設置圖片
    this.rankUnitsDigitImage.setTexture(this.rankNumberKeys[rankUnitsDigit]);
    this.rankTensDigitImage.setTexture(this.rankNumberKeys[rankTensDigit]);
    this.rankHundredsDigitImage.setTexture(this.rankNumberKeys[rankHundredsDigit]);
    // 位數不到不用顯示
    this.rankTensDigitImage.setVisible(rank >= 10);
    this.rankHundredsDigitImage.setVisible(rank >= 100);
    // 第一名用特殊圖片
    if (rank === 1) {
      this.rankUnitsDigitImage.setTexture(RankString.RankNumberWin);
    }
  }

  /** 設定頭像
   * @param playerId
   * @param posX
   */
  private setHeadIcon(posX: number): void {
    // 骰出對應圖片key
    const allHeroData = TableManager.hero.getAll();
    const randomHeroData = allHeroData[Math.floor(Math.random() * allHeroData.length)];
    const headIconkey = `${randomHeroData.nameKey}${CharacterAnimType.Run}`;
    // 根據key決定要設置的圖片, 播動畫
    const animKey = 'headAnimationKey';
    this.headIcon = this.addSprite(headIconkey, posX, -10);
    this.headIcon.anims.create({
      key: animKey,
      frames: headIconkey,
      frameRate: 8,
      showOnStart: true,
      repeat: -1,
    });
    this.headIcon.anims.play(animKey);
    this.headIcon.setScale(0.3);
    this.headIcon.setFlipX(true);
  }

  /** 根據名次決定長條圖的寬高
   * @param rank 排名
   */
  private getSliderSize(rank: number): Phaser.Math.Vector2 {
    switch (rank) {
      case 1:
        return new Phaser.Math.Vector2(677, 45);
      case 2:
        return new Phaser.Math.Vector2(612, 43);
      case 3:
        return new Phaser.Math.Vector2(537, 39);
      case 4:
        return new Phaser.Math.Vector2(475, 35);
      case 5:
        return new Phaser.Math.Vector2(475, 33);
      default:
        return new Phaser.Math.Vector2(475, 33);
    }
  }

  /** 取得頭像的位置X
   * @param infoPosx 玩家資訊位置中心點
   */
  private getHeadIconX(infoPosx: number): number {
    return infoPosx;
  }

  /** 取得學校&姓名的位置X
   * @param infoPosx 玩家資訊位置中心點
   */
  private getSchoolAndNameTextX(infoPosx: number): number {
    return infoPosx + 100;
  }

  /** 取得分數的位置X
   * @param infoPosx 玩家資訊位置中心點
   */
  private getScoreTextX(infoPosx: number): number {
    return (this.sliderOffsetX + infoPosx) / 2;
  }
}
