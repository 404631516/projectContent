import store, { Store } from '@/store';

export class StoreHelper {
    public static $$store: Store = store as Store;
}
