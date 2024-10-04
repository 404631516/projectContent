import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import ParkourHero from './ParkourHero';

export enum ParkourHeroEventID {
  /** 進入準備 */
  Ready = 0,
  /** 跑動 */
  Run,
  /** 跳躍 */
  Jump,
  /** 飛行 */
  Fly,
  /** 下落 */
  Fall,
  /** 進入重生 */
  Respawn,
  /** 進入死亡 */
  Dead,
}

export enum ParkourHeroStateID {
  /** 準備 */
  Ready = 0,
  /** 跑步 */
  Run,
  /** 一段跳 */
  FirstJump,
  /** 二段跳 */
  SecondJump,
  /** 三段跳 */
  ThirdJump,
  /** 飛行 */
  Fly,
  /** 掉落 */
  Fall,
  /** 重生 */
  Respawn,
  /** 死亡 */
  Dead,
}

export default class ParkourHeroFSM {
  /** 狀態機 */
  public stateMachine: StateMachine<ParkourHeroFSM> = new StateMachine<ParkourHeroFSM>();

  /** 狀態Map */
  private stateMap: Map<ParkourHeroStateID, State<ParkourHeroFSM>> = new Map<
    ParkourHeroStateID,
    State<ParkourHeroFSM>
  >();

  /** 英雄角色 */
  private _hero: ParkourHero;
  public get hero(): ParkourHero {
    return this._hero;
  }

  constructor(hero: ParkourHero) {
    this._hero = hero;

    this.stateMachine.setTarget(this);

    // create states.
    const readyState = this.stateMachine.createState(ReadyState);
    this.stateMap.set(ParkourHeroStateID.Ready, readyState);

    const runState = this.stateMachine.createState(RunState);
    this.stateMap.set(ParkourHeroStateID.Run, runState);

    const firstJumpState = this.stateMachine.createState(JumpState);
    this.stateMap.set(ParkourHeroStateID.FirstJump, firstJumpState);

    const secondJumpState = this.stateMachine.createState(JumpState);
    this.stateMap.set(ParkourHeroStateID.SecondJump, secondJumpState);

    const thirdJumpState = this.stateMachine.createState(JumpState);
    this.stateMap.set(ParkourHeroStateID.ThirdJump, thirdJumpState);

    const flyState = this.stateMachine.createState(FlyState);
    this.stateMap.set(ParkourHeroStateID.Fly, flyState);

    const fallState = this.stateMachine.createState(FallState);
    this.stateMap.set(ParkourHeroStateID.Fall, fallState);

    const respawnState = this.stateMachine.createState(RespawnState);
    this.stateMap.set(ParkourHeroStateID.Respawn, respawnState);

    const deadState = this.stateMachine.createState(DeadState);
    this.stateMap.set(ParkourHeroStateID.Dead, deadState);

    // set transition.
    // 跑步 -> 一段跳
    this.stateMachine.setStatesTransition(ParkourHeroEventID.Jump, firstJumpState, [runState]);
    // 二段跳 -> 三段跳
    this.stateMachine.setStatesTransition(ParkourHeroEventID.Jump, thirdJumpState, [secondJumpState]);

    // 一段跳、復活、飛行、掉落 -> 二段跳
    this.stateMachine.setStatesTransition(ParkourHeroEventID.Jump, secondJumpState, [
      firstJumpState,
      respawnState,
      flyState,
      fallState,
    ]);

    // 準備、一段跳、二段跳、三段跳、復活、飛行、掉落 -> 跑步
    this.stateMachine.setStatesTransition(ParkourHeroEventID.Run, runState, [
      readyState,
      firstJumpState,
      secondJumpState,
      thirdJumpState,
      respawnState,
      flyState,
      fallState,
    ]);

    // 跑步、一段跳、二段跳、三段跳、復活 -> 飛行
    this.stateMachine.setStatesTransition(ParkourHeroEventID.Fly, flyState, [
      runState,
      firstJumpState,
      secondJumpState,
      thirdJumpState,
      respawnState,
    ]);

    // 飛行 -> 掉落
    this.stateMachine.setStatesTransition(ParkourHeroEventID.Fall, fallState, [flyState]);

    // any transition.
    // Any -> 復活
    this.stateMachine.setAnyStateTransition(ParkourHeroEventID.Respawn, respawnState);
    // Any -> 死亡
    this.stateMachine.setAnyStateTransition(ParkourHeroEventID.Dead, deadState);
    // Any -> 準備
    this.stateMachine.setAnyStateTransition(ParkourHeroEventID.Ready, readyState);
  }

  public start(): void {
    // change to defaule state.
    const readyState = this.stateMap.get(ParkourHeroStateID.Ready);
    if (readyState !== undefined) {
      this.stateMachine.initState(readyState);
    }
  }

  public update(delta: number): void {
    this.stateMachine.updateState(delta);
  }

  /** 判斷是否為某個狀態
   * @param state 要判斷的狀態
   * @returns boolean
   */
  public isCurrentState(stateID: ParkourHeroStateID): boolean {
    const state = this.stateMap.get(stateID);
    return state === undefined ? false : this.stateMachine.isCurrentState(state);
  }
}

class ReadyState extends State<ParkourHeroFSM> {
  public onEnter(): void {
    this.getTarget().hero.onReadyEnter();
  }
}

class RunState extends State<ParkourHeroFSM> {
  public onEnter(): void {
    const hero = this.getTarget().hero;
    hero.onRunEnter();
    // 避免轉換到跑步狀態時喪失加速度
    hero.setCollisionVelocity();
  }

  // 移動狀態中持續給予加速度
  public onUpdate(): void {
    this.getTarget().hero.setCollisionVelocity();
  }
}

class JumpState extends State<ParkourHeroFSM> {
  public onEnter(): void {
    const hero = this.getTarget().hero;
    hero.onJumpEnter();
    // 避免轉換到跳躍狀態時喪失加速度
    hero.setCollisionVelocity();
  }

  // 移動狀態中持續給予加速度
  public onUpdate(): void {
    const hero = this.getTarget().hero;
    hero.setCollisionVelocity();

    // 著地時回復跑步狀態
    if (hero.body.onFloor()) {
      this.triggerEvent(ParkourHeroEventID.Run);
    }
  }
}

class FlyState extends State<ParkourHeroFSM> {
  private flyTimeEvent!: Phaser.Time.TimerEvent;

  public onEnter(): void {
    const hero = this.getTarget().hero;
    hero.onFlyEnter();

    // 延遲發動，結束狀態
    this.flyTimeEvent = hero.scene.time.addEvent({
      delay: hero.flyduration * 1000,
      callback: () => {
        this.triggerEvent(ParkourHeroEventID.Fall);
      },
    });
  }

  public onLeave(): void {
    const hero = this.getTarget().hero;
    // 將飛行計時器移除重置
    hero.scene.time.removeEvent(this.flyTimeEvent);

    hero.onFlyLeave();
  }
}

class FallState extends State<ParkourHeroFSM> {
  public onUpdate(): void {
    const hero = this.getTarget().hero;
    hero.setCollisionVelocity();

    // 著地時回復跑步狀態
    if (this.getTarget().hero.body.onFloor()) {
      this.triggerEvent(ParkourHeroEventID.Run);
    }
  }
}

class RespawnState extends State<ParkourHeroFSM> {
  public onEnter(): void {
    this.getTarget().hero.onRespawnEnter();
  }

  public onUpdate(delta: number): void {
    const hero = this.getTarget().hero;

    // 重生狀態時，速度會慢慢回升
    hero.onRespawnUpdate(delta);

    // 著地時回復跑步狀態
    if (hero.body.onFloor()) {
      this.triggerEvent(ParkourHeroEventID.Run);
    }
  }
}

class DeadState extends State<ParkourHeroFSM> {
  public onEnter(): void {
    this.getTarget().hero.onDeadEnter();
  }
}
