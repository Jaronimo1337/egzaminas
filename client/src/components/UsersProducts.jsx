import { useState, useEffect } from 'react';
import ProductCard from './ProductCard.jsx';
import { Link } from 'react-router';
import { getProductById } from '../helpers/getProduct.js';
import { getAllUsers } from '../helpers/getUser.js';
export default function UsersProducts() {
    const [usersWithProducts, setUsersWithProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsersAndProducts = async () => {
            try {
                // Gauti visus vartotojus
                const usersResponse = await getAllUsers();
                const users = usersResponse.data.data;

                // Gauti visų vartotojų produktus
                const usersWithProductsPromises = users.map(async (user) => {
                    const productsResponse = await getProductById(user.id);
                    return { ...user, products: productsResponse.data.data };
                });

                // Palaukti, kol visi vartotojų produktai bus gauti
                const usersWithProductsData = await Promise.all(
                    usersWithProductsPromises
                );

                // Filtruojame tik tuos vartotojus, kurie turi bent vieną produktą
                setUsersWithProducts(
                    usersWithProductsData.filter(
                        (user) => user.products.length > 0
                    )
                );
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsersAndProducts();
    }, []);

    if (loading) return <p>Kraunama...</p>;
    if (error) return <p>Klaida: {error}</p>;

    return (
        <div className="w-full">
            {usersWithProducts.map((user) => (
                <div key={user.id} className="mb-4">
                    <div className="flex flex-row gap-2 mt-2 ">
                        <div className="w-2 h-6 bg-red-500"></div>
                        <h2 className="text-l text-red-500 font-bold mb-2">
                            Spotlight
                        </h2>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                        Explore {user.username} products
                    </h2>
                    <div className="flex flex-wrap flex-row  ">
                        {user.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    <div className="text-center">
                        <Link to={`/home/${user.id}`}>
                            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2">
                                View All Products
                            </button>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
