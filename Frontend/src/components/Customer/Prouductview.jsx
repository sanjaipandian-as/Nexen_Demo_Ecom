import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaMinus, FaPlus, FaShare, FaTag, FaInfoCircle, FaShieldAlt, FaBox } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import { MdLocalShipping, MdSecurity, MdVerified } from 'react-icons/md';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';

import Topbar from './Topbar';
import Footer from './Footer';

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

    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, reviewText: '' });
    const [editingReview, setEditingReview] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [userReview, setUserReview] = useState(null);

    const [cartItems, setCartItems] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [addingToCartSimilar, setAddingToCartSimilar] = useState(null);
    const [togglingWishlistSimilar, setTogglingWishlistSimilar] = useState(null);

    const isLoggedIn = useMemo(() => !!localStorage.getItem('token'), []);

    useEffect(() => {
        if (!id) return;

        const fetchAllData = async () => {
            setLoading(true);
            try {
                const productPromise = API.get(`/products/customer/product/${id}`);
                const similarPromise = API.get('/products/customer/page?page=1');
                const reviewsPromise = API.get(`/reviews/${id}`);

                const promises = [productPromise, similarPromise, reviewsPromise];
                if (isLoggedIn) {
                    promises.push(API.get('/wishlist'));
                    promises.push(API.get('/cart'));
                }

                const results = await Promise.allSettled(promises);

                if (results[0].status === 'fulfilled') {
                    setProduct(results[0].value.data);
                    setError('');
                } else {
                    setError('Failed to load product. Please try again later.');
                }

                if (results[1].status === 'fulfilled') {
                    const productsData = results[1].value.data.products || (Array.isArray(results[1].value.data) ? results[1].value.data : []);
                    const filtered = productsData.filter(p => p._id !== id).slice(0, 6);
                    setSimilarProducts(filtered);
                }

                if (results[2].status === 'fulfilled') {
                    const reviewsData = Array.isArray(results[2].value.data) ? results[2].value.data : [];
                    setReviews(reviewsData);

                    if (isLoggedIn) {
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                            const userId = JSON.parse(userStr)?._id;
                            const myReview = reviewsData.find(r => r.customerId?._id === userId);
                            setUserReview(myReview || null);
                        }
                    }
                }

                if (results[3]?.status === 'fulfilled') {
                    const wishlistData = Array.isArray(results[3].value.data) ? results[3].value.data : [];
                    const wishlistProductIds = wishlistData.filter(item => item?.productId?._id).map(item => item.productId._id);
                    setWishlistItems(wishlistProductIds);
                    setIsInWishlist(wishlistProductIds.includes(id));
                }

                if (results[4]?.status === 'fulfilled') {
                    const items = results[4].value.data.items || [];
                    setCartItems(items);
                    const productInCart = items.some(item =>
                        (item.productId?._id || item.productId) === id
                    );
                    setIsInCart(productInCart);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load product. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id, isLoggedIn]);

    useEffect(() => {
        if (!product || !product.images || product.images.length <= 1) return;

        const interval = setInterval(() => {
            setSelectedImage((prev) => (prev + 1) % product.images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [product]);

    const checkIsInCart = useCallback((productId) => {
        return cartItems.some(item =>
            (item.productId?._id || item.productId) === productId
        );
    }, [cartItems]);

    const getCartItemDetail = useCallback((productId) => {
        return cartItems.find(item =>
            (item.productId?._id || item.productId) === productId
        );
    }, [cartItems]);

    const handleAddToCartSimilar = async (e, productId) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate('/Login');
            return;
        }
        setAddingToCartSimilar(productId);
        try {
            await API.post('/cart/add', { productId: productId.toString(), quantity: 1 });
            const response = await API.get('/cart');
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error('Add to cart error:', error);
        } finally {
            setAddingToCartSimilar(null);
        }
    };

    const toggleWishlistSimilar = async (e, productId) => {
        e.stopPropagation();
        if (!isLoggedIn) {
            navigate('/Login');
            return;
        }
        setTogglingWishlistSimilar(productId);
        try {
            const isFav = wishlistItems.includes(productId);
            if (isFav) {
                await API.delete(`/wishlist/remove/${productId}`);
                setWishlistItems(prev => prev.filter(favId => favId !== productId));
            } else {
                await API.post('/wishlist/add', { productId });
                setWishlistItems(prev => [...prev, productId]);
            }
        } catch (error) {
            console.error('Wishlist error:', error);
        } finally {
            setTogglingWishlistSimilar(null);
        }
    };

    const toggleWishlist = useCallback(async () => {
        if (!isLoggedIn) {
            alert('Please login to add items to wishlist');
            navigate('/Login');
            return;
        }

        setTogglingWishlist(true);

        try {
            if (isInWishlist) {
                await API.delete(`/wishlist/remove/${id}`);
                setIsInWishlist(false);
                setWishlistItems(prev => prev.filter(wishId => wishId !== id));
                alert('Removed from wishlist');
            } else {
                await API.post('/wishlist/add', { productId: id });
                setIsInWishlist(true);
                setWishlistItems(prev => [...prev, id]);
                alert('Added to wishlist!');
            }
        } catch (error) {
            console.error('Wishlist error:', error);
            if (error.response?.status === 401) {
                alert('Session expired. Please login again');
                navigate('/Login');
            } else {
                alert(error.response?.data?.message || 'Failed to update wishlist');
            }
        } finally {
            setTogglingWishlist(null);
        }
    }, [isInWishlist, id, isLoggedIn, navigate]);

    const handleQuantityChange = useCallback((action) => {
        if (!product) return;
        const available = product.stock || 0;
        if (action === 'increase' && quantity < available) {
            setQuantity(quantity + 1);
        } else if (action === 'decrease' && quantity > 1) {
            setQuantity(quantity - 1);
        }
    }, [product, quantity]);

    const handlePlaceOrder = useCallback(async () => {
        if (isInCart) {
            navigate('/Payment');
            return;
        }

        try {
            await API.post('/cart/add', {
                productId: product._id,
                quantity
            });
            setIsInCart(true);
            navigate('/Payment');
        } catch (error) {
            console.error('Buy now error:', error);
            alert('Failed to process. Please try again.');
        }
    }, [isInCart, product, quantity, navigate]);

    const handleAddToCart = useCallback(async () => {
        if (isInCart) {
            navigate('/Cart');
            return;
        }

        try {
            await API.post('/cart/add', {
                productId: product._id,
                quantity
            });
            setIsInCart(true);
            alert(`Added ${quantity} item(s) to cart successfully!`);
            const response = await API.get('/cart');
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error('Add to cart error:', error);
            alert(error.response?.data?.message || 'Failed to add to cart');
        }
    }, [isInCart, product, quantity, navigate]);

    const handleAddReview = useCallback(async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
            alert('Please login to add a review');
            navigate('/Login');
            return;
        }

        setSubmittingReview(true);
        try {
            await API.post('/reviews/add', {
                productId: id,
                rating: reviewForm.rating,
                reviewText: reviewForm.reviewText
            });
            alert('Review added successfully!');
            setShowReviewForm(false);
            setReviewForm({ rating: 5, reviewText: '' });
            const response = await API.get(`/reviews/${id}`);
            setReviews(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Add review error:', error);
            alert(error.response?.data?.message || 'Failed to add review');
        } finally {
            setSubmittingReview(false);
        }
    }, [id, reviewForm, isLoggedIn, navigate]);

    const handleUpdateReview = useCallback(async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            await API.put(`/reviews/update/${editingReview}`, {
                rating: reviewForm.rating,
                reviewText: reviewForm.reviewText
            });
            alert('Review updated successfully!');
            setShowReviewForm(false);
            setEditingReview(null);
            setReviewForm({ rating: 5, reviewText: '' });
            const response = await API.get(`/reviews/${id}`);
            setReviews(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Update review error:', error);
            alert(error.response?.data?.message || 'Failed to update review');
        } finally {
            setSubmittingReview(false);
        }
    }, [editingReview, reviewForm, id]);

    const handleDeleteReview = useCallback(async (reviewId) => {
        if (!confirm('Are you sure you want to delete your review?')) return;
        try {
            await API.delete(`/reviews/delete/${reviewId}`);
            alert('Review deleted successfully!');
            const response = await API.get(`/reviews/${id}`);
            setReviews(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Delete review error:', error);
            alert(error.response?.data?.message || 'Failed to delete review');
        }
    }, [id]);

    const openEditReview = useCallback((review) => {
        setEditingReview(review._id);
        setReviewForm({
            rating: review.rating,
            reviewText: review.reviewText
        });
        setShowReviewForm(true);
    }, []);

    const closeReviewForm = useCallback(() => {
        setShowReviewForm(false);
        setEditingReview(null);
        setReviewForm({ rating: 5, reviewText: '' });
    }, []);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }, [reviews]);

    const ratingDistribution = useMemo(() => {
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(review => {
            distribution[review.rating]++;
        });
        return distribution;
    }, [reviews]);

    const productImages = useMemo(() =>
        product?.images && product.images.length > 0
            ? product.images
            : [placeholderImg]
        , [product]);

    const inStock = useMemo(() => (product?.stock || 0) > 0, [product]);
    const sellingPrice = product?.pricing?.selling_price || 0;
    const mrp = product?.pricing?.mrp || 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Topbar />
                <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 mt-10 mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Image Skeleton */}
                        <div className="lg:col-span-5">
                            <Skeleton className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] rounded-xl mb-4" />
                            <div className="grid grid-cols-4 gap-3">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                                ))}
                            </div>
                        </div>

                        {/* Content Skeleton */}
                        <div className="lg:col-span-7">
                            <div className="flex justify-between mb-4">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-12" />
                            </div>
                            <Skeleton className="h-10 w-3/4 mb-6" />

                            <div className="flex gap-3 mb-8">
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-24 rounded-full" />
                            </div>

                            <div className="space-y-4 mb-8">
                                <Skeleton className="h-12 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                                {[...Array(6)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }


    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-lg hover:from-primary/90 hover:to-primary transition-all shadow-md"
                    >
                        Browse All Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Topbar />
            <main className="flex-1 max-w-screen-2xl mx-auto px-4 sm:px-6 py-8 mt-10 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden mb-4 shadow-sm">
                                <img
                                    src={productImages[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] object-contain p-4"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.target.src = placeholderImg;
                                        e.target.onerror = null;
                                    }}
                                />
                                <div className="absolute bottom-4 right-4 flex gap-2">
                                    <button
                                        onClick={toggleWishlist}
                                        disabled={togglingWishlist}
                                        className="p-3 bg-white rounded-full shadow-lg hover:scale-110 transition-all"
                                    >
                                        {togglingWishlist ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                        ) : (
                                            <BsFillBagHeartFill className={`w-5 h-5 transition-all ${isInWishlist ? 'text-red-500' : 'text-gray-400'}`} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3">
                                {productImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`border-2 rounded-lg overflow-hidden transition-all ${selectedImage === index ? 'border-primary' : 'border-gray-200'}`}
                                    >
                                        <img src={image} alt="" className="w-full h-20 object-contain p-2" onError={(e) => {
                                            e.target.src = placeholderImg;
                                            e.target.onerror = null;
                                        }} />
                                    </button>
                                ))}
                            </div>

                            <div className="hidden lg:flex gap-3 mt-6">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!inStock}
                                    className="flex-1 py-4 bg-primary/10 border-2 border-primary text-primary font-bold text-lg rounded-lg hover:bg-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <FaShoppingCart className="w-5 h-5" />
                                    {isInCart ? 'ADDED' : 'ADD TO CART'}
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={!inStock}
                                    className="flex-1 py-4 bg-primary text-white font-bold text-lg rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    BUY NOW
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-primary font-bold uppercase tracking-wider text-sm">{product.brand || 'Standard'}</span>
                            <div className="flex items-center gap-1 bg-secondary text-white px-2 py-1 rounded-lg text-sm font-bold">
                                <FaStar /> {averageRating}
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>
                        <p className="text-xs text-gray-400 mb-4 font-mono">Slug: {product.slug}</p>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                                <FaBox className="w-3 h-3 text-primary" />
                                {product.net_quantity || 'N/A'}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">
                                <FaTag className="w-3 h-3 text-primary" />
                                {product.brand || 'Standard'}
                            </div>
                        </div>

                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-4xl font-bold text-gray-900">₹{sellingPrice.toFixed(2)}</span>
                                {mrp > sellingPrice && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl text-gray-400 line-through">₹{mrp.toFixed(2)}</span>
                                        <span className="text-green-600 font-bold">{product.discount_percentage}% OFF</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">+ Free Delivery • Inclusive of all taxes</p>
                        </div>

                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaInfoCircle className="text-primary" /> Availability & Category
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                                <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-primary/20 transition-colors">
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Category</p>
                                    <p className="text-sm font-bold text-gray-800 truncate">{product.category?.main || 'General'}</p>
                                </div>
                                <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-primary/20 transition-colors">
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mb-1">Sub Category</p>
                                    <p className="text-sm font-bold text-gray-800 truncate">{product.category?.sub || '-'}</p>
                                </div>
                                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                                    <p className="text-[10px] text-primary uppercase font-black tracking-wider mb-1">Total Stock</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        <p className="text-sm font-black text-primary">{product.stock || 0} Pcs</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {inStock ? (
                                    <>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-green-600 font-bold">In Stock</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-red-600 font-bold">Out of Stock</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mb-6 pb-6 border-b border-gray-200">
                            <p className="text-sm font-bold text-gray-700 mb-3">Quantity:</p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleQuantityChange('decrease')}
                                    disabled={quantity <= 1}
                                    className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-primary disabled:opacity-50"
                                >
                                    <FaMinus className="w-4 h-4 text-gray-700" />
                                </button>
                                <span className="text-2xl font-bold text-gray-900 w-16 text-center border-2 border-gray-300 rounded-lg py-2">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => handleQuantityChange('increase')}
                                    disabled={quantity >= (product.stock || 0)}
                                    className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-primary disabled:opacity-50"
                                >
                                    <FaPlus className="w-4 h-4 text-gray-700" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                                <MdLocalShipping className="w-10 h-10 text-primary mb-2" />
                                <p className="text-xs font-bold text-gray-900">Free Delivery</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                                <MdSecurity className="w-10 h-10 text-primary mb-2" />
                                <p className="text-xs font-bold text-gray-900">Secure Payment</p>
                            </div>
                            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-lg">
                                <MdVerified className="w-10 h-10 text-primary mb-2" />
                                <p className="text-xs font-bold text-gray-900">Certified Safe</p>
                            </div>
                        </div>


                        {product.description && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Product Description</h2>
                                <p className="text-gray-700 leading-relaxed">{product.description}</p>
                            </div>
                        )}

                        {product.specifications?.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3">Specifications</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {product.specifications.map((spec, i) => (
                                        <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <span className="text-gray-600 font-medium">{spec.key}</span>
                                            <span className="text-gray-900 font-bold">{spec.value} {spec.unit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                        {!userReview && (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="px-6 py-2 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold rounded-lg shadow-md"
                            >
                                Write a Review
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</div>
                                <div className="flex items-center justify-center gap-1 mb-2">
                                    {[...Array(5)].map((_, index) => (
                                        <FaStar key={index} className={`w-6 h-6 ${index < Math.round(averageRating) ? 'text-secondary' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <p className="text-gray-600">Based on {reviews.length} reviews</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = ratingDistribution[star];
                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                return (
                                    <div key={star} className="flex items-center gap-3 mb-2">
                                        <span className="text-sm font-semibold text-gray-700 w-8">{star}★</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                                            <div className="bg-secondary h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <span className="text-sm text-gray-600 w-8">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {showReviewForm && (
                        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border-2 border-primary/20 mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">{editingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
                                <button onClick={closeReviewForm} className="text-gray-600 font-bold text-xl">×</button>
                            </div>
                            <form onSubmit={editingReview ? handleUpdateReview : handleAddReview}>
                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                                                <FaStar className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-secondary' : 'text-gray-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <textarea
                                        value={reviewForm.reviewText}
                                        onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
                                        rows="4"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                                        placeholder="Share your experience..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={closeReviewForm} className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg">Cancel</button>
                                    <button type="submit" disabled={submittingReview} className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-white font-semibold rounded-lg disabled:opacity-50">
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {reviews.map((review) => {
                            const isUserReview = userReview && userReview._id === review._id;
                            return (
                                <div key={review._id} className={`p-6 rounded-2xl border-2 ${isUserReview ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'}`}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{review.customerId?.name || 'Anonymous'}</h4>
                                            <div className="flex gap-1 my-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} className={`w-4 h-4 ${i < review.rating ? 'text-secondary' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                            <p className="text-gray-700">{review.reviewText}</p>
                                        </div>
                                        {isUserReview && (
                                            <div className="flex gap-2">
                                                <button onClick={() => openEditReview(review)} className="text-primary text-sm font-bold">Edit</button>
                                                <button onClick={() => handleDeleteReview(review._id)} className="text-red-600 text-sm font-bold">Delete</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>

                    {/* Mobile & Tablet: Horizontal Scroll */}
                    <div className="lg:hidden overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        <div className="flex gap-3 sm:gap-4">
                            {similarProducts.map((item) => {
                                const inCart = checkIsInCart(item._id);
                                const cartItemDetail = getCartItemDetail(item._id);
                                const availablePieces = item.stock || 0;
                                const sellingPrice = item.pricing?.selling_price || 0;
                                const mrp = item.pricing?.mrp;
                                const discount = item.pricing?.discount_percentage || 0;
                                const brandName = item.brand || 'Standard';

                                return (
                                    <div
                                        key={item._id}
                                        onClick={() => { navigate(`/product/${item._id}`); window.scrollTo(0, 0); }}
                                        className="flex-shrink-0 w-[280px] sm:w-[300px] bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer active:scale-98 snap-start"
                                    >
                                        <div className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer">
                                            <img
                                                src={item.images?.[0] || placeholderImg}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.src = placeholderImg;
                                                    e.target.onerror = null;
                                                }}
                                            />

                                            {discount > 0 && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                                    <FaTag className="w-2 h-2" />
                                                    {discount}% OFF
                                                </div>
                                            )}

                                            <button
                                                onClick={(e) => toggleWishlistSimilar(e, item._id)}
                                                disabled={togglingWishlistSimilar === item._id}
                                                className="absolute top-2 sm:top-3 right-2 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-90"
                                            >
                                                {togglingWishlistSimilar === item._id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-primary"></div>
                                                ) : (
                                                    <BsFillBagHeartFill
                                                        className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${wishlistItems.includes(item._id)
                                                            ? 'text-red-500'
                                                            : 'text-gray-300 hover:text-red-400'
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
                                                <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 flex-1">{item.name}</h3>
                                                <div className="flex items-center gap-1 bg-secondary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer flex-shrink-0">
                                                    <FaStar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-secondary" />
                                                    <span className="text-xs sm:text-sm font-medium text-gray-700">4.2</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] sm:text-xs text-gray-500 font-medium mb-0.5 sm:mb-1">Category</span>
                                                    <span className="text-xs sm:text-sm font-bold text-gray-800 capitalize">{item.category?.main || 'General'}</span>
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
                                                        onClick={(e) => handleAddToCartSimilar(e, item._id)}
                                                        disabled={addingToCartSimilar === item._id || availablePieces <= 0}
                                                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 ${addingToCartSimilar === item._id || availablePieces <= 0
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 cursor-pointer'
                                                            }`}
                                                    >
                                                        {addingToCartSimilar === item._id ? (
                                                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
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
                            })}
                        </div>
                    </div>

                    {/* Desktop: Grid Layout */}
                    <div className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
                        {similarProducts.map((item) => {
                            const inCart = checkIsInCart(item._id);
                            const cartItemDetail = getCartItemDetail(item._id);
                            const availablePieces = item.stock || 0;
                            const sellingPrice = item.pricing?.selling_price || 0;
                            const mrp = item.pricing?.mrp;
                            const discount = item.pricing?.discount_percentage || 0;
                            const brandName = item.brand || 'Standard';

                            return (
                                <div
                                    key={item._id}
                                    onClick={() => { navigate(`/product/${item._id}`); window.scrollTo(0, 0); }}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer active:scale-98"
                                >
                                    <div className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer">
                                        <img
                                            src={item.images?.[0] || placeholderImg}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = placeholderImg;
                                                e.target.onerror = null;
                                            }}
                                        />

                                        {discount > 0 && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                                <FaTag className="w-2 h-2" />
                                                {discount}% OFF
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => toggleWishlistSimilar(e, item._id)}
                                            disabled={togglingWishlistSimilar === item._id}
                                            className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all active:scale-90"
                                        >
                                            {togglingWishlistSimilar === item._id ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                            ) : (
                                                <BsFillBagHeartFill
                                                    className={`w-5 h-5 transition-colors ${wishlistItems.includes(item._id)
                                                        ? 'text-red-500'
                                                        : 'text-gray-300 hover:text-red-400'
                                                        }`}
                                                />
                                            )}
                                        </button>
                                        {availablePieces <= 0 && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                <span className="text-white font-bold text-lg">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-3 gap-2">
                                            <h3 className="text-base font-semibold text-gray-800 line-clamp-2 flex-1">{item.name}</h3>
                                            <div className="flex items-center gap-1 bg-secondary/10 px-2 py-1 rounded cursor-pointer flex-shrink-0">
                                                <FaStar className="w-3 h-3 text-secondary" />
                                                <span className="text-sm font-medium text-gray-700">4.2</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 font-medium mb-1">Category</span>
                                                <span className="text-sm font-bold text-gray-800 capitalize">{item.category?.main || 'General'}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-gray-500 font-medium mb-1">Brand</span>
                                                <span className="text-sm font-bold text-primary capitalize">
                                                    {brandName}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                                            <div className="flex flex-col">
                                                <span className="text-xl font-bold text-gray-800">₹{sellingPrice.toFixed(2)}</span>
                                                {mrp > sellingPrice && (
                                                    <span className="text-xs text-gray-400 line-through">₹{mrp.toFixed(2)}</span>
                                                )}
                                            </div>

                                            {inCart ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate('/cart');
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
                                                >
                                                    <FaShoppingCart className="w-4 h-4" />
                                                    <span className="text-sm font-medium whitespace-nowrap">
                                                        View Cart
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => handleAddToCartSimilar(e, item._id)}
                                                    disabled={addingToCartSimilar === item._id || availablePieces <= 0}
                                                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95 ${addingToCartSimilar === item._id || availablePieces <= 0
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 cursor-pointer'
                                                        }`}
                                                >
                                                    {addingToCartSimilar === item._id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    ) : (
                                                        <>
                                                            <FaShoppingCart className="w-4 h-4" />
                                                            <span className="text-sm font-medium whitespace-nowrap">
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
                        })}
                    </div>

                    {/* Scrollbar Hide CSS */}
                    <style>{`
                        .scrollbar-hide::-webkit-scrollbar {
                            display: none;
                        }
                        .scrollbar-hide {
                            -ms-overflow-style: none;
                            scrollbar-width: none;
                        }
                    `}</style>
                </div>
            </main>

            <div className="lg:hidden fixed bottom-16 left-0 right-0 z-40 px-4 pointer-events-none">
                {/* Space for mobile floating buttons if needed */}
            </div>

            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
                <div className="flex gap-3 pointer-events-auto">
                    <button onClick={handleAddToCart} disabled={!inStock} className="flex-1 py-3 bg-primary/10 border-2 border-primary text-primary font-bold rounded-lg flex items-center justify-center gap-2">
                        <FaShoppingCart /> {isInCart ? 'GO TO CART' : 'CART'}
                    </button>
                    <button onClick={handlePlaceOrder} disabled={!inStock} className="flex-1 py-3 bg-primary text-white font-bold rounded-lg">BUY NOW</button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Productview;