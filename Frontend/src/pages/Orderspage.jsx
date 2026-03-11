import React, { useState, useEffect } from 'react';
import { FaBox, FaCheckCircle, FaTruck, FaTimesCircle, FaClock, FaMapMarkerAlt, FaRupeeSign, FaCalendar, FaShoppingBag, FaChevronDown, FaChevronUp, FaCreditCard, FaSearch, FaHistory, FaDownload, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { MdOutlineReceipt, MdFilterList, MdErrorOutline, MdClose, MdCloudUpload, MdAccountBalance, MdQrCodeScanner, MdOutlinePrivacyTip } from 'react-icons/md';
import API from '../../api';
import placeholderImg from '../assets/Placeholder.png';
import noOrdersImg from '../assets/admin/no_pending_requests.png';
import { formatAddress } from '../utils/addressHelper';
import Skeleton from '../components/Common/Skeleton';


const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [dateFilter, setDateFilter] = useState('all'); // all, today, yesterday, thisWeek, lastWeek, thisMonth, custom
    const [customDate, setCustomDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [error, setError] = useState('');

    // Cancellation/Return State
    const [actionOrderId, setActionOrderId] = useState(null);
    const [actionType, setActionType] = useState(null); // 'cancel' or 'return'
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Refund details state
    const [refundType, setRefundType] = useState('upi'); // 'upi' or 'bank'
    const [refundUpi, setRefundUpi] = useState('');
    const [refundAccount, setRefundAccount] = useState({
        accountNumber: '',
        ifscCode: '',
        beneficiaryName: ''
    });
    const [returnImages, setReturnImages] = useState([]); // 📸 NEW: Image upload state
    const [useManualRefund, setUseManualRefund] = useState(false); // ⭐ NEW: Toggle for manual refund on online payments

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await API.get('/orders');
            // Sort by last order first
            const sortedOrders = (response.data.orders || []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sortedOrders);
            setError('');
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    // Close expanded order when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const card = event.target.closest('.order-card-container');
            // If the user clicked outside the CURRENTLY expanded card
            if (expandedOrder && (!card || card.getAttribute('data-order-id') !== expandedOrder)) {
                setExpandedOrder(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [expandedOrder]);

    const handleOrderAction = async () => {
        if (!reason.trim()) {
            alert('Please provide a reason');
            return;
        }

        const activeOrder = orders.find(o => o._id === actionOrderId);

        // Validation for Refund Details (Standard for COD, Optional for Online via Manual Toggle)
        let refundDetails = null;
        if (activeOrder?.paymentMethod === 'cod' || useManualRefund) {
            if (refundType === 'upi') {
                if (!refundUpi.trim()) {
                    alert('Please provide your UPI ID for settlement.');
                    return;
                }
                refundDetails = { accountType: 'upi', upiId: refundUpi };
            } else {
                if (!refundAccount.accountNumber || !refundAccount.ifscCode || !refundAccount.beneficiaryName) {
                    alert('Please provide complete bank details for secure settlement.');
                    return;
                }
                refundDetails = {
                    accountType: 'bank',
                    ...refundAccount
                };
            }
        }

        try {
            setSubmitting(true);
            const endpoint = actionType === 'cancel' ? `/orders/cancel/${actionOrderId}` : `/orders/return/${actionOrderId}`;

            // 📸 ⭐ USE FORMDATA FOR IMAGE UPLOADS
            const formData = new FormData();
            formData.append('reason', reason);

            if (refundDetails) {
                formData.append('refundAccountDetails', JSON.stringify(refundDetails));
            }

            // Append return images
            if (actionType === 'return' && returnImages.length > 0) {
                returnImages.forEach((img) => {
                    formData.append('images', img);
                });
            }

            await API.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Refresh orders and reset state
            await fetchOrders();
            resetActionState();
        } catch (error) {
            console.error(`Error ${actionType}ing order:`, error);
            alert(error.response?.data?.message || `Failed to ${actionType} order`);
        } finally {
            setSubmitting(false);
        }
    };

    const resetActionState = () => {
        setActionOrderId(null);
        setActionType(null);
        setReason('');
        setRefundType('upi');
        setRefundUpi('');
        setRefundAccount({
            accountNumber: '',
            ifscCode: '',
            beneficiaryName: ''
        });
        setReturnImages([]);
        setUseManualRefund(false);
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const renderOrderCard = (order, idx) => {
        const isExpanded = expandedOrder === order._id;
        const firstItem = order.items?.[0];
        const itemImage = firstItem?.productId?.images?.[0] || placeholderImg;
        const itemName = firstItem?.productId?.name || 'Standard Product Item';
        const itemPrice = firstItem?.price || firstItem?.productId?.pricing?.selling_price || 0;
        const itemCount = order.items?.length || 0;
        const destinationCity = order.shippingAddress?.city || 'Shipping Address';

        return (
            <div
                key={order._id}
                data-order-id={order._id}
                className={`order-card-container group relative bg-white rounded-[2.5rem] p-7 border-2 transition-all duration-700 flex flex-col ${isExpanded
                    ? 'lg:col-span-1 border-[#E91E63]/20 shadow-2xl shadow-rose-100 z-50'
                    : 'border-slate-50 hover:border-slate-200 hover:shadow-2xl hover:shadow-slate-200 h-full z-10'
                    }`}
                style={{ animationDelay: `${idx * 50}ms` }}
            >
                <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                    {/* Luxury Background Pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                    {/* Order Identity Block */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#E91E63] animate-pulse" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Transaction Registry</p>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                #{order._id.slice(-8).toUpperCase()}
                            </h3>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                        </div>
                    </div>

                    {/* Logistics Ribbon */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 flex flex-col">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Origin Node</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-[8px]"><FaBox /></div>
                                Warehouse, IN
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-[1px] bg-slate-100" />
                            <FaTruck className="text-[10px] text-slate-300 my-1" />
                            <div className="w-8 h-[1px] bg-slate-100" />
                        </div>
                        <div className="flex-1 flex flex-col items-end text-right">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Final Point</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                {destinationCity}
                                <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-[8px]"><FaMapMarkerAlt /></div>
                            </div>
                        </div>
                    </div>

                    {/* Premium Asset Preview */}
                    <div className="relative mb-8 group/asset">
                        <div className="absolute -inset-2 bg-gradient-to-br from-slate-100 to-transparent rounded-[2.5rem] opacity-0 group-hover/asset:opacity-100 transition-opacity duration-500" />
                        <div className="relative flex items-center gap-5 p-4 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 backdrop-blur-sm">
                            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg border-4 border-white overflow-hidden flex-shrink-0">
                                <img
                                    src={itemImage}
                                    alt={itemName}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/asset:scale-110"
                                    onError={(e) => { e.target.src = placeholderImg; }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-[#E91E63] uppercase tracking-widest mb-1">{firstItem?.productId?.category?.main || 'ELITE PIECE'}</p>
                                <h4 className="font-black text-slate-900 text-sm leading-tight truncate uppercase tracking-tight">{itemName}</h4>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[11px] font-black text-slate-900">₹{itemPrice.toLocaleString()}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-bold text-slate-400">UNIT: {firstItem?.quantity || 1}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Threshold */}
                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50">
                        <div>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Aggregate Registry</p>
                            <p className="text-[11px] font-black text-slate-900 uppercase">{itemCount} Portfolio {itemCount === 1 ? 'Asset' : 'Assets'}</p>
                        </div>
                        <button
                            onClick={() => toggleOrderDetails(order._id)}
                            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${isExpanded
                                ? 'bg-[#E91E63] text-white shadow-2xl shadow-rose-200 scale-105'
                                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200'
                                }`}
                        >
                            {isExpanded ? 'Collapse' : 'Inspect'}
                        </button>
                    </div>

                    {/* Expanded Intelligence Sheet */}
                    {isExpanded && (
                        <div className="absolute -left-7 top-[calc(100%+1.5rem)] w-[calc(100%+3.5rem)] bg-white rounded-[2.5rem] border-2 border-[#E91E63]/20 shadow-2xl p-7 z-50 space-y-8 animate-fadeIn transform origin-top transition-all duration-300">
                            {/* Data Matrix */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <FaCreditCard className="text-slate-300" /> Channel
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-800">{getPaymentMethodLabel(order.paymentMethod)}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400" /> Invoice
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-800 capitalize">{order.paymentStatus}</p>
                                </div>
                            </div>

                            {/* Manifest List */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                    Manifest Summary
                                    <div className="flex-1 h-[1px] bg-slate-100" />
                                </h4>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-white border border-slate-50 rounded-3xl hover:border-slate-200 transition-all group/item">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0">
                                                <img src={item.productId?.images?.[0] || placeholderImg} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{item.productId?.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</p>
                                            </div>
                                            <p className="text-xs font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Intervention Protocol Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-100 mt-2">
                                {!['shipped', 'delivered', 'cancelled', 'return_requested', 'cancellation_requested'].includes(order.status) && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActionOrderId(order._id); setActionType('cancel'); }}
                                        className="py-4 bg-rose-50 text-rose-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-rose-100 transition-all font-black"
                                    >
                                        Terminate
                                    </button>
                                )}
                                {order.status === 'delivered' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setActionOrderId(order._id); setActionType('return'); }}
                                        className="py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 font-black"
                                    >
                                        Return
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const calculateOrderTotal = (order) => {
        // If totalAmount exists and is valid, use it
        if (order.totalAmount && order.totalAmount > 0) {
            return order.totalAmount;
        }
        // Otherwise calculate from items
        if (order.items && order.items.length > 0) {
            return order.items.reduce((total, item) => {
                const itemPrice = item.price || item.productId?.pricing?.selling_price || item.productId?.price || 0;
                const itemQuantity = item.quantity || 1;
                return total + (itemPrice * itemQuantity);
            }, 0);
        }
        return 0;
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending_payment': 'bg-amber-50 text-amber-600 border-amber-100',
            'paid': 'bg-blue-50 text-blue-600 border-blue-100',
            'packed': 'bg-purple-50 text-purple-600 border-purple-100',
            'shipped': 'bg-indigo-50 text-indigo-600 border-indigo-100',
            'delivered': 'bg-green-50 text-green-600 border-green-100',
            'cancelled': 'bg-red-50 text-red-600 border-red-100',
            'cancellation_requested': 'bg-orange-50 text-orange-600 border-orange-100',
            'return_requested': 'bg-rose-50 text-rose-600 border-rose-100',
            'returning': 'bg-cyan-50 text-cyan-600 border-cyan-100',
            'returned': 'bg-gray-50 text-gray-600 border-gray-100',
            'refund_initiated': 'bg-teal-50 text-teal-600 border-teal-100',
            'refunded': 'bg-emerald-50 text-emerald-600 border-emerald-100'
        };
        return colors[status] || 'bg-gray-50 text-gray-500 border-gray-100';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'pending_payment': <FaClock className="w-3 h-3 sm:w-4 sm:h-4" />,
            'paid': <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
            'packed': <FaBox className="w-3 h-3 sm:w-4 sm:h-4" />,
            'shipped': <FaTruck className="w-3 h-3 sm:w-4 sm:h-4" />,
            'delivered': <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
            'cancelled': <FaTimesCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
            'return_requested': <FaClock className="w-3 h-3 sm:w-4 sm:h-4" />,
            'refund_initiated': <FaClock className="w-3 h-3 sm:w-4 sm:h-4" />,
            'refunded': <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        };
        return icons[status] || <FaClock className="w-3 h-3 sm:w-4 sm:h-4" />;
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending_payment': 'Pending Payment',
            'paid': 'Paid',
            'packed': 'Packed',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled',
            'cancellation_requested': 'Cancellation Requested',
            'return_requested': 'Return Requested',
            'return_approved': 'Return Approved',
            'return_rejected': 'Return Rejected',
            'returned': 'Returned',
            'refund_initiated': 'Refund Initiated',
            'refunded': 'Refunded'
        };
        return labels[status] || status.replace('_', ' ').toUpperCase();
    };

    const getPaymentMethodLabel = (method) => {
        return method === 'cod' ? 'Cash on Delivery' : 'Online Payment';
    };

    const getPaymentMethodIcon = (method) => {
        return method === 'cod' ? '💵' : '💳';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 p-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[200px]">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-11 w-32 rounded-xl" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }


    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
                <FaTimesCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mb-4" />
                <p className="text-gray-600 text-base sm:text-lg mb-4 text-center">{error}</p>
                <button
                    onClick={fetchOrders}
                    className="px-6 py-3 bg-[#E91E63] text-white font-semibold rounded-xl hover:bg-[#E91E63]/90 transition-all shadow-lg text-sm sm:text-base"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4">
                <FaShoppingBag className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 mb-4 sm:mb-6" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">No Orders Yet</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base text-center">Start shopping to see your orders here</p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#E91E63] to-[#E91E63]/90 text-white font-semibold rounded-xl hover:from-[#E91E63]/90 hover:to-[#E91E63] transition-all shadow-lg text-sm sm:text-base"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    const stats = {
        total: orders.length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        processing: orders.filter(o => ['paid', 'packed', 'shipped'].includes(o.status)).length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchTerm === '' ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items?.some(item => item.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        const orderDate = new Date(order.createdAt);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfLastWeek = new Date(startOfWeek); startOfLastWeek.setDate(startOfWeek.getDate() - 7);
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        let matchesDate = true;
        if (dateFilter === 'today') matchesDate = orderDate >= today;
        else if (dateFilter === 'yesterday') matchesDate = orderDate >= yesterday && orderDate < today;
        else if (dateFilter === 'thisWeek') matchesDate = orderDate >= startOfWeek;
        else if (dateFilter === 'lastWeek') matchesDate = orderDate >= startOfLastWeek && orderDate < startOfWeek;
        else if (dateFilter === 'thisMonth') matchesDate = orderDate >= startOfMonth;
        else if (dateFilter === 'custom' && customDate) {
            const selected = new Date(customDate);
            selected.setHours(0, 0, 0, 0);
            const nextDay = new Date(selected);
            nextDay.setDate(selected.getDate() + 1);
            matchesDate = orderDate >= selected && orderDate < nextDay;
        }
        return matchesSearch && matchesStatus && matchesDate;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen bg-gray-50/30">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#E91E63]/10 rounded-2xl flex items-center justify-center">
                            <FaHistory className="text-[#E91E63] text-2xl" />
                        </div>
                        My Orders
                    </h1>
                    <p className="text-gray-400 font-bold mt-2 ml-16">Track your packages and manage returns</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-105">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Total</p>
                        <p className="text-xl font-black text-gray-900 leading-none">{stats.total}</p>
                    </div>
                    <div className="px-5 py-3 bg-green-50 rounded-2xl border border-green-100 shadow-sm transition-transform hover:scale-105">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600 mb-1">Delivered</p>
                        <p className="text-xl font-black text-green-700 leading-none">{stats.delivered}</p>
                    </div>
                </div>
            </div>

            {/* Premium Filter Controls */}
            <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search Field */}
                    <div className="relative flex-1 group">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E91E63] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or Product Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#E91E63]/20 focus:outline-none transition-all font-bold text-gray-700 placeholder:text-gray-300 shadow-inner"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter */}
                        <div className="relative min-w-[160px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full h-[52px] pl-4 pr-10 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[#E91E63]/20 focus:outline-none appearance-none font-black text-xs uppercase tracking-wider text-gray-600 cursor-pointer shadow-inner"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending_payment">Pending Payment</option>
                                <option value="paid">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <MdFilterList className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Date Picker */}
                        <div className="flex items-center gap-3 bg-gray-50 px-4 h-[52px] rounded-2xl border-2 border-transparent focus-within:border-[#E91E63]/20 shadow-inner">
                            <FaCalendar className="text-gray-300" />
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => {
                                    setCustomDate(e.target.value);
                                    setDateFilter('custom');
                                }}
                                className="bg-transparent border-none outline-none text-xs font-black text-gray-600 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Date Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'all', label: 'All Orders' },
                        { id: 'today', label: "Today" },
                        { id: 'yesterday', label: 'Yesterday' },
                        { id: 'thisWeek', label: 'This Week' },
                        { id: 'lastWeek', label: 'Last Week' },
                        { id: 'thisMonth', label: 'This Month' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => {
                                setDateFilter(f.id);
                                setCustomDate('');
                            }}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${dateFilter === f.id
                                ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200 scale-105'
                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Feed */}
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border-4 border-dashed border-gray-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <MdErrorOutline className="w-12 h-12 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-1 tracking-tight">No Matching Orders</h3>
                    <p className="text-gray-400 font-bold text-sm">Try adjusting your filters or search term</p>
                    <button
                        onClick={() => {
                            setDateFilter('all');
                            setSearchTerm('');
                            setStatusFilter('all');
                            setCustomDate('');
                        }}
                        className="mt-6 px-6 py-2 bg-[#E91E63]/10 text-[#E91E63] text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#E91E63] hover:text-white transition-all"
                    >
                        Clear All Filters
                    </button>
                </div>
            ) : (
                <div className="space-y-16 pb-12">
                    {/* 1. ACTIVE LOGISTICS: Paid, Packed, Shipped */}
                    {filteredOrders.filter(o => ['paid', 'packed', 'shipped'].includes(o.status)).length > 0 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-6 px-2">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">Active Logistics</h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                                <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">IN TRANSIT</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredOrders
                                    .filter(o => ['paid', 'packed', 'shipped'].includes(o.status))
                                    .map((order, idx) => renderOrderCard(order, idx))}
                            </div>
                        </div>
                    )}

                    {/* 2. PENDING SETTLEMENT: Pending Payment, Requested Actions */}
                    {filteredOrders.filter(o => ['pending_payment', 'cancellation_requested', 'return_requested'].includes(o.status)).length > 0 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-6 px-2">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">Pending Settlement</h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                                <span className="text-[10px] font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">ACTION REQUIRED</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredOrders
                                    .filter(o => ['pending_payment', 'cancellation_requested', 'return_requested'].includes(o.status))
                                    .map((order, idx) => renderOrderCard(order, idx))}
                            </div>
                        </div>
                    )}

                    {/* 3. REGISTRY ARCHIVE: Delivered, Returned, Cancelled */}
                    {filteredOrders.filter(o => ['delivered', 'returned', 'refunded', 'cancelled', 'return_approved'].includes(o.status)).length > 0 && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-6 px-2">
                                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.4em]">Registry Archive</h2>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">LOGGED</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-80 hover:opacity-100 transition-opacity">
                                {filteredOrders
                                    .filter(o => ['delivered', 'returned', 'refunded', 'cancelled', 'return_approved'].includes(o.status))
                                    .map((order, idx) => renderOrderCard(order, idx))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {actionOrderId && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 animate-slideUp">
                        {/* Header */}
                        <div className={`relative px-8 py-10 text-white overflow-hidden ${actionType === 'cancel'
                            ? 'bg-gradient-to-br from-rose-600 via-rose-500 to-pink-600'
                            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
                            }`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                            <button
                                onClick={resetActionState}
                                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all text-white backdrop-blur-sm"
                            >
                                <MdClose className="text-xl" />
                            </button>

                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
                                    Secure Refund Process
                                </span>
                                <h3 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                                    {actionType === 'cancel' ? <MdErrorOutline className="text-white/80" /> : <FaHistory className="text-white/80" />}
                                    {actionType === 'cancel' ? 'Cancel Order' : 'Return Order'}
                                </h3>
                                <p className="text-white/70 font-medium text-sm max-w-md">
                                    {actionType === 'cancel'
                                        ? 'Please provide a reason for cancelling your order.'
                                        : 'Tell us why you want to return this product and upload any photos if necessary.'}
                                </p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-10">
                                {/* Reason Segment */}
                                <div>
                                    <h4 className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        1. Reason for Request
                                    </h4>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder={`Describe the reason for this ${actionType}...`}
                                        className="w-full h-32 px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:bg-white focus:border-rose-200 focus:outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300 shadow-inner"
                                    />
                                </div>

                                {/* Upload Photos (Return Only) */}
                                {actionType === 'return' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h4 className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            2. Upload Photos
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <label className="relative flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:bg-slate-100/50 hover:border-amber-300 transition-all group cursor-pointer">
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files);
                                                        setReturnImages(prev => [...prev, ...files].slice(0, 5));
                                                    }}
                                                    className="hidden"
                                                />
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-all">
                                                    <MdCloudUpload className="text-2xl" />
                                                </div>
                                                <p className="mt-4 text-[10px] font-bold text-slate-900 tracking-widest uppercase">Select Images</p>
                                                <p className="mt-1 text-[8px] font-bold text-slate-400">(Max 5 images)</p>
                                            </label>

                                            <div className="grid grid-cols-2 gap-2">
                                                {returnImages.map((img, i) => (
                                                    <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-slate-100">
                                                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                                                        <button
                                                            onClick={() => setReturnImages(prev => prev.filter((_, idx) => idx !== i))}
                                                            className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MdClose className="text-lg" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Refund Details */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            {actionType === 'return' ? '3.' : '2.'} Refund Method
                                        </h4>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                                            <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Secure Transfer</span>
                                        </div>
                                    </div>

                                    {(orders.find(o => o._id === actionOrderId)?.paymentMethod === 'cod' || useManualRefund) ? (
                                        <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
                                            <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 mb-6">
                                                <button
                                                    onClick={() => setRefundType('upi')}
                                                    className={`flex-1 py-3 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest ${refundType === 'upi' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                                                >
                                                    UPI ID
                                                </button>
                                                <button
                                                    onClick={() => setRefundType('bank')}
                                                    className={`flex-1 py-3 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest ${refundType === 'bank' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}
                                                >
                                                    Bank Account
                                                </button>
                                            </div>

                                            {refundType === 'upi' ? (
                                                <input
                                                    type="text"
                                                    placeholder="Enter UPI ID (e.g. name@bank)"
                                                    value={refundUpi}
                                                    onChange={(e) => setRefundUpi(e.target.value)}
                                                    className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-rose-200 focus:outline-none font-bold text-sm text-slate-700 shadow-sm transition-all"
                                                />
                                            ) : (
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Account Holder Name"
                                                        value={refundAccount.beneficiaryName}
                                                        onChange={(e) => setRefundAccount({ ...refundAccount, beneficiaryName: e.target.value })}
                                                        className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-rose-200 focus:outline-none font-bold text-sm text-slate-700 shadow-sm"
                                                    />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Account Number"
                                                            value={refundAccount.accountNumber}
                                                            onChange={(e) => setRefundAccount({ ...refundAccount, accountNumber: e.target.value })}
                                                            className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-rose-200 focus:outline-none font-bold text-sm"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="IFSC Code"
                                                            value={refundAccount.ifscCode}
                                                            onChange={(e) => setRefundAccount({ ...refundAccount, ifscCode: e.target.value.toUpperCase() })}
                                                            className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-rose-200 focus:outline-none font-bold text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {useManualRefund && (
                                                <button
                                                    onClick={() => setUseManualRefund(false)}
                                                    className="w-full mt-4 text-[9px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-all"
                                                >
                                                    ← Revert to Original Payment Method
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-slate-900 rounded-[2.5rem] p-7 shadow-xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl" />
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[8px] font-bold rounded uppercase tracking-widest">Auto Refund</span>
                                                        <span className="text-[10px] font-bold text-white uppercase italic">Original Payment Method</span>
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-300 leading-relaxed">
                                                        Refund will be processed automatically to your <span className="text-white">original payment source</span> within 5-7 working days.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setUseManualRefund(true)}
                                                className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white transition-all"
                                            >
                                                Use different refund method?
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
                            <button
                                onClick={resetActionState}
                                className="w-full sm:w-auto px-10 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleOrderAction}
                                disabled={submitting}
                                className={`flex-1 w-full py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest transition-all ${submitting
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : actionType === 'cancel'
                                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                                        : 'bg-slate-900 text-white hover:bg-slate-800'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : `Submit ${actionType === 'cancel' ? 'Cancellation' : 'Return'} Request`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
