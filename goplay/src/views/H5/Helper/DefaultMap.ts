export default class DefaultMap<K, V> extends Map<K, V> {
  private defaultValue: () => V;

  constructor(defaultValue: () => V, entries?: ReadonlyArray<Readonly<[K, V]>> | null) {
    super(entries);
    this.defaultValue = defaultValue;
  }

  get(key: K): V {
    if (!this.has(key)) {
      const value = this.defaultValue();
      this.set(key, value);
      return value;
    }
    return super.get(key)!;
  }
}
