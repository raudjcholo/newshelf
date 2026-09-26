export type AuthActionState = {
  status: 'idle' | 'error' | 'confirmation-required';
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialAuthState: AuthActionState = {
  status: 'idle',
};
