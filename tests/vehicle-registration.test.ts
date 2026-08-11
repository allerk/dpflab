import { describe, expect, it } from 'vitest';
import {
  isPlausibleVehicleRegistrationNumber,
  normalizeVehicleRegistrationNumber
} from '../src/lib/vehicle-registration';

describe('vehicle registration numbers', () => {
  it('normalizes case, whitespace and typographic dashes', () => {
    expect(normalizeVehicleRegistrationNumber('  123   abc  ')).toBe('123 ABC');
    expect(normalizeVehicleRegistrationNumber('ab–123')).toBe('AB-123');
  });

  it('accepts non-standard and foreign plates without enforcing one Estonian template', () => {
    expect(isPlausibleVehicleRegistrationNumber('123 ABC')).toBe(true);
    expect(isPlausibleVehicleRegistrationNumber('AB-123-CD')).toBe(true);
    expect(isPlausibleVehicleRegistrationNumber('ÜV 7')).toBe(true);
  });

  it('rejects empty and punctuation-only values', () => {
    expect(isPlausibleVehicleRegistrationNumber('')).toBe(false);
    expect(isPlausibleVehicleRegistrationNumber('--')).toBe(false);
  });
});
