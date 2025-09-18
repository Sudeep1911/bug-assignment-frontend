// test-utils/renderWithProvider.tsx
import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { Provider, createStore } from 'jotai';

export const renderWithStore = (ui: ReactNode, store = createStore()) => {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
};
