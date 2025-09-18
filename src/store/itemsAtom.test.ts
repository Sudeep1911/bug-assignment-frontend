// atoms/itemsAtom.test.ts
import { getDefaultStore } from 'jotai';
import { itemsAtom } from './itemsAtom';
import { ItemData } from '@/api/item.api';

describe('itemsAtom', () => {
  const store = getDefaultStore();

  const mockItem: ItemData = {
    _id: '1',
    title: 'Item 1',
    type: 'feature',
    description: 'A test item',
    modules: 'module-1',
    priority: 'high',
    assignedTo: 'user-1',
    raisedBy: 'user-2',
    monitoredBy: 'user-3',
    dueDate: '2025-12-31',
  };

  beforeEach(() => {
    store.set(itemsAtom, {
      items: [],
      loading: false,
      error: null,
    });
  });

  it('should add item correctly', () => {
    const current = store.get(itemsAtom);
    store.set(itemsAtom, {
      ...current,
      items: [...current.items, mockItem],
    });

    const updated = store.get(itemsAtom);
    expect(updated.items).toHaveLength(1);
    expect(updated.items[0].title).toBe('Item 1');
  });

  it('should update item correctly', () => {
    store.set(itemsAtom, {
      items: [mockItem],
      loading: false,
      error: null,
    });

    const updatedTitle = 'Updated Item';
    const current = store.get(itemsAtom);
    store.set(itemsAtom, {
      ...current,
      items: current.items.map((item) => (item._id === '1' ? { ...item, title: updatedTitle } : item)),
    });

    const updated = store.get(itemsAtom);
    expect(updated.items[0].title).toBe(updatedTitle);
  });

  it('should remove item correctly', () => {
    store.set(itemsAtom, {
      items: [mockItem],
      loading: false,
      error: null,
    });

    const current = store.get(itemsAtom);
    store.set(itemsAtom, {
      ...current,
      items: current.items.filter((item) => item._id !== '1'),
    });

    const updated = store.get(itemsAtom);
    expect(updated.items).toHaveLength(0);
  });

  it('should set loading and error state', () => {
    // Set loading
    const current = store.get(itemsAtom);
    store.set(itemsAtom, {
      ...current,
      loading: true,
    });

    expect(store.get(itemsAtom).loading).toBe(true);

    // Set error
    store.set(itemsAtom, {
      ...store.get(itemsAtom),
      error: 'Something went wrong',
    });

    expect(store.get(itemsAtom).error).toBe('Something went wrong');
  });
});
