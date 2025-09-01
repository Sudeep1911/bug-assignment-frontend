import { Project } from '@/types/project.types';
import { EngineInstanse, options } from './fetch';
export const createProject = async (data: Record<string, unknown>) => {
  try {
    const result = await EngineInstanse.post(`/projects/create`, data, options);
    return result;
  } catch (e) {
    console.log('error', e);
  }
};

export const getProjects = async (adminId: string) => {
  try {
    const result = await EngineInstanse.get(`/projects/user/${adminId}`, options);
    return result;
  } catch (e) {
    console.log('error', e);
  }
};

export const getProject = async (projectId: string): Promise<any> => {
  try {
    const result = await EngineInstanse.get(`/projects/${projectId}`, options);
    return result.data;
  } catch (e) {
    console.log('error', e);
    throw e;
  }
};

export const updateProject = async (projectId: string, data: Partial<any>): Promise<any> => {
  try {
    const result = await EngineInstanse.put(`/projects/${projectId}`, data, options);
    return result.data;
  } catch (e) {
    console.log('error', e);
    throw e;
  }
};

export const getProjectModules = async (projectId: string): Promise<any> => {
  try {
    const result = await EngineInstanse.get(`/projects/${projectId}/modules`, options);
    return result.data;
  } catch (e) {
    console.log('error', e);
    throw e;
  }
};
