import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import { VerticalParkourHero } from './VerticalParkourHero';

export enum VerticalParkourHeroEventId {
  /** 進入閒置 */
  Idle = 0,
  /** 進入移動 */
  Move,
  /** 解鎖寶箱 */
  Unlock,
  /** 死亡 */
  Die,
}

export default class VerticalParkourHeroFSM extends StateMachine<VerticalParkourHero> {
  constructor(hero: VerticalParkourHero) {
    super();
    this.setTarget(hero);

    // create states.
    const idleState = this.createState(Idle);
    const moveState = this.createState(Move);
    const unlockState = this.createState(Unlock);
    const dieState = this.createState(Die);

    // set transition.
    this.setAnyStateTransition(VerticalParkourHeroEventId.Move, moveState);
    this.setAnyStateTransition(VerticalParkourHeroEventId.Idle, idleState);
    this.setAnyStateTransition(VerticalParkourHeroEventId.Unlock, unlockState);
    this.setAnyStateTransition(VerticalParkourHeroEventId.Die, dieState);

    this.initState(idleState);
  }

  /** 是否為移動狀態 */
  public isMoveState(): boolean {
    return this.isTransitioning === false && this.getCurrentState() instanceof Move;
  }
}

/** 閒置狀態 */
class Idle extends State<VerticalParkourHero> {}

/** 移動狀態 */
class Move extends State<VerticalParkourHero> {
  public onUpdate(time: number, delta: number): void {
    const hero = this.getTarget();
    hero.onMoveUpdate();
  }
}

/** 解鎖狀態 */
class Unlock extends State<VerticalParkourHero> {
  public onEnter(): void {
    const hero = this.getTarget();
    hero.onUnlockEnter();
  }

  public onLeave(): void {
    const hero = this.getTarget();
    hero.onUnlockLeave();
  }
}

/** 死亡狀態 */
class Die extends State<VerticalParkourHero> {
  public onEnter(): void {
    const hero = this.getTarget();
    hero.onDieEnter();
  }
}
