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

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (allProducts.length > 0) {
            const uniqueCategories = [...new Set(allProducts.map(p =>
                (typeof p.category === 'object' ? p.category?.main : p.category)
            ).filter(Boolean))];
            setCategories(uniqueCategories);
        }
    }, [allProducts]);

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
        <div className="w-full h-full bg-white border-r border-slate-100 overflow-y-auto">
            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2563EB]">Collection</span>
                        <h2 className="text-2xl font-bold text-[#1E293B]">Filters</h2>
                    </div>
                    <button
                        onClick={clearFilters}
                        className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-[#2563EB] transition-colors"
                    >
                        Reset
                    </button>
                </div>

                <div className="space-y-10">
                    {/* Sort Section */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Reference</h3>
                        <div className="relative group">
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-[#1E293B] appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-[#2563EB]/10 transition-all uppercase tracking-tight"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="price-low">Price: Ascending</option>
                                <option value="price-high">Price: Descending</option>
                                <option value="newest">Latest Arrivals</option>
                                <option value="rating">Top Rated</option>
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <div className="w-4 h-4 border-b-2 border-r-2 border-slate-300 rotate-45 mb-1"></div>
                            </div>
                        </div>
                    </div>

                    {/* Categories Section */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Studio Categories</h3>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setFilters({ ...filters, category: '' })}
                                className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all ${filters.category === ''
                                    ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-100'
                                    : 'bg-white border border-slate-100 text-slate-600 hover:border-blue-200'
                                    }`}
                            >
                                <span className="uppercase tracking-tight">All Suites</span>
                                {filters.category === '' && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilters({ ...filters, category: cat })}
                                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all ${filters.category === cat
                                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-100'
                                        : 'bg-white border border-slate-100 text-slate-600 hover:border-blue-200'
                                        }`}
                                >
                                    <span className="uppercase tracking-tight">{cat}</span>
                                    {filters.category === cat && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range Section */}
                    <div className="space-y-4">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Price Points</h3>
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">₹</span>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-[#1E293B] outline-none focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
                                />
                            </div>
                            <div className="w-4 h-[2px] bg-slate-200"></div>
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">₹</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-[#1E293B] outline-none focus:ring-2 focus:ring-[#2563EB]/10 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Status */}
                    <div className="pt-4">
                        <label className="group flex items-center justify-between px-5 py-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                            <span className="text-[13px] font-bold text-slate-600 uppercase tracking-tight">Available Only</span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={filters.inStock}
                                    onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHorizontalCard = (product) => {
        const isInCart = cartItems.some(item => (item.productId?._id || item.productId) === product._id);
        const cartItem = cartItems.find(item => (item.productId?._id || item.productId) === product._id);
        const discount = Math.round((((product.pricing?.mrp || product.originalPrice) - (product.pricing?.selling_price || product.price)) / (product.pricing?.mrp || product.originalPrice)) * 100);

        return (
            <div
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                className="group bg-white rounded-[32px] overflow-hidden border border-slate-100/60 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer"
            >
                <div className="flex flex-col md:flex-row h-full">
                    {/* Image Section */}
                    <div className="relative w-full md:w-[320px] lg:w-[400px] aspect-[4/3] md:aspect-square overflow-hidden bg-slate-50 p-6 flex-shrink-0">
                        <div className="w-full h-full rounded-[24px] overflow-hidden relative shadow-inner">
                            <img
                                src={(product.images?.filter(img => img && img.trim() !== '')?.[0]) || placeholderImg}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = placeholderImg;
                                }}
                            />
                            {discount > 0 && (
                                <div className="absolute top-4 left-4">
                                    <span className="backdrop-blur-md bg-rose-500/90 text-[10px] font-black uppercase tracking-widest text-white px-3 py-1.5 rounded-full shadow-lg shadow-rose-500/20">
                                        -{discount}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-8 md:p-10 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-blue-50 text-[#2563EB] text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl">
                                    {product.category?.main || product.category || 'Special Edition'}
                                </span>
                                <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-xl">
                                    <FaStar className="w-2.5 h-2.5 text-amber-400" />
                                    <span className="text-[11px] font-bold text-slate-600">4.2 (Verified)</span>
                                </div>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-4 group-hover:text-[#2563EB] transition-colors line-clamp-2">
                                {product.name}
                            </h3>

                            <p className="text-slate-500 text-sm md:text-base leading-relaxed line-clamp-3 mb-8 font-medium">
                                {product.description || "Premium addition to your daily routine, meticulously crafted with international standards of excellence and sustainable components."}
                            </p>

                            <div className="flex flex-wrap gap-x-8 gap-y-4 mb-8 pt-6 border-t border-slate-50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Availability</span>
                                    <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {product.stock > 0 ? `Ready to Dispatch (${product.stock})` : 'Catalog Only'}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Pricing Model</span>
                                    <span className="text-xs font-bold text-slate-600">MSRP Inclusive of Taxes</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-50 gap-6">
                            <div className="flex flex-col self-start">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-black text-[#1E293B]">
                                        ₹{(product.pricing?.selling_price || product.price || 0).toLocaleString()}
                                    </span>
                                    {discount > 0 && (
                                        <span className="text-base text-slate-300 font-bold line-through">
                                            ₹{(product.pricing?.mrp || product.originalPrice || 0).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Free Expedited Shipping</span>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <button
                                    onClick={(e) => toggleWishlist(e, product._id)}
                                    className="p-5 rounded-2xl bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
                                >
                                    <FaHeart size={20} className={wishlistItems.includes(product._id) ? 'text-rose-500' : ''} />
                                </button>

                                {isInCart ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/cart');
                                        }}
                                        className="flex-1 sm:flex-none px-12 py-5 bg-slate-900 text-white rounded-[24px] text-[12px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        <FaCheckCircle size={18} />
                                        Cart ({cartItem?.quantity || 1})
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => handleAddToCart(e, product._id)}
                                        disabled={addingToCart === product._id || product.stock <= 0}
                                        className={`flex-1 sm:flex-none px-12 py-5 rounded-[24px] text-[12px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${product.stock <= 0
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                                            : 'bg-[#2563EB] text-white shadow-blue-100 hover:bg-[#1E40AF]'
                                            }`}
                                    >
                                        {addingToCart === product._id ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                        ) : (
                                            <>
                                                <FaShoppingCart size={18} />
                                                {product.stock <= 0 ? 'Notify Me' : 'Procure Item'}
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCardGrid = (product) => {
        const isInCart = cartItems.some(item => (item.productId?._id || item.productId) === product._id);
        const cartItem = cartItems.find(item => (item.productId?._id || item.productId) === product._id);
        const discount = Math.round((((product.pricing?.mrp || product.originalPrice) - (product.pricing?.selling_price || product.price)) / (product.pricing?.mrp || product.originalPrice)) * 100);

        return (
            <div
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                className="group bg-white rounded-[32px] overflow-hidden border border-slate-100/60 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] hover:border-blue-100/50 transition-all duration-500 cursor-pointer flex flex-col h-full bg-gradient-to-b from-white to-slate-50/30"
            >
                {/* Image Section */}
                <div className="relative aspect-[4/5] overflow-hidden p-4">
                    <div className="w-full h-full rounded-[24px] overflow-hidden bg-slate-100/50 relative group-hover:shadow-inner transition-shadow">
                        <img
                            src={(product.images?.filter(img => img && img.trim() !== '')?.[0]) || placeholderImg}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = placeholderImg;
                            }}
                        />

                        {/* Status Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {discount > 0 && (
                                <span className="backdrop-blur-md bg-rose-500/90 text-[10px] font-black uppercase tracking-widest text-white px-3 py-1.5 rounded-full shadow-lg shadow-rose-500/20">
                                    -{discount}%
                                </span>
                            )}
                            {product.stock <= 0 && (
                                <span className="backdrop-blur-md bg-slate-900/80 text-[10px] font-black uppercase tracking-widest text-white px-3 py-1.5 rounded-full">
                                    Sold Out
                                </span>
                            )}
                        </div>

                        {/* Wishlist Action */}
                        <button
                            onClick={(e) => toggleWishlist(e, product._id)}
                            disabled={togglingWishlist === product._id}
                            className="absolute top-4 right-4 w-10 h-10 backdrop-blur-md bg-white/80 rounded-2xl flex items-center justify-center shadow-sm border border-white/40 hover:bg-white transition-all transform hover:scale-105 active:scale-95"
                        >
                            {togglingWishlist === product._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2563EB]"></div>
                            ) : (
                                <FaHeart
                                    className={`w-4 h-4 transition-colors ${wishlistItems.includes(product._id) ? 'text-rose-500' : 'text-slate-300'}`}
                                />
                            )}
                        </button>

                        {/* Interactive Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-7 pb-7 flex flex-col flex-1">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB]">
                                {product.category?.main || product.category || 'Portfolio'}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                            <div className="flex items-center gap-1">
                                <FaStar className="w-2.5 h-2.5 text-amber-400" />
                                <span className="text-[11px] font-bold text-slate-500">4.2</span>
                            </div>
                        </div>
                        <h3 className="text-base font-bold text-[#1E293B] line-clamp-2 leading-snug group-hover:text-[#2563EB] transition-colors">
                            {product.name}
                        </h3>
                    </div>

                    <div className="mt-auto space-y-5">
                        <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-[#1E293B] leading-none mb-1">
                                    ₹{(product.pricing?.selling_price || product.price || 0).toLocaleString()}
                                </span>
                                {discount > 0 && (
                                    <span className="text-[13px] text-slate-400 font-bold line-through">
                                        ₹{(product.pricing?.mrp || product.originalPrice || 0).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl border ${product.stock > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-500'} text-[10px] font-black uppercase tracking-widest`}>
                                {product.stock > 0 ? 'Verified' : 'Limited'}
                            </div>
                        </div>

                        {isInCart ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/cart');
                                }}
                                className="w-full flex items-center justify-center gap-2.5 py-4 bg-slate-900 text-white rounded-[20px] shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-[0.98] text-[11px] font-bold uppercase tracking-widest"
                            >
                                <FaCheckCircle size={16} />
                                View Cart ({cartItem?.quantity || 1})
                            </button>
                        ) : (
                            <button
                                onClick={(e) => handleAddToCart(e, product._id)}
                                disabled={addingToCart === product._id || product.stock <= 0}
                                className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-[20px] transition-all active:scale-[0.98] text-[11px] font-bold uppercase tracking-widest ${product.stock <= 0
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#2563EB] text-white shadow-xl shadow-blue-100 hover:bg-[#1E40AF]'
                                    }`}
                            >
                                {addingToCart === product._id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                ) : (
                                    <>
                                        <FaShoppingCart size={16} />
                                        {product.stock <= 0 ? 'Catalog Only' : 'Procure Item'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
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

                <div className="bg-white/70 backdrop-blur-xl px-8 py-10 border-b border-slate-100 flex-shrink-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#2563EB]">
                                <FaSearch className="animate-pulse" />
                                <span>Search Query Engine</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-[#1E293B] leading-tight">
                                Results for <span className="text-[#2563EB]">"{searchQuery}"</span>
                            </h1>
                            {!loading && (
                                <p className="text-slate-400 text-sm font-medium italic">
                                    Found {products.length} exclusive items matching your request
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-slate-200"
                            >
                                <FaFilter size={14} />
                                Adjust Filters
                            </button>

                            <div className="hidden lg:flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                <div className="flex -space-x-3 overflow-hidden p-1">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200"></div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 pr-4">Global Trend Verified</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-20 md:pb-6">
                    {loading ? (
                        <div className="space-y-12">
                            <div>
                                <div className="h-px bg-slate-100 mb-10"></div>
                                <div className="space-y-8">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-[32px] border border-slate-50 p-6 flex flex-col md:flex-row gap-8">
                                            <Skeleton className="w-full md:w-[320px] aspect-square rounded-[24px]" />
                                            <div className="flex-1 space-y-6 py-4">
                                                <div className="space-y-3">
                                                    <Skeleton className="h-8 w-3/4 rounded-xl" />
                                                    <Skeleton className="h-4 w-1/4 rounded-lg" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-full rounded-lg" />
                                                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                                                </div>
                                                <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                                                    <Skeleton className="h-10 w-32 rounded-xl" />
                                                    <Skeleton className="h-14 w-48 rounded-2xl" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="h-px bg-slate-100 mb-10"></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="bg-white rounded-[32px] border border-slate-50 p-4 space-y-6">
                                            <Skeleton className="w-full aspect-[4/5] rounded-[24px]" />
                                            <div className="px-3 pb-4 space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <Skeleton className="h-6 w-2/3 rounded-lg" />
                                                    <Skeleton className="h-6 w-10 rounded-lg" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Skeleton className="h-10 w-1/2 rounded-xl" />
                                                    <Skeleton className="h-14 w-full rounded-[20px]" />
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
                                <div className="mb-14">
                                    <div className="flex items-center gap-4 mb-8">
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Featured Collections</h2>
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                    </div>
                                    <div className="space-y-6">
                                        {giftBoxProducts.map(renderHorizontalCard)}
                                    </div>
                                </div>
                            )}

                            {otherProducts.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-4 mb-8">
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Inventory Items</h2>
                                        <div className="h-px flex-1 bg-slate-100"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
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
