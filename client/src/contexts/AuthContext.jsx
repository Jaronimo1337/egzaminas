import { createContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

import loginMe from '../helpers/loginMe.js';

import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContextProvider = ({ children }) => {
    const [auth, setAuth] = useState();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchMe = async () => {
            try {
                if (Cookies.get('tokenJS')) {
                    const data = await loginMe();
                    if (axios.isAxiosError(data))
                        throw new Error(
                            'Unauthorized. Perhaps the server has restarted and your session ended.'
                        );
                    setAuth(data.data.data);
                }
            } catch (error) {
                if (error) setAuth(null);
                Cookies.remove('tokenJS');
                console.log(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
    }, []);

    const providedObject = useMemo(() => {
        return { auth, setAuth, loading };
    }, [auth, loading]);

    return (
        <AuthContext.Provider value={providedObject}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthContextProvider };
