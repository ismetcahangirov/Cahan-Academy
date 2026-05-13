import { beforeEach, afterAll, vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  console.log('✅ Bütün testlər tamamlandı.');
});
