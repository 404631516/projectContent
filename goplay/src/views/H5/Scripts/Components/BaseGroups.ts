/** Phaser群組(物件池)管理 */
export default abstract class BaseGroups {
  /** 遊戲場景 */
  public scene: Phaser.Scene;

  /** 群組Map
   * key: 型別名稱
   * value: 對應群組
   */
  private groupMap: Map<string, Phaser.GameObjects.Group> = new Map();

  /** 建構式
   * @param scene 遊戲場景
   */
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** 繼承類別自定義，初始化創建群組 */
  public abstract init(): void;

  /** 創建非物理群組
   * @param nameKey 群組名稱
   * @param config 群組參數
   */
  public createGroup(nameKey: string, config: Phaser.Types.GameObjects.Group.GroupConfig): void {
    // 如果重複創建
    if (this.groupMap.has(nameKey)) {
      console.error(`創建群組重複: ${nameKey}`);
      console.error(`創建群組config: ${config}`);
      return;
    }

    // 創建並記錄群組
    this.groupMap.set(nameKey, this.scene.add.group(config));
  }

  /** 創建物理群組
   * @param nameKey 群組名稱
   * @param config 群組參數
   */
  public createPhysicGroup(nameKey: string, config: Phaser.Types.Physics.Arcade.PhysicsGroupConfig): void {
    // 如果重複創建
    if (this.groupMap.has(nameKey)) {
      console.error(`創建物理群組重複: ${nameKey}`);
      console.error(`創建物理群組config: ${config}`);
      return;
    }

    // 創建並記錄群組
    this.groupMap.set(nameKey, this.scene.physics.add.group(config));
  }

  /** 獲取對應群組
   * @param nameKey 群組名稱
   * @returns 群組 或 undefined
   */
  public getGroup(nameKey: string): Phaser.GameObjects.Group | undefined {
    if (this.groupMap.has(nameKey) === false) {
      console.error(`無法獲取對應群組: ${nameKey}，使用前必須先創建!`);
      return undefined;
    }

    return this.groupMap.get(nameKey);
  }

  /** 獲取對應群組成員
   * @param nameKey 群組名稱
   * @returns 成員 或 undefined
   */
  public getMemberFromGroup<T extends Phaser.GameObjects.GameObject>(nameKey: string): T | undefined {
    const group = this.getGroup(nameKey);
    return group ? (group.get() as T) : undefined;
  }

  /** 回收對應群組成員
   * @param nameKey 群組名稱
   * @param member 成員
   */
  public hideMemberFromGroup<T extends Phaser.GameObjects.GameObject>(nameKey: string, member: T): void {
    const group = this.getGroup(nameKey);
    if (group === undefined) {
      console.error(`無法獲取對應群組: ${nameKey}，成員無法被回收`);
      return;
    }

    member.parentContainer?.remove(member);
    group.killAndHide(member);
  }

  /** 創建對應群組成員
   * @param nameKey 群組名稱
   * @returns 成員 或 undefined
   */
  public createMemberFromGroup<T extends Phaser.GameObjects.GameObject>(nameKey: string): T | undefined {
    const group = this.getGroup(nameKey);
    return group ? (group.create() as T) : undefined;
  }

  /** 移除對應群組成員
   * @param nameKey 群組名稱
   * @param member 成員
   */
  public removeMemberFromGroup<T extends Phaser.GameObjects.GameObject>(nameKey: string, member: T): void {
    const group = this.getGroup(nameKey);
    if (group === undefined) {
      console.error(`無法獲取對應群組: ${nameKey}，成員無法被移除`);
      return;
    }

    member.parentContainer?.remove(member);
    group.remove(member);
  }
}
