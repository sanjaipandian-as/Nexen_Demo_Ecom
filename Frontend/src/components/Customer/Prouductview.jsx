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
    if (error || !product) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
            <p className="text-slate-500 mb-6">{error || "We couldn't find the product you're looking for."}</p>
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                Back to Home
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 pb-[90px] lg:pb-0">
            <Topbar />

            <main className="flex-1 max-w-6xl mx-auto px-4 md:px-6 py-6 lg:py-12 w-full">

                {/* Product Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* --- LEFT: GALLERY (Sticky) --- */}
                    <div className="lg:col-span-7 lg:sticky lg:top-24 h-fit">
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 group">
                                <img
                                    src={productImages[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-6 md:p-8 transition-transform duration-700 group-hover:scale-105"
                                />

                                {/* Badges & Actions */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {discount > 0 && (
                                        <div className="bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg shadow-rose-600/30 w-fit">
                                            -{discount}%
                                        </div>
                                    )}
                                    {!inStock && (
                                        <div className="bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-full w-fit">
                                            OUT OF STOCK
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={toggleWishlist}
                                    className={`absolute top-6 right-6 p-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${isInWishlist
                                        ? 'bg-rose-600 text-white shadow-rose-600/30'
                                        : 'bg-white text-slate-400 hover:text-rose-600'
                                        }`}
                                >
                                    {isInWishlist ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Thumbnails */}
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {productImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedImage(i)}
                                        className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all p-2 bg-slate-50 ${selectedImage === i
                                            ? 'border-slate-900 ring-2 ring-slate-900/10'
                                            : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-200'
                                            }`}
                                    >
                                        <img src={img} className="w-full h-full object-contain" alt={`Thumbnail ${i + 1}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: DETAILS --- */}
                    <div className="lg:col-span-5 flex flex-col">

                        {/* Header Info */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-3 text-xs font-bold tracking-widest text-slate-500 uppercase">
                                <span className='text-rose-600'>{product.brand || 'Official'}</span>
                                {product.category && (
                                    <>
                                        <span>•</span>
                                        <span>
                                            {typeof product.category === 'string'
                                                ? product.category
                                                : (product.category.sub || product.category.main || 'Category')}
                                        </span>
                                    </>
                                )}
                            </div>

                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-[1.1] mb-4 tracking-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center gap-2 bg-yellow-400/10 px-3 py-1.5 rounded-lg">
                                    <div className="flex text-yellow-500 text-sm">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < Math.round(averageRating) ? 'fill-current' : 'text-yellow-200'} />
                                        ))}
                                    </div>
                                    <span className="text-sm font-bold text-yellow-700">{averageRating}</span>
                                </div>
                                <span className="text-slate-400 text-sm font-medium">({reviews.length} Verified Reviews)</span>
                            </div>

                            {/* Price Block */}
                            <div className="flex items-baseline gap-3 pb-6 border-b border-slate-100">
                                <span className="text-3xl lg:text-4xl font-black text-slate-900">₹{sellingPrice.toLocaleString()}</span>
                                {mrp > sellingPrice && (
                                    <div className="flex flex-col items-start">
                                        <span className="text-lg text-slate-400 line-through font-medium">₹{mrp.toLocaleString()}</span>
                                        <span className="text-rose-600 text-sm font-bold">Save ₹{(mrp - sellingPrice).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description Short */}
                        <p className="text-slate-600 leading-relaxed mb-6 font-medium text-sm">
                            {product.description?.slice(0, 150)}{product.description?.length > 150 && '...'}
                        </p>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex flex-col gap-3 mb-6">
                            <div className="flex gap-3">
                                {/* Quantity */}
                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl h-12 w-36 px-2">
                                    <button onClick={() => handleQuantityChange('decrease')} className="w-12 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><FaMinus size={12} /></button>
                                    <span className="flex-1 text-center font-bold text-lg text-slate-900">{quantity}</span>
                                    <button onClick={() => handleQuantityChange('increase')} className="w-12 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><FaPlus size={12} /></button>
                                </div>

                                <button
                                    onClick={() => addToCartAction(false)}
                                    disabled={!inStock}
                                    className={`flex-1 h-12 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${isInCart
                                        ? 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50'
                                        : 'bg-white border-2 border-slate-200 text-slate-900 hover:border-slate-900'
                                        }`}
                                >
                                    <FaShoppingCart />
                                    {isInCart ? 'View Cart' : 'Add to Cart'}
                                </button>
                            </div>

                            <button
                                onClick={() => addToCartAction(true)}
                                disabled={!inStock}
                                className="w-full h-14 bg-rose-600 text-white font-black text-sm uppercase tracking-wide rounded-xl shadow-xl shadow-rose-200 hover:bg-rose-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:shadow-none disabled:cursor-not-allowed"
                            >
                                <MdOutlineFlashOn size={20} className="text-rose-200" />
                                {inStock ? 'Buy Now' : 'Out of Stock'}
                            </button>
                        </div>

                        {/* Trust Features */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {[
                                { icon: MdLocalShipping, title: "Free Shipping", text: "On orders over ₹999" },
                                { icon: MdVerified, title: "Authentic", text: "100% Original Products" },
                                { icon: FaBox, title: "Easy Returns", text: "7 Days Return Policy" },
                                { icon: MdSecurity, title: "Secure Pay", text: "Encrypted Payments" },
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-2.5 items-start p-3 rounded-xl bg-slate-50/50">
                                    <item.icon className="w-4 h-4 text-slate-900 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-[11px] uppercase tracking-wide mb-0.5">{item.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium leading-tight">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Accordion Sections */}
                        <div className="space-y-3">
                            <AccordionItem
                                title="Description & Details"
                                icon={FaInfoCircle}
                                isOpen={expandedSection === 'description'}
                                onClick={() => setExpandedSection(expandedSection === 'description' ? '' : 'description')}
                            >
                                <p className="whitespace-pre-line">{product.description || 'No description available.'}</p>
                            </AccordionItem>

                            {product.specifications?.length > 0 && (
                                <AccordionItem
                                    title="Specifications"
                                    icon={FaTag}
                                    isOpen={expandedSection === 'specs'}
                                    onClick={() => setExpandedSection(expandedSection === 'specs' ? '' : 'specs')}
                                >
                                    <div className="grid grid-cols-1 gap-3">
                                        {product.specifications.map((spec, i) => (
                                            <div key={i} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                                                <span className="text-slate-500 text-sm font-medium">{spec.key}</span>
                                                <span className="text-slate-900 text-sm font-bold">{spec.value} {spec.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionItem>
                            )}

                            <AccordionItem
                                title={`Reviews (${reviews.length})`}
                                icon={FaStar}
                                isOpen={expandedSection === 'reviews'}
                                onClick={() => setExpandedSection(expandedSection === 'reviews' ? '' : 'reviews')}
                            >
                                <div className="space-y-6">
                                    {/* Add Review Button */}
                                    {!userReview && !showReviewForm && (
                                        <div className="text-center p-6 bg-slate-50 rounded-2xl">
                                            <h4 className="font-bold text-slate-900 mb-2">Own this product?</h4>
                                            <p className="text-slate-500 text-sm mb-4">Share your thoughts with other customers</p>
                                            <button
                                                onClick={() => setShowReviewForm(true)}
                                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-sm hover:border-slate-900 transition-all"
                                            >
                                                Write a Review
                                            </button>
                                        </div>
                                    )}

                                    {/* Review Form */}
                                    {showReviewForm && (
                                        <div className="bg-slate-50 p-6 rounded-2xl animate-fadeIn">
                                            <h4 className="font-black text-slate-900 mb-4 text-center">Write Your Review</h4>
                                            <div className="flex justify-center gap-2 mb-6">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                                        className={`text-2xl transition-transform hover:scale-110 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-slate-200'}`}
                                                    >
                                                        <FaStar />
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={reviewForm.reviewText}
                                                onChange={(e) => setReviewForm(prev => ({ ...prev, reviewText: e.target.value }))}
                                                className="w-full p-4 rounded-xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 outline-none min-h-[100px] text-sm resize-none mb-4"
                                                placeholder="What did you like or dislike?..."
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowReviewForm(false)}
                                                    className="flex-1 py-3 text-slate-500 font-bold text-sm bg-white rounded-xl hover:bg-slate-100"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleAddReview}
                                                    disabled={submittingReview}
                                                    className="flex-1 py-3 text-white font-bold text-sm bg-slate-900 rounded-xl hover:bg-black disabled:opacity-50"
                                                >
                                                    {submittingReview ? 'Posting...' : 'Post Review'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Review List */}
                                    <div className="space-y-6">
                                        {reviews.length > 0 ? (
                                            reviews.map((r) => (
                                                <div key={r._id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                                                                {r.customerId?.name?.[0] || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 text-sm">{r.customerId?.name}</p>
                                                                <div className="flex text-yellow-400 text-[10px] gap-0.5">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <FaStar key={i} className={i < r.rating ? '' : 'text-slate-200'} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-medium">Verified Purchase</span>
                                                    </div>
                                                    <p className="text-slate-600 text-sm leading-relaxed pl-11">"{r.reviewText}"</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-slate-400 text-sm italic">
                                                No reviews yet. Be the first!
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </AccordionItem>
                        </div>
                    </div>
                </div>

                {/* --- SIMILAR PRODUCTS --- */}
                {similarProducts.length > 0 && (
                    <div className="mt-16 lg:mt-24">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900">You Might Also Like</h2>
                            <button className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-rose-600 transition-colors">
                                View Collection <FaArrowRight />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {similarProducts.map((p) => {
                                const pMrp = p.pricing?.mrp || 0;
                                const pSelling = p.pricing?.selling_price || 0;
                                return (
                                    <div
                                        key={p._id}
                                        onClick={() => navigate(`/product/${p._id}`)}
                                        className="group cursor-pointer"
                                    >
                                        <div className="relative aspect-[3/4] bg-slate-50 rounded-xl overflow-hidden mb-3 border border-slate-100 transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50">
                                            <img
                                                src={p.images?.[0] || placeholderImg}
                                                alt={p.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {/* Hover Add to Cart */}
                                            <div className="absolute inset-x-3 bottom-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                                <button className="w-full py-2.5 bg-white text-slate-900 font-bold text-xs uppercase tracking-wide rounded-lg shadow-lg hover:bg-slate-900 hover:text-white transition-colors">
                                                    Quick View
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">{p.brand || 'Brand'}</p>
                                            <h3 className="font-bold text-slate-900 text-sm mb-1.5 truncate group-hover:text-rose-600 transition-colors">{p.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-slate-900">₹{pSelling.toLocaleString()}</span>
                                                {pMrp > pSelling && (
                                                    <span className="text-xs text-slate-400 line-through">₹{pMrp.toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </main>

            {/* --- MOBILE STICKY FOOTER --- */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-xl border-t border-slate-100 lg:hidden z-50">
                <div className="flex gap-3">
                    <button
                        onClick={() => addToCartAction(false)}
                        disabled={!inStock}
                        className={`flex-1 h-11 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all ${isInCart
                            ? 'bg-slate-100 text-slate-900'
                            : 'bg-white border text-slate-900 border-slate-200'
                            }`}
                    >
                        {isInCart ? <FaCheck /> : <FaShoppingCart />}
                        {isInCart ? 'Added' : 'Add to Cart'}
                    </button>
                    <button
                        onClick={() => addToCartAction(true)}
                        disabled={!inStock}
                        className="flex-[2] h-11 bg-slate-900 text-white rounded-lg font-black text-xs uppercase shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:shadow-none"
                    >
                        <MdOutlineFlashOn className="text-yellow-400 text-lg" />
                        {inStock ? 'Buy Now' : 'Sold Out'}
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