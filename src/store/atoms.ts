// store/atoms.ts
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";

export interface User {
  email: string;
  password: string;
  name?: string;
  role?: "developer" | "tester" | "admin";
  _id: string;
  details: {
    companyId?: string;
    modules?: Module[];
  };
}
export interface Module{
  module:string
  proficiency:number
}

// atomWithStorage will store it in localStorage under "user"
export const userAtom = atomWithStorage<User | null>("user", null);

export const useUserAtom = () => {
  const [currentUser, setCurrentUser] = useAtom(userAtom);
  return { currentUser, setCurrentUser };
};
