export default abstract class Bot {
  /** bot uid */
  public uid: number;
  /** 房間id */
  public roomId!: number;

  constructor(uid: number) {
    this.uid = uid;
  }

  /** update */
  public abstract update(): void;
  /** login並更新自己的token */
  public abstract login(account: string, password: string): Promise<boolean>;
  /** 設定要加入房間的房號&密碼 */
  public abstract setRoomInfo(roomId: number, password: string): void;
}
