import State from '@/views/H5/Scripts/Components/StateMachine/State';
import StateMachine from '@/views/H5/Scripts/Components/StateMachine/StateMachine';
import HeroUniverseNpc from './HeroUniverseNpc';

export enum HeroUniverseNpcEventId {
  /** 無事件 */
  Idle = 0,
  /** 有可完成任務 */
  HasCompletableTasks,
  /** 有可接取任務 */
  HasAcceptableTasks,
  /** 有進行中任務 */
  HasInProgressTasks,
}

export default class HeroUniverseNpcFSM extends StateMachine<HeroUniverseNpc> {
  constructor(npc: HeroUniverseNpc) {
    super();
    this.setTarget(npc);

    // create states.
    const idleState = this.createState(IdleState);
    const hasCompletableTasksState = this.createState(HasCompletableTasksState);
    const hasInProgressTasks = this.createState(HasInProgressTasks);
    const hasAcceptableTasksState = this.createState(HasAcceptableTasksState);

    // set transition.
    this.setAnyStateTransition(HeroUniverseNpcEventId.Idle, idleState);
    this.setAnyStateTransition(HeroUniverseNpcEventId.HasCompletableTasks, hasCompletableTasksState);
    this.setAnyStateTransition(HeroUniverseNpcEventId.HasInProgressTasks, hasInProgressTasks);
    this.setAnyStateTransition(HeroUniverseNpcEventId.HasAcceptableTasks, hasAcceptableTasksState);

    this.initState(idleState);
  }
}

/** 無事件狀態 */
class IdleState extends State<HeroUniverseNpc> {
  public onEnter(): void {
    const npc = this.getTarget();
    npc.onIdleEnter();
  }
}

/** 有可完成任務 */
class HasCompletableTasksState extends State<HeroUniverseNpc> {
  public onEnter(): void {
    const npc = this.getTarget();
    npc.onHasCompletableTasksEnter();
  }
}

/** 有進行中任務 */
class HasInProgressTasks extends State<HeroUniverseNpc> {
  public onEnter(): void {
    const npc = this.getTarget();
    npc.onHasInProgressTasksStateEnter();
  }
}

/** 有可接受任務 */
class HasAcceptableTasksState extends State<HeroUniverseNpc> {
  public onEnter(): void {
    const npc = this.getTarget();
    npc.onHasAcceptableTasksStateEnter();
  }
}
