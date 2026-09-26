import { describe, expect, it } from 'vitest';

import { loginSchema, signupSchema } from './validation';

describe('authentication input validation', () => {
  it('accepts valid login input', () => {
    expect(
      loginSchema.safeParse({
        email: 'reader@example.com',
        password: 'long-enough-password',
      }).success,
    ).toBe(true);
  });

  it('rejects invalid email and short passwords', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'short',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });

  it('requires matching password confirmation', () => {
    const result = signupSchema.safeParse({
      email: 'reader@example.com',
      password: 'long-enough-password',
      passwordConfirmation: 'different-password',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.passwordConfirmation).toEqual([
        'Passwords do not match.',
      ]);
    }
  });
});
