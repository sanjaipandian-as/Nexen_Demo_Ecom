import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaCheckCircle, FaExclamationCircle, FaHeart, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';


const SearchResult = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addingToCart, setAddingToCart] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [wishlistItems, setWishlistItems] = useState([]);
    const [togglingWishlist, setTogglingWishlist] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [filters, setFilters] = useState({
        category: '',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        sortBy: 'relevance'
    });

    const categories = ['Sparklers', 'Rockets', 'Fountains', 'Gift Boxes', 'Chakras', 'Bombs', 'Flower Pots', 'Ground Chakkars'];

    useEffect(() => {
        if (searchQuery) {
            searchProducts();
            fetchWishlist();
            fetchCart();
        }
    }, [searchQuery]);

    const searchProducts = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await API.get(`/search?q=${encodeURIComponent(searchQuery)}`);
            setAllProducts(response.data.products || []);
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to search products. Please try again.');
            setAllProducts([]);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [filters, allProducts]);

    const applyFilters = () => {
        let filtered = [...allProducts];

        if (filters.category) {
            filtered = filtered.filter(p =>
                (p.category?.main || p.category)?.toLowerCase() === filters.category.toLowerCase()
            );
        }

        if (filters.minPrice) {
            filtered = filtered.filter(p => (p.pricing?.selling_price || p.price) >= parseFloat(filters.minPrice));
        }

        if (filters.maxPrice) {
            filtered = filtered.filter(p => (p.pricing?.selling_price || p.price) <= parseFloat(filters.maxPrice));
        }

        if (filters.inStock) {
            filtered = filtered.filter(p => (p.stock_control?.available_pieces || p.stock) > 0);
        }

        switch (filters.sortBy) {
            case 'price-low':
                filtered.sort((a, b) => (a.pricing?.selling_price || a.price) - (b.pricing?.selling_price || b.price));
                break;
            case 'price-high':
                filtered.sort((a, b) => (b.pricing?.selling_price || b.price) - (a.pricing?.selling_price || a.price));
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'rating':
                filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
            default:
                break;
        }

        setProducts(filtered);
    };

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
            if (error.response?.status === 401) {
                showNotification('Session expired. Please login again', 'error');
                setTimeout(() => navigate('/Login'), 1500);
            } else {
                showNotification(error.response?.data?.message || 'Failed to update wishlist', 'error');
            }
        } finally {
            setTogglingWishlist(null);
        }
    };

    const handleAddToCart = async (e, productId) => {
        e.stopPropagation();

        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to add items to cart', 'error');
            setTimeout(() => navigate('/Login'), 1500);
            return;
        }

        setAddingToCart(productId);

        try {
            await API.post('/cart/add', {
                productId: productId.toString(),
                quantity: 1
            });

            showNotification('Added to cart successfully!', 'success');
            fetchCart();
        } catch (error) {
            console.error('Add to cart error:', error);
            if (error.response?.status === 401) {
                showNotification('Session expired. Please login again', 'error');
                setTimeout(() => navigate('/Login'), 1500);
            } else {
                showNotification(error.response?.data?.message || 'Failed to add to cart', 'error');
            }
        } finally {
            setAddingToCart(null);
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            minPrice: '',
            maxPrice: '',
            inStock: false,
            sortBy: 'relevance'
        });
    };

    const isGiftBox = (category) => {
        const catName = typeof category === 'object' ? category?.main : category;
        return catName?.toLowerCase() === 'gift boxes' || catName?.toLowerCase() === 'gift box';
    };

    const giftBoxProducts = products.filter(p => isGiftBox(p.category));
    const otherProducts = products.filter(p => !isGiftBox(p.category));

    const FilterSidebar = () => (
        <div className="w-full h-full bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FaFilter className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        Filters
                    </h2>
                    <button
                        onClick={clearFilters}
                        className="text-xs sm:text-sm text-primary hover:text-primary/80 font-semibold px-2 py-1 hover:bg-primary/10 rounded transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">Sort By</h3>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                        >
                            <option value="relevance">Relevance</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>

                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">Category</h3>
                        <div className="space-y-1.5 sm:space-y-2">
                            <button
                                onClick={() => setFilters({ ...filters, category: '' })}
                                className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${filters.category === '' ? 'bg-primary text-primary-foreground' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                All Categories
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilters({ ...filters, category: cat })}
                                    className={`w-full text-left px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${filters.category === cat ? 'bg-primary text-primary-foreground' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">Price Range</h3>
                        <div className="space-y-2 sm:space-y-3">
                            <input
                                type="number"
                                placeholder="Min Price"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                            />
                            <input
                                type="number"
                                placeholder="Max Price"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={filters.inStock}
                                onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                                className="w-4 h-4 sm:w-5 sm:h-5 text-primary border-2 border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-xs sm:text-sm font-semibold text-gray-700">In Stock Only</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHorizontalCard = (product) => {
        const isInCart = cartItems.some(item => (item.productId?._id || item.productId) === product._id);
        const cartItem = cartItems.find(item => (item.productId?._id || item.productId) === product._id);

        return (
            <div
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 cursor-pointer"
            >
                <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-48 md:w-56 lg:w-64 h-48 sm:h-48 md:h-56 lg:h-64 flex-shrink-0 bg-gray-50">
                        <img
                            src={product.images?.[0] || placeholderImg}
                            alt={product.name}
                            className="w-full h-full object-contain p-2 sm:p-3 md:p-4"
                            onError={(e) => {
                                e.target.src = placeholderImg;
                                e.target.onerror = null;
                            }}
                        />
                        <button
                            onClick={(e) => toggleWishlist(e, product._id)}
                            disabled={togglingWishlist === product._id}
                            className="absolute top-2 right-2 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                        >
                            {togglingWishlist === product._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary"></div>
                            ) : (
                                <FaHeart
                                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${wishlistItems.includes(product._id) ? 'text-primary' : 'text-gray-300 hover:text-primary'
                                        }`}
                                />
                            )}
                        </button>
                        {(product.stock_control?.available_pieces || product.stock || 0) <= 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-bold text-sm sm:text-base md:text-lg">Out of Stock</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 flex-1 pr-2 sm:pr-4 line-clamp-2">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-1 bg-green-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-semibold flex-shrink-0">
                                    <span>4.2</span>
                                    <FaStar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                                {product.totalReviews || 0} Ratings & {product.totalReviews || 0} Reviews
                            </p>

                            <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                                {product.description && (
                                    <p className="text-xs sm:text-sm text-gray-700 line-clamp-2">{product.description}</p>
                                )}

                                <ul className="space-y-1 text-xs sm:text-sm text-gray-700">
                                    <li className="flex items-start">
                                        <span className="text-gray-400 mr-1.5 sm:mr-2">•</span>
                                        <span>Category: <span className="font-semibold capitalize">{product.category?.main || product.category || 'General'}</span></span>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="text-gray-400 mr-1.5 sm:mr-2">•</span>
                                        <span>Stock: <span className={`font-semibold ${(product.stock_control?.available_pieces || product.stock || 0) > 10 ? 'text-green-600' : (product.stock_control?.available_pieces || product.stock || 0) > 0 ? 'text-secondary' : 'text-red-600'
                                            }`}>
                                            {(product.stock_control?.available_pieces || product.stock || 0) > 0 ? `${product.stock_control?.available_pieces || product.stock} units available` : 'Out of stock'}
                                        </span></span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 sm:pt-4 border-t border-gray-200 gap-3 sm:gap-2">
                            <div>
                                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                                        ₹{(product.pricing?.selling_price || product.price || 0).toFixed(2)}
                                    </span>
                                    {(product.pricing?.mrp || product.originalPrice) && (product.pricing?.mrp || product.originalPrice) > (product.pricing?.selling_price || product.price) && (
                                        <>
                                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                                                ₹{(product.pricing?.mrp || product.originalPrice).toFixed(2)}
                                            </span>
                                            <span className="text-xs sm:text-sm font-bold text-green-600">
                                                {Math.round((((product.pricing?.mrp || product.originalPrice) - (product.pricing?.selling_price || product.price)) / (product.pricing?.mrp || product.originalPrice)) * 100)}% off
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {isInCart ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/cart');
                                    }}
                                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white border-2 border-primary text-primary rounded-lg transition-all shadow-sm hover:shadow-md hover:bg-primary/10 font-semibold text-sm sm:text-base"
                                >
                                    <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Cart ({cartItem?.quantity || 1})</span>
                                </button>
                            ) : (
                                <button
                                    onClick={(e) => handleAddToCart(e, product._id)}
                                    disabled={addingToCart === product._id || (product.stock_control?.available_pieces || product.stock || 0) <= 0}
                                    className={`w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-semibold text-sm sm:text-base ${(addingToCart === product._id || (product.stock_control?.available_pieces || product.stock || 0) <= 0)
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90'
                                        }`}
                                >
                                    {addingToCart === product._id ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCardGrid = (product) => {
        const isInCart = cartItems.some(item => (item.productId?._id || item.productId) === product._id);
        const cartItem = cartItems.find(item => (item.productId?._id || item.productId) === product._id);

        return (
            <div
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 cursor-pointer group"
            >
                <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
                    <img
                        src={product.images?.[0] || placeholderImg}
                        alt={product.name}
                        className="w-full h-full object-contain p-3 sm:p-4 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.src = placeholderImg;
                            e.target.onerror = null;
                        }}
                    />
                    <button
                        onClick={(e) => toggleWishlist(e, product._id)}
                        disabled={togglingWishlist === product._id}
                        className="absolute top-2 right-2 w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all z-10"
                    >
                        {togglingWishlist === product._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        ) : (
                            <FaHeart
                                className={`w-4 h-4 transition-colors ${wishlistItems.includes(product._id) ? 'text-primary' : 'text-gray-300 hover:text-primary'
                                    }`}
                            />
                        )}
                    </button>
                    {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                            <span className="text-white font-bold text-sm sm:text-base">Out of Stock</span>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-5 xl:p-6">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-sm sm:text-base lg:text-base xl:text-lg font-bold text-gray-900 line-clamp-2 flex-1">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-secondary text-white px-2 py-1 rounded text-xs sm:text-sm font-bold flex-shrink-0">
                            <FaStar className="w-3 h-3" />
                            <span>4.2</span>
                            <span className="text-[10px] sm:text-xs">(0)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Category</p>
                            <p className="text-sm xl:text-base font-bold text-gray-900 capitalize truncate">
                                {product.category?.main || product.category || 'General'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Stock</p>
                            <p className={`text-sm xl:text-base font-bold ${(product.stock_control?.available_pieces || product.stock || 0) > 10 ? 'text-green-600' : (product.stock_control?.available_pieces || product.stock || 0) > 0 ? 'text-secondary' : 'text-red-600'
                                }`}>
                                {(product.stock_control?.available_pieces || product.stock || 0) > 0 ? `${product.stock_control?.available_pieces || product.stock} units` : 'Out of stock'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                        <div className="flex flex-col">
                            <span className="text-xl xl:text-2xl font-bold text-gray-900">
                                ₹{(product.pricing?.selling_price || product.price || 0).toFixed(2)}
                            </span>
                            {(product.pricing?.mrp || product.originalPrice) && (product.pricing?.mrp || product.originalPrice) > (product.pricing?.selling_price || product.price) && (
                                <span className="text-sm text-gray-400 line-through">
                                    ₹{(product.pricing?.mrp || product.originalPrice).toFixed(2)}
                                </span>
                            )}
                        </div>
                        {(product.pricing?.mrp || product.originalPrice) && (product.pricing?.mrp || product.originalPrice) > (product.pricing?.selling_price || product.price) && (
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                                {Math.round((((product.pricing?.mrp || product.originalPrice) - (product.pricing?.selling_price || product.price)) / (product.pricing?.mrp || product.originalPrice)) * 100)}% OFF
                            </div>
                        )}
                    </div>

                    {isInCart ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/cart');
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 xl:py-3 bg-white border-2 border-primary text-primary rounded-lg transition-all shadow-sm hover:shadow-md hover:bg-primary/10 font-semibold text-sm">
                            <FaShoppingCart className="w-4 h-4" />
                            <span>Added ({cartItem?.quantity || 1})</span>
                        </button>
                    ) : (
                        <button
                            onClick={(e) => handleAddToCart(e, product._id)}
                            disabled={addingToCart === product._id || (product.stock_control?.available_pieces || product.stock || 0) <= 0}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 xl:py-3 text-white rounded-lg transition-all shadow-sm hover:shadow-md font-semibold text-sm ${addingToCart === product._id || (product.stock_control?.available_pieces || product.stock || 0) <= 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80'
                                }`}
                        >
                            {addingToCart === product._id ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <FaShoppingCart className="w-4 h-4" />
                                    <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    };


    return (
        <div className="flex w-full h-screen bg-gray-50 overflow-hidden">
            <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                <FilterSidebar />
            </div>

            {showMobileFilters && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
                    <div className="absolute left-0 top-0 bottom-0 w-[280px] sm:w-80 bg-white" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Filters</h2>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            </button>
                        </div>
                        <FilterSidebar />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {notification.show && (
                    <div className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transform transition-all ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        {notification.type === 'success' ? (
                            <FaCheckCircle className="w-5 h-5" />
                        ) : (
                            <FaExclamationCircle className="w-5 h-5" />
                        )}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                )}

                <div className="bg-white px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <FaSearch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                                    Search Results for "{searchQuery}"
                                </h1>
                                {!loading && (
                                    <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                                        {products.length} {products.length === 1 ? 'product' : 'products'} found
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowMobileFilters(true)}
                            className="lg:hidden px-3 sm:px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-medium shadow-sm hover:bg-primary/90 transition-colors flex-shrink-0"
                        >
                            <FaFilter className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden xs:inline">Filters</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-20 md:pb-6">
                    {loading ? (
                        <div className="space-y-8">
                            <div>
                                <Skeleton className="h-8 w-48 mb-4" />
                                <div className="space-y-4">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-lg border border-gray-100 p-4 flex gap-4">
                                            <Skeleton className="w-48 h-48 rounded-lg" />
                                            <div className="flex-1 space-y-4">
                                                <div className="flex justify-between">
                                                    <Skeleton className="h-6 w-3/4" />
                                                    <Skeleton className="h-6 w-12" />
                                                </div>
                                                <Skeleton className="h-4 w-1/4" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-full" />
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t">
                                                    <Skeleton className="h-8 w-32" />
                                                    <Skeleton className="h-10 w-40" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Skeleton className="h-8 w-48 mb-4" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-lg border border-gray-100 p-4 space-y-4">
                                            <Skeleton className="w-full aspect-square rounded-lg" />
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <Skeleton className="h-5 w-2/3" />
                                                    <Skeleton className="h-5 w-10" />
                                                </div>
                                                <div className="flex justify-between">
                                                    <Skeleton className="h-4 w-1/3" />
                                                    <Skeleton className="h-4 w-1/4" />
                                                </div>
                                                <div className="flex justify-between items-center pt-4 border-t">
                                                    <Skeleton className="h-6 w-24" />
                                                    <Skeleton className="h-10 w-full ml-4" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : error ? (

                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
                            <FaExclamationCircle className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-red-500 mb-3 sm:mb-4" />
                            <p className="text-gray-600 text-base sm:text-lg text-center">{error}</p>
                            <button
                                onClick={searchProducts}
                                className="mt-3 sm:mt-4 px-5 sm:px-6 py-2 sm:py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm sm:text-base font-medium shadow-sm"
                            >
                                Retry
                            </button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
                            <FaSearch className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400 mb-3 sm:mb-4" />
                            <p className="text-gray-600 text-base sm:text-lg mb-1 sm:mb-2 text-center">No products found for "{searchQuery}"</p>
                            <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6 text-center">Try adjusting your filters or search terms</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-5 sm:px-6 py-2 sm:py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm sm:text-base font-medium shadow-sm"
                            >
                                Browse All Products
                            </button>
                        </div>
                    ) : (
                        <>
                            {giftBoxProducts.length > 0 && (
                                <div className="mb-6 sm:mb-8">
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Gift Boxes</h2>
                                    <div className="space-y-3 sm:space-y-4">
                                        {giftBoxProducts.map(renderHorizontalCard)}
                                    </div>
                                </div>
                            )}

                            {otherProducts.length > 0 && (
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Other Products</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                                        {otherProducts.map(renderCardGrid)}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResult;
