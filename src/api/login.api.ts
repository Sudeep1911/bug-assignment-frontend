import { EngineInstanse, options } from "./fetch";
export const loginApi = async (data: any) => {
  try {
    const result = await EngineInstanse.post(`/users/signin`, data, options);
    return result;
  } catch (e) {
    console.log("error", e);
  }
};

export const signUp = async (data: any) => {
  try {
    const result = await EngineInstanse.post(`/users/signup`, data, options);
    return result;
  } catch (e) {
    console.log("error", e);
  }
};

export const createUser = async(data:any)=>{
  try{
    const result = await EngineInstanse.post(`/users/create`, data, options);
    return result;
  }catch(e){
    console.log("error", e);
  }
}
