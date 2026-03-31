import { describe, expect, it } from 'vitest';
import { customerFormalLabel, customerNameInitial, customerStoredName } from './customer-display';

describe('customerStoredName', () => {
	it('trims whitespace', () => {
		expect(customerStoredName('  Somchai  ')).toBe('Somchai');
	});
});

describe('customerFormalLabel', () => {
	it('returns plain name without honorific prefix', () => {
		expect(customerFormalLabel('Somchai Jaidee')).toBe('Somchai Jaidee');
		expect(customerFormalLabel('\u0e04\u0e38\u0e13\u0e21\u0e32\u0e25\u0e35')).toBe(
			'\u0e04\u0e38\u0e13\u0e21\u0e32\u0e25\u0e35'
		);
		expect(customerFormalLabel('')).toBe('Customer');
	});
});

describe('customerNameInitial', () => {
	it('uses first character of stored name', () => {
		expect(customerNameInitial('Malee S.')).toBe('M');
		expect(customerNameInitial('\u0e21\u0e32\u0e25\u0e35 \u0e28\u0e23\u0e35\u0e2a\u0e38\u0e02')).toBe(
			'\u0e21'
		);
	});
});
