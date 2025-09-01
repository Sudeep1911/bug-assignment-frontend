import { EngineInstanse, options } from './fetch';

export const createGPT = async (data: Record<string, unknown>) => {
  try {
    const result = await EngineInstanse.post(`/gpt/conversation`, data, options);
    return result;
  } catch (e) {
    console.log('error', e);
  }
};
