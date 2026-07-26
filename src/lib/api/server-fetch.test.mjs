import test from 'node:test';
import assert from 'node:assert/strict';
import { serverFetchNameDetail } from './server-fetch.js';

test('serverFetchNameDetail uses local data for known names without calling the network', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => {
    throw new Error('network should not be used for known local names');
  };

  try {
    const result = await serverFetchNameDetail('islamic', 'abdullah');
    assert.equal(result.notFound, false);
    assert.equal(result.error, false);
    assert.ok(result.data);
    assert.equal(result.data.name, 'Abdullah');
  } finally {
    global.fetch = originalFetch;
  }
});
