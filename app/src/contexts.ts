import { createContext, type Dispatch, type SetStateAction } from 'react';
import { type AuthResponse } from '@model/auth';

export const AuthContext = createContext<[AuthResponse | null, Dispatch<SetStateAction<AuthResponse | null>>]>([
    null,
    () => null,
]);

export const ThemeContext = createContext<['light' | 'dark', () => void]>(['light', () => {}]);

export const CategoryContext = createContext<[number | null, Dispatch<SetStateAction<number>>]>([null, () => null]);

export interface AlertType {
    message: string;
    type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}

export const AlertContext = createContext<[AlertType | null, Dispatch<SetStateAction<AlertType | null>>]>([
    null,
    () => null,
]);
