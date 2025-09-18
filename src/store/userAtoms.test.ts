// atoms/userAtom.test.ts
import { getDefaultStore } from 'jotai';
import { userAtom } from '@/store/atoms';

describe('userAtom', () => {
  const store = getDefaultStore();

  const mockUser = {
    _id: '1',
    email: 'test@example.com',
    password: 'password',
    name: 'Tester',
    role: 'tester' as const, // 👈 fix this line
    details: {
      companyId: '123',
      modules: [],
    },
  };

  beforeEach(() => {
    store.set(userAtom, null); // Reset atom
    localStorage.clear(); // Clear persisted storage
  });

  it('should set and get user correctly', () => {
    store.set(userAtom, mockUser);
    const user = store.get(userAtom);
    expect(user).toEqual(mockUser);
  });

  it('should persist user in localStorage', () => {
    store.set(userAtom, mockUser);
    const stored = JSON.parse(localStorage.getItem('user') || '{}');
    expect(stored.email).toBe(mockUser.email);
  });
});
