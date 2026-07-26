import test from 'node:test';
import assert from 'node:assert/strict';
import { findLocalNameData, getLocalNameList } from './local-name-data.mjs';

test('findLocalNameData resolves a known Islamic name slug quickly', () => {
  const result = findLocalNameData('islamic', 'abdullah');
  assert.ok(result);
  assert.equal(result.name, 'Abdullah');
  assert.equal(result.religion, 'islamic');
});

test('findLocalNameData returns null for an unknown slug', () => {
  const result = findLocalNameData('islamic', 'not-a-real-name-slug');
  assert.equal(result, null);
});

test('getLocalNameList returns a bounded list without duplicates', () => {
  const result = getLocalNameList('islamic', 5, 'abdullah');
  assert.ok(Array.isArray(result));
  assert.ok(result.length <= 5);
  assert.ok(result.every((item) => item.slug !== 'abdullah'));
});
