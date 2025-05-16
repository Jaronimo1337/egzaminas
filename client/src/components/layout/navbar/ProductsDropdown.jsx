import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import getAllCategories from '../../../helpers/getAllCategories';

const ProductsDropdown = () => {
    const [categories, setCategories] = useState([]);
    const [openCategory, setOpenCategory] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const response = await getAllCategories();
                const data =
                    response.data?.categories || response.data || response;
                setCategories(Array.isArray(data) ? data : []);
                if (!Array.isArray(data)) setError('Failed to load categories');
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsDropdownOpen(false);
                setOpenCategory(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCategoryClick = (categoryId) => {
        setOpenCategory(openCategory === categoryId ? null : categoryId);
    };

    const handleSubcategoryClick = (subcategoryId) => {
        navigate(`/products/s/${subcategoryId}`);
        setIsDropdownOpen(false);
        setOpenCategory(null);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className="text-dark dark:text-white"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                Products
            </button>

            {isDropdownOpen && (
                <div
                    className={`absolute bg-white dark:bg-gray-900 shadow-lg rounded-md z-10 transition-all duration-300 ease-in-out 
                    ${isMobile ? 'w-[90vw] max-w-[20rem] right-2' : 'w-[40vw] max-w-[40rem] right-1 md:right-auto'}`}
                >
                    <div className="flex flex-col p-4 max-h-[70vh] overflow-y-auto space-y-2">
                        <ul className="w-full space-y-2">
                            {categories.length > 0 ? (
                                categories.map((category) => (
                                    <li key={category.id}>
                                        <div
                                            className="w-full text-left px-4 py-2 text-lg font-medium text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-200 flex justify-between items-center cursor-pointer"
                                            onClick={() =>
                                                handleCategoryClick(category.id)
                                            }
                                        >
                                            <span>{category.name}</span>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    className="text-sm text-blue-800 hover:bg-gray-200 hover:rounded-md p-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(
                                                            `categories/${category.id}`
                                                        );
                                                        setIsDropdownOpen(
                                                            false
                                                        );
                                                        setOpenCategory(null);
                                                    }}
                                                >
                                                    View All
                                                </button>
                                                {category.subcategories && (
                                                    <span>
                                                        {openCategory ===
                                                        category.id
                                                            ? '−'
                                                            : '+'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out 
                                            ${openCategory === category.id ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                                        >
                                            {category.subcategories && (
                                                <ul className="pl-6 mt-2 space-y-2">
                                                    {category.subcategories
                                                        .length > 0 ? (
                                                        category.subcategories.map(
                                                            (sub) => (
                                                                <li
                                                                    key={sub.id}
                                                                    className="px-4 py-2 text-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition duration-200"
                                                                >
                                                                    <button
                                                                        onClick={() =>
                                                                            handleSubcategoryClick(
                                                                                sub.id
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            sub.name
                                                                        }
                                                                    </button>
                                                                </li>
                                                            )
                                                        )
                                                    ) : (
                                                        <li className="px-4 py-2 text-lg text-gray-500 dark:text-gray-400">
                                                            No subcategories
                                                        </li>
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-2 text-lg text-gray-500 dark:text-gray-400">
                                    No categories found
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsDropdown;
