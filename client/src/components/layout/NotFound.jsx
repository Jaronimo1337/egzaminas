import { useNavigate } from 'react-router';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <button onClick={() => navigate('/home')}>Go to Home</button>
        </div>
    );
};

export default NotFound;
