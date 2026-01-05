import { calculateComplianceBalance, calculatePercentDifference, isCompliant, TARGET_INTENSITY_2025 } from '../Route';

describe('Route Domain Logic', () => {
  describe('calculateComplianceBalance', () => {
    it('should calculate positive CB for routes below target intensity', () => {
      const target = 89.3368;
      const actual = 88.0;
      const fuelConsumption = 4800; // tons

      const cb = calculateComplianceBalance(target, actual, fuelConsumption);
      
      expect(cb).toBeGreaterThan(0); // Surplus
      expect(cb).toBeCloseTo((target - actual) * fuelConsumption * 41000, 2);
    });

    it('should calculate negative CB for routes above target intensity', () => {
      const target = 89.3368;
      const actual = 93.5;
      const fuelConsumption = 5100; // tons

      const cb = calculateComplianceBalance(target, actual, fuelConsumption);
      
      expect(cb).toBeLessThan(0); // Deficit
    });
  });

  describe('calculatePercentDifference', () => {
    it('should calculate percent difference correctly', () => {
      const baseline = 91.0;
      const comparison = 88.0;

      const diff = calculatePercentDifference(baseline, comparison);
      
      expect(diff).toBeCloseTo(((comparison / baseline) - 1) * 100, 2);
    });
  });

  describe('isCompliant', () => {
    it('should return true for intensities at or below target', () => {
      expect(isCompliant(89.3368)).toBe(true);
      expect(isCompliant(88.0)).toBe(true);
    });

    it('should return false for intensities above target', () => {
      expect(isCompliant(91.0)).toBe(false);
      expect(isCompliant(93.5)).toBe(false);
    });
  });
});




