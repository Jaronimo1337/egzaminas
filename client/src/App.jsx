import { Routes, Route } from 'react-router';
import Auth from './components/layout/Register_Login/Auth.jsx';
import Home from './components/layout/Home.jsx';
import NotFound from './components/layout/NotFound.jsx';
import NavBar from './components/layout/navbar/NavBar.jsx';
import UserProducts from './components/UserProducts.jsx';
import ProductDetails from './components/ProductDetails.jsx';
import SearchedProducts from './components/products/SearchedProducts.jsx';
import PublicUserProfile from './components/products/PublicUserProfile.jsx';
import ProtectedRoutes from './components/layout/ProtectedRoutes.jsx';
import ProductsPage from './components/products/SubcategoryProducts.jsx';
import ProductsDropdown from './components/layout/navbar/ProductsDropdown.jsx';
import CategoryProducts from './components/products/CategoryProducts.jsx';
import Footer from './components/layout/Footer.jsx';

function App() {
    return (
        <>
            <NavBar />
            <Routes>
                <Route index element={<Auth />} />
                <Route path="signup" element={<Auth authType="signup" />} />
                <Route path="home" element={<Home />} />
                <Route path="products/:id" element={<UserProducts />} />
                <Route
                    path="products/selected/:id"
                    element={<ProductDetails />}
                />
                <Route path="products/u/:username" element={<UserProducts />} />
                <Route
                    path="products/s/:subcategoryId"
                    element={<ProductsPage />}
                />
                <Route path="/" element={<ProductsDropdown />} />
                <Route path="/search" element={<SearchedProducts />} />
                <Route path="categories/:id" element={<CategoryProducts />} />
                <Route path="users/:username" element={<PublicUserProfile />} />
                
                {/* Include protected routes */}
                {ProtectedRoutes()}
                
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
        </>
    );
}

export default App;