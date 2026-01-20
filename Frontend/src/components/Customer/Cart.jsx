import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaShoppingCart, FaTimes, FaCheckCircle, FaTag } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import API from '../../../api';
import Skeleton from '../Common/Skeleton';
import placeholderImg from '../../assets/Placeholder.png';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingItem, setUpdatingItem] = useState(null);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(false);
    const [addingToCart, setAddingToCart] = useState(null);
    const [showWishlist, setShowWishlist] = useState(false);

    useEffect(() => {
        fetchCart();
        fetchWishlist();
    }, []);

    const validCartItems = useMemo(() =>
        cartItems.filter(item => item?.productId?._id), [cartItems]
    );

    useEffect(() => {
        if (validCartItems.length > 0 && selectedItems.length === 0) {
            setSelectedItems(validCartItems.map(item => item.productId._id));
        }
    }, [validCartItems.length]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/Login');
                return;
            }

            const response = await API.get('/cart');
            setCartItems(response.data.items || []);
        } catch (err) {
            console.error('Fetch cart error:', err);
            if (err.response?.status === 401) {
                navigate('/Login');
            } else {
                setError('Failed to load cart');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchWishlist = async () => {
        try {
            setLoadingWishlist(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await API.get('/wishlist');
            const wishlistData = Array.isArray(response.data) ? response.data : [];
            setWishlistItems(wishlistData.slice(0, 4)); // Show only first 4 items
        } catch (err) {
            console.error('Fetch wishlist error:', err);
        } finally {
            setLoadingWishlist(false);
        }
    };

    const addWishlistItemToCart = async (productId) => {
        try {
            setAddingToCart(productId);
            await API.post('/cart/add', { productId, quantity: 1 });
            await fetchCart();
            setError('');
        } catch (err) {
            console.error('Add to cart error:', err);
            setError('Failed to add item to cart');
        } finally {
            setAddingToCart(null);
        }
    };

    const toggleItemSelection = useCallback((productId) => {
        setSelectedItems(prev =>
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedItems(selectedItems.length === validCartItems.length ? [] : validCartItems.map(item => item.productId._id));
    }, [selectedItems.length, validCartItems]);

    const updateQuantity = useCallback(async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdatingItem(productId);
        try {
            await API.put('/cart/update', { productId, quantity: newQuantity });
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item?.productId?._id === productId ? { ...item, quantity: newQuantity } : item
                )
            );
        } catch (err) {
            console.error('Update quantity error:', err);
            setError('Failed to update quantity');
        } finally {
            setUpdatingItem(null);
        }
    }, []);

    const removeItem = useCallback(async (productId) => {
        setUpdatingItem(productId);
        try {
            await API.delete(`/cart/remove/${productId}`);
            setCartItems(prevItems => prevItems.filter(item => item?.productId?._id !== productId));
            setSelectedItems(prev => prev.filter(id => id !== productId));
        } catch (err) {
            console.error('Remove item error:', err);
            setError('Failed to remove item');
        } finally {
            setUpdatingItem(null);
        }
    }, []);

    const selectedCartItems = useMemo(() =>
        validCartItems.filter(item => selectedItems.includes(item.productId._id)), [validCartItems, selectedItems]
    );

    const subtotal = useMemo(() =>
        selectedCartItems.reduce((total, item) => total + ((item.productId.pricing?.selling_price || item.productId.price || 0) * item.quantity), 0), [selectedCartItems]
    );

    const tax = useMemo(() => subtotal * 0.18, [subtotal]);
    const total = useMemo(() => subtotal + tax, [subtotal, tax]);

    const savings = useMemo(() =>
        selectedCartItems.reduce((total, item) => {
            const currentPrice = item.productId.pricing?.selling_price || item.productId.price || 0;
            const originalPrice = item.productId.pricing?.mrp || item.productId.originalPrice || currentPrice;
            const discount = (originalPrice - currentPrice) * item.quantity;
            return total + (discount > 0 ? discount : 0);
        }, 0), [selectedCartItems]
    );

    const handleCheckout = useCallback(() => {
        if (selectedItems.length === 0) {
            setError('Please select at least one item to checkout');
            return;
        }
        localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
        navigate('/checkout');
    }, [selectedItems, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-8 pb-16">
                <div className="max-w-8xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
                                    <div className="flex gap-6">
                                        <Skeleton className="w-32 h-32 rounded-lg flex-shrink-0" />
                                        <div className="flex-1 space-y-4">
                                            <Skeleton className="h-6 w-3/4" />
                                            <Skeleton className="h-4 w-1/4" />
                                            <div className="flex justify-between items-center pt-4">
                                                <Skeleton className="h-10 w-32" />
                                                <Skeleton className="h-8 w-24" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-4">
                            <div className="bg-white p-8 rounded-xl border border-gray-100 space-y-6">
                                <Skeleton className="h-8 w-1/2" />
                                <div className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                </div>
                                <Skeleton className="h-12 w-full mt-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    if (cartItems.length === 0) {
        return (
            <div className="bg-white px-4 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto w-full space-y-24">
                    <div className="max-w-md mx-auto text-center space-y-12">
                        <div className="space-y-8">
                            <div className="relative">
                                <div className="w-48 h-48 bg-gray-50 rounded-full mx-auto flex items-center justify-center transition-transform hover:scale-105 duration-500">
                                    <FaShoppingCart className="w-16 h-16 text-gray-200" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your cart is empty</h1>
                                <p className="text-gray-500 text-lg">Looks like you haven't made your choice yet. Let's find something special for you.</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-all transform active:scale-[0.98]"
                                >
                                    Start Shopping
                                </button>

                                {wishlistItems.length > 0 && (
                                    <button
                                        onClick={() => setShowWishlist(!showWishlist)}
                                        className="w-full py-4 bg-white border border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-all"
                                    >
                                        <BsFillBagHeartFill className="text-primary" />
                                        {showWishlist ? 'Hide Wishlist' : 'Import from Wishlist'} ({wishlistItems.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {showWishlist && wishlistItems.length > 0 && (
                        <div className="pt-16 border-t border-gray-100 mt-16 w-full text-left animate-in fade-in slide-in-from-bottom-5 duration-700">
                            <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                From your wishlist
                                <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 uppercase tracking-widest leading-none">
                                    Import Items
                                </span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                                {wishlistItems.map((item) => (
                                    <div key={item.productId._id} className="group space-y-4">
                                        <div
                                            className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden cursor-pointer relative"
                                            onClick={() => navigate(`/product/${item.productId._id}`)}
                                        >
                                            <img
                                                src={item.productId.images?.[0] || placeholderImg}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.target.src = placeholderImg;
                                                    e.target.onerror = null;
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{item.productId.name}</h3>
                                            <p className="text-sm font-bold text-gray-900">₹{item.productId.pricing?.selling_price || item.productId.price}</p>
                                        </div>
                                        <button
                                            onClick={() => addWishlistItemToCart(item.productId._id)}
                                            className="w-full py-3 text-xs font-bold uppercase tracking-wider border border-gray-200 rounded-xl hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all active:scale-[0.98]"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 pt-8 pb-16">
            {error && (
                <div className="max-w-7xl mx-auto px-4 mb-4">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                        <FaTimes className="w-4 h-4 p-0 flex-shrink-0" />
                        <p className="font-medium flex-1">{error}</p>
                        <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                            <FaTimes className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-8xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                    {/* Cart Items Section */}
                    <div className="lg:col-span-8 mb-6 lg:mb-0">
                        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-gray-100 gap-4">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === validCartItems.length}
                                            onChange={toggleSelectAll}
                                            className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-0 focus:ring-offset-0 cursor-pointer accent-black"
                                        />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                                        Select All ({validCartItems.length})
                                    </span>
                                </label>
                                {selectedItems.length > 0 && (
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                        {selectedItems.length} SELECTED
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
                                {validCartItems.map((item) => {
                                    const isSelected = selectedItems.includes(item.productId._id);
                                    const product = item.productId;
                                    const currentPrice = product.pricing?.selling_price || product.price || 0;
                                    const originalPrice = product.pricing?.mrp || product.originalPrice;

                                    return (
                                        <div
                                            key={product._id}
                                            className={`p-4 sm:p-6 transition-all duration-300 ${isSelected ? 'bg-primary/5' : 'bg-white'
                                                } border-b border-gray-100 last:border-0`}
                                        >
                                            <div className="flex gap-4 sm:gap-6">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleItemSelection(product._id)}
                                                        className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-0 focus:ring-offset-0 cursor-pointer accent-black"
                                                    />
                                                </div>

                                                <div
                                                    className="w-20 h-20 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 cursor-pointer"
                                                    onClick={() => navigate(`/product/${product._id}`)}
                                                >
                                                    <img
                                                        src={product.images?.[0] || placeholderImg}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                                        onError={(e) => {
                                                            e.target.src = placeholderImg;
                                                            e.target.onerror = null;
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h3
                                                                className="text-base sm:text-lg font-semibold text-gray-900 leading-tight cursor-pointer hover:text-primary transition-colors truncate sm:whitespace-normal"
                                                                onClick={() => navigate(`/product/${product._id}`)}
                                                            >
                                                                {product.name}
                                                            </h3>
                                                            <button
                                                                onClick={() => removeItem(product._id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                                            >
                                                                <FaTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-baseline gap-2 flex-wrap">
                                                            <span className="text-lg font-bold text-gray-900">₹{currentPrice.toFixed(2)}</span>
                                                            {originalPrice > currentPrice && (
                                                                <span className="text-sm text-gray-400 line-through">₹{originalPrice.toFixed(2)}</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {product.stock > 0 ? (
                                                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase">{product.stock} in stock</span>
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase">Out of Stock</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-between mt-4 gap-3">
                                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-9 sm:h-10 w-fit">
                                                            <button
                                                                onClick={() => updateQuantity(product._id, item.quantity - 1)}
                                                                disabled={updatingItem === product._id || item.quantity <= 1}
                                                                className="px-2 sm:px-3 h-full hover:bg-gray-50 disabled:opacity-30 transition-colors"
                                                            >
                                                                <FaMinus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            </button>
                                                            <span className="w-8 sm:w-10 text-center text-sm font-bold border-x border-gray-200 h-full flex items-center justify-center bg-white">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(product._id, item.quantity + 1)}
                                                                disabled={updatingItem === product._id || item.quantity >= (product.stock || 0)}
                                                                className="px-2 sm:px-3 h-full hover:bg-gray-50 disabled:opacity-30 transition-colors"
                                                            >
                                                                <FaPlus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="text-left xs:text-right">
                                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5 sm:hidden">Subtotal</p>
                                                            <p className="text-sm sm:text-base font-bold text-gray-900">
                                                                ₹{(currentPrice * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm sticky top-28 space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-6">Order Summary</h2>

                                {selectedItems.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 text-sm font-medium">
                                            Select items to see summary
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Subtotal ({selectedItems.length} items)</span>
                                            <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Estimated Tax</span>
                                            <span className="font-semibold text-gray-900">₹{tax.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Shipping</span>
                                            <span className="font-bold text-green-600 uppercase tracking-tighter">Free</span>
                                        </div>

                                        {savings > 0 && (
                                            <div className="flex justify-between text-sm bg-green-50 p-3 rounded-lg text-green-700">
                                                <span className="font-medium">Total Savings</span>
                                                <span className="font-bold">-₹{savings.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                                                <p className="text-3xl font-bold text-gray-900 tracking-tighter">₹{total.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCheckout}
                                    disabled={selectedItems.length === 0}
                                    className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all transform active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
                                >
                                    Proceed to Checkout
                                </button>

                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    Continue Shopping
                                </button>
                            </div>

                            <div className="pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                        <FaCheckCircle className="w-4 h-4" />
                                    </div>
                                    <p>Safe & Secure Checkout</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
