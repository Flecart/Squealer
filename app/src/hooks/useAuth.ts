import { useContext } from 'react';

export default function useAuth() {
    const [authState] = useContext(AuthContext);
}
