import State from './State';

/** 一條Transition */
export default class Transition<T> {
  public from!: State<T>;

  public to!: State<T>;

  public eventID?: number;
}
