import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaExclamationCircle, FaTag, FaCheckCircle } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';

const defaultFilters = {};

const Products = ({ filters = defaultFilters }) => {
    const navigate = useNavigate();
    const [addingToCart, setAddingToCart] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [wishlistItems, setWishlistItems] = useState([]);
    const [togglingWishlist, setTogglingWishlist] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [cartItems, setCartItems] = useState([]);

    const isLoggedIn = useMemo(() => {
        return !!localStorage.getItem('token');
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Build query parameters from filters
                const queryParams = new URLSearchParams();
                queryParams.append('page', currentPage);

                // Check if any filters are active
                const hasActiveFilters =
                    filters.category ||
                    (filters.sortBy && filters.sortBy !== 'relevance') ||
                    (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000)) ||
                    (filters.selectedBrands && filters.selectedBrands.length > 0) ||
                    (filters.selectedAges && filters.selectedAges.length > 0) ||
                    (filters.selectedTags && filters.selectedTags.length > 0) ||
                    (filters.selectedRatings && filters.selectedRatings.length > 0) ||
                    filters.isEcoFriendly ||
                    filters.isGreenCrackers;

                let productsPromise;

                if (hasActiveFilters) {
                    // Use filter endpoint
                    if (filters.category) {
                        queryParams.append('category', filters.category);
                    }

                    if (filters.sortBy && filters.sortBy !== 'relevance') {
                        queryParams.append('sortBy', filters.sortBy);
                    }

                    if (filters.priceRange) {
                        queryParams.append('minPrice', filters.priceRange[0]);
                        queryParams.append('maxPrice', filters.priceRange[1]);
                    }

                    if (filters.selectedBrands && filters.selectedBrands.length > 0) {
                        queryParams.append('brands', filters.selectedBrands.join(','));
                    }

                    if (filters.selectedAges && filters.selectedAges.length > 0) {
                        queryParams.append('ageCategories', filters.selectedAges.join(','));
                    }

                    if (filters.selectedTags && filters.selectedTags.length > 0) {
                        queryParams.append('tags', filters.selectedTags.join(','));
                    }

                    if (filters.selectedRatings && filters.selectedRatings.length > 0) {
                        const minRating = Math.min(...filters.selectedRatings);
                        queryParams.append('minRating', minRating);
                    }

                    if (filters.isEcoFriendly) {
                        queryParams.append('isEcoFriendly', 'true');
                    }

                    if (filters.isGreenCrackers) {
                        queryParams.append('isGreenCrackers', 'true');
                    }

                    productsPromise = API.get(`/products/customer/filter?${queryParams.toString()}`);
                } else {
                    // Use regular pagination endpoint
                    productsPromise = API.get(`/products/customer/page?page=${currentPage}`);
                }

                const promises = [productsPromise];
                if (isLoggedIn) {
                    promises.push(API.get('/wishlist'));
                    promises.push(API.get('/cart'));
                }

                const results = await Promise.allSettled(promises);

                if (results[0].status === 'fulfilled') {
                    setProducts(results[0].value.data.products || []);
                    setTotalPages(results[0].value.data.totalPages || 1);
                    setError('');
                } else {
                    setError('Failed to load products. Please try again later.');
                    setProducts([]);
                }

                if (results[1]?.status === 'fulfilled') {
                    const wishlistProductIds = (Array.isArray(results[1].value.data) ? results[1].value.data : [])
                        .filter(item => item?.productId?._id)
                        .map(item => item.productId._id);
                    setWishlistItems(wishlistProductIds);
                }

                if (results[2]?.status === 'fulfilled') {
                    setCartItems(results[2].value.data.items || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [currentPage, isLoggedIn, filters]);

    const isInCart = useCallback((productId) => {
        return cartItems.some(item =>
            (item.productId?._id || item.productId) === productId
        );
    }, [cartItems]);

    const getCartItem = useCallback((productId) => {
        return cartItems.find(item =>
            (item.productId?._id || item.productId) === productId
        );
    }, [cartItems]);

    const toggleWishlist = async (e, productId) => {
        e.stopPropagation();

        if (!isLoggedIn) {
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
            } else if (error.response?.status === 400 && error.response?.data?.message === 'Already in wishlist') {
                setWishlistItems(prev => [...prev, productId]);
                showNotification('Already in wishlist', 'success');
            } else {
                showNotification(error.response?.data?.message || 'Failed to update wishlist', 'error');
            }
        } finally {
            setTogglingWishlist(null);
        }
    };

    const handleProductClick = useCallback((productId) => {
        navigate(`/product/${productId}`);
    }, [navigate]);

    const showNotification = useCallback((message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    }, []);

    const handleAddToCart = async (e, productId) => {
        e.stopPropagation();

        if (!isLoggedIn) {
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

            const response = await API.get('/cart');
            setCartItems(response.data.items || []);
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

    const ProductCard = useCallback(({ product }) => {
        const inCart = isInCart(product._id);
        const cartItem = getCartItem(product._id);
        const availablePieces = product.stock || 0;
        const sellingPrice = product.pricing?.selling_price || 0;
        const mrp = product.pricing?.mrp;
        const discount = product.pricing?.discount_percentage || 0;
        const brandName = product.brand || 'Generic';

        return (
            <div
                onClick={() => handleProductClick(product._id)}
                className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer active:scale-98"
            >
                <div className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer">
                    <img
                        src={product.images?.[0] || placeholderImg}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = placeholderImg;
                            e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                        }}
                    />

                    {discount > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                            <FaTag className="w-2 h-2" />
                            {discount}% OFF
                        </div>
                    )}

                    <button
                        onClick={(e) => toggleWishlist(e, product._id)}
                        disabled={togglingWishlist === product._id}
                        className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-90"
                    >
                        {togglingWishlist === product._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary"></div>
                        ) : (
                            <BsFillBagHeartFill
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${wishlistItems.includes(product._id)
                                    ? 'text-primary'
                                    : 'text-gray-300 hover:text-primary'
                                    }`}
                            />
                        )}
                    </button>
                    {availablePieces <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-bold text-sm sm:text-base md:text-lg">Out of Stock</span>
                        </div>
                    )}
                </div>

                <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 flex-1">{product.name}</h3>
                        <div className="flex items-center gap-1 bg-gray-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer flex-shrink-0">
                            <FaStar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary" />
                            <span className="text-xs sm:text-sm font-medium text-gray-700">4.2</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Category</span>
                            <span className="text-xs sm:text-sm font-bold text-gray-800 capitalize">{product.category?.main || 'General'}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Brand</span>
                            <span className="text-xs sm:text-sm font-bold text-primary capitalize">
                                {brandName}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100 gap-2">
                        <div className="flex flex-col">
                            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-800">₹{sellingPrice.toFixed(2)}</span>
                            {mrp > sellingPrice && (
                                <span className="text-[10px] sm:text-xs text-gray-400 line-through">₹{mrp.toFixed(2)}</span>
                            )}
                        </div>

                        {inCart ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/cart');
                                }}
                                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
                            >
                                <FaShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                                    View Cart
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={(e) => handleAddToCart(e, product._id)}
                                disabled={addingToCart === product._id || availablePieces <= 0}
                                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 ${addingToCart === product._id || availablePieces <= 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 cursor-pointer'
                                    }`}
                            >
                                {addingToCart === product._id ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                                        <span className="text-xs sm:text-sm font-medium hidden sm:inline">Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                                            {availablePieces <= 0 ? 'Out' : 'Add'}
                                        </span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }, [wishlistItems, togglingWishlist, addingToCart, isInCart, getCartItem, handleProductClick, toggleWishlist, handleAddToCart, navigate]);

    return (
        <div className="w-full bg-gray-50 pb-20 md:pb-0 mt-10">

            {notification.show && (
                <div className={`fixed top-16 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto z-50 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg transform transition-all ${notification.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    {notification.type === 'success' ? (
                        <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    ) : (
                        <FaExclamationCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    )}
                    <span className="font-medium text-sm sm:text-base">{notification.message}</span>
                </div>
            )}

            <div className="p-3 sm:p-4 md:p-6">

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-3 sm:p-4">
                                <Skeleton className="w-full aspect-[4/3] mb-4" />
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-5 w-10" />
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-3 w-12" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <div className="space-y-2 flex flex-col items-end">
                                            <Skeleton className="h-3 w-12" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    </div>
                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <div className="space-y-1">
                                            <Skeleton className="h-6 w-20" />
                                            <Skeleton className="h-3 w-12" />
                                        </div>
                                        <Skeleton className="h-10 w-24" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
                        <FaExclamationCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mb-4" />
                        <p className="text-gray-600 text-base sm:text-lg text-center">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-5 sm:px-6 py-2 sm:py-2.5 bg-primary text-white text-sm sm:text-base rounded-lg hover:bg-primary/90 transition-all active:scale-95"
                        >
                            Retry
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                        <p className="text-gray-600 text-base sm:text-lg">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}

                {!loading && !error && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-sm sm:text-base text-gray-700 hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 active:scale-95"
                        >
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">Prev</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-semibold text-sm sm:text-base">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-sm sm:text-base text-gray-700 hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700 active:scale-95"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;