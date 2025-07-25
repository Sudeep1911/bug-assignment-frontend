import { EngineInstanse, options } from "./fetch";
export const createCompany = async (data: any) => {
  try {
    const result = await EngineInstanse.post(`/company/create`, data, options);
    return result;
  } catch (e) {
    console.log("error", e);
  }
};
