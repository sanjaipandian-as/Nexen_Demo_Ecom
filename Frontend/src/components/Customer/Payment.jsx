import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    MdCreditCard, MdAccountBalanceWallet, MdLocationOn, MdEdit,
    MdPerson, MdPhone, MdShoppingCart, MdLock, MdCheckCircle,
    MdArrowBack, MdErrorOutline, MdDelete, MdAdd, MdRemove,
    MdShoppingBag, MdPayments, MdOutlineSecurity, MdVerifiedUser,
    MdOutlineSpeed
} from 'react-icons/md';
import { SiVisa, SiMastercard, SiAmericanexpress, SiPaytm, SiGooglepay, SiPhonepe } from 'react-icons/si';
import API from '../../../api';
import placeholderImg from '../../assets/Placeholder.png';
import Skeleton from '../Common/Skeleton';


import { formatAddress } from '../../utils/addressHelper';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { shippingAddress, product: directProduct, quantity: directQuantity } = location.state || {};

    const [selectedMethod, setSelectedMethod] = useState('cod');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    const [upiId, setUpiId] = useState('');
    const [selectedWallet, setSelectedWallet] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState(shippingAddress || null);
    const [orderCreated, setOrderCreated] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [shippingAddressString, setShippingAddressString] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '', subMessage: '' });
    const [acceptPolicy, setAcceptPolicy] = useState(false);

    useEffect(() => {
        verifyCartAndPrepareAddress();
    }, []);

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ ...toast, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const verifyCartAndPrepareAddress = async () => {
        try {
            // ⭐ 1. Check if it's a Direct Buy Now flow
            if (directProduct) {
                setCartItems([{
                    productId: directProduct,
                    quantity: directQuantity || 1,
                    price: directProduct.pricing?.selling_price || directProduct.price || 0
                }]);

                if (!shippingAddress) await fetchAddresses();
                else {
                    setSelectedAddress(shippingAddress);
                    setShippingAddressString(formatAddress(shippingAddress));
                    setLoading(false);
                }
                return;
            }

            // ⭐ 2. Normal Cart Flow
            const response = await API.get('/cart');
            let items = response.data.items || [];

            // ⭐ 3. Filter by Selected Items (High Security)
            const selectedIdsStr = localStorage.getItem('selectedCartItems');
            if (selectedIdsStr) {
                const selectedIds = JSON.parse(selectedIdsStr);
                items = items.filter(item =>
                    selectedIds.includes(item.productId?._id) ||
                    selectedIds.includes(item._id)
                );
            }

            if (items.length === 0) {
                setToast({
                    show: true,
                    type: 'error',
                    message: 'Empty Selection',
                    subMessage: 'No items selected for payment.'
                });
                navigate('/Cart');
                return;
            }

            setCartItems(items);

            if (!shippingAddress) {
                await fetchAddresses();
            } else {
                setSelectedAddress(shippingAddress);
                setShippingAddressString(formatAddress(shippingAddress));
                setLoading(false);
            }
        } catch (error) {
            console.error('Error verifying cart/selection:', error);
            setError('Failed to verify items. Please try again.');
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const response = await API.get('/address');
            const userAddresses = response.data || [];
            setAddresses(userAddresses);

            if (userAddresses.length === 0) {
                setError('Please add a delivery address in Settings before placing an order.');
                setLoading(false);
                return;
            }

            const defaultAddr = userAddresses.find(addr => addr.isDefault);
            const addressToUse = defaultAddr || userAddresses[0];
            setSelectedAddressId(addressToUse._id);
            setSelectedAddress(addressToUse);

            setShippingAddressString(formatAddress(addressToUse));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setError('Failed to fetch addresses. Please try again.');
            setLoading(false);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await API.delete(`/cart/remove/${productId}`);
            const updatedItems = cartItems.filter(item =>
                (item.productId?._id || item.productId) !== productId
            );
            setCartItems(updatedItems);

            if (updatedItems.length === 0) {
                setToast({
                    show: true,
                    type: 'error',
                    message: 'Cart is Empty',
                    subMessage: 'Redirecting to home...'
                });
                setTimeout(() => navigate('/'), 2000);
            }
        } catch (error) {
            console.error('Error removing item:', error);
            setToast({
                show: true,
                type: 'error',
                message: 'Failed to Remove Item',
                subMessage: 'Please try again'
            });
        }
    };

    const handleUpdateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            await API.put('/cart/update', {
                productId,
                quantity: newQuantity
            });

            const updatedItems = cartItems.map(item => {
                if ((item.productId?._id || item.productId) === productId) {
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
            setCartItems(updatedItems);
        } catch (error) {
            console.error('Error updating quantity:', error);
            setToast({
                show: true,
                type: 'error',
                message: 'Failed to Update Quantity',
                subMessage: 'Please try again'
            });
        }
    };


    const handleSelectAddress = (address) => {
        setSelectedAddressId(address._id);
        setSelectedAddress(address);
        setShippingAddressString(formatAddress(address));
        setShowAddressModal(false);
    };

    const createOrder = async () => {
        if (orderCreated) return order;

        if (!selectedAddress) {
            setToast({
                show: true,
                type: 'error',
                message: 'Address Required',
                subMessage: 'Please select a shipping address'
            });
            return;
        }

        // Map address to unified structure for Order model
        const orderAddress = {
            street: selectedAddress.addressLine || selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            zipCode: selectedAddress.pincode || selectedAddress.zipCode,
            country: selectedAddress.country || 'India',
            mobile: selectedAddress.phone || selectedAddress.mobile
        };

        try {
            setProcessing(true);

            // ⭐ Prepare payload based on flow
            const payload = {
                shippingAddress: orderAddress,
                paymentMethod: selectedMethod === 'cod' ? 'cod' : 'online',
            };

            if (directProduct) {
                payload.directItems = [{
                    productId: directProduct._id,
                    quantity: directQuantity || 1
                }];
            } else {
                const selectedIdsStr = localStorage.getItem('selectedCartItems');
                if (selectedIdsStr) {
                    payload.cartItemIds = JSON.parse(selectedIdsStr);
                }
            }

            const response = await API.post('/orders/create', payload);
            setOrder(response.data.order);
            setOrderCreated(true);
            setError('');
            return response.data.order;
        } catch (error) {
            console.error('Error creating order:', error);
            const errorMessage = error.response?.data?.message || 'Failed to initiate order.';
            setToast({
                show: true,
                type: 'error',
                message: 'Order Creation Failed',
                subMessage: errorMessage
            });
            throw error;
        } finally {
            setProcessing(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) return;
        } else if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
            }
            if (formattedValue.length > 5) return;
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 3);
        }

        setCardDetails({ ...cardDetails, [name]: formattedValue });
    };

    const handleRazorpayPayment = async () => {
        try {
            setProcessing(true);

            const checkoutItems = cartItems.map(item => ({
                productId: item.productId?._id || item.productId,
                quantity: item.quantity,
                price: item.price || item.productId?.pricing?.selling_price || 0
            }));

            const { data } = await API.post('/payment/order', { items: checkoutItems });

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setToast({
                    show: true,
                    type: 'error',
                    message: 'Connection Error',
                    subMessage: 'Failed to load Payment Gateway. Check your internet connection.'
                });
                setProcessing(false);
                return;
            }

            // ⭐ Get user data for prefill
            const userStr = localStorage.getItem('user');
            const userData = userStr ? JSON.parse(userStr) : {};

            const options = {
                key: data.razorpayKey,
                amount: data.paymentOrder.amount,
                currency: data.paymentOrder.currency,
                name: 'AJIZZ FASHIONS',
                description: `Order Payment Session - ${Date.now()}`,
                image: '', // logo removed to fix CORS/loopback errors
                order_id: data.paymentOrder.id,
                prefill: {
                    name: userData.fullname || userData.name || userData.username || "",
                    email: userData.email || "",
                    contact: selectedAddress?.phone || userData.phone || ""
                },
                theme: {
                    color: "#E91E63", // Highlight color
                },
                handler: async function (response) {
                    try {
                        const orderAddress = {
                            street: selectedAddress.addressLine || selectedAddress.street,
                            city: selectedAddress.city,
                            state: selectedAddress.state,
                            zipCode: selectedAddress.pincode || selectedAddress.zipCode,
                            country: selectedAddress.country || 'India',
                            mobile: selectedAddress.phone || selectedAddress.mobile
                        };

                        const verifyResponse = await API.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderData: {
                                items: checkoutItems,
                                shippingAddress: orderAddress,
                                sourceCartItems: directProduct ? [] : cartItems
                            }
                        });

                        setOrder(verifyResponse.data.order);
                        setOrderCreated(true);

                        setToast({
                            show: true,
                            type: 'success',
                            message: 'Payment Successful!',
                            subMessage: 'Order Confirmed'
                        });

                        // Clear selection
                        localStorage.removeItem('selectedCartItems');

                        setTimeout(() => {
                            navigate('/');
                        }, 2000);
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        setToast({
                            show: true,
                            type: 'error',
                            message: 'Payment Verification Failed',
                            subMessage: 'Please contact support'
                        });
                    }
                },
                modal: {
                    ondismiss: async function () {
                        // Sequence aborted by user. 
                        // With the new protocol, no database order exists yet.
                        setProcessing(false);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error('Payment error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to initiate payment. Please try again.';
            setToast({
                show: true,
                type: 'error',
                message: 'Payment Blocked',
                subMessage: errorMsg
            });
            setProcessing(false);
        }
    };

    const handleCODPayment = async () => {
        try {
            setProcessing(true);

            let currentOrder = order;
            if (!orderCreated) {
                currentOrder = await createOrder();
            }

            if (!currentOrder) {
                setToast({
                    show: true,
                    type: 'error',
                    message: 'Failed to Create Order',
                    subMessage: 'Please try again'
                });
                setProcessing(false);
                return;
            }

            setToast({
                show: true,
                type: 'success',
                message: 'Order Placed Successfully!',
                subMessage: 'Order Confirmed - Pay on Delivery'
            });

            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (error) {
            console.error('COD order error:', error);
            setToast({
                show: true,
                type: 'error',
                message: 'Failed to Place Order',
                subMessage: 'Please try again'
            });
            setProcessing(false);
        }
    };

    const handlePayment = () => {
        if (processing || orderCreated) {
            console.log('Payment already in progress or order already created');
            return;
        }

        if (!acceptPolicy) {
            setToast({
                show: true,
                type: 'error',
                message: 'Policy Acceptance Required',
                subMessage: 'Please accept the policies to continue'
            });
            return;
        }

        if (selectedMethod === 'cod') {
            handleCODPayment();
        } else {
            handleRazorpayPayment();
        }
    };

    const calculateTotal = () => {
        if (order) return order.totalAmount || 0;
        if (cartItems.length === 0) return 0;

        return cartItems.reduce((sum, item) => {
            const itemPrice = item.price || item.productId?.pricing?.selling_price || item.productId?.price || 0;
            const itemQuantity = item.quantity || 1;
            return sum + (itemPrice * itemQuantity);
        }, 0);
    };

    const total = calculateTotal();
    const subtotal = total; // Simple subtotal for now as we don't have separate taxes/etc. in calculation

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 font-['Inter']">
                <div className="bg-white border-b border-slate-200 p-4 shadow-sm">
                    <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-64" />
                                <Skeleton className="h-4 w-96" />
                            </div>
                            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6">
                                <Skeleton className="h-10 w-48" />
                                <div className="space-y-4">
                                    {[...Array(2)].map((_, i) => (
                                        <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-2xl">
                                            <Skeleton className="w-24 h-24 rounded-xl" />
                                            <div className="flex-1 space-y-3">
                                                <Skeleton className="h-5 w-1/2" />
                                                <Skeleton className="h-4 w-1/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center font-['Inter']">
                <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MdErrorOutline className="w-10 h-10 text-rose-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Checkout Interrupted</h2>
                    <p className="text-slate-500 mb-8">{error}</p>
                    <div className="flex flex-col gap-3">
                        {error.includes('address') ? (
                            <button
                                onClick={() => navigate('/Settings')}
                                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
                            >
                                UPDATE DELIVERY ADDRESS
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
                            >
                                RETURN TO HOME
                            </button>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                        >
                            TRY AGAIN
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-['Inter'] selection:bg-rose-100 selection:text-rose-600">
            {/* Custom Toast System */}
            {toast.show && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 animate-slideDown">
                    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${toast.type === 'success'
                        ? 'bg-white/90 border-emerald-100'
                        : 'bg-white/90 border-rose-100'
                        }`}>
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                            }`}>
                            {toast.type === 'success' ? (
                                <MdCheckCircle className="w-6 h-6" />
                            ) : (
                                <MdErrorOutline className="w-6 h-6" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">
                                {toast.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {toast.subMessage}
                            </p>
                        </div>
                        <button
                            onClick={() => setToast({ ...toast, show: false })}
                            className="text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <MdDelete className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Premium Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-3 text-slate-500 hover:text-rose-500 font-black text-xs uppercase tracking-widest transition-all"
                        >
                            <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-rose-100 group-hover:bg-rose-50 transition-all">
                                <MdArrowBack className="w-3 h-3" />
                            </div>
                            Back
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                            <MdLock className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Secure SSL Encryption</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Main Flow */}
                    <div className="lg:col-span-8 space-y-10">
                        <header className="mb-12">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-[10px] font-black">01</span>
                                <div className="h-[1px] flex-1 bg-slate-100"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Checkout Sequence</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                                Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500">Manifest.</span>
                            </h1>
                            <p className="text-sm font-bold text-slate-400 max-w-lg">Finalize your high-end selection and establish the delivery terminal for your premium assets.</p>
                        </header>

                        {/* Order Items Segment */}
                        <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -ml-16 -mt-16"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-slate-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200">
                                            <MdShoppingBag className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">The Manifest</h2>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{(order?.items?.length || cartItems.length)} Curated Units</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {(order?.items || cartItems)?.map((item, index) => {
                                        const productId = item.productId?._id || item.productId;
                                        const productImage = item.productId?.images?.[0] || item.images?.[0] || placeholderImg;
                                        const productName = item.productId?.name || item.name || `Exclusive Product`;
                                        const itemPrice = item.price || item.productId?.pricing?.selling_price || item.productId?.price || 0;

                                        return (
                                            <div key={index} className="group relative flex flex-col md:flex-row gap-8 p-8 rounded-[2.5rem] bg-slate-50 border border-transparent hover:border-slate-100 hover:bg-white transition-all duration-700">
                                                {!order && (
                                                    <button
                                                        onClick={() => handleRemoveItem(productId)}
                                                        className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <MdDelete className="w-3 h-3" />
                                                    </button>
                                                )}

                                                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                                    <img
                                                        src={productImage}
                                                        alt={productName}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                        onError={(e) => { e.target.src = placeholderImg; }}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div>
                                                            <h3 className="font-black text-slate-900 text-base mb-1 truncate">{productName}</h3>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.productId?.category?.main || 'FASHION'}</p>
                                                        </div>

                                                        <div className="flex items-center gap-6 mt-4">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Qty</span>
                                                                {!order ? (
                                                                    <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200">
                                                                        <button onClick={() => handleUpdateQuantity(productId, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><MdRemove className="w-2 h-2" /></button>
                                                                        <span className="px-3 font-black text-slate-900 text-xs">{item.quantity}</span>
                                                                        <button onClick={() => handleUpdateQuantity(productId, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"><MdAdd className="w-2 h-2" /></button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="font-black text-slate-900 text-xs bg-white px-3 py-1 rounded-lg border border-slate-100">{item.quantity}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Price</span>
                                                                <span className="text-sm font-black text-slate-900">₹{itemPrice.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-right border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
                                                    <p className="text-xl font-black text-slate-900">₹{(itemPrice * item.quantity).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Delivery Segment */}
                        <section className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-[100px] -mr-32 -mt-32 transition-all group-hover:scale-125"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                                            <MdLocationOn className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-slate-900">Logistics Node</h2>
                                            <p className="text-xs font-bold text-slate-400">Specify the final terminal for delivery</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAddressModal(true)}
                                        className="px-6 py-3 bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                    >
                                        Modify Address
                                    </button>
                                </div>

                                <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] group-hover:bg-white transition-all duration-500 shadow-inner">
                                    <div className="flex items-start gap-5">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
                                            <MdVerifiedUser className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded uppercase tracking-widest border border-emerald-100">Verified Endpoint</span>
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{selectedAddress?.fullname || 'RECIPIENT'}</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed mb-4">
                                                {shippingAddressString || shippingAddress || 'Logical endpoint not established.'}
                                            </p>
                                            <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-100">
                                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><MdPhone className="w-3.5 h-3.5 text-slate-300" /> {selectedAddress?.phone || 'NO CONTACT'}</span>
                                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><MdOutlineSecurity className="w-3.5 h-3.5 text-slate-300" /> Secure Drop-off</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Payment Segment */}
                        <section className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-48 h-48 bg-rose-50 rounded-full blur-[80px] -mr-24 -mb-24 opacity-30"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                                        <MdCreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Financial Protocol</h2>
                                        <p className="text-xs font-bold text-slate-500">Select your authorized settlement channel</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div
                                        onClick={() => setSelectedMethod('online')}
                                        className={`relative group cursor-pointer p-8 rounded-[2rem] border-2 transition-all duration-700 ${selectedMethod === 'online'
                                            ? 'border-rose-500 bg-rose-50/20 shadow-xl shadow-rose-100'
                                            : 'border-slate-50 bg-slate-50/50 hover:border-rose-200 hover:bg-white hover:shadow-xl hover:shadow-slate-100'}`}
                                    >
                                        <div className="flex flex-col h-full justify-between gap-8">
                                            <div className="flex justify-between items-start">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${selectedMethod === 'online' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 rotate-6' : 'bg-white text-slate-300 border border-slate-100'}`}>
                                                    <MdAccountBalanceWallet className="w-7 h-7" />
                                                </div>
                                                {selectedMethod === 'online' ? (
                                                    <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg animate-in zoom-in">
                                                        <MdCheckCircle className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 text-lg mb-1 leading-tight tracking-tight uppercase">Digital Gateway</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Instant Settlement</p>
                                            </div>
                                            <div className="flex items-center gap-3 grayscale group-hover:grayscale-0 transition-all duration-500 opacity-40 group-hover:opacity-100">
                                                <SiVisa className="w-8 h-8" />
                                                <SiMastercard className="w-8 h-8" />
                                                <SiGooglepay className="w-8 h-8" />
                                                <SiPhonepe className="w-8 h-8" />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setSelectedMethod('cod')}
                                        className={`relative group cursor-pointer p-8 rounded-[2rem] border-2 transition-all duration-700 ${selectedMethod === 'cod'
                                            ? 'border-slate-900 bg-slate-900 text-white shadow-2xl shadow-slate-300'
                                            : 'border-slate-50 bg-slate-50/50 hover:border-slate-300 hover:bg-white hover:shadow-xl hover:shadow-slate-100'}`}
                                    >
                                        <div className="flex flex-col h-full justify-between gap-8">
                                            <div className="flex justify-between items-start">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${selectedMethod === 'cod' ? 'bg-white text-slate-900 shadow-xl -rotate-6' : 'bg-white text-slate-300 border border-slate-100'}`}>
                                                    <MdPayments className="w-7 h-7" />
                                                </div>
                                                {selectedMethod === 'cod' ? (
                                                    <div className="w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg animate-in zoom-in">
                                                        <MdCheckCircle className="w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-lg mb-1 leading-tight tracking-tight uppercase ${selectedMethod === 'cod' ? 'text-white' : 'text-slate-900'}`}>Handover Cash</h3>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${selectedMethod === 'cod' ? 'text-slate-400' : 'text-slate-400'}`}>On-site Terminal Payment</p>
                                            </div>
                                            <div className={`px-4 py-1 rounded-xl self-start text-[8px] font-black uppercase tracking-widest transition-all ${selectedMethod === 'cod' ? 'bg-white/10 text-white border border-white/20' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                Regional Availability
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28 space-y-6">
                            <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                                {/* Interactive Glossy Effect */}
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                                {/* Decorator Nodes */}
                                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-600/20 rounded-full blur-[80px] animate-pulse"></div>
                                <div className="absolute top-1/4 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-1000"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-12">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Settlement Hub</h2>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-slate-800"></div>)}
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-12 pb-12 border-b border-slate-800/50">
                                        <div className="flex justify-between items-center group/item">
                                            <span className="text-xs font-bold text-slate-400 group-hover/item:text-slate-200 transition-colors">Gross Value</span>
                                            <span className="font-black tracking-tight">₹{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-400">Logistics</span>
                                                <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">ESTABLISHED</span>
                                            </div>
                                            <span className="text-[10px] font-black text-emerald-400">COMPLIMENTARY</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-400">Fiscal Levies</span>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Inclusive</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mb-10">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Final Settlement</p>
                                            <p className="text-4xl font-black tracking-tighter text-white">₹{total.toLocaleString()}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <MdOutlineSpeed className="text-rose-500 text-lg mb-1 animate-pulse" />
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Instant Release</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <label className="flex items-start gap-4 cursor-pointer group/policy">
                                            <div className="relative mt-0.5">
                                                <input
                                                    type="checkbox"
                                                    checked={acceptPolicy}
                                                    onChange={(e) => setAcceptPolicy(e.target.checked)}
                                                    className="peer appearance-none w-5 h-5 rounded-lg border-2 border-slate-700 bg-slate-800 transition-all checked:bg-rose-500 checked:border-rose-500 cursor-pointer"
                                                />
                                                <MdCheckCircle className="absolute top-0 left-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none p-0.5" />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-400 leading-relaxed group-hover/policy:text-slate-300 transition-colors">
                                                I authorize the transaction and agree to the <a href="/privacy" className="text-white hover:text-rose-400 underline decoration-rose-500/30 underline-offset-4">Privacy Protocols</a> and <a href="/terms" className="text-white hover:text-rose-400 underline decoration-rose-500/30 underline-offset-4">Service Terms</a>.
                                            </span>
                                        </label>
                                    </div>

                                    <button
                                        onClick={handlePayment}
                                        disabled={processing}
                                        className={`relative w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] transition-all overflow-hidden ${processing
                                            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:from-rose-500 hover:to-pink-500 active:scale-95 shadow-[0_20px_40px_rgba(225,29,72,0.3)]'
                                            }`}
                                    >
                                        <div className="relative z-10 flex items-center justify-center gap-3">
                                            {processing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
                                                    Verifying Assets...
                                                </>
                                            ) : (
                                                <>
                                                    <MdLock className="w-3.5 h-3.5" />
                                                    Commit Transaction
                                                </>
                                            )}
                                        </div>
                                        {/* Animated light beam effect */}
                                        {!processing && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-shimmer" />
                                        )}
                                    </button>

                                    <div className="mt-6 flex items-center justify-center gap-2">
                                        <div className="h-[1px] w-4 bg-slate-800"></div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                            Secure Encrypted Node
                                        </p>
                                        <div className="h-[1px] w-4 bg-slate-800"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 mb-3">
                                        <MdCheckCircle />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Guaranteed Original</p>
                                </div>
                                <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mb-3">
                                        <MdShoppingBag />
                                    </div>
                                    <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Vetted Suppliers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 sm:p-6 animate-fadeIn">
                    <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Select Destination</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Found {addresses.length} Saved Addresses</p>
                            </div>
                            <button
                                onClick={() => setShowAddressModal(false)}
                                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all font-black text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-8 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
                            {addresses.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <MdLocationOn className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-bold mb-6">No saved addresses found in your account.</p>
                                    <button
                                        onClick={() => navigate('/Settings')}
                                        className="px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
                                    >
                                        Go to Settings
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-4">
                                        {addresses.map((address) => (
                                            <div
                                                key={address._id}
                                                onClick={() => handleSelectAddress(address)}
                                                className={`group relative border-2 rounded-3xl p-6 cursor-pointer transition-all duration-300 ${selectedAddressId === address._id ? 'border-rose-500 bg-rose-50/20' : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-6">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <h3 className={`font-black uppercase tracking-tight ${selectedAddressId === address._id ? 'text-rose-600' : 'text-slate-900'}`}>{address.fullname}</h3>
                                                            {address.isDefault && (
                                                                <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded uppercase tracking-widest">Main</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-500 leading-relaxed mb-4">{address.addressLine}</p>
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 bg-white rounded flex items-center justify-center shadow-sm"><MdPhone className="w-2 h-2 text-slate-400" /></div>
                                                                <span className="text-[10px] font-black text-slate-400">{address.phone}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-4 h-4 bg-white rounded flex items-center justify-center shadow-sm"><MdLocationOn className="w-2 h-2 text-slate-400" /></div>
                                                                <span className="text-[10px] font-black text-slate-400">{address.city}, {address.pincode}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selectedAddressId === address._id ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-200 bg-white'}`}>
                                                        {selectedAddressId === address._id && <MdCheckCircle className="w-4 h-4" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => navigate('/Settings')}
                                        className="w-full py-5 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all font-black text-[10px] uppercase tracking-[0.3em]"
                                    >
                                        + Enroll New Address
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payment;
