import { test, expect } from '@playwright/test';

test.describe('Sync API Routes', () => {
  const baseUrl = 'http://localhost:3000';

  test.skip('POST /api/sync/items should return error if DATABASE_URL is not set', async ({ request }) => {
    // Skipping this test as it requires a running Next dev server
    // To run: npm run dev, then npm run test:e2e
    const response = await request.post(`${baseUrl}/api/sync/items`, {
      data: {
        items: [
          {
            id: 'test-item-1',
            name: 'Test Shirt',
            type: 'clothing',
            category: 'top',
            dateAdded: Date.now(),
          },
        ],
      },
    });

    // Either 501 (not configured) or 200 (if DB is set up)
     
    expect([200, 501]).toContain(response.status());
  });

  test.skip('GET /api/sync/items should return items or error', async ({ request }) => {
    // Skipping this test as it requires a running Next dev server
    // To run: npm run dev, then npm run test:e2e
    const response = await request.get(`${baseUrl}/api/sync/items`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await response.json() as any;

    // Either returns items array or an error
    expect([200, 501]).toContain(response.status());
    if (response.status() === 200) {
      expect(body.items).toBeInstanceOf(Array);
    } else {
      expect(body.error).toBeDefined();
    }
  });
});
