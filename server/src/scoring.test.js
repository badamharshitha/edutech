import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreStudent } from './server.js';

test('scores severe need within the documented range', () => {
  const result = scoreStudent({ familyIncome: 2500, familySize: 7, educationalNeed: 'high', dropoutRisk: 'high', academicPerformance: 65, requiredAmount: 12000 });
  assert.equal(result.priority, 'HIGH');
  assert.ok(result.needScore >= 80 && result.needScore <= 100);
  assert.equal(typeof result.aiExplanation, 'string');
});

test('scores lower need and preserves bounded output', () => {
  const result = scoreStudent({ familyIncome: 50000, familySize: 1, educationalNeed: 'low', dropoutRisk: 'low', academicPerformance: 95, requiredAmount: 1000 });
  assert.ok(result.needScore >= 0 && result.needScore <= 100);
  assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(result.priority));
  assert.equal(result.dropoutRisk, 'low');
});
