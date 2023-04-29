import {  createContext, type Dispatch, type SetStateAction} from "react";


export interface AuthParams {
    username: string;
    jwt: string;
};


export const AuthContext = createContext<[AuthParams | null,Dispatch<SetStateAction<AuthParams|null>>]>([authState,setAuthState]);
