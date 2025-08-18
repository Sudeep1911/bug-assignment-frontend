import { EngineInstanse, options } from "./fetch";
export const createCompany = async (data: Record<string, unknown>) => {
  try {
    const result = await EngineInstanse.post(`/company/create`, data, options);
    return result;
  } catch (e) {
    console.log("error", e);
  }
};

export const getCompanyUser = async (id: string): Promise<Employee[] | undefined> => {
  try {
    const result = await EngineInstanse.get(`/projects/${id}/users`, options);
    return result.data;
  } catch (e) {
    console.log("error", e);
    return undefined;
  }
};

export const getCompanyById = async (id: string)=> {
  try {
    const result = await EngineInstanse.get(`/company/${id}`, options);
    return result.data;
  } catch (e) {
    console.log("error", e);
    return undefined;
  }
};

export const getCompanyUserById = async (id: string): Promise<Employee[] | undefined> => {
  try {
    const result = await EngineInstanse.get(`/company/${id}/users`, options);
    return result.data;
  } catch (e) {
    console.log("error", e);
    return undefined;
  }
};

export const updateCompany = async (companyId: string, data: Record<string, unknown>) => {
  try {
    const result = await EngineInstanse.put(`/company/${companyId}`, data, options);
    return result;
  } catch (e) {
    console.log("error", e);
  }
};