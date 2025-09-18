// atoms/companyAtom.test.ts
import { getDefaultStore } from 'jotai';
import { companyAtom } from './companyAtom';

describe('companyAtom', () => {
  const store = getDefaultStore();

  const mockCompany = {
    _id: 'comp123',
    name: 'Acme Corp',
    industry: 'Tech',
    description: 'A company',
    ownerId: 'user123',
  };

  beforeEach(() => {
    store.set(companyAtom, null);
    localStorage.clear();
  });

  it('should store and retrieve company data', () => {
    store.set(companyAtom, mockCompany);
    expect(store.get(companyAtom)).toEqual(mockCompany);
  });

  it('should persist company in localStorage', () => {
    store.set(companyAtom, mockCompany);
    const stored = JSON.parse(localStorage.getItem('company') || '{}');
    expect(stored.name).toBe(mockCompany.name);
  });
});
