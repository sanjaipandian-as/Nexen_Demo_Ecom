import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdSearch, MdFilterList, MdVisibility, MdLocalShipping, MdCheckCircle, MdShoppingCart } from 'react-icons/md';
import API from '../../../../api';

const AdminOrders = ({ refreshId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const statuses = ['all', 'pending_payment', 'paid', 'shipped', 'delivered', 'cancelled'];

    useEffect(() => {
        fetchOrders();
    }, [refreshId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await API.get('/admin/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await API.put(`/admin/orders/${orderId}`, { status: newStatus });
            toast.success('Order status updated successfully');
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        const colors = {
            'pending_payment': 'bg-amber-50 text-amber-600',
            'paid': 'bg-indigo-50 text-indigo-600',
            'shipped': 'bg-blue-50 text-blue-600',
            'delivered': 'bg-emerald-50 text-emerald-600',
            'cancelled': 'bg-rose-50 text-rose-600'
        };
        return colors[status] || 'bg-slate-50 text-slate-600';
    };

    return (
        <div className="px-6 py-6 bg-[#F3F6FA] min-h-screen">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-[28px] font-bold text-[#1E293B] mb-1">Orders Management</h1>
                <p className="text-[#64748B] text-[15px] font-medium italic">Track and manage all customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white rounded-[16px] border border-slate-100 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <MdShoppingCart className="text-xl" />
                        </div>
                        <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest leading-none">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 leading-none">{orders.length}</p>
                </div>
                <div className="bg-white rounded-[16px] border border-slate-100 p-6 shadow-[0_8_24_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                            <div className="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest leading-none">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 leading-none">
                        {orders.filter(o => o.status === 'pending_payment').length}
                    </p>
                </div>
                <div className="bg-white rounded-[16px] border border-slate-100 p-6 shadow-[0_8_24_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <MdLocalShipping className="text-xl" />
                        </div>
                        <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest leading-none">Shipped</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 leading-none">
                        {orders.filter(o => o.status === 'shipped').length}
                    </p>
                </div>
                <div className="bg-white rounded-[16px] border border-slate-100 p-6 shadow-[0_8_24_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <MdCheckCircle className="text-xl" />
                        </div>
                        <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest leading-none">Delivered</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 leading-none">
                        {orders.filter(o => o.status === 'delivered').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-6 mb-10">
                <div className="relative flex-1 group">
                    <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-[#2563EB] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[20px] outline-none transition-all focus:border-[#2563EB]/30 focus:shadow-[0_8px_30px_rgb(37,99,235,0.06)] text-slate-700 font-bold placeholder:text-slate-300 shadow-sm"
                    />
                </div>
                <div className="relative w-full md:w-[260px] group">
                    <MdFilterList className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-[#2563EB] transition-colors pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full pl-16 pr-12 py-5 bg-white border border-slate-100 rounded-[20px] outline-none transition-all focus:border-[#2563EB]/30 focus:shadow-[0_8px_30_rgba(37,99,235,0.06)] text-slate-700 font-black appearance-none cursor-pointer tracking-tight shadow-sm"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'all' ? 'All Statuses' : status.replace('_', ' ').toUpperCase()}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 border-b-2 border-r-2 border-slate-200 rotate-45 mb-1 pointer-events-none group-focus-within:border-[#2563EB] transition-colors"></div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-6">
                        <div className="h-6 w-40 bg-slate-50 rounded-full animate-pulse mb-8"></div>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="h-10 w-24 bg-slate-50 rounded-lg animate-pulse"></div>
                                <div className="h-10 flex-1 bg-slate-50 rounded-lg animate-pulse"></div>
                                <div className="h-10 w-32 bg-slate-50 rounded-lg animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MdShoppingCart className="text-4xl text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Found</h3>
                        <p className="text-slate-500 font-medium">No orders match your current search/filter criteria</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-left py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                                    <th className="text-left py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                    <th className="text-left py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                                    <th className="text-left py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="text-left py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="text-left py-5 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5 px-8 text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                    {order.customerId?.name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="text-[13px] font-bold text-slate-600 leading-none">{order.customerId?.name || 'Guest User'}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-[13px] font-bold text-slate-400">
                                            {order.items?.length || 0} items
                                        </td>
                                        <td className="py-5 px-8 text-[14px] font-black text-slate-900">
                                            ₹{order.totalAmount?.toLocaleString('en-IN')}
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="relative inline-block group/select">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className={`
                                                        appearance-none pl-3 pr-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                                                        ${getStatusColor(order.status)} border-0 focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all
                                                    `}
                                                >
                                                    {statuses.filter(s => s !== 'all').map(status => (
                                                        <option key={status} value={status}>
                                                            {status.replace('_', ' ').toUpperCase()}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-b-2 border-r-2 border-current opacity-40 rotate-45 mb-1 pointer-events-none"></div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-[12px] font-bold text-slate-400">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center group-hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
                                            >
                                                <MdVisibility size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                        onClick={() => setShowDetailsModal(false)}
                    ></div>

                    <div className="relative bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-modalScale">
                        <div className="flex-none bg-white border-b border-slate-100 p-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-none">Order Details</h3>
                                    <p className="text-[13px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-0.5">#{selectedOrder._id.toUpperCase()}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all duration-300 hover:rotate-90"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-slate-50/20">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                                    <p className="font-bold text-slate-900 text-lg">{selectedOrder.customerId?.name || 'Guest User'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Order Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedOrder.status)}`}>
                                        {selectedOrder.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Order Date</p>
                                    <p className="font-bold text-slate-700">
                                        {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                                    <p className="font-bold text-slate-700 uppercase">Prepaid</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-[2px] w-6 bg-blue-600"></div>
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Ordered Items</h4>
                                </div>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400">IMG</div>
                                                <div>
                                                    <p className="font-bold text-slate-800">Product #{item.productId.slice(-6).toUpperCase()}</p>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-slate-900 text-lg">
                                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[15px] font-bold text-slate-500">Order Revenue</span>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">
                                        ₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                {selectedOrder.shippingAddress && (
                                    <div className="p-6 bg-blue-50/50 rounded-[24px] border border-blue-100/50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <MdLocalShipping className="text-blue-600" />
                                            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Delivery Address</p>
                                        </div>
                                        <p className="text-[14px] font-bold text-slate-700 leading-relaxed uppercase tracking-tight">
                                            {selectedOrder.shippingAddress.street}<br />
                                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
