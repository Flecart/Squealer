import { createContext, type Dispatch, type SetStateAction } from 'react';
import { type AuthContextType } from './hooks/AuthProvider';

export const AuthContext = createContext<AuthContextType | null>(null);

export const ThemeContext = createContext<['light' | 'dark', () => void]>(['light', () => {}]);

export const CategoryContext = createContext<[number | null, Dispatch<SetStateAction<number>>]>([null, () => null]);
