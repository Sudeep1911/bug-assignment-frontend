import { ItemData } from "@/api/item.api";
import { atom, useAtom } from "jotai";


export interface ItemsState {
  items: ItemData[];
  loading: boolean;
  error: string | null;
}

export const itemsAtom = atom<ItemsState>({
  items: [],
  loading: false,
  error: null,
});

export const useItemsAtom = () => {
  const [itemsState, setItemsState] = useAtom(itemsAtom);
  
  const addItem = (item: ItemData) => {
    setItemsState(prev => ({
      ...prev,
      items: [...prev.items, item],
    }));
  };

  const updateItem = (itemId: string, updates: Partial<ItemData>) => {
    setItemsState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item._id === itemId ? { ...item, ...updates } : item
      ),
    }));
  };

  const removeItem = (itemId: string) => {
    setItemsState(prev => ({
      ...prev,
      items: prev.items.filter(item => item._id !== itemId),
    }));
  };

  const setItems = (items: ItemData[]) => {
    setItemsState(prev => ({
      ...prev,
      items,
    }));
  };

  const setLoading = (loading: boolean) => {
    setItemsState(prev => ({
      ...prev,
      loading,
    }));
  };

  const setError = (error: string | null) => {
    setItemsState(prev => ({
      ...prev,
      error,
    }));
  };

  return {
    ...itemsState,
    addItem,
    updateItem,
    removeItem,
    setItems,
    setLoading,
    setError,
  };
}; 