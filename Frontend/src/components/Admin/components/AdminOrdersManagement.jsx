import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { MdSearch, MdFilterList, MdVisibility, MdLocalShipping, MdCheckCircle, MdShoppingCart, MdReceipt, MdArrowForward, MdDownload } from 'react-icons/md';
import { FaTimes } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import API from '../../../../api';

const StatusDropdown = ({ currentStatus, onUpdate, statuses, statusLabels, getStatusColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (status) => {
        onUpdate(status);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 shadow-sm
                    ${getStatusColor(currentStatus)}
                `}
            >
                <span className="whitespace-nowrap">{statusLabels[currentStatus]}</span>
                <div className={`w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-current opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-[50] overflow-hidden animate-slideDown origin-top-right">
                    <div className="p-1">
                        {statuses.filter(s => s !== 'all').map((status) => (
                            <div
                                key={status}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(status);
                                }}
                                className={`
                                    flex items-center justify-between px-3 py-2 text-[10px] font-black rounded-lg cursor-pointer transition-all uppercase tracking-wider mb-0.5 last:mb-0
                                    ${currentStatus === status
                                        ? 'bg-rose-50 text-rose-600'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                {statusLabels[status]}
                                {currentStatus === status && <MdCheckCircle className="text-sm" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminOrders = ({ refreshId, triggerGlobalRefresh }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    const statuses = ['all', 'pending_payment', 'paid', 'shipped', 'delivered', 'cancelled'];
    const statusLabels = {
        'all': 'All Orders',
        'pending_payment': 'Pending Payment',
        'paid': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };

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
            if (triggerGlobalRefresh) triggerGlobalRefresh(); // Refresh parent/other tabs
            fetchOrders();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order status');
        }
    };

    const filteredOrders = orders.filter(order => {
        const term = searchTerm.toLowerCase().replace('#', '');
        const orderIdMatch = order._id.toLowerCase().includes(term);
        const shortIdMatch = order._id.slice(-6).toLowerCase().includes(term);
        const customerMatch = order.customerId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        // Also check if any product in the order matches (since user said "search product by id")
        const productMatch = order.items?.some(item =>
            item.productId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.productId?._id?.toLowerCase().includes(term)
        );

        const matchesSearch = orderIdMatch || shortIdMatch || customerMatch || productMatch;
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        const colors = {
            'pending_payment': 'bg-amber-50 text-amber-600 border-amber-100',
            'paid': 'bg-indigo-50 text-indigo-600 border-indigo-100',
            'shipped': 'bg-blue-50 text-blue-600 border-blue-100',
            'delivered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'cancelled': 'bg-rose-50 text-rose-600 border-rose-100'
        };
        return colors[status] || 'bg-slate-50 text-slate-600 border-slate-100';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending_payment': return <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />;
            case 'delivered': return <MdCheckCircle />;
            case 'shipped': return <MdLocalShipping />;
            case 'cancelled': return <FaTimes />;
            default: return <div className="w-2 h-2 rounded-full bg-slate-400" />;
        }
    };

    const handleDownloadInvoice = (order) => {
        if (!order) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.setTextColor(225, 29, 72); // Rose-600
        doc.text("Grow We Go - Invoice", 14, 22);

        // Order Info
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Order ID: #${order._id.slice(-6).toUpperCase()}`, 14, 32);
        doc.text(`Full Order ID: ${order._id}`, 14, 37);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 42);
        doc.text(`Status: ${order.status.replace('_', ' ')}`, 14, 47);

        // Customer Info
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text("Customer Details:", 14, 58);
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(order.customerId?.name || 'Guest User', 14, 64);
        doc.text(order.customerId?.email || '', 14, 69);

        // Address
        const ship = order.shippingAddress;
        let addressText = "No address provided";
        if (ship) {
            if (typeof ship === 'string') {
                addressText = ship;
            } else {
                addressText = `${ship.street}, ${ship.city}\n${ship.state} - ${ship.zipCode}\n${ship.country || 'India'}\nPhone: ${ship.mobile}`;
            }
        }

        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text("Shipping Address:", 120, 58);
        doc.setFontSize(10);
        doc.setTextColor(80);

        // Split text to fit within column (width ~75mm from x=120 to margin)
        const splitAddress = doc.splitTextToSize(addressText, 75);
        doc.text(splitAddress, 120, 64);

        // Items Table
        const tableBody = order.items.map(item => [
            item.productId?.name || 'Unknown Item',
            item.quantity,
            `Rs. ${item.price.toLocaleString('en-IN')}`,
            `Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`
        ]);

        autoTable(doc, {
            startY: 95,
            head: [['Item', 'Qty', 'Unit Price', 'Total']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [225, 29, 72], textColor: 255, fontStyle: 'bold' }, // Rose-600
            styles: { fontSize: 9, cellPadding: 3 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 20, halign: 'center' },
                2: { cellWidth: 30, halign: 'right' },
                3: { cellWidth: 30, halign: 'right' }
            }
        });

        // Total
        const finalY = doc.lastAutoTable.finalY + 10;

        doc.line(120, finalY, 196, finalY); // Divider line

        doc.setFontSize(10);
        doc.text("Subtotal:", 140, finalY + 7);
        doc.text(`Rs. ${order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('en-IN')}`, 195, finalY + 7, { align: 'right' });

        doc.text("Shipping:", 140, finalY + 13);
        doc.text("Free", 195, finalY + 13, { align: 'right' });

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(225, 29, 72);
        doc.text("Total Amount:", 140, finalY + 24);
        doc.text(`Rs. ${order.totalAmount?.toLocaleString('en-IN')}`, 195, finalY + 24, { align: 'right' });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.setFont("helvetica", "normal");
        doc.text("Thank you for shopping with Grow We Go!", 105, 285, { align: 'center' });

        doc.save(`Invoice_${order._id}.pdf`);
    };

    return (
        <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen font-sans text-slate-900">
            {/* Header */}
            <div className="mb-6 md:mb-10">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Orders Management</h1>
                <p className="text-slate-500 font-medium text-xs md:text-sm mt-1">Track and manage customer orders</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">
                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200">
                            <MdShoppingCart className="text-lg md:text-xl" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Orders</p>
                        <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">{orders.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-500">
                            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Pending</p>
                        <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">{orders.filter(o => o.status === 'pending_payment').length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-rose-50 text-rose-500">
                            <MdLocalShipping className="text-lg md:text-xl" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Shipped</p>
                        <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">{orders.filter(o => o.status === 'shipped').length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-500">
                            <MdCheckCircle className="text-lg md:text-xl" />
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Delivered</p>
                        <p className="text-xl md:text-2xl font-black text-slate-900 leading-none">{orders.filter(o => o.status === 'delivered').length}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="relative flex-1 group">
                    <MdSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-rose-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-3 md:py-4 bg-white border border-slate-200 rounded-2xl outline-none transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-slate-700 font-bold placeholder:text-slate-300 shadow-sm text-sm md:text-base"
                    />
                </div>

                <div className="relative min-w-full md:min-w-[240px] custom-dropdown-container">
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className={`
                            w-full flex items-center justify-between px-6 py-3 md:py-4 bg-white border rounded-2xl outline-none transition-all cursor-pointer shadow-sm
                            ${showFilterDropdown ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 hover:border-slate-300'}
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <MdFilterList className="text-rose-500 text-xl" />
                            <span className="text-slate-700 font-bold text-sm">
                                {statusLabels[statusFilter]}
                            </span>
                        </div>
                        <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-400 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showFilterDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-slideDown">
                            {statuses.map((status) => (
                                <div
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setShowFilterDropdown(false);
                                    }}
                                    className={`
                                        px-6 py-3 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between
                                        ${statusFilter === status ? 'bg-slate-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                >
                                    {statusLabels[status]}
                                    {statusFilter === status && <MdCheckCircle />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Orders Content */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 w-full bg-slate-50 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="p-20 text-center flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                        <MdShoppingCart className="text-5xl" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">No Orders Found</h3>
                    <p className="text-slate-400 font-bold text-sm">Try adjusting your search or filters</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-visible min-h-[500px]">
                        <div className="overflow-visible">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Details</th>
                                        <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                        <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                        <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="text-left py-6 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="group hover:bg-slate-50/40 transition-colors">
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                                                        <MdReceipt />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">#{order._id.slice(-6).toUpperCase()}</p>
                                                        <p className="text-[11px] font-bold text-slate-400">{order.items?.length || 0} items</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border-2 border-white shadow-sm">
                                                        {order.customerId?.name?.charAt(0) || 'G'}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600">{order.customerId?.name || 'Guest User'}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <p className="text-sm font-black text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                            </td>
                                            <td className="py-5 px-8">
                                                <p className="text-xs font-bold text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-lg inline-block shadow-sm">
                                                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                            </td>
                                            <td className="py-5 px-8">
                                                <StatusDropdown
                                                    currentStatus={order.status}
                                                    onUpdate={(newStatus) => updateOrderStatus(order._id, newStatus)}
                                                    statuses={statuses}
                                                    statusLabels={statusLabels}
                                                    getStatusColor={getStatusColor}
                                                />
                                            </td>
                                            <td className="py-5 px-8 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownloadInvoice(order);
                                                        }}
                                                        className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center shadow-sm cursor-pointer"
                                                        title="Download Invoice"
                                                    >
                                                        <MdDownload />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center shadow-sm cursor-pointer"
                                                        title="View Details"
                                                    >
                                                        <MdArrowForward />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                            <MdReceipt />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">#{order._id.slice(-6).toUpperCase()}</p>
                                            <p className="text-[11px] font-bold text-slate-400">{order.items?.length || 0} items</p>
                                        </div>
                                    </div>
                                    <StatusDropdown
                                        currentStatus={order.status}
                                        onUpdate={(newStatus) => updateOrderStatus(order._id, newStatus)}
                                        statuses={statuses}
                                        statusLabels={statusLabels}
                                        getStatusColor={getStatusColor}
                                    />
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm">
                                                {order.customerId?.name?.charAt(0) || 'G'}
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">{order.customerId?.name || 'Guest User'}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-500">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                                        <span className="text-base font-black text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadInvoice(order);
                                        }}
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        <MdDownload className="text-base" />
                                        Invoice
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setShowDetailsModal(true);
                                        }}
                                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                                    >
                                        details
                                        <MdArrowForward className="text-base" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Order Details Modal */}
            {showDetailsModal && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-modalScale">
                        {/* Header */}
                        <div className="p-4 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex gap-4 md:gap-6 items-center">
                                <div className="p-3 md:p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hidden md:block">
                                    <MdReceipt className="text-2xl md:text-3xl text-rose-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-1">Order #{selectedOrder._id.slice(-6).toUpperCase()}</h2>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <p className="text-xs md:text-sm font-bold text-slate-500">
                                            {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleDownloadInvoice(selectedOrder)}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs md:text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
                                >
                                    <MdDownload className="text-lg" />
                                    <span className="md:hidden">Invoice</span>
                                    <span className="hidden md:inline">Download Invoice</span>
                                </button>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
                                >
                                    <FaTimes className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-10">
                                <div className="p-4 md:p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Customer Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600">
                                                {selectedOrder.customerId?.name?.charAt(0) || 'G'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-slate-900 truncate">{selectedOrder.customerId?.name || 'Guest User'}</p>
                                                <p className="text-xs font-medium text-slate-500 truncate">{selectedOrder.customerId?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 md:p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Shipping Address</h3>
                                    {selectedOrder.shippingAddress ? (
                                        <div className="text-sm font-bold text-slate-700 leading-relaxed">
                                            {typeof selectedOrder.shippingAddress === 'string' ? (
                                                <p>{selectedOrder.shippingAddress}</p>
                                            ) : (
                                                <>
                                                    <p>{selectedOrder.shippingAddress.street}</p>
                                                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                                                    <p>{selectedOrder.shippingAddress.country || 'India'}</p>
                                                    <p className="mt-1 text-slate-500 font-medium">Phone: {selectedOrder.shippingAddress.mobile}</p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-400 italic">No address provided</p>
                                    )}
                                </div>
                            </div>

                            <div className="border rounded-2xl border-slate-100 overflow-hidden mb-6 md:mb-8">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[500px]">
                                        <thead className="bg-slate-50/50">
                                            <tr>
                                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                                <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                                <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {selectedOrder.items?.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="py-4 px-6">
                                                        <p className="text-sm font-bold text-slate-900">{item.productId?.name || 'Unknown Item'}</p>
                                                        <p className="text-xs text-slate-400 font-medium">SKU: {(item.productId?._id || '').slice(-6).toUpperCase()}</p>
                                                    </td>
                                                    <td className="py-4 px-6 text-center text-sm font-bold text-slate-700">{item.quantity}</td>
                                                    <td className="py-4 px-6 text-right text-sm font-bold text-slate-700">₹{item.price.toLocaleString('en-IN')}</td>
                                                    <td className="py-4 px-6 text-right text-sm font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-full max-w-sm bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                                    <div className="relative z-10 space-y-3">
                                        <div className="flex justify-between text-sm opacity-80">
                                            <span>Subtotal</span>
                                            <span>₹{selectedOrder.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-sm opacity-80">
                                            <span>Shipping</span>
                                            <span>Free</span>
                                        </div>
                                        <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                                            <span className="font-black uppercase tracking-widest text-xs">Total Amount</span>
                                            <span className="text-2xl font-black">₹{selectedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    {/* Abstract shapes */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-600/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
