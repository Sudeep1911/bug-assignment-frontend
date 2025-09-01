import { EngineInstanse, options } from './fetch';
import { SubmitItemData } from '@/components/Dashboard/SubmitItemPopup';

export interface ItemData extends SubmitItemData {
  _id: string;
  projectId?: string;
  companyId?: string;
  status?: 'todo' | 'in-progress' | 'review' | 'done' | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const createItem = async (data: ItemData) => {
  try {
    const result = await EngineInstanse.post(`/tasks/create`, data, options);
    return result;
  } catch (e) {
    console.log('error', e);
    throw e;
  }
};

export const getItems = async (projectId?: string) => {
  try {
    const url = projectId ? `/tasks?projectId=${projectId}` : `/items`;
    const result = await EngineInstanse.get(url, options);
    return result;
  } catch (e) {
    console.log('error', e);
    throw e;
  }
};

export const updateItem = async (itemId: string, data: Partial<ItemData>) => {
  try {
    const result = await EngineInstanse.put(`/tasks/${itemId}`, data, options);
    return result;
  } catch (e) {
    console.log('error', e);
    throw e;
  }
};

export const deleteItem = async (itemId: string) => {
  try {
    const result = await EngineInstanse.delete(`/tasks/${itemId}`, options);
    return result;
  } catch (e) {
    console.log('error', e);
    throw e;
  }
};

export const getItemsByType = async (type: 'bug' | 'task' | 'feature', projectId?: string) => {
  try {
    const url = projectId ? `/tasks/type/${type}?projectId=${projectId}` : `/tasks/type/${type}`;
    const result = await EngineInstanse.get(url, options);
    return result;
  } catch (e) {
    console.log('error', e);
    throw e;
  }
};
