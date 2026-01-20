import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaShare, FaTag, FaInfoCircle, FaBox, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import { MdLocalShipping, MdSecurity, MdVerified } from 'react-icons/md';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';

import Topbar from './Topbar';
import Footer from './Footer';

// Internal Accordion Component for Mobile
const AccordionItem = ({ title, isOpen, onClick, children, icon: Icon }) => (
    <div className="border-b border-gray-100 last:border-0">
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between py-4 bg-white hover:bg-gray-50 transition-colors"
        >
            <div className="flex items-center gap-3">
                {Icon && <Icon className="text-primary w-4 h-4" />}
                <span className="font-bold text-gray-900 text-base">{title}</span>
            </div>
            {isOpen ? <FaChevronUp className="text-gray-400 text-sm" /> : <FaChevronDown className="text-gray-400 text-sm" />}
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
            {children}
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
    const [editingReview, setEditingReview] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [expandedSection, setExpandedSection] = useState('description'); // 'description', 'specs', 'reviews'

    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);

    // Auth Check
    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        if (!id) return;
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Parallel fetching
                const results = await Promise.allSettled([
                    API.get(`/products/customer/product/${id}`),
                    API.get('/products/customer/page?page=1'),
                    API.get(`/reviews/${id}`),
                    isLoggedIn ? API.get('/wishlist') : Promise.resolve({ value: { data: [] } }),
                    isLoggedIn ? API.get('/cart') : Promise.resolve({ value: { data: [] } })
                ]);

                // 1. Product Data
                if (results[0].status === 'fulfilled') {
                    setProduct(results[0].value.data);
                } else {
                    setError('Failed to load product.');
                }

                // 2. Similar Products
                if (results[1].status === 'fulfilled') {
                    const products = results[1].value.data.products || [];
                    setSimilarProducts(products.filter(p => p._id !== id).slice(0, 6));
                }

                // 3. Reviews
                if (results[2].status === 'fulfilled') {
                    const reviewsData = Array.isArray(results[2].value.data) ? results[2].value.data : [];
                    setReviews(reviewsData);
                    if (isLoggedIn) {
                        const userId = JSON.parse(localStorage.getItem('user'))?._id;
                        setUserReview(reviewsData.find(r => r.customerId?._id === userId));
                    }
                }

                // 4. Wishlist Status
                if (results[3]?.status === 'fulfilled' && results[3].value?.data) {
                    const wData = Array.isArray(results[3].value.data) ? results[3].value.data : [];
                    const ids = wData.map(i => i.productId?._id).filter(Boolean);
                    setWishlistItems(ids);
                    setIsInWishlist(ids.includes(id));
                }

                // 5. Cart Status
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

    // Handlers
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
                alert(`Added ${quantity} item(s) to cart`);
                const res = await API.get('/cart');
                setCartItems(res.data.items || []);
            }
        } catch (e) {
            console.error(e);
            alert('Failed to add to cart, possibly out of stock or internal error.');
        }
    }, [isLoggedIn, isInCart, product, quantity, navigate]);

    const toggleWishlist = useCallback(async () => {
        if (!isLoggedIn) return navigate('/Login');
        setTogglingWishlist(true);
        try {
            if (isInWishlist) {
                await API.delete(`/wishlist/remove/${id}`);
                setIsInWishlist(false);
                setWishlistItems(prev => prev.filter(x => x !== id));
            } else {
                await API.post('/wishlist/add', { productId: id });
                setIsInWishlist(true);
                setWishlistItems(prev => [...prev, id]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setTogglingWishlist(false);
        }
    }, [isLoggedIn, isInWishlist, id, navigate]);

    // Review Logic
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

    // Derived State
    const productImages = useMemo(() => product?.images?.length ? product.images : [placeholderImg], [product]);
    const inStock = (product?.stock || 0) > 0;
    const sellingPrice = product?.pricing?.selling_price || 0;
    const mrp = product?.pricing?.mrp || 0;
    const averageRating = useMemo(() => reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 0, [reviews]);

    if (loading) return <Skeleton className="h-screen w-full" />;
    if (error || !product) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error || 'Product not found'}</div>;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900 pb-[100px] lg:pb-0">
            <Topbar />

            <main className="flex-1 container mx-auto px-0 lg:px-6 py-0 lg:py-8 mt-0 lg:mt-6">
                <div className="flex flex-col lg:flex-row gap-0 lg:gap-12">

                    {/* --- MOBILE/DESKTOP IMAGE GALLERY --- */}
                    <div className="w-full lg:w-1/2 bg-white lg:bg-transparent lg:sticky lg:top-24 h-fit">
                        <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square bg-white lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm overflow-hidden flex items-center justify-center">
                            <img
                                src={productImages[selectedImage]}
                                alt={product.name}
                                className="w-full h-full object-contain p-4 lg:p-8"
                            />
                            {/* Wishlist Button (Floating) */}
                            <button
                                onClick={toggleWishlist}
                                className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur rounded-full shadow-md border border-gray-100 z-10 active:scale-90 transition-transform"
                            >
                                <BsFillBagHeartFill className={`w-5 h-5 ${isInWishlist ? 'text-primary' : 'text-gray-400'}`} />
                            </button>

                            {/* Discount Badge */}
                            {mrp > sellingPrice && (
                                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                    {product.discount_percentage}% OFF
                                </div>
                            )}
                        </div>

                        {/* Thumbnails (Scrollable on Mobile) */}
                        <div className="flex lg:grid lg:grid-cols-5 gap-3 p-4 lg:px-0 overflow-x-auto scrollbar-hide">
                            {productImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImage(i)}
                                    className={`flex-shrink-0 w-16 h-16 lg:w-full lg:h-auto lg:aspect-square border-2 rounded-lg overflow-hidden ${selectedImage === i ? 'border-primary' : 'border-transparent lg:border-gray-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-contain p-1" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* --- PRODUCT DETAILS --- */}
                    <div className="w-full lg:w-1/2 px-4 lg:px-0">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">{product.brand || 'Generic'}</span>
                                <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                    <FaStar /> {averageRating}
                                    <span className="text-gray-400 font-normal">({reviews.length})</span>
                                </div>
                            </div>
                            <h1 className="text-2xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-2 break-words">{product.name}</h1>
                            <p className="text-xs text-gray-400 font-mono">#{product.slug}</p>
                        </div>

                        {/* Price & Stock */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                            <div className="flex items-baseline gap-3 mb-2">
                                <span className="text-3xl font-black text-gray-900">₹{sellingPrice.toFixed(0)}</span>
                                {mrp > sellingPrice && <span className="text-lg text-gray-400 line-through">₹{mrp.toFixed(0)}</span>}
                            </div>
                            <div className={`flex items-center gap-2 text-sm font-bold ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                                <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-600' : 'bg-red-500'}`} />
                                {inStock ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
                            </div>
                        </div>

                        {/* Services Grid (Mobile Optimized) */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            {[
                                { icon: MdLocalShipping, label: "Free Shipping", sub: "On all orders" },
                                { icon: MdSecurity, label: "Secure Pay", sub: "100% Protected" },
                                { icon: MdVerified, label: "Genuine", sub: "Brand New" },
                                { icon: FaBox, label: "Returns", sub: "7 Day Policy" }
                            ].map((s, i) => (
                                <div key={i} className="flex flex-col p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                    <s.icon className="text-primary w-5 h-5 mb-1" />
                                    <span className="text-sm font-bold text-gray-900">{s.label}</span>
                                    <span className="text-[10px] text-gray-500">{s.sub}</span>
                                </div>
                            ))}
                        </div>

                        {/* --- ACCORDION SECTIONS (Mobile First Approach) --- */}
                        <div className="space-y-0 border-t border-gray-100 lg:border-0 lg:space-y-8">

                            {/* Description */}
                            <div className="lg:border lg:border-gray-100 lg:rounded-2xl lg:p-6 lg:bg-white">
                                <div className="lg:hidden">
                                    <AccordionItem
                                        title="Description"
                                        icon={FaInfoCircle}
                                        isOpen={expandedSection === 'description'}
                                        onClick={() => setExpandedSection(expandedSection === 'description' ? '' : 'description')}
                                    >
                                        <p className="text-gray-600 text-sm leading-7 whitespace-pre-line px-1">{product.description || 'No description available.'}</p>
                                    </AccordionItem>
                                </div>
                                <div className="hidden lg:block">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaInfoCircle className="text-primary" /> Description</h3>
                                    <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">{product.description}</p>
                                </div>
                            </div>

                            {/* Specifications */}
                            {product.specifications?.length > 0 && (
                                <div className="lg:border lg:border-gray-100 lg:rounded-2xl lg:p-6 lg:bg-white">
                                    <div className="lg:hidden">
                                        <AccordionItem
                                            title="Specifications"
                                            icon={FaTag}
                                            isOpen={expandedSection === 'specs'}
                                            onClick={() => setExpandedSection(expandedSection === 'specs' ? '' : 'specs')}
                                        >
                                            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                                                {product.specifications.map((spec, i) => (
                                                    <div key={i} className="flex justify-between text-sm">
                                                        <span className="text-gray-500 break-words w-1/3">{spec.key}</span>
                                                        <span className="font-bold text-gray-900 break-words w-2/3 text-right">{spec.value} {spec.unit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </AccordionItem>
                                    </div>
                                    <div className="hidden lg:block">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaTag className="text-primary" /> Specifications</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {product.specifications.map((spec, i) => (
                                                <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-500">{spec.key}</span>
                                                    <span className="font-bold text-gray-900">{spec.value} {spec.unit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews Accordion */}
                            <div className="lg:hidden">
                                <AccordionItem
                                    title={`Reviews (${reviews.length})`}
                                    icon={FaStar}
                                    isOpen={expandedSection === 'reviews'}
                                    onClick={() => setExpandedSection(expandedSection === 'reviews' ? '' : 'reviews')}
                                >
                                    <div className="space-y-4 pt-2">
                                        {!userReview && (
                                            <button onClick={() => setShowReviewForm(true)} className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl">Write a Review</button>
                                        )}
                                        {showReviewForm && (
                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                <p className="font-bold mb-2">Write Review</p>
                                                <textarea
                                                    className="w-full p-2 border rounded mb-2"
                                                    value={reviewForm.reviewText}
                                                    onChange={e => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                                                    placeholder="Your thoughts..."
                                                />
                                                <button onClick={handleAddReview} className="w-full bg-primary text-white py-2 rounded">Submit</button>
                                            </div>
                                        )}
                                        {reviews.slice(0, 3).map(r => (
                                            <div key={r._id} className="p-3 bg-gray-50 rounded-xl">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-sm">{r.customerId?.name}</span>
                                                    <div className="flex text-yellow-400 text-xs">{[...Array(5)].map((_, i) => <FaStar key={i} className={i < r.rating ? '' : 'text-gray-300'} />)}</div>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-3">{r.reviewText}</p>
                                            </div>
                                        ))}
                                        {reviews.length > 3 && <button className="w-full text-center text-primary text-sm font-bold py-2">View All Reviews</button>}
                                    </div>
                                </AccordionItem>
                            </div>

                            {/* Desktop Reviews (Hidden on Mobile) */}
                            <div className="hidden lg:block mt-8">
                                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                        {reviews.map(r => (
                                            <div key={r._id} className="p-4 bg-gray-50 rounded-xl">
                                                <div className="flex justify-between">
                                                    <p className="font-bold">{r.customerId?.name}</p>
                                                    <div className="flex text-yellow-500">{[...Array(r.rating)].map((_, i) => <FaStar key={i} />)}</div>
                                                </div>
                                                <p className="text-gray-600 mt-2">{r.reviewText}</p>
                                            </div>
                                        ))}
                                        {reviews.length === 0 && <p className="text-gray-400 italic">No reviews yet.</p>}
                                    </div>
                                    <div>
                                        {!userReview && <button onClick={() => setShowReviewForm(true)} className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30">Write Review</button>}
                                        {showReviewForm && (
                                            <div className="mt-4 p-6 border rounded-2xl">
                                                <div className="flex gap-2 text-2xl mb-4 text-gray-300">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <FaStar
                                                            key={star}
                                                            className={`cursor-pointer ${star <= reviewForm.rating ? 'text-yellow-400' : ''}`}
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                        />
                                                    ))}
                                                </div>
                                                <textarea
                                                    className="w-full border p-3 rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 ring-primary/20"
                                                    rows="4"
                                                    value={reviewForm.reviewText}
                                                    onChange={e => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                                                    placeholder="Tell us what you liked..."
                                                />
                                                <button onClick={handleAddReview} className="mt-4 bg-primary text-white px-8 py-3 rounded-xl font-bold w-full hover:bg-primary/90">Submit Review</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Similar Products */}
                <div className="mt-12 pt-8 border-t border-gray-200 px-4 lg:px-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {similarProducts.map(p => (
                            <div key={p._id} onClick={() => { navigate(`/product/${p._id}`); window.scrollTo(0, 0); }} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                <img src={p.images[0]} className="w-full aspect-square object-contain p-6" />
                                <div className="p-4 border-t border-gray-50">
                                    <p className="font-bold text-sm truncate mb-1">{p.name}</p>
                                    <p className="text-primary font-black">₹{p.pricing?.selling_price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* --- MOBILE STICKY BOTTOM BAR --- */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 lg:hidden z-50 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-3">
                    {/* Quantity Control Tiny */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl h-12 px-2 shrink-0">
                        <button onClick={() => handleQuantityChange('decrease')} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-primary active:scale-95"><FaMinus className="w-3 h-3" /></button>
                        <span className="w-6 text-center font-bold text-sm mx-1">{quantity}</span>
                        <button onClick={() => handleQuantityChange('increase')} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-primary active:scale-95"><FaPlus className="w-3 h-3" /></button>
                    </div>

                    <button
                        onClick={() => addToCartAction(false)}
                        className="flex-1 h-12 bg-white border-2 border-primary text-primary font-bold rounded-xl text-sm flex items-center justify-center gap-2 active:bg-primary/5 transition-colors"
                        disabled={!inStock}
                    >
                        {isInCart ? 'View Cart' : 'Add to Cart'}
                    </button>
                    <button
                        onClick={() => addToCartAction(true)}
                        className="flex-1 h-12 bg-primary text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                        disabled={!inStock}
                    >
                        Buy Now
                    </button>
                </div>
            </div>

            {/* Desktop Footer Only */}
            <div className="hidden lg:block">
                <Footer />
            </div>

            {/* Mobile Footer Spacing is handled by pb-[100px] on main container */}
        </div>
    );
};

export default Productview;