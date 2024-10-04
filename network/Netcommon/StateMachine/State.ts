import StateMachine from './StateMachine';

/** 一個state的基底類別 */
export default class State<T> {
  public stateMachine!: StateMachine<T>;
  public getTarget(): T {
    return this.stateMachine.getTarget();
  }
  public onEnter() {
    /** */
  }
  public onUpdate(delta?: number) {
    /** */
  }
  public onLeave() {
    /** */
  }
  public triggerEvent(eventID: number) {
    this.stateMachine.triggerEvent(eventID);
  }
}
