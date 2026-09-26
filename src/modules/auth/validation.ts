import { z } from 'zod';

const email = z.email('Enter a valid email address.');
const password = z
  .string()
  .min(8, 'Password must contain at least 8 characters.')
  .max(128, 'Password must contain at most 128 characters.');

export const loginSchema = z.object({
  email,
  password,
});

export const signupSchema = z
  .object({
    email,
    password,
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'Passwords do not match.',
    path: ['passwordConfirmation'],
  });

export function authFormValues(formData: FormData) {
  return {
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirmation: formData.get('passwordConfirmation'),
  };
}
