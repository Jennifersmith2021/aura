import { test, expect } from '@playwright/test';
import { getExpirationStatus, getDaysRemaining } from '@/utils/expiration';
import type { Item } from '@/types';

test.describe('expiration utils', () => {
  test('returns good for unopened or non-makeup items', () => {
    const item: Item = {
      id: 'i1',
      name: 'Shirt',
      type: 'clothing',
      category: 'top',
      dateAdded: Date.now(),
    };
    expect(getExpirationStatus(item)).toBe('good');
  });

  test('returns expired for old opened makeup', () => {
    const now = Date.now();
    const oldDate = now - (365 * 24 * 60 * 60 * 1000 * 3); // 3 years
    const item: Item = {
      id: 'i2',
      name: 'Old Foundation',
      type: 'makeup',
      category: 'face',
      dateAdded: oldDate - 1000,
      dateOpened: oldDate,
    };
    expect(getExpirationStatus(item)).toBe('expired');
  });

  test('getDaysRemaining returns a number', () => {
    const now = Date.now();
    const recentDate = now - (1000 * 60 * 60 * 24 * 10); // 10 days ago
    const item: Item = {
      id: 'i3',
      name: 'Recent Foundation',
      type: 'makeup',
      category: 'face',
      dateAdded: recentDate - 1000,
      dateOpened: recentDate,
    };
    const days = getDaysRemaining(item);
    expect(typeof days).toBe('number');
  });
});
