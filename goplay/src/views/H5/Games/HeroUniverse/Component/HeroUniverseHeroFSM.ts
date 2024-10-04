import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import { HeroUniverseHero } from './HeroUniverseHero';

export enum HeroUniverseHeroEventId {
  /** 進入閒置 */
  Idle = 0,
  /** 進入移動 */
  Move,
}

export default class HeroUniverseHeroFSM extends StateMachine<HeroUniverseHero> {
  constructor(hero: HeroUniverseHero) {
    super();
    this.setTarget(hero);

    // create states.
    const idleState = this.createState(Idle);
    const moveState = this.createState(Move);

    // set transition.
    this.setStatesTransition(HeroUniverseHeroEventId.Move, moveState, [idleState]);
    this.setStatesTransition(HeroUniverseHeroEventId.Idle, idleState, [moveState]);

    this.initState(idleState);
  }
}

/** 閒置狀態 */
class Idle extends State<HeroUniverseHero> {
  public onEnter(): void {
    const hero = this.getTarget();
    hero.onIdleEnter();
  }

  public onUpdate(time: number, delta: number): void {
    const hero = this.getTarget();
    hero.onIdleUpdate();
  }
}

/** 移動狀態 */
class Move extends State<HeroUniverseHero> {
  public onEnter(): void {
    const hero = this.getTarget();
    hero.onMoveEnter();
  }

  public onUpdate(time: number, delta: number): void {
    const hero = this.getTarget();
    hero.onMoveUpdate();
  }
}
