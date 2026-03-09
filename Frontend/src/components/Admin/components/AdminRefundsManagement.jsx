import React, { useState, useEffect } from 'react';
import {
    MdAssignmentReturn,
    MdCancel,
    MdRefresh,
    MdSearch,
    MdFilterList,
    MdCheckCircle,
    MdClose,
    MdInfo,
    MdAttachMoney,
    MdDateRange,
    MdHistory,
    MdWarning,
    MdArrowForward,
    MdReceipt,
    MdVisibility,
    MdOutlineErrorOutline,
    MdCloudUpload
} from 'react-icons/md';
import API from '../../../../api';
import noPendingImg from '../../../assets/admin/no_pending_requests.png';
import noCancelledImg from '../../../assets/admin/no_cancelled_orders.png';

const AdminRefundsManagement = ({ refreshId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('requests'); // requests, processing, historical

    useEffect(() => {
        fetchSpecialOrders();
    }, [refreshId]);

    const fetchSpecialOrders = async () => {
        try {
            setLoading(true);
            const response = await API.get('/admin/orders');
            const specialOrders = (response.data || []).filter(order =>
                ['cancellation_requested', 'return_requested', 'return_approved', 'refund_initiated', 'refunded', 'cancelled', 'returned', 'return_rejected'].includes(order.status)
            );
            setOrders(specialOrders);
        } catch (error) {
            console.error('Error fetching refund/cancel orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            setActionLoading(true);
            await API.put(`/admin/orders/${orderId}`, { status });
            await fetchSpecialOrders();
            setSelectedOrderId(null);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order._id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const requests = filteredOrders.filter(o =>
        ['cancellation_requested', 'return_requested'].includes(o.status)
    );

    const processing = filteredOrders.filter(o =>
        ['return_approved', 'refund_initiated'].includes(o.status)
    );

    const historical = filteredOrders.filter(o =>
        ['cancelled', 'returned', 'refunded', 'return_rejected'].includes(o.status)
    );

    const getActiveOrders = () => {
        switch (activeTab) {
            case 'requests': return requests;
            case 'processing': return processing;
            case 'historical': return historical;
            default: return filteredOrders;
        }
    };

    const OrderCard = ({ order, isExpanded, onToggle }) => {
        const isPending = ['cancellation_requested', 'return_requested'].includes(order.status);
        const orderID = order._id.slice(-8).toUpperCase();

        return (
            <div
                onClick={() => !isExpanded && onToggle(order._id)}
                className={`group bg-white rounded-3xl border transition-all duration-500 relative overflow-hidden flex flex-col ${isExpanded
                    ? 'lg:col-span-2 border-slate-900 shadow-2xl p-0'
                    : `p-6 cursor-pointer hover:shadow-xl ${isPending ? 'border-rose-100 hover:border-rose-300 bg-rose-50/10' : 'border-slate-100'}`
                    }`}
            >
                {/* Close Button */}
                {isExpanded && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggle(null); }}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all z-50 active:scale-95"
                    >
                        <MdClose size={20} />
                    </button>
                )}

                {isExpanded ? (
                    <div className="flex flex-col md:flex-row h-full animate-in fade-in zoom-in-95 duration-300">
                        {/* 📸 Photos Section */}
                        <div className="md:w-1/2 bg-slate-50 p-8 border-b md:border-b-0 md:border-r border-slate-100">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-rose-600">
                                    <MdVisibility size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Request Photos</h3>
                            </div>

                            {order.returnImages && order.returnImages.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-white group/img cursor-pointer" onClick={() => window.open(order.returnImages[0], '_blank')}>
                                        <img
                                            src={order.returnImages[0]}
                                            alt="Return"
                                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {order.returnImages.map((img, i) => (
                                            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-100 cursor-pointer hover:border-rose-500 transition-all" onClick={() => window.open(img, '_blank')}>
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center bg-white/50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <MdCloudUpload size={40} className="text-slate-300 mb-2" />
                                    <p className="text-sm font-medium text-slate-500">No images provided by customer</p>
                                </div>
                            )}
                        </div>

                        {/* ⚖️ Details & Actions Section */}
                        <div className="md:w-1/2 p-8 flex flex-col bg-white">
                            <div className="mb-8">
                                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider mb-3">
                                    Order #{orderID}
                                </span>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Process Request</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <p className="text-slate-500 text-sm">Review the details and take necessary action.</p>
                                    {order.deliveryAttempted === false && (
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded uppercase tracking-widest border border-emerald-200">
                                            Never Delivered
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8 flex-1">
                                {/* Reason Box */}
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Reason</p>
                                    <p className="text-slate-800 font-medium leading-relaxed">
                                        {order.cancelReason || order.returnReason || 'No reason provided.'}
                                    </p>
                                </div>

                                {/* Financial Settlement */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900 rounded-2xl p-5 text-white">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Refund Amount</p>
                                            <p className="text-2xl font-bold">₹{(order.totalAmount || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Orig. Payment</p>
                                            <p className="text-sm font-bold text-slate-900 uppercase">{order.paymentMethod || 'Online'}</p>
                                        </div>
                                    </div>

                                    {/* Bank/UPI Info */}
                                    {order.refundAccountDetails && (
                                        <div className="bg-white border-2 border-slate-50 p-6 rounded-2xl shadow-sm">
                                            {order.refundAccountDetails.accountType === 'upi' ? (
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">UPI ID</p>
                                                        <p className="text-lg font-bold text-slate-900 select-all">{order.refundAccountDetails.upiId}</p>
                                                    </div>
                                                    <MdReceipt className="text-slate-200" size={32} />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">A/C Holder</p>
                                                        <p className="text-md font-bold text-slate-900">{order.refundAccountDetails.beneficiaryName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Account No.</p>
                                                        <p className="text-sm font-bold text-slate-900 select-all">{order.refundAccountDetails.accountNumber}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">IFSC Code</p>
                                                        <p className="text-sm font-bold text-slate-900 select-all uppercase">{order.refundAccountDetails.ifscCode}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="grid gap-3 pt-4">
                                    {order.status === 'cancellation_requested' && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Logic: If paid, move to processing for refund. If COD, move to finished history.
                                                    const nextStatus = order.paymentStatus === 'success' ? 'refund_initiated' : 'cancelled';
                                                    handleUpdateStatus(order._id, nextStatus);
                                                }}
                                                className="w-full py-4 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                Approve Cancellation <MdCheckCircle size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'paid'); }}
                                                className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                                            >
                                                Reject Request
                                            </button>
                                        </>
                                    )}

                                    {order.status === 'return_requested' && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'return_approved'); }}
                                                className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                Approve Return <MdAssignmentReturn size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'delivered'); }}
                                                className="w-full py-4 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-all active:scale-95"
                                            >
                                                Reject Return
                                            </button>
                                        </>
                                    )}

                                    {['return_approved', 'refund_initiated'].includes(order.status) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order._id, 'refunded'); }}
                                            className="w-full py-5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            Mark as Refunded <MdAttachMoney size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPending ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <MdReceipt size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-lg tracking-tight">#{orderID}</p>
                                    <p className="text-[10px] font-bold text-slate-400 capitalize">{order.customerId?.name || 'Guest User'}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${isPending ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                {order.status.replace('_', ' ')}
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Reason</p>
                            <p className="text-sm font-medium text-slate-600 line-clamp-2 italic">
                                "{order.cancelReason || order.returnReason || 'No reason specified'}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-auto">
                            <div>
                                <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Total Amount</p>
                                <p className="text-xl font-bold text-slate-900">₹{(order.totalAmount || 0).toLocaleString()}</p>
                            </div>
                            <button className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isPending ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                                Review Details
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 md:p-12 space-y-8 h-screen overflow-y-auto no-scrollbar pb-32 bg-[#F8FAFC]">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Returns & Cancellations</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Manage product returns, cancellations, and refunds efficiently.</p>
                </div>

                <div className="relative w-full lg:w-96 group">
                    <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-600 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search by ID or customer..."
                        className="w-full h-14 pl-12 pr-6 bg-white border border-slate-200 rounded-2xl focus:border-rose-600 focus:outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 z-[100] bg-[#F8FAFC] py-2">
                <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1">
                    {[
                        { id: 'requests', label: 'Requests', count: requests.length, icon: MdWarning },
                        { id: 'processing', label: 'Processing', count: processing.length, icon: MdRefresh },
                        { id: 'historical', label: 'History', count: historical.length, icon: MdCheckCircle }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-[9px] ${activeTab === tab.id ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <button
                    onClick={fetchSpecialOrders}
                    className="p-4 bg-white rounded-2xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm active:scale-95 group"
                >
                    <MdRefresh size={24} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
                </button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-slate-100" />
                    ))
                ) : getActiveOrders().length === 0 ? (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <MdAssignmentReturn size={48} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No requests found</h3>
                        <p className="text-slate-400 text-sm mt-2">There are no pending actions in this category.</p>
                    </div>
                ) : (
                    getActiveOrders().map(order => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            isExpanded={selectedOrderId === order._id}
                            onToggle={(id) => setSelectedOrderId(id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminRefundsManagement;
