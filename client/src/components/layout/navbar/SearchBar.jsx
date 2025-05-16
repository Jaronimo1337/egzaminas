import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { searchSuggestions } from '../../../helpers/searchProducts';
import getSearchRegex from '../../../helpers/getSearchRegex';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [zalgoRegex, setZalgoRegex] = useState(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setQuery('');
        setSuggestions([]);
        setIsFocused(false);

        if (inputRef.current) {
            inputRef.current.blur();
        }
    }, [location.pathname, location.search]);

    useEffect(() => {
        if (query.length >= 3) {
            const fetchSuggestions = async () => {
                const response = await searchSuggestions(query);
                if (response?.data) {
                    setSuggestions(response.data);
                }
            };

            const delayDebounceFn = setTimeout(() => {
                fetchSuggestions();
            }, 300);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setSuggestions([]);
        }
    }, [query]);

    useEffect(() => {
        const fetchRegex = async () => {
            try {
                const response = await getSearchRegex();
                if (response?.zalgoRegex) {
                    setZalgoRegex(new RegExp(response.zalgoRegex));
                } else {
                    console.error('Zalgo regex not found in the response.');
                }
            } catch (err) {
                console.error('Failed to fetch Zalgo regex:', err);
            }
        };
        fetchRegex();
    }, []);

    const isZalgo = (text) => {
        return zalgoRegex ? zalgoRegex.test(text) : false;
    };

    const handleSearch = (e) => {
        e.preventDefault();
        let trimmedQuery = query.trim().toLowerCase();

        if (trimmedQuery.length < 3 || trimmedQuery.length > 30) {
            toast.error('Search query must be between 3 and 30 characters.');
            return;
        }

        if (isZalgo(trimmedQuery)) {
            toast.error('Zalgo text is not allowed.');
            return;
        }

        if (!/^[a-zA-Z0-9 ]+$/.test(trimmedQuery)) {
            toast.error(
                'Search query can only contain letters, numbers, and spaces.'
            );
            return;
        }

        navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    };

    const handleSuggestionClick = (suggestion) => {
        navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
    };

    return (
        <div className="flex flex-col items-center justify-center relative">
            <div
                className={`flex items-center ${isFocused || query ? 'justify-center' : 'hover:bg-gray-200 dark:hover:bg-gray-600 px-1 py-2 rounded-md'}`}
            >
                <form onSubmit={handleSearch} className="relative mx-auto flex">
                    <ToastContainer
                        position="top-center"
                        style={{ zIndex: 9999 }}
                    />
                    <input
                        ref={inputRef}
                        type="search"
                        className={`peer cursor-pointer relative z-10 h-8 w-10 rounded-lg border bg-transparent outline-none transition-all text-black dark:text-white ${
                            isFocused || query
                                ? 'w-full pl-10 border-gray-500 px-3 opacity-100'
                                : 'focus:w-full focus:opacity-100 placeholder:opacity-0 focus:border-gray-500 focus:px-3 opacity-0'
                        }`}
                        placeholder="Search products..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            if (!query) {
                                setIsFocused(false);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        className="absolute dark:bg-transparent top-0 dark:text-white border-gray-500 left-0 bottom-0 my-auto h-8 w-10 px-3 rounded-lg"
                        onClick={() => {
                            if (!query && inputRef.current) {
                                if (isFocused) {
                                    setIsFocused(false);
                                    inputRef.current.blur();
                                } else {
                                    setIsFocused(true);
                                    inputRef.current.focus();
                                }
                            }
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 50 50"
                            className="dark:fill-white"
                        >
                            <path d="M 21 3 C 11.6 3 4 10.6 4 20s7.6 17 17 17c3.4 0 6.5-1 9.1-2.7L42.4 46.6 46.6 42.4 34.5 30.3C36.7 27.4 38 23.9 38 20 38 10.6 30.4 3 21 3zM21 7c7.2 0 13 5.8 13 13s-5.8 13-13 13S8 27.2 8 20 13.8 7 21 7z"></path>
                        </svg>
                    </button>
                </form>
            </div>

            {suggestions.length > 0 && isFocused && (
                <ul className="absolute top-full dark:bg-gray-800 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-auto">
                    {suggestions.map((product) => (
                        <li
                            key={product.id}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white"
                        >
                            <button
                                onMouseDown={() =>
                                    handleSuggestionClick(product)
                                }
                            >
                                {product.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
