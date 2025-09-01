// store/atoms.ts
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';

export interface Company {
  _id: string;
  name: string;
  industry: string;
  description: string;
  ownerId: string;
}

// Persist in localStorage under "company"
export const companyAtom = atomWithStorage<Company | null>('company', null);

export const useCompanyAtom = () => {
  const [companyUser, setCompanyUser] = useAtom(companyAtom);
  return { companyUser, setCompanyUser };
};
