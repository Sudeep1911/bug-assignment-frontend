import { EngineInstanse, options } from "./fetch";
export const createProject = async (data: any) => {
  try {
    const result = await EngineInstanse.post(`/projects/create`, data, options);
    return result;
  } catch (e) {
    console.log("error", e);
  }
};
