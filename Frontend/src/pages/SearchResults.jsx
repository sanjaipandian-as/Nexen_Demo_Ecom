import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaSearch, FaFilter, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import API from '../../api';
import Skeleton from '../components/Common/Skeleton';
import placeholderImg from '../assets/Placeholder.png';

import Topbar from '../components/Customer/Topbar';
import Footer from '../components/Customer/Footer';
import Sidebar from '../components/Customer/Sidebar';

// Add custom styles for range sliders
const rangeSliderStyles = `
    input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        pointer-events: auto !important;
    }
    
    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF5FCF, #F7DB91);
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        pointer-events: auto;
    }
    
    input[type="range"]::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FF5FCF, #F7DB91);
        cursor: pointer;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        pointer-events: auto;
    }
    
    input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
    }
    
    input[type="range"]::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
    }
`;

const SearchResults = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [searchResults, setSearchResults] = useState([]);
    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [wishlistItems, setWishlistItems] = useState([]);
    const [togglingWishlist, setTogglingWishlist] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Filter states
    const [filters, setFilters] = useState({
        sortBy: 'relevance',
        categories: [],
        priceRange: [0, 50000]
    });
    const [categories, setCategories] = useState([]);
    const [maxPrice, setMaxPrice] = useState(50000);

    useEffect(() => {
        if (query) {
            fetchSearchResults();
            fetchWishlist();
            fetchCart();
        }
    }, [query]);

    // Apply filters when they change
    useEffect(() => {
        applyFilters();
    }, [filters, allResults]);


    const fetchSearchResults = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/search?q=${encodeURIComponent(query)}`);
            const products = response.data.products || [];
            setAllResults(products);
            setSearchResults(products);

            // Extract unique categories and their counts
            const categoryMap = {};
            products.forEach(product => {
                const categoryName = product.category?.main || product.category || 'Other';
                if (!categoryMap[categoryName]) {
                    categoryMap[categoryName] = { name: categoryName, count: 0 };
                }
                categoryMap[categoryName].count++;
            });
            setCategories(Object.values(categoryMap));

            // Calculate max price
            const prices = products.map(p => p.pricing?.selling_price || p.price || 0);
            const max = prices.length > 0 ? Math.max(...prices) : 50000;
            setMaxPrice(max);
            setFilters(prev => ({ ...prev, priceRange: [0, max] }));

            setError('');
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to fetch search results');
            setAllResults([]);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allResults];

        // Filter by categories
        if (filters.categories.length > 0) {
            filtered = filtered.filter(product => {
                const productCategory = product.category?.main || product.category || 'Other';
                return filters.categories.includes(productCategory);
            });
        }

        // Filter by price range
        if (filters.priceRange) {
            filtered = filtered.filter(product => {
                const price = product.pricing?.selling_price || product.price || 0;
                return price >= filters.priceRange[0] && price <= filters.priceRange[1];
            });
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'price-low':
                filtered.sort((a, b) => (a.pricing?.selling_price || a.price || 0) - (b.pricing?.selling_price || b.price || 0));
                break;
            case 'price-high':
                filtered.sort((a, b) => (b.pricing?.selling_price || b.price || 0) - (a.pricing?.selling_price || a.price || 0));
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'rating':
                filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
            default:
                // relevance - keep original order
                break;
        }

        setSearchResults(filtered);
    };

    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);


    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await API.get('/wishlist');
            const wishlistProductIds = (Array.isArray(response.data) ? response.data : []).map(item => item.productId._id);
            setWishlistItems(wishlistProductIds);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await API.get('/cart');
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const toggleWishlist = async (e, productId) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to add items to wishlist', 'error');
            setTimeout(() => navigate('/Login'), 1500);
            return;
        }

        setTogglingWishlist(productId);
        try {
            const isInWishlist = wishlistItems.includes(productId);
            if (isInWishlist) {
                await API.delete(`/wishlist/remove/${productId}`);
                setWishlistItems(prev => prev.filter(id => id !== productId));
                showNotification('Removed from wishlist', 'success');
            } else {
                await API.post('/wishlist/add', { productId });
                setWishlistItems(prev => [...prev, productId]);
                showNotification('Added to wishlist!', 'success');
            }
        } catch (error) {
            console.error('Wishlist error:', error);
            showNotification(error.response?.data?.message || 'Failed to update wishlist', 'error');
        } finally {
            setTogglingWishlist(null);
        }
    };

    const addToCart = async (e, product) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to add items to cart', 'error');
            setTimeout(() => navigate('/Login'), 1500);
            return;
        }

        setAddingToCart(product._id);
        try {
            await API.post('/cart/add', {
                productId: product._id,
                quantity: 1
            });
            showNotification('Added to cart successfully!', 'success');
            fetchCart();
        } catch (error) {
            console.error('Add to cart error:', error);
            showNotification(error.response?.data?.message || 'Failed to add to cart', 'error');
        } finally {
            setAddingToCart(null);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };




    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <style>{rangeSliderStyles}</style>

            {/* Topbar - Full Width Sticky */}
            <Topbar />

            {/* Main Content Area */}
            <div className="flex-1 max-w-[1600px] w-full mx-auto flex items-start">

                {/* Filter Sidebar - Sticky Left */}
                <Sidebar
                    showFilters={true}
                    onFiltersChange={handleFiltersChange}
                    categories={categories}
                    maxPrice={maxPrice}
                />

                {/* Product Grid Area */}
                <main className="flex-1 w-full min-w-0">
                    <div className="p-4 md:p-6 lg:p-8">
                        <div className="px-2 py-2 mb-6">
                            <h1 className="text-xl font-bold text-gray-800">
                                Search Results for "{query}"
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Showing {searchResults.length} of {allResults.length} products
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-4">
                                        <Skeleton className="w-full aspect-[4/3] mb-4" />
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <Skeleton className="h-6 w-2/3" />
                                                <Skeleton className="h-6 w-12" />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-4 w-24" />
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <Skeleton className="h-3 w-12 ml-auto" />
                                                    <Skeleton className="h-4 w-20" />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                <Skeleton className="h-7 w-20" />
                                                <Skeleton className="h-10 w-32 rounded-lg" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (

                            <div className="text-center py-20">
                                <FaExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <p className="text-gray-800 text-lg mb-4">{error}</p>
                                <button
                                    onClick={fetchSearchResults}
                                    className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-md transition-all font-semibold"
                                >
                                    Retry Search
                                </button>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center py-20">
                                <FaSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-800 text-xl font-semibold mb-2">No products found for "{query}"</p>
                                <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-md transition-all font-semibold"
                                >
                                    Browse All Products
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {searchResults.map((product) => {
                                    const isInCart = cartItems.some(item => (item.productId?._id || item.productId) === product._id);
                                    const cartItem = cartItems.find(item => (item.productId?._id || item.productId) === product._id);

                                    return (
                                        <div
                                            key={product._id}
                                            onClick={() => navigate(`/product/${product._id}`)}
                                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer"
                                        >
                                            <div className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer">
                                                <img
                                                    src={product.images?.[0] || placeholderImg}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = placeholderImg;
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                                <button
                                                    onClick={(e) => toggleWishlist(e, product._id)}
                                                    disabled={togglingWishlist === product._id}
                                                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                                                >
                                                    {togglingWishlist === product._id ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                                    ) : (
                                                        <FaHeart
                                                            className={`w-5 h-5 transition-colors ${wishlistItems.includes(product._id)
                                                                ? 'text-red-500'
                                                                : 'text-gray-300 hover:text-red-400'
                                                                }`}
                                                        />
                                                    )}
                                                </button>
                                                {product.stock <= 0 && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                        <span className="text-white font-bold text-lg">Out of Stock</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-base font-semibold text-gray-800">{product.name}</h3>
                                                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded cursor-pointer">
                                                        <FaStar className="w-3 h-3 text-secondary" />
                                                        <span className="text-sm font-medium text-gray-700">4.2</span>
                                                        <span className="text-xs text-gray-500">(0)</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-gray-500 font-medium mb-1">Category</span>
                                                        <span className="text-sm font-bold text-gray-800 capitalize">{product.category?.main || product.category || 'General'}</span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs text-gray-500 font-medium mb-1">Stock</span>
                                                        <span className={`text-sm font-bold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-primary' : 'text-red-600'
                                                            }`}>
                                                            {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                    <span className="text-lg font-bold text-gray-800">
                                                        ₹{(product.pricing?.selling_price || product.price || 0).toFixed(2)}
                                                    </span>
                                                    {isInCart ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate('/cart');
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary text-primary rounded-lg transition-all shadow-sm hover:shadow-md hover:bg-primary/5 cursor-pointer"
                                                        >
                                                            <FaCheckCircle className="w-4 h-4" />
                                                            <span className="text-sm font-medium">
                                                                Added ({cartItem?.quantity || 1})
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => addToCart(e, product)}
                                                            disabled={addingToCart === product._id || product.stock <= 0}
                                                            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md ${addingToCart === product._id || product.stock <= 0
                                                                ? 'bg-gray-400 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 cursor-pointer'
                                                                }`}
                                                        >
                                                            {addingToCart === product._id ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                                    <span className="text-sm font-medium">Adding...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FaShoppingCart className="w-4 h-4" />
                                                                    <span className="text-sm font-medium">
                                                                        {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Notification Toast */}
            {notification.show && (
                <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transform transition-all ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {notification.type === 'success' ? <FaCheckCircle className="w-5 h-5" /> : <FaExclamationCircle className="w-5 h-5" />}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
                    <div className="w-80 h-full bg-white overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="font-bold text-lg text-gray-900">Filters</h2>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <FaTimes className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <div className="p-4">
                            <Sidebar
                                showFilters={true}
                                onFiltersChange={handleFiltersChange}
                                categories={categories}
                                maxPrice={maxPrice}
                            />
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );

};

export default SearchResults;
