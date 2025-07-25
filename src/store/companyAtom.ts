import { atom, useAtom } from "jotai";
export interface Company {
  _id: string;
  name: string;
  industry: string;
  description: string;
  ownerId: string;
}
export const companyAtom = atom<Company>();
export const useCompanyAtom = () => {
  const [companyUser, setCompanyUser] = useAtom(companyAtom);
  return { companyUser, setCompanyUser };
};
