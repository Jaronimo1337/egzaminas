import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

const Protected = () => {
    const { auth, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) return <div className="loading">Loading...</div>;

    return auth ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace state={{ from: location }} />
    );
};

export default Protected;
