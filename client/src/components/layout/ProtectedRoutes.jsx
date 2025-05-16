import { Route } from 'react-router';
import Profile from '../protected/Private_User_Profile/ProfileInfo.jsx';
import Protected from '../protected/Protected.jsx';
import MyProducts from '../protected/productCRUD/MyProducts.jsx';
import AdminPanel from '../protected/admin/adminpanel.jsx';
import MyReviews from '../protected/commentCRUD/MyReviews.jsx';

const ProtectedRoutes = () => {
    return (
        <Route element={<Protected />}>
            <Route path="profile" element={<Profile />}></Route>
            <Route path="myProducts" element={<MyProducts />}></Route>
            <Route path="/reviews" element={<MyReviews />} />
            <Route path="/adminpanel" element={<AdminPanel />} />
        </Route>
    );
};

export default ProtectedRoutes;
