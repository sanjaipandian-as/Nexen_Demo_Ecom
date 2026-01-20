import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaShare, FaTag, FaInfoCircle, FaBox, FaChevronDown, FaChevronUp, FaRegHeart, FaHeart, FaEye } from 'react-icons/fa';
import { BsFillBagHeartFill, BsArrowRight } from 'react-icons/bs';
import { MdLocalShipping, MdSecurity, MdVerified, MdOutlineFlashOn } from 'react-icons/md';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';

import Topbar from './Topbar';
import Footer from './Footer';

// Internal Accordion Component for Mobile
const AccordionItem = ({ title, isOpen, onClick, children, icon: Icon }) => (
    <div className="border-b border-gray-100 last:border-0 overflow-hidden">
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between py-5 bg-white hover:bg-pink-50/30 transition-all duration-300 group"
        >
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl transition-colors duration-300 ${isOpen ? 'bg-[#E91E63] text-white' : 'bg-pink-50 text-[#E91E63] group-hover:bg-[#E91E63]/10'}`}>
                    {Icon && <Icon className="w-4 h-4" />}
                </div>
                <span className={`font-bold text-base transition-colors duration-300 ${isOpen ? 'text-gray-900' : 'text-gray-600'}`}>{title}</span>
            </div>
            <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                <FaChevronDown className={`text-sm ${isOpen ? 'text-[#E91E63]' : 'text-gray-400'}`} />
            </div>
        </button>
        <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'max-h-[2000px] opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>
            <div className="animate-fadeIn">
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
                    setSimilarProducts(products.filter(p => p._id !== id).slice(0, 6));
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
        if (isInCart && !isBuyNow) return navigate('/Cart');
        if (isInCart && isBuyNow) return navigate('/Payment');

        try {
            await API.post('/cart/add', { productId: product._id, quantity });
            setIsInCart(true);
            if (isBuyNow) navigate('/Payment');
            else {
                const res = await API.get('/cart');
                setCartItems(res.data.items || []);
            }
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

    const productImages = useMemo(() => product?.images?.length ? product.images : [placeholderImg], [product]);
    const inStock = (product?.stock || 0) > 0;
    const sellingPrice = product?.pricing?.selling_price || 0;
    const mrp = product?.pricing?.mrp || 0;
    const discount = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
    const averageRating = useMemo(() => reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 0, [reviews]);

    if (loading) return <div className="min-h-screen bg-white"><Skeleton className="h-screen w-full" /></div>;
    if (error || !product) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><p className="text-xl font-bold text-gray-400 mb-4">{error || 'Product not found'}</p><button onClick={() => navigate(-1)} className="px-6 py-2 bg-primary text-white rounded-full">Go Back</button></div>;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900 pb-[120px] lg:pb-0">
            <Topbar />

            <main className="flex-1 container mx-auto px-0 lg:px-8 py-0 lg:py-12 mt-0 lg:mt-4">
                <div className="flex flex-col lg:flex-row gap-0 lg:gap-16 items-start">

                    {/* --- IMAGE GALLERY --- */}
                    <div className="w-full lg:w-[55%] bg-white lg:bg-transparent lg:sticky lg:top-28">
                        <div className="group relative w-full aspect-square sm:aspect-[1.2/1] lg:aspect-square bg-white lg:rounded-[2.5rem] lg:border lg:border-pink-50 lg:shadow-xl lg:shadow-pink-100/50 overflow-hidden flex items-center justify-center transition-all duration-500">
                            <img
                                src={productImages[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-contain p-6 lg:p-12 transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Actions on Image */}
                            <div className="absolute top-6 right-6 flex flex-col gap-3">
                                <button
                                    onClick={toggleWishlist}
                                    className={`p-4 rounded-2xl shadow-lg backdrop-blur-md transition-all duration-300 active:scale-90 ${isInWishlist ? 'bg-[#E91E63] text-white shadow-pink-500/30' : 'bg-white/90 text-gray-400 hover:text-[#E91E63] shadow-black/5 hover:bg-white'}`}
                                >
                                    {isInWishlist ? <FaHeart className="w-5 h-5 animate-sparkle" /> : <FaRegHeart className="w-5 h-5" />}
                                </button>
                                <button className="p-4 bg-white/90 text-gray-400 hover:text-[#E91E63] rounded-2xl shadow-lg shadow-black/5 backdrop-blur-md transition-all duration-300 hover:bg-white">
                                    <FaShare className="w-5 h-5" />
                                </button>
                            </div>

                            {discount > 0 && (
                                <div className="absolute top-6 left-6 bg-gradient-to-r from-[#E91E63] to-pink-500 text-white text-sm font-black px-5 py-2 rounded-2xl shadow-lg shadow-pink-500/20 animate-slideDown">
                                    {discount}% OFF
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 p-6 lg:px-0 overflow-x-auto scrollbar-hide animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                            {productImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 p-2 ${selectedImage === i ? 'border-[#E91E63] ring-4 ring-[#E91E63]/10 scale-105' : 'border-gray-50 bg-gray-50/50 grayscale-[0.5] hover:grayscale-0 hover:border-pink-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-contain" alt="thumbnail" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- PRODUCT DETAILS --- */}
                    <div className="w-full lg:w-[45%] px-6 lg:px-0 animate-slideUp">
                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="bg-[#E91E63]/10 text-[#E91E63] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.1em] border border-[#E91E63]/20">
                                {product.brand || 'Official Collection'}
                            </span>
                            <div className="flex items-center gap-2 bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-full text-[10px] font-black border border-yellow-100">
                                <FaStar className="w-3 h-3" />
                                <span>{averageRating} ({reviews.length} Reviews)</span>
                            </div>
                            {inStock && (
                                <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1.5 rounded-full text-[10px] font-black border border-green-100 animate-pulse">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                    <span>LIMITED STOCK</span>
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl lg:text-5xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">{product.name}</h1>

                        {/* Pricing Card */}
                        <div className="bg-gradient-to-br from-pink-50/80 to-white rounded-[2rem] p-8 mb-8 border border-pink-100/50 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 transition-transform duration-700 group-hover:scale-125">
                                <BsFillBagHeartFill className="w-32 h-32" />
                            </div>

                            <div className="relative z-10">
                                <p className="text-gray-500 text-sm font-bold mb-2">Exclusive Price</p>
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-5xl font-black text-gray-900 tracking-tighter">₹{sellingPrice.toFixed(0)}</span>
                                    {mrp > sellingPrice && (
                                        <div className="flex flex-col">
                                            <span className="text-lg text-gray-400 line-through decoration-[#E91E63]/30 font-medium">₹{mrp.toFixed(0)}</span>
                                            <span className="text-[#E91E63] font-black text-xs">SAVE ₹{(mrp - sellingPrice).toFixed(0)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={`flex items-center gap-2 text-xs font-bold ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                                    <MdOutlineFlashOn className={`w-4 h-4 ${inStock ? 'animate-pulse' : ''}`} />
                                    {inStock ? 'Available now! Dispatched within 24 hours' : 'This item is currently out of stock'}
                                </div>
                            </div>
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden lg:flex flex-col gap-6 mb-10">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[1.5rem] p-2 h-[4.5rem]">
                                    <button onClick={() => handleQuantityChange('decrease')} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-[#E91E63] transition-colors"><FaMinus /></button>
                                    <span className="w-12 text-center font-black text-xl text-gray-900">{quantity}</span>
                                    <button onClick={() => handleQuantityChange('increase')} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-[#E91E63] transition-colors"><FaPlus /></button>
                                </div>

                                <button
                                    onClick={() => addToCartAction(false)}
                                    className={`flex-1 h-[4.5rem] rounded-[1.5rem] font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 ${isInCart ? 'bg-white border-2 border-[#E91E63] text-[#E91E63] shadow-lg shadow-pink-500/5' : 'bg-[#E91E63] text-white shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-95'}`}
                                    disabled={!inStock}
                                >
                                    <FaShoppingCart />
                                    {isInCart ? 'Go to Cart' : 'Add to Cart'}
                                </button>
                            </div>

                            <button
                                onClick={() => addToCartAction(true)}
                                className="w-full h-20 bg-gray-900 text-white font-black text-xl rounded-[1.5rem] shadow-2xl shadow-black/10 transition-all duration-300 hover:bg-black hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 disabled:bg-gray-200 disabled:shadow-none"
                                disabled={!inStock}
                            >
                                <MdOutlineFlashOn className="text-yellow-400 text-2xl" />
                                BUY SECURELY NOW
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-4 gap-4 mb-12">
                            {[
                                { icon: MdLocalShipping, label: "Free Shipping" },
                                { icon: MdSecurity, label: "Secure Pay" },
                                { icon: MdVerified, label: "Official" },
                                { icon: FaBox, label: "Easy Returns" }
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-4 bg-gray-50/50 border border-gray-100 rounded-3xl group hover:bg-white hover:shadow-lg transition-all duration-300">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 text-[#E91E63] transition-transform duration-300 group-hover:scale-110">
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight leading-tight">{s.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Accordions */}
                        <div className="border-t border-gray-100">
                            <AccordionItem
                                title="Description"
                                icon={FaInfoCircle}
                                isOpen={expandedSection === 'description'}
                                onClick={() => setExpandedSection(expandedSection === 'description' ? '' : 'description')}
                            >
                                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                                    <p className="text-gray-700 text-base leading-7 tracking-wide whitespace-pre-line font-medium">{product.description || 'No detailed description available for this item.'}</p>
                                </div>
                            </AccordionItem>

                            {product.specifications?.length > 0 && (
                                <AccordionItem
                                    title="Specifications"
                                    icon={FaTag}
                                    isOpen={expandedSection === 'specs'}
                                    onClick={() => setExpandedSection(expandedSection === 'specs' ? '' : 'specs')}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                                        {product.specifications.map((spec, i) => (
                                            <div key={i} className="flex flex-col p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{spec.key}</span>
                                                <span className="font-bold text-gray-900">{spec.value} {spec.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionItem>
                            )}

                            <AccordionItem
                                title={`Customer Reviews (${reviews.length})`}
                                icon={FaStar}
                                isOpen={expandedSection === 'reviews'}
                                onClick={() => setExpandedSection(expandedSection === 'reviews' ? '' : 'reviews')}
                            >
                                <div className="space-y-6 pr-4">
                                    {!userReview && (
                                        <div className="p-6 bg-pink-50/30 border border-pink-100/50 rounded-3xl text-center">
                                            <p className="font-bold text-gray-900 mb-4">Loved this product? Let us know!</p>
                                            <button onClick={() => setShowReviewForm(true)} className="px-8 py-3 bg-primary text-white font-black rounded-2xl shadow-lg shadow-primary/20">Write a Review</button>
                                        </div>
                                    )}

                                    {showReviewForm && (
                                        <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-xl animate-scaleIn">
                                            <p className="font-black text-gray-900 mb-4 text-center">HOW WOULD YOU RATE IT?</p>
                                            <div className="flex justify-center gap-3 text-3xl mb-6">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <FaStar
                                                        key={star}
                                                        className={`cursor-pointer transition-all duration-300 ${star <= reviewForm.rating ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    />
                                                ))}
                                            </div>
                                            <textarea
                                                className="w-full p-4 bg-gray-50 border-none rounded-2xl mb-4 focus:ring-2 ring-primary/20 outline-none transition-all placeholder:text-gray-300"
                                                rows="4"
                                                value={reviewForm.reviewText}
                                                onChange={e => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                                                placeholder="Describe your experience..."
                                            />
                                            <div className="flex gap-3">
                                                <button onClick={() => setShowReviewForm(false)} className="flex-1 py-3 text-gray-400 font-bold hover:text-gray-600">Cancel</button>
                                                <button onClick={handleAddReview} className="flex-[2] bg-primary text-white py-3 rounded-2xl font-black shadow-lg shadow-primary/30" disabled={submittingReview}>
                                                    {submittingReview ? 'Submitting...' : 'Post Review'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {reviews.length > 0 ? reviews.map(r => (
                                            <div key={r._id} className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-primary font-black text-sm uppercase">
                                                            {r.customerId?.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <span className="font-black text-gray-900 text-sm">{r.customerId?.name}</span>
                                                    </div>
                                                    <div className="flex text-yellow-400 text-[10px] gap-0.5">
                                                        {[...Array(5)].map((_, i) => <FaStar key={i} className={i < r.rating ? '' : 'text-gray-100'} />)}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 text-sm leading-relaxed italic">"{r.reviewText}"</p>
                                            </div>
                                        )) : <p className="text-center text-gray-400 py-8 italic">No reviews yet. Be the first to share your thoughts!</p>}
                                    </div>
                                </div>
                            </AccordionItem>
                        </div>
                    </div>
                </div>

                {/* --- SIMILAR PRODUCTS --- */}
                <div className="mt-24 pt-16 border-t border-gray-100 px-6 lg:px-0">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <span className="text-primary font-black text-xs uppercase tracking-widest mb-2 block animate-slideUp">Handpicked for you</span>
                            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tight animate-slideUp">Similar Products</h2>
                        </div>
                        <button className="hidden lg:flex items-center gap-2 text-primary font-black hover:gap-3 transition-all duration-300">
                            VIEW COLLECTION <BsArrowRight />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-10">
                        {similarProducts.map((p, idx) => {
                            const pMrp = p.pricing?.mrp || 0;
                            const pSelling = p.pricing?.selling_price || 0;
                            const pDiscount = pMrp > pSelling ? Math.round(((pMrp - pSelling) / pMrp) * 100) : 0;

                            return (
                                <div
                                    key={p._id}
                                    onClick={() => { navigate(`/product/${p._id}`); window.scrollTo(0, 0); }}
                                    className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-pink-100/50 transition-all duration-500 cursor-pointer animate-slideUp"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    {/* Product Image Wrapper */}
                                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-50/30 flex items-center justify-center p-8 transition-all duration-500 group-hover:p-4">
                                        <img
                                            src={p.images?.[0] || placeholderImg}
                                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                                            alt={p.name}
                                        />

                                        {/* Overlay Bagde */}
                                        {pDiscount > 0 && (
                                            <div className="absolute top-4 left-4 bg-[#E91E63] text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-pink-500/20">
                                                -{pDiscount}%
                                            </div>
                                        )}

                                        {/* Quick Wishlist */}
                                        <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <div className="p-3 bg-white shadow-xl rounded-2xl text-gray-400 hover:text-primary">
                                                <FaRegHeart className="w-4 h-4" />
                                            </div>
                                        </div>

                                        {/* Bottom Action Bar */}
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="w-full py-3 bg-[#E91E63] text-white rounded-xl text-[10px] font-black text-center shadow-lg shadow-pink-500/30 tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors">
                                                <FaEye className="w-3 h-3" />
                                                QUICK VIEW
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-6 text-center">
                                        <p className="text-[10px] font-bold text-primary uppercase mb-1">{p.brand || 'Original'}</p>
                                        <p className="font-black text-gray-900 text-base truncate mb-3">{p.name}</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <span className="text-xl font-black text-gray-900">₹{pSelling}</span>
                                            {pMrp > pSelling && (
                                                <span className="text-xs text-gray-400 line-through">₹{pMrp}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* --- MOBILE STICKY BOTTOM BAR --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-pink-50 p-6 lg:hidden z-50 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-15px_30px_rgba(233,30,99,0.08)]">
                <div className="flex gap-4">
                    {/* Quantity Control Pink */}
                    <div className="flex items-center bg-gray-50 border border-gray-100 rounded-2xl h-16 px-2 shrink-0">
                        <button onClick={() => handleQuantityChange('decrease')} className="w-10 h-full flex items-center justify-center text-gray-400 active:text-[#E91E63]"><FaMinus className="w-3 h-3" /></button>
                        <span className="w-8 text-center font-black text-lg text-gray-900">{quantity}</span>
                        <button onClick={() => handleQuantityChange('increase')} className="w-10 h-full flex items-center justify-center text-gray-400 active:text-[#E91E63]"><FaPlus className="w-3 h-3" /></button>
                    </div>

                    <button
                        onClick={() => addToCartAction(false)}
                        className={`flex-1 h-16 transition-all duration-300 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 active:scale-95 ${isInCart ? 'bg-white border-2 border-[#E91E63] text-[#E91E63]' : 'bg-[#E91E63] text-white shadow-lg shadow-pink-500/30'}`}
                        disabled={!inStock}
                    >
                        <FaShoppingCart className="w-4 h-4" />
                        {isInCart ? 'GO TO CART' : 'ADD TO CART'}
                    </button>

                    <button
                        onClick={() => addToCartAction(true)}
                        className="flex-1 h-16 bg-gray-900 text-white font-black rounded-2xl text-sm shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:bg-gray-200"
                        disabled={!inStock}
                    >
                        <MdOutlineFlashOn className="text-yellow-400 w-5 h-5" />
                        BUY NOW
                    </button>
                </div>
            </div>

            <div className="hidden lg:block">
                <Footer />
            </div>
        </div>
    );
};

export default Productview;