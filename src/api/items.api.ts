import { EngineInstanse, options } from "./fetch";
import { SubmitItemData } from "@/components/Dashboard/SubmitItemPopup";

export interface ItemData extends SubmitItemData {
  projectId?: string;
  companyId?: string;
  status?: "todo" | "in-progress" | "review" | "done";
  createdAt?: Date;
  updatedAt?: Date;
}

export const createItem = async (data: ItemData) => {
  try {
    const result = await EngineInstanse.post(`/items/create`, data, options);
    return result;
  } catch (e) {
    console.log("error", e);
    throw e;
  }
};

export const getItems = async (projectId?: string) => {
  try {
    const url = projectId ? `/items?projectId=${projectId}` : `/items`;
    const result = await EngineInstanse.get(url, options);
    return result;
  } catch (e) {
    console.log("error", e);
    throw e;
  }
};

export const updateItem = async (itemId: string, data: Partial<ItemData>) => {
  try {
    const result = await EngineInstanse.put(`/items/${itemId}`, data, options);
    return result;
  } catch (e) {
    console.log("error", e);
    throw e;
  }
};

export const deleteItem = async (itemId: string) => {
  try {
    const result = await EngineInstanse.delete(`/items/${itemId}`, options);
    return result;
  } catch (e) {
    console.log("error", e);
    throw e;
  }
};

export const getItemsByType = async (type: "bug" | "task" | "feature", projectId?: string) => {
  try {
    const url = projectId 
      ? `/items/type/${type}?projectId=${projectId}` 
      : `/items/type/${type}`;
    const result = await EngineInstanse.get(url, options);
    return result;
  } catch (e) {
    console.log("error", e);
    throw e;
  }
}; 