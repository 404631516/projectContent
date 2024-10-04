import { EffectData } from '@/manager/TableManager';
import HeroUniverseGameScene from '../Scenes/HeroUniverseGameScene';
import AnimationHelper from '@/views/H5/Helper/AnimationHelper';
import { HeroUniverseString } from '../Data/HeroUniverseConfig';
import HeroUniverseNpcFSM, { HeroUniverseNpcEventId } from './HeroUniverseNpcFSM';

/** 因雄宇宙地圖Npc */
export default abstract class HeroUniverseNpc extends Phaser.GameObjects.Sprite {
  /** 名稱文字風格 */
  private readonly textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'sans-serif, serif, monospace',
    fontStyle: 'normal',
    color: '#FFFFFF',
    fontSize: '30px',
    stroke: '#000000',
    strokeThickness: 3,
  };

  /** 遊戲場景 */
  public declare scene: HeroUniverseGameScene;

  /** 將原先body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody 強制定義型別 */
  public declare body: Phaser.Physics.Arcade.Body;

  /** NPC ID */
  public get npcId(): number {
    return this.getData('id') ?? 0;
  }

  /** NPC名稱 */
  public get npcName(): string {
    return this._npcName;
  }

  /** 在遊戲場景中的真實高度 */
  private get inGameHeight(): number {
    return this.height / this.scale;
  }

  /** 狀態機 */
  public fsm: HeroUniverseNpcFSM;
  /** 驚嘆號 */
  private exclamationMark: Phaser.GameObjects.Sprite;
  /** 問號 */
  private questionMark: Phaser.GameObjects.Sprite;
  /** 任務進行中記號 */
  private inProgressMark: Phaser.GameObjects.Sprite;
  /** NPC名稱 */
  private _npcName: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number,
  ) {
    super(scene, x, y, texture, frame);
  }

  update(time: number, delta: number): void {
    this.fsm.updateState(time, delta);
  }

  /** 設定特效
   * @param effectData 特效資料
   */
  public setEffect(effectData: EffectData): void {
    // 計算特效大小以符合原Tile大小
    effectData.fromScale = this.height / effectData.frameSize;
    effectData.toScale = this.height / effectData.frameSize;

    // 播放特效
    AnimationHelper.setTweenFromEffectData(this, effectData, false);
    // 替換特效後須手動重整body大小
    this.body.setSize(this.width, this.height, true);

    // 標記位置
    const markY = this.y - this.inGameHeight / 2;

    // 有可以完成任務的標記: !
    this.exclamationMark = this.scene.add.sprite(this.x, markY, HeroUniverseString.ExclamationMark);
    this.exclamationMark.setDepth(this.depth);

    // 有進行中任務的標記: >>
    this.inProgressMark = this.scene.add.sprite(this.x, markY, HeroUniverseString.ProgressMark);
    this.inProgressMark.setDepth(this.depth);

    // 有可以接取任務的標記: ?
    this.questionMark = this.scene.add.sprite(this.x, markY, HeroUniverseString.QuestionMark);
    this.questionMark.setDepth(this.depth);

    this.fsm = new HeroUniverseNpcFSM(this);
  }

  /** 設定名稱
   * @param name 名稱
   */
  public setDisplayName(name: string): void {
    this._npcName = name;
    const text = this.scene.add.text(this.x, this.y + this.inGameHeight / 2, name, this.textStyle);
    text.setOrigin(0.5, 0).setDepth(this.depth);
  }

  /** 更新狀態 */
  public updateStatus(): void {
    if (this.scene.heroUniverseWeb.hasCompletableTasks(this.npcId)) {
      this.fsm.triggerEvent(HeroUniverseNpcEventId.HasCompletableTasks);
    } else if (this.scene.heroUniverseWeb.hasInProgressTasks(this.npcId)) {
      this.fsm.triggerEvent(HeroUniverseNpcEventId.HasInProgressTasks);
    } else if (this.scene.heroUniverseWeb.hasAcceptableTasks(this.npcId)) {
      this.fsm.triggerEvent(HeroUniverseNpcEventId.HasAcceptableTasks);
    } else {
      this.fsm.triggerEvent(HeroUniverseNpcEventId.Idle);
    }
  }

  public onIdleEnter(): void {
    this.exclamationMark.setVisible(false);
    this.questionMark.setVisible(false);
    this.inProgressMark.setVisible(false);
  }

  public onHasCompletableTasksEnter(): void {
    this.exclamationMark.setVisible(true);
    this.questionMark.setVisible(false);
    this.inProgressMark.setVisible(false);
  }

  public onHasInProgressTasksStateEnter(): void {
    this.exclamationMark.setVisible(false);
    this.questionMark.setVisible(false);
    this.inProgressMark.setVisible(true);
  }

  public onHasAcceptableTasksStateEnter(): void {
    this.exclamationMark.setVisible(false);
    this.questionMark.setVisible(true);
    this.inProgressMark.setVisible(false);
  }
}
