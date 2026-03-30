import { describe, expect, it } from 'vitest';
import { customerFormalLabel, customerNameInitial, customerStoredName } from './customer-display';

describe('customerStoredName', () => {
	it('trims and handles null', () => {
		expect(customerStoredName('  สมชาย  ')).toBe('สมชาย');
		expect(customerStoredName(null)).toBe('');
	});
});

describe('customerFormalLabel', () => {
	it('prefixes คุณ when needed', () => {
		expect(customerFormalLabel('สมชาย ใจดี')).toBe('คุณสมชาย ใจดี');
		expect(customerFormalLabel('คุณมาลี')).toBe('คุณมาลี');
		expect(customerFormalLabel('')).toBe('ลูกค้า');
	});
});

describe('customerNameInitial', () => {
	it('uses first character of stored name', () => {
		expect(customerNameInitial('มาลี ศรีสุข')).toBe('ม');
		expect(customerNameInitial('')).toBe('?');
	});
});
