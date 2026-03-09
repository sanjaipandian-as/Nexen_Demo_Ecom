import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaShare, FaTag, FaInfoCircle, FaBox, FaChevronDown, FaRegHeart, FaHeart, FaEye, FaArrowRight, FaCheck } from 'react-icons/fa';
import { MdLocalShipping, MdSecurity, MdVerified, MdOutlineFlashOn } from 'react-icons/md';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';
import Topbar from './Topbar';
import Footer from './Footer';

// Internal Accordion Component
const AccordionItem = ({ title, isOpen, onClick, children, icon: Icon }) => (
    <div className="border border-slate-200 rounded-2xl mb-4 overflow-hidden bg-white hover:border-slate-300 transition-colors">
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-5 text-left bg-white transition-all duration-300"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isOpen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {Icon && <Icon className="w-4 h-4" />}
                </div>
                <span className={`font-bold text-base md:text-lg transition-colors ${isOpen ? 'text-slate-900' : 'text-slate-600'}`}>{title}</span>
            </div>
            <FaChevronDown className={`text-sm transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-900' : 'text-slate-400'}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-5 pt-0 text-slate-600 leading-relaxed font-medium">
                {children}
            </div>
        </div>
    </div>
);

const Productview = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [togglingWishlist, setTogglingWishlist] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [selectedSize, setSelectedSize] = useState('M');

    // Reviews & State
    const [reviews, setReviews] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [expandedSection, setExpandedSection] = useState('description');

    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);

    // Auth Check
    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!id) return;
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const results = await Promise.allSettled([
                    API.get(`/products/customer/product/${id}`),
                    API.get('/products/customer/page?page=1'),
                    API.get(`/reviews/${id}`),
                    isLoggedIn ? API.get('/wishlist') : Promise.resolve({ value: { data: [] } }),
                    isLoggedIn ? API.get('/cart') : Promise.resolve({ value: { data: [] } })
                ]);

                if (results[0].status === 'fulfilled') {
                    setProduct(results[0].value.data);
                } else {
                    setError('Failed to load product.');
                }

                if (results[1].status === 'fulfilled') {
                    const products = results[1].value.data.products || [];
                    setSimilarProducts(products.filter(p => p._id !== id).slice(0, 4)); // Reduced to 4 for cleaner look
                }

                if (results[2].status === 'fulfilled') {
                    const reviewsData = Array.isArray(results[2].value.data) ? results[2].value.data : [];
                    setReviews(reviewsData);
                    if (isLoggedIn) {
                        const user = localStorage.getItem('user');
                        if (user) {
                            const userId = JSON.parse(user)?._id;
                            setUserReview(reviewsData.find(r => r.customerId?._id === userId));
                        }
                    }
                }

                if (results[3]?.status === 'fulfilled' && results[3].value?.data) {
                    const wData = Array.isArray(results[3].value.data) ? results[3].value.data : [];
                    const ids = wData.map(i => i.productId?._id).filter(Boolean);
                    setWishlistItems(ids);
                    setIsInWishlist(ids.includes(id));
                }

                if (results[4]?.status === 'fulfilled' && results[4].value?.data) {
                    const cItems = results[4].value.data.items || [];
                    setCartItems(cItems);
                    setIsInCart(cItems.some(i => (i.productId?._id || i.productId) === id));
                }

            } catch (err) {
                console.error(err);
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id, isLoggedIn]);

    const handleQuantityChange = useCallback((action) => {
        if (!product) return;
        const max = product.stock || 0;
        if (action === 'increase' && quantity < max) setQuantity(q => q + 1);
        if (action === 'decrease' && quantity > 1) setQuantity(q => q - 1);
    }, [product, quantity]);

    const addToCartAction = useCallback(async (isBuyNow = false) => {
        if (!isLoggedIn) return navigate('/Login');

        // If Buy Now: just go to checkout with this product's state
        if (isBuyNow) {
            navigate('/checkout', {
                state: {
                    product: product,
                    quantity: quantity
                }
            });
            return;
        }

        if (isInCart) return navigate('/Cart');

        try {
            await API.post('/cart/add', { productId: product._id, quantity });
            setIsInCart(true);
            const res = await API.get('/cart');
            setCartItems(res.data.items || []);
        } catch (e) {
            console.error(e);
            alert('Failed to add to cart.');
        }
    }, [isLoggedIn, isInCart, product, quantity, navigate]);

    const toggleWishlist = useCallback(async () => {
        if (!isLoggedIn) return navigate('/Login');
        if (togglingWishlist) return;

        setTogglingWishlist(true);
        try {
            if (isInWishlist) {
                await API.delete(`/wishlist/remove/${id}`);
                setIsInWishlist(false);
            } else {
                await API.post('/wishlist/add', { productId: id });
                setIsInWishlist(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setTogglingWishlist(false);
        }
    }, [isLoggedIn, isInWishlist, id, navigate, togglingWishlist]);

    const handleAddReview = async () => {
        if (!isLoggedIn) return navigate('/Login');
        setSubmittingReview(true);
        try {
            await API.post('/reviews/add', { productId: id, ...reviewForm });
            setShowReviewForm(false);
            setReviewForm({ rating: 5, reviewText: '' });
            const res = await API.get(`/reviews/${id}`);
            setReviews(res.data);
        } catch (e) { alert('Failed to add review'); }
        finally { setSubmittingReview(false); }
    };

    const productImages = useMemo(() => {
        const valid = product?.images?.filter(img => img && typeof img === 'string' && img.trim() !== '');
        return valid?.length ? valid : [placeholderImg];
    }, [product, placeholderImg]);
    const inStock = (product?.stock || 0) > 0;
    const sellingPrice = product?.pricing?.selling_price || 0;
    const mrp = product?.pricing?.mrp || 0;
    const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
    const averageRating = useMemo(() => reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 0, [reviews]);

    if (loading) return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
                    <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-slate-50 rounded-[40px]" />)}
                    </div>
                    <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                        <div className="h-12 bg-slate-50 rounded-2xl w-3/4" />
                        <div className="h-6 bg-slate-50 rounded-xl w-1/4" />
                        <div className="h-24 bg-slate-50 rounded-[32px] w-full" />
                        <div className="h-16 bg-slate-900/5 rounded-full w-full" />
                        <div className="h-16 bg-slate-900 rounded-full w-full" />
                    </div>
                </div>
            </div>
        </div>
    );

    if (error || !product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-12 text-center font-plus">
            <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-8 border border-slate-100">
                <FaInfoCircle className="text-slate-200 text-4xl" />
            </div>
            <h2 className="text-3xl font-extrabold text-[#0F172A] mb-4 tracking-tight">Product Not Located</h2>
            <p className="text-slate-400 font-medium mb-12 max-w-md mx-auto">{error || "The requested item is currently unavailable in our studio collection."}</p>
            <button
                onClick={() => navigate('/')}
                className="px-12 py-5 bg-[#0F172A] text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95"
            >
                Return To Collection
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 pb-[120px] lg:pb-0">
            <Topbar />

            <main className="flex-1 max-w-[1440px] mx-auto px-6 md:px-12 py-8 lg:py-16 w-full">

                {/* --- PRIMARY PRODUCT SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24 mb-16">

                    {/* --- LEFT: STUDIO DYNAMIC IMAGE GRID --- */}
                    <div className="lg:h-[80vh] min-h-[500px]">
                        <div className="h-full">
                            {productImages.length === 1 && (
                                <div className="h-full bg-[#F8FAFC] rounded-[40px] overflow-hidden group cursor-pointer relative">
                                    <img
                                        src={productImages[0]}
                                        className="w-full h-full object-contain p-12 lg:p-24 transition-transform duration-1000 group-hover:scale-105"
                                        alt="Product 1"
                                        onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                    />
                                    <div className="absolute bottom-10 right-10 w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl opacity-0 group-hover:opacity-100 transition-all">
                                        <FaPlus size={16} />
                                    </div>
                                </div>
                            )}

                            {productImages.length === 2 && (
                                <div className="grid grid-rows-2 gap-4 lg:gap-6 h-full">
                                    {productImages.slice(0, 2).map((img, i) => (
                                        <div key={i} className="bg-[#F8FAFC] rounded-[40px] overflow-hidden group cursor-pointer relative">
                                            <img
                                                src={img}
                                                className="w-full h-full object-contain p-8 lg:p-12 transition-transform duration-1000 group-hover:scale-105"
                                                alt={`Product ${i + 1}`}
                                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {productImages.length === 3 && (
                                <div className="grid grid-cols-2 gap-4 lg:gap-6 h-full">
                                    <div className="bg-[#F8FAFC] rounded-[40px] overflow-hidden group cursor-pointer relative h-full">
                                        <img
                                            src={productImages[0]}
                                            className="w-full h-full object-contain p-12 lg:p-20 transition-transform duration-1000 group-hover:scale-105"
                                            alt="Product 1"
                                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                        />
                                    </div>
                                    <div className="grid grid-rows-2 gap-4 lg:gap-6">
                                        {productImages.slice(1, 3).map((img, i) => (
                                            <div key={i} className="bg-[#F8FAFC] rounded-[40px] overflow-hidden group cursor-pointer relative">
                                                <img
                                                    src={img}
                                                    className="w-full h-full object-contain p-8 lg:p-12 transition-transform duration-1000 group-hover:scale-105"
                                                    alt={`Product ${i + 2}`}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {productImages.length >= 4 && (
                                <div className="grid grid-cols-2 gap-4 lg:gap-6 h-full">
                                    {productImages.slice(0, 4).map((img, i) => (
                                        <div key={i} className="bg-[#F8FAFC] rounded-[40px] overflow-hidden group cursor-pointer relative">
                                            <img
                                                src={img}
                                                className="w-full h-full object-contain p-6 lg:p-10 transition-transform duration-1000 group-hover:scale-105"
                                                alt={`Product ${i + 1}`}
                                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT: EXECUTIVE TRANSACTIONAL SIDEBAR --- */}
                    <div className="flex flex-col sticky top-24 h-fit max-h-[85vh] overflow-y-auto pr-6 scrollbar-hide">

                        {/* Product Header */}
                        <div className="mb-4 font-plus">
                            <h1 className="text-3xl xl:text-4xl font-extrabold text-[#0F172A] mb-2 tracking-tighter leading-tight italic">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex text-[#F59E0B] text-xs">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < Math.round(averageRating) ? 'fill-current' : 'text-slate-100'} />
                                    ))}
                                </div>
                                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">
                                    {averageRating} <span className="text-slate-200 ml-1">/ {reviews.length} Client Reviews</span>
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-3xl font-black text-[#0F172A] font-outfit tracking-tighter">₹{sellingPrice.toLocaleString()}</span>
                                {mrp > sellingPrice && (
                                    <span className="text-lg text-slate-300 font-bold line-through font-outfit italic opacity-50">₹{mrp.toLocaleString()}</span>
                                )}
                                {discount > 0 && (
                                    <div className="bg-[#0081FF] text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">
                                        -{discount}%
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Variant Selection: Color */}
                        <div className="mb-6 font-plus">
                            <h4 className="text-[11px] font-black text-slate-300 mb-3 flex items-center justify-between uppercase tracking-[0.2em]">
                                Selective Studio: <span className="text-[#0081FF] font-black ml-2 flex-1 normal-case tracking-normal">Original</span>
                            </h4>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {productImages.slice(0, 4).map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`flex-shrink-0 w-16 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1.5 bg-[#F8FAFC] ${selectedImage === i ? 'border-[#0081FF]' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                    >
                                        <img
                                            src={img}
                                            className="w-full h-full object-contain"
                                            alt={`Variant ${i + 1}`}
                                            onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Variant Selection: Size */}
                        <div className="mb-8 font-plus">
                            <h4 className="text-[11px] font-black text-slate-300 mb-3 flex items-center justify-between uppercase tracking-[0.2em]">
                                Size Guide: <span className="text-[#0F172A] font-black ml-2 flex-1 normal-case tracking-normal">{selectedSize}</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-14 h-12 rounded-2xl text-[12px] font-black transition-all border-2 ${selectedSize === size
                                            ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-xl'
                                            : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Hub */}
                        <div className="space-y-4 mb-10">
                            <div className="flex gap-3">
                                {/* Precision Quantity */}
                                <div className="flex items-center bg-white border-2 border-slate-100 rounded-full h-16 w-44 px-2 group hover:border-slate-200 transition-all font-outfit">
                                    <button onClick={() => handleQuantityChange('decrease')} className="w-12 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 font-bold text-xl transition-colors">−</button>
                                    <span className="flex-1 text-center font-bold text-[18px] text-[#0F172A]">{quantity}</span>
                                    <button onClick={() => handleQuantityChange('increase')} className="w-12 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 font-bold text-xl transition-colors">+</button>
                                </div>

                                <button
                                    onClick={() => addToCartAction(false)}
                                    disabled={!inStock}
                                    className={`flex-1 h-16 rounded-full font-black text-[15px] uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${isInCart
                                        ? 'bg-[#0081FF] text-white shadow-blue-200'
                                        : 'bg-[#0081FF] text-white shadow-blue-200 hover:bg-[#0070E0]'
                                        }`}
                                >
                                    {isInCart ? 'View Cart' : 'Add to Cart'}
                                </button>
                            </div>

                            <button
                                onClick={() => addToCartAction(true)}
                                disabled={!inStock}
                                className="w-full h-16 bg-[#0F172A] text-white font-black text-[15px] uppercase tracking-[0.1em] rounded-full shadow-2xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center disabled:bg-slate-100 disabled:text-slate-300 font-plus"
                            >
                                Buy It Now
                            </button>

                            <div className="flex gap-3 pt-4">
                                <button onClick={toggleWishlist} className={`flex-1 h-14 border-2 rounded-full flex items-center justify-center gap-3 font-bold text-[14px] transition-all ${isInWishlist ? 'border-[#0081FF] text-[#0081FF] bg-blue-50' : 'border-slate-100 text-[#0F172A] hover:border-slate-200'}`}>
                                    {isInWishlist ? <FaHeart /> : <FaRegHeart />} {isInWishlist ? 'Saved' : 'Save'}
                                </button>
                                <button className="flex-1 h-14 border-2 border-slate-100 hover:border-slate-200 rounded-full flex items-center justify-center gap-3 text-[#0F172A] font-bold text-[14px] transition-all">
                                    <FaShare /> Share
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- SECONDARY: INFO & REVIEWS --- */}
                <div className="space-y-8">
                    {/* Fulfillment Quick-Deck */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-[#F8FAFC] rounded-[40px] border border-slate-50">
                        {[
                            { icon: MdLocalShipping, title: "EXPRESS SHIPPING", text: "Global 24h Dispatch" },
                            { icon: MdVerified, title: "AUTHENTIC QUALITY", text: "Studio Certified" },
                            { icon: MdSecurity, title: "SECURE CHECKOUT", text: "PCI-DSS Compliant" },
                            { icon: FaBox, title: "EASY RETURNS", text: "30-Day Policy" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col gap-3 items-center text-center group">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-900 shadow-sm group-hover:shadow-md transition-all">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-plus font-black text-[#0F172A] text-[10px] uppercase tracking-[0.1em] mb-1">{item.title}</h4>
                                    <p className="text-[11px] text-slate-400 font-medium leading-tight">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <AccordionItem
                            title="Description & Details"
                            icon={FaInfoCircle}
                            isOpen={expandedSection === 'description'}
                            onClick={() => setExpandedSection(expandedSection === 'description' ? '' : 'description')}
                        >
                            <div className="py-2">
                                <p className="whitespace-pre-line text-slate-500 font-medium leading-[1.8]">{product.description || 'No description available for this flagship product.'}</p>
                            </div>
                        </AccordionItem>

                        {product.specifications?.length > 0 && (
                            <AccordionItem
                                title="Specifications"
                                icon={FaTag}
                                isOpen={expandedSection === 'specs'}
                                onClick={() => setExpandedSection(expandedSection === 'specs' ? '' : 'specs')}
                            >
                                <div className="grid grid-cols-1 gap-2 py-2">
                                    {product.specifications.map((spec, i) => (
                                        <div key={i} className="flex justify-between py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 px-2 transition-colors rounded-lg">
                                            <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest">{spec.key}</span>
                                            <span className="text-slate-900 text-sm font-black italic">{spec.value} {spec.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </AccordionItem>
                        )}

                        <AccordionItem
                            title={`Client Reviews (${reviews.length})`}
                            icon={FaStar}
                            isOpen={expandedSection === 'reviews'}
                            onClick={() => setExpandedSection(expandedSection === 'reviews' ? '' : 'reviews')}
                        >
                            <div className="space-y-10 py-4">
                                {/* Actionable Review Trigger */}
                                {!userReview && !showReviewForm && (
                                    <div className="text-center p-12 bg-[#F8FAFC] rounded-[32px] border border-slate-50">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                            <FaStar className="text-amber-400 text-2xl" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-xl mb-3 font-plus">Share Your Experience</h4>
                                        <p className="text-slate-400 text-sm font-medium mb-8">Your feedback helps our community make informed decisions.</p>
                                        <button
                                            onClick={() => setShowReviewForm(true)}
                                            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                                        >
                                            Write A Review
                                        </button>
                                    </div>
                                )}

                                {/* Review Form */}
                                {showReviewForm && (
                                    <div className="bg-[#F8FAFC] p-10 rounded-[32px] border border-slate-100">
                                        <h4 className="font-black text-slate-900 mb-8 text-2xl text-center font-plus">Rate This Product</h4>
                                        <div className="flex justify-center gap-3 mb-10">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                    className={`text-3xl transition-all hover:scale-125 ${star <= reviewForm.rating ? 'text-[#F59E0B]' : 'text-slate-200'}`}
                                                >
                                                    <FaStar />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={reviewForm.reviewText}
                                            onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                                            className="w-full p-6 rounded-2xl bg-white border-2 border-slate-100 focus:border-slate-900 outline-none min-h-[140px] text-base font-medium resize-none mb-8 transition-all"
                                            placeholder="Describe your experience..."
                                        />
                                        <div className="flex gap-4">
                                            <button onClick={() => setShowReviewForm(false)} className="flex-1 py-5 text-slate-500 font-bold text-xs uppercase tracking-widest bg-white rounded-2xl">Cancel</button>
                                            <button onClick={handleAddReview} disabled={submittingReview} className="flex-1 py-5 text-white font-black text-xs uppercase tracking-widest bg-slate-900 rounded-2xl">{submittingReview ? 'Sending...' : 'Submit Review'}</button>
                                        </div>
                                    </div>
                                )}

                                {/* Feed */}
                                <div className="space-y-12">
                                    {reviews.length > 0 ? (
                                        reviews.map((r) => (
                                            <div key={r._id} className="group pb-12 last:pb-0 border-b last:border-0 border-slate-50">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-900 text-lg">{r.customerId?.name?.[0] || 'U'}</div>
                                                        <div>
                                                            <p className="font-bold text-[#0F172A] text-base mb-1 font-plus">{r.customerId?.name}</p>
                                                            <div className="flex text-[#F59E0B] text-[10px] gap-1">
                                                                {[...Array(5)].map((_, i) => <FaStar key={i} className={i < r.rating ? 'fill-current' : 'text-slate-100'} />)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full block mb-1">Verified Purchase</span>
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 text-base leading-[1.8] font-medium italic pl-[76px]">"{r.reviewText}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-xs italic">No reviews yet</p>
                                    )}
                                </div>
                            </div>
                        </AccordionItem>
                    </div>

                    {/* --- SIMILAR PRODUCTS --- */}
                    {similarProducts.length > 0 && (
                        <div className="mt-24 lg:mt-32">
                            <div className="flex items-center justify-between mb-8 md:mb-12">
                                <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] font-plus tracking-tight">You Might Also Like</h2>
                                <button className="hidden md:flex items-center gap-2 text-sm font-bold text-[#0081FF] transition-all hover:gap-4">
                                    View Collection <FaArrowRight />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                                {similarProducts.map((p) => (
                                    <div key={p._id} onClick={() => navigate(`/product/${p._id}`)} className="group cursor-pointer">
                                        <div className="relative aspect-[3/4] bg-[#F8FAFC] rounded-[32px] overflow-hidden mb-6 transition-all duration-700 hover:shadow-2xl hover:shadow-slate-200">
                                            <img
                                                src={p.images?.[0] || placeholderImg}
                                                alt={p.name}
                                                className="w-full h-full object-contain p-8 transition-transform duration-1000 group-hover:scale-110"
                                                onError={(e) => { e.target.onerror = null; e.target.src = placeholderImg; }}
                                            />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 font-plus">{p.brand || 'Official'}</p>
                                        <h3 className="font-bold text-[#0F172A] text-base mb-2 truncate font-plus group-hover:text-[#0081FF] transition-colors">{p.name}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-[#0F172A] text-lg font-outfit">₹{p.pricing?.selling_price.toLocaleString()}</span>
                                            {p.pricing?.mrp > p.pricing?.selling_price && (
                                                <span className="text-sm text-slate-300 line-through font-outfit">₹{p.pricing?.mrp.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* --- MOBILE FOOTER --- */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-white/80 backdrop-blur-2xl border-t border-slate-50 lg:hidden z-50">
                <div className="flex gap-3 max-w-md mx-auto">
                    <button onClick={() => addToCartAction(false)} className="flex-1 h-14 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 border-2 border-slate-100 text-[#0F172A]">
                        {isInCart ? <FaCheck /> : <FaShoppingCart />} {isInCart ? 'View Cart' : 'Add'}
                    </button>
                    <button onClick={() => addToCartAction(true)} className="flex-[2] h-14 bg-[#0F172A] text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all">
                        Buy Now
                    </button>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Productview;