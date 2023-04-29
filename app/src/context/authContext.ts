import { createContext, type Dispatch, type SetStateAction } from 'react';
import { type AuthResponse } from '../../../model/auth';

export const AuthContext = createContext<[AuthResponse | null, Dispatch<SetStateAction<AuthResponse | null>>]>([
    null,
    () => null,
]);
