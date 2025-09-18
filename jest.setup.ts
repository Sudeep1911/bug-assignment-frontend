class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length() {
    return Object.keys(this.store).length;
  }

  clear = jest.fn(() => {
    this.store = {};
  });

  getItem = jest.fn((key: string) => {
    return this.store[key] || null;
  });

  key = jest.fn((index: number) => {
    return Object.keys(this.store)[index] || null;
  });

  removeItem = jest.fn((key: string) => {
    delete this.store[key];
  });

  setItem = jest.fn((key: string, value: string) => {
    this.store[key] = value;
  });
}

global.localStorage = new LocalStorageMock();
