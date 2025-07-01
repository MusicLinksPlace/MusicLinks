import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utils', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('handles conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
      expect(result).toBe('base-class conditional-class');
    });

    it('handles empty strings and falsy values', () => {
      const result = cn('base-class', '', null, undefined, false && 'hidden');
      expect(result).toBe('base-class');
    });

    it('handles objects with boolean values', () => {
      const result = cn('base-class', {
        'active': true,
        'disabled': false,
        'hidden': true
      });
      expect(result).toBe('base-class active hidden');
    });
  });
}); 