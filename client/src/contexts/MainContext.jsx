import { AuthContextProvider } from './AuthContext.jsx';

const MainContextProvider = ({ children }) => {
    return <AuthContextProvider>{children}</AuthContextProvider>;
};

export default MainContextProvider;
