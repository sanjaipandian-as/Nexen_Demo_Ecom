import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../../api';
import Skeleton from '../components/Common/Skeleton';

import Topbar from '../components/Customer/Topbar';
import Sidebar from '../components/Customer/Sidebar';
import Footer from '../components/Customer/Footer';
import { FaArrowLeft, FaShoppingCart, FaStar, FaStore, FaMapMarkerAlt, FaCheckCircle } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import placeholderImg from '../assets/Placeholder.png';

const ShopProductsPage = () => {
    const { sellerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const shopData = location.state?.shopData;

    const [products, setProducts] = useState([]);
    const [shopInfo, setShopInfo] = useState(shopData || null);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [addingToCart, setAddingToCart] = useState(null);
    const [addingToWishlist, setAddingToWishlist] = useState(null);

    // Fetch shop products and info
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch products and shop info in parallel
                const [productsRes, shopRes] = await Promise.all([
                    API.get(`/products/customer/seller/${sellerId}`),
                    !shopInfo ? API.get(`/sellers/${sellerId}`) : Promise.resolve(null)
                ]);

                setProducts(productsRes.data || []);

                if (shopRes) {
                    const seller = shopRes.data;
                    setShopInfo({
                        id: seller._id,
                        name: seller.businessName,
                        img: seller.img || placeholderImg,
                        rating: seller.rating || 4.5,
                        products: `${seller.totalProducts || 0} Products`,
                        location: seller.address?.city || 'India'
                    });
                }
            } catch (error) {
                console.error('Error fetching shop data:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        if (sellerId) {
            fetchData();
        }
    }, [sellerId, shopInfo]);

    // Fetch cart and wishlist
    useEffect(() => {
        fetchCart();
        fetchWishlist();
    }, []);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await API.get('/cart');
                setCartItems(response.data.items || []);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await API.get('/wishlist');
                const items = Array.isArray(response.data.items) ? response.data.items :
                    (Array.isArray(response.data) ? response.data : []);
                setWishlistItems(items);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const addToCart = async (product) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/Login');
            return;
        }

        const inCart = cartItems.some(item =>
            (item.productId?._id || item.productId) === product._id
        );

        if (inCart) {
            navigate('/Cart');
            return;
        }

        setAddingToCart(product._id);
        try {
            await API.post('/cart/add', {
                productId: product._id,
                quantity: 1
            });
            fetchCart();
        } catch (error) {
            console.error('Add to cart error:', error);
        } finally {
            setAddingToCart(null);
        }
    };

    const addToWishlist = async (product) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/Login');
            return;
        }

        const isFav = wishlistItems.some(item =>
            (item.productId?._id || item.productId) === product._id
        );

        setAddingToWishlist(product._id);
        try {
            if (isFav) {
                await API.delete(`/wishlist/remove/${product._id}`);
                fetchWishlist();
            } else {
                await API.post('/wishlist/add', {
                    productId: product._id
                });
                fetchWishlist();
            }
        } catch (error) {
            console.error('Wishlist error:', error);
        } finally {
            setAddingToWishlist(null);
        }
    };

    const isInCart = (productId) => {
        return cartItems.some(item =>
            (item.productId?._id || item.productId) === productId
        );
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item =>
            (item.productId?._id || item.productId) === productId
        );
    };

    return (
        <div className="flex w-full h-screen bg-gray-50">
            {/* Sidebar with filters disabled */}
            <Sidebar showFilter={false} />

            <div className="flex flex-col flex-1 h-screen overflow-y-auto relative">
                <Topbar />
                <div className="flex-1">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                        {/* Back Button & Shop Header */}
                        <div className="mb-6">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4"
                            >
                                <FaArrowLeft />
                                <span className="text-sm md:text-base">Back to Home</span>
                            </button>

                            {shopInfo && (
                                <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                                            <img
                                                src={shopInfo.img}
                                                alt={shopInfo.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = '/Monkey.jpg';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                                                    {shopInfo.name}
                                                </h1>
                                                <div className="hidden md:flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-100 uppercase tracking-tighter">
                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                                    Verified Seller
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-gray-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <FaStar className="text-secondary" />
                                                    <span className="text-gray-900 font-bold">{shopInfo.rating}</span>
                                                    <span>(450+ Reviews)</span>
                                                </div>
                                                <span className="hidden md:block text-gray-300">•</span>
                                                <div className="flex items-center gap-1.5">
                                                    <FaStore className="text-primary" />
                                                    <span>{shopInfo.products}</span>
                                                </div>
                                                {shopInfo.location && (
                                                    <>
                                                        <span className="hidden md:block text-gray-300">•</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <FaMapMarkerAlt className="text-blue-500" />
                                                            <span>{shopInfo.location}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl md:text-2xl font-black text-gray-900">
                                    Shop Collection
                                </h2>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {products.length} Items Available
                                </span>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {[...Array(8)].map((_, index) => (
                                    <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                                        <Skeleton className="aspect-[4/3] w-full rounded-none" />
                                        <div className="p-4 space-y-4">
                                            <Skeleton className="h-5 w-full" />
                                            <Skeleton className="h-4 w-2/3" />
                                            <div className="flex justify-between items-center pt-4">
                                                <Skeleton className="h-8 w-1/3" />
                                                <Skeleton className="h-10 w-1/3 rounded-xl" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (

                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                                <FaStore className="text-7xl text-gray-200 mb-6" />
                                <h2 className="text-2xl font-black text-gray-900 mb-2">Inventory Empty</h2>
                                <p className="text-gray-500 text-center max-w-sm mb-8 font-medium">
                                    This brand hasn't listed any fashion items for this season yet. Check back soon!
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary transition-all shadow-lg active:scale-95"
                                >
                                    Explore Other Brands
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {products.map((product) => {
                                    const inCart = isInCart(product._id);
                                    const inWishlist = isInWishlist(product._id);

                                    return (
                                        <div
                                            key={product._id}
                                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                                        >
                                            {/* Product Image Container */}
                                            <div
                                                className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                                                onClick={() => navigate(`/product/${product._id}`)}
                                            >
                                                <img
                                                    src={product.images?.[0] || placeholderImg}
                                                    alt={product.name}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        e.target.src = placeholderImg;
                                                        e.target.onerror = null;
                                                    }}
                                                />

                                                {/* Top Right Wishlist Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToWishlist(product);
                                                    }}
                                                    className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all z-10 active:scale-90 ${inWishlist
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500'
                                                        }`}
                                                >
                                                    {addingToWishlist === product._id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary" />
                                                    ) : (
                                                        <BsFillBagHeartFill className={`w-4 h-4 ${inWishlist ? 'text-white' : 'text-gray-300'}`} />
                                                    )}
                                                </button>

                                                {product.discount_percentage > 0 && (
                                                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                        {product.discount_percentage}% OFF
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="p-4 flex flex-col flex-1">
                                                {/* Title & Rating Row */}
                                                <div className="flex justify-between items-start gap-2 mb-3">
                                                    <h3
                                                        className="font-bold text-gray-800 line-clamp-1 text-base md:text-lg cursor-pointer hover:text-primary transition-colors flex-1"
                                                        onClick={() => navigate(`/product/${product._id}`)}
                                                    >
                                                        {product.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                                                        <FaStar className="text-secondary text-xs" />
                                                        <span className="text-xs font-bold text-gray-600">4.2</span>
                                                    </div>
                                                </div>

                                                {/* Category & Brand Row */}
                                                <div className="flex justify-between items-center text-[11px] mb-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-400 uppercase font-medium mb-0.5">Category</span>
                                                        <span className="text-gray-800 font-bold truncate max-w-[80px]">
                                                            {product.category?.main || product.category || 'Uncategorized'}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-gray-400 uppercase font-medium mb-0.5">Brand</span>
                                                        <span className="text-primary font-bold truncate max-w-[100px]">
                                                            {product.brand || 'Standard'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Divider */}
                                                <div className="h-px bg-gray-50 mb-4" />

                                                {/* Price & Add to Cart Row */}
                                                <div className="mt-auto flex items-center justify-between">
                                                    <div className="flex flex-col">
                                                        <span className="text-xl md:text-2xl font-black text-[#1e293b]">
                                                            ₹{product.pricing?.selling_price?.toLocaleString('en-IN') || '0'}
                                                        </span>
                                                        {product.pricing?.mrp > product.pricing?.selling_price && (
                                                            <span className="text-[10px] text-gray-400 line-through">
                                                                ₹{product.pricing?.mrp?.toLocaleString('en-IN') || '0'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => addToCart(product)}
                                                        disabled={addingToCart === product._id || (product.stock || 0) <= 0}
                                                        className={`h-11 px-5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95 ${(product.stock || 0) <= 0
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                                            : inCart
                                                                ? 'bg-green-500 text-white hover:bg-green-600'
                                                                : 'bg-gradient-to-r from-primary/80 to-primary text-white hover:shadow-primary/20 hover:shadow-lg'
                                                            }`}
                                                    >
                                                        {addingToCart === product._id ? (
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                        ) : (product.stock || 0) <= 0 ? (
                                                            <span>Sold Out</span>
                                                        ) : inCart ? (
                                                            <>
                                                                <FaCheckCircle className="w-4 h-4" />
                                                                <span>Added</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FaShoppingCart className="w-4 h-4" />
                                                                <span>Add</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default ShopProductsPage;
