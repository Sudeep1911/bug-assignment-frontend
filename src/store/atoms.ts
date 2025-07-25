// store/atoms.ts
import { atom, useAtom } from "jotai";
export interface User {
  email: string;
  password: string;
  name?: string;
  role?: "developer" | "tester" | "admin";
  _id: string;
  details: {
    companyId?: string; // ObjectId as string if client-side
    designation?: string;
    proficiency?: string[];
    module?: string;
  };
}
export const userAtom = atom<User>();
export const useUserAtom = () => {
  const [currentUser, setCurrentUser] = useAtom(userAtom);
  return { currentUser, setCurrentUser };
};
