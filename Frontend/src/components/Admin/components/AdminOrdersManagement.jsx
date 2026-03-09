import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { MdSearch, MdFilterList, MdVisibility, MdLocalShipping, MdCheckCircle, MdShoppingCart, MdReceipt, MdArrowForward, MdDownload } from 'react-icons/md';
import { FaTimes, FaCalendar } from 'react-icons/fa';
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
    const [dateFilter, setDateFilter] = useState('all');
    const [customDate, setCustomDate] = useState('');
    const [activeTab, setActiveTab] = useState('to_ship'); // 'unpaid', 'to_ship', 'in_transit', 'completed', 'all'

    const statuses = ['all', 'pending_payment', 'paid', 'shipped', 'delivered', 'cancelled', 'return_requested', 'refund_initiated', 'refunded'];
    const statusLabels = {
        'all': 'All Orders',
        'pending_payment': 'Pending Payment',
        'paid': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'return_requested': 'Return Requested',
        'refund_initiated': 'Refund Pending',
        'refunded': 'Refunded'
    };

    useEffect(() => {
        fetchOrders();
    }, [refreshId]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await API.get('/admin/orders');
            // Sort by most recent first (Production standard)
            const sortedOrders = (response.data || []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setOrders(sortedOrders);
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

        // Tab-based Lifecycle Filtering
        let matchesTab = true;
        if (activeTab === 'unpaid') matchesTab = order.status === 'pending_payment';
        else if (activeTab === 'to_ship') matchesTab = order.status === 'paid';
        else if (activeTab === 'in_transit') matchesTab = order.status === 'shipped';
        else if (activeTab === 'completed') matchesTab = order.status === 'delivered';
        else if (activeTab === 'all') matchesTab = true;

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        // ... Date logic continues below ...
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const startOfLastWeek = new Date(startOfWeek);
        startOfLastWeek.setDate(startOfWeek.getDate() - 7);

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

        return matchesSearch && matchesStatus && matchesDate && matchesTab;
    });

    const getStatusColor = (status) => {
        const colors = {
            'pending_payment': 'bg-amber-50 text-amber-600 border-amber-100',
            'paid': 'bg-indigo-50 text-indigo-600 border-indigo-100',
            'shipped': 'bg-blue-50 text-blue-600 border-blue-100',
            'delivered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'cancelled': 'bg-rose-50 text-rose-600 border-rose-100',
            'return_requested': 'bg-orange-50 text-orange-600 border-orange-100',
            'refund_initiated': 'bg-teal-50 text-teal-600 border-teal-100',
            'refunded': 'bg-green-50 text-green-700 border-green-100'
        };
        return colors[status] || 'bg-slate-50 text-slate-500 border-slate-100';
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

            {/* 🚀 NEW Professional Workflow Navigation */}
            <div className="mb-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2 bg-white/50 backdrop-blur-xl p-2 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
                    {[
                        { id: 'to_ship', label: 'Ready to Ship', icon: <MdLocalShipping />, color: 'rose', count: orders.filter(o => o.status === 'paid').length },
                        { id: 'unpaid', label: 'Unpaid Orders', icon: <MdReceipt />, color: 'amber', count: orders.filter(o => o.status === 'pending_payment').length },
                        { id: 'in_transit', label: 'In Transit', icon: <MdArrowForward />, color: 'blue', count: orders.filter(o => o.status === 'shipped').length },
                        { id: 'completed', label: 'Completed', icon: <MdCheckCircle />, color: 'emerald', count: orders.filter(o => o.status === 'delivered').length },
                        { id: 'all', label: 'View All', icon: <MdFilterList />, color: 'slate', count: orders.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setStatusFilter('all');
                            }}
                            className={`
                                relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-500 overflow-hidden group
                                ${activeTab === tab.id
                                    ? `bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105`
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white'}
                            `}
                        >
                            <span className={`text-lg transition-transform group-hover:-rotate-12 ${activeTab === tab.id ? 'text-white' : `text-${tab.color}-500/50 group-hover:text-${tab.color}-500`}`}>
                                {tab.icon}
                            </span>
                            <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
                            {tab.count > 0 && (
                                <span className={`
                                    flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-black
                                    ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                                `}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="pl-6 animate-in fade-in slide-in-from-left-4 duration-700">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        {activeTab === 'to_ship' && "Processing Queue: New orders verified and ready for logistics dispatch"}
                        {activeTab === 'unpaid' && "Incomplete Nodes: Orders awaiting successful transaction confirmation"}
                        {activeTab === 'in_transit' && "Active Logistics: Packages currently handled by external delivery partners"}
                        {activeTab === 'completed' && "Settled Accounts: Successfully delivered and customer-acknowledged orders"}
                        {activeTab === 'all' && "Master Archive: Full historical record of all lifecycle stages"}
                    </p>
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

            {/* Quick Date Filters & Calendar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { id: 'all', label: 'All Time' },
                            { id: 'today', label: "Today's Orders" },
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
                                className={`
                                    px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border-2
                                    ${dateFilter === f.id
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200 scale-105'
                                        : 'bg-white text-slate-400 border-slate-50 hover:border-slate-200 hover:text-slate-600'
                                    }
                                `}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200/50">
                        <div className="flex items-center gap-2 px-3 text-slate-400">
                            <FaCalendar className="text-sm" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Select Date</span>
                        </div>
                        <input
                            type="date"
                            value={customDate}
                            onChange={(e) => {
                                setCustomDate(e.target.value);
                                setDateFilter('custom');
                            }}
                            className="bg-white border border-slate-200/50 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-rose-300 transition-all cursor-pointer shadow-sm"
                        />
                        {dateFilter === 'custom' && (
                            <button
                                onClick={() => {
                                    setDateFilter('all');
                                    setCustomDate('');
                                }}
                                className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders Feed - Premium Grid Layout */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-80 w-full bg-white rounded-[2.5rem] border border-slate-100 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="py-24 text-center flex flex-col items-center justify-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                        {activeTab === 'unpaid' ? <MdReceipt className="text-5xl" /> :
                            activeTab === 'to_ship' ? <MdLocalShipping className="text-5xl" /> :
                                <MdShoppingCart className="text-5xl" />}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">
                        {activeTab === 'to_ship' ? 'All Orders Dispatched!' :
                            activeTab === 'unpaid' ? 'No Pending Payments' :
                                'No Orders Found'}
                    </h3>
                    <p className="text-slate-400 font-bold max-w-xs mx-auto">
                        {activeTab === 'to_ship' ? "You're all caught up with shipping. Great job!" :
                            activeTab === 'unpaid' ? "All customers have completed their transactions." :
                                "Try adjusting your filters or search criteria."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {filteredOrders.map((order, idx) => {
                        const isExpanded = selectedOrder?._id === order._id;
                        const customerInitial = order.customerId?.name?.charAt(0) || 'G';
                        const itemCount = order.items?.length || 0;

                        return (
                            <div
                                key={order._id}
                                onClick={() => setSelectedOrder(isExpanded ? null : order)}
                                className={`
                                    bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-8 cursor-pointer flex flex-col relative overflow-hidden
                                    ${isExpanded ? 'lg:col-span-2 ring-2 ring-rose-500/20' : 'h-full'}
                                `}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {/* Abstract background decorator for active state */}
                                {isExpanded && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-60"></div>
                                )}

                                {order.status === 'paid' && (
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500 shadow-[0_4px_12px_rgba(244,63,94,0.3)] z-20"></div>
                                )}
                                {order.status === 'pending_payment' && (
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400 shadow-[0_4px_12px_rgba(251,191,36,0.3)] z-20"></div>
                                )}

                                {/* Card Head */}
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Details</p>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                            #{order._id.slice(-8).toUpperCase()}
                                            {order.status === 'paid' && (
                                                <span className="px-2 py-0.5 bg-rose-500 text-white text-[8px] font-black uppercase rounded animate-pulse">New Order</span>
                                            )}
                                            <span className="text-[10px] font-bold text-slate-300">/ {new Date(order.createdAt).toLocaleDateString()}</span>
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusDropdown
                                            currentStatus={order.status}
                                            onUpdate={(newStatus) => updateOrderStatus(order._id, newStatus)}
                                            statuses={statuses}
                                            statusLabels={statusLabels}
                                            getStatusColor={getStatusColor}
                                        />
                                        {isExpanded && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(null);
                                                }}
                                                className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all flex items-center justify-center shadow-sm"
                                                title="Minimize Card"
                                            >
                                                <FaTimes className="text-sm" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Focus Section */}
                                <div className="flex items-center gap-4 mb-8 bg-slate-50/50 p-4 rounded-3xl border border-slate-100 group-hover:bg-white transition-colors duration-500">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-lg font-black text-rose-600 transform group-hover:rotate-6 transition-transform">
                                        {customerInitial}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Customer</p>
                                        <p className="text-sm font-black text-slate-900 truncate">{order.customerId?.name || 'Guest User'}</p>
                                        <p className="text-[11px] font-bold text-slate-400 truncate">{order.customerId?.email}</p>
                                    </div>
                                </div>

                                {/* Items Info */}
                                <div className="mb-6 px-1">
                                    <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Order Items ({itemCount})</span>
                                        <span className="text-slate-900 font-black">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                    </div>

                                    {isExpanded ? (
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {order.items?.map((item, i) => (
                                                <div key={i} className="flex items-center gap-4 p-3 bg-white border border-slate-50 rounded-2xl hover:border-rose-100 transition-colors shadow-sm">
                                                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.productId?.images?.[0]}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-black text-slate-900 truncate uppercase">{item.productId?.name || 'Standard Product'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400">₹{item.price?.toLocaleString()} × {item.quantity}</p>
                                                    </div>
                                                    <p className="text-xs font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {order.items?.slice(0, 3).map((item, i) => (
                                                <div key={i} className="w-10 h-10 rounded-xl border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
                                                    <img
                                                        src={item.productId?.images?.[0]}
                                                        alt=""
                                                        className="w-full h-full object-cover opacity-80"
                                                        onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                                                    />
                                                </div>
                                            ))}
                                            {itemCount > 3 && (
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                    +{itemCount - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Expanded Detail Section (Conditional) */}
                                {isExpanded && (
                                    <div className="mt-4 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <MdLocalShipping className="text-rose-500" /> Shipping Info
                                                </h4>
                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-slate-600 leading-relaxed">
                                                    {typeof order.shippingAddress === 'string' ? (
                                                        <p>{order.shippingAddress}</p>
                                                    ) : (
                                                        <>
                                                            <p className="text-slate-900 mb-1 font-black">{order.shippingAddress?.fullname || order.shippingAddress?.fullName}</p>
                                                            <p>{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                                                            <p>{order.shippingAddress?.state} - {order.shippingAddress?.zipCode}</p>
                                                            <p className="mt-2 text-[10px] font-black text-rose-500 uppercase">📞 {order.shippingAddress?.mobile}</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ⭐ NEW: Payment & Settlement Node */}
                                            <div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
                                                    <MdReceipt className="text-rose-600" /> Settlement Intelligence
                                                </h4>
                                                <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100/50 space-y-5 relative overflow-hidden group/settle hover:border-slate-900 transition-all duration-500">
                                                    <div className="flex justify-between items-center relative z-10">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Channel Origin</span>
                                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200 outline outline-4 outline-slate-50 shadow-sm">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Digital / Online'}</span>
                                                    </div>
                                                    {order.razorpayPaymentId && (
                                                        <div className="flex justify-between items-center relative z-10">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway ID</span>
                                                            <span className="text-[10px] font-black text-blue-600 px-2 py-1 bg-blue-50/50 rounded-lg font-mono border border-blue-100 select-all">{order.razorpayPaymentId}</span>
                                                        </div>
                                                    )}
                                                    {order.refundAccountDetails && (
                                                        <div className="pt-4 border-t-2 border-slate-200/30 mt-4 space-y-4 relative z-10">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Refund Point (Origin: COD)</p>
                                                            </div>
                                                            {order.refundAccountDetails.accountType === 'upi' ? (
                                                                <div className="flex flex-col gap-2 bg-white p-4 rounded-3xl border-2 border-amber-100/50 shadow-sm">
                                                                    <span className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest">Digital Address (UPI)</span>
                                                                    <span className="text-[13px] font-black text-slate-900 select-all font-mono tracking-tighter truncate">{order.refundAccountDetails.upiId}</span>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-white p-5 rounded-[2rem] border-2 border-rose-100/50 space-y-4 shadow-sm group-hover/settle:border-rose-300 transition-colors">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[9px] font-black text-slate-400 uppercase">Beneficiary Node</span>
                                                                        <span className="text-[11px] font-black text-slate-900 uppercase italic font-hero">{order.refundAccountDetails.beneficiaryName}</span>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className="text-[8px] font-black text-slate-300 uppercase">Account Archive</span>
                                                                            <span className="text-[11px] font-black text-slate-900 select-all font-mono tracking-tight">{order.refundAccountDetails.accountNumber}</span>
                                                                        </div>
                                                                        <div className="flex flex-col gap-1 items-end">
                                                                            <span className="text-[8px] font-black text-slate-300 uppercase text-right">Clearing Code</span>
                                                                            <span className="text-[11px] font-black text-slate-900 uppercase font-mono tracking-tight">{order.refundAccountDetails.ifscCode}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                        <div className="flex flex-col justify-end gap-3">
                                            <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-200">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Grand Total</p>
                                                <div className="flex justify-between items-end">
                                                    <p className="text-3xl font-black tracking-tighter">₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(order); }}
                                                            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1"
                                                        >
                                                            PDF
                                                        </button>
                                                        {order.status === 'paid' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'shipped'); }}
                                                                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 shadow-lg shadow-rose-900/40"
                                                            >
                                                                Ship Now
                                                            </button>
                                                        )}
                                                        {order.status === 'shipped' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); updateOrderStatus(order._id, 'delivered'); }}
                                                                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 shadow-lg shadow-blue-900/40"
                                                            >
                                                                Set Delivered
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Card Footer Actions (Visible only when not expanded) */}
                                {!isExpanded && (
                                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-50 border-dashed">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(order); }}
                                                className="w-10 h-10 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm"
                                            >
                                                <MdDownload />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest border border-slate-100">
                                            Details <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-10">
                                <div className="p-4 md:p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><MdVisibility className="text-rose-500" /> Customer</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-rose-600">
                                            {selectedOrder.customerId?.name?.charAt(0) || 'G'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-slate-900 truncate">{selectedOrder.customerId?.name || 'Guest User'}</p>
                                            <p className="text-[10px] font-medium text-slate-500 truncate">{selectedOrder.customerId?.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 md:p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><MdLocalShipping className="text-rose-500" /> Shipping</h3>
                                    {selectedOrder.shippingAddress ? (
                                        <div className="text-xs font-bold text-slate-700 leading-relaxed">
                                            {typeof selectedOrder.shippingAddress === 'string' ? (
                                                <p>{selectedOrder.shippingAddress}</p>
                                            ) : (
                                                <>
                                                    <p className="text-slate-900 font-black mb-0.5">{selectedOrder.shippingAddress.fullname || selectedOrder.shippingAddress.fullName}</p>
                                                    <p>{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}</p>
                                                    <p>{selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No address provided</p>
                                    )}
                                </div>

                                <div className="p-4 md:p-8 rounded-[2.5rem] bg-slate-50 border-2 border-slate-100 relative overflow-hidden group/pay">
                                    <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-rose-500/5 rounded-full blur-3xl" />
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3"><MdReceipt className="text-rose-600" /> Settlement Node</h3>
                                    <div className="space-y-5 relative z-10">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin Channel</span>
                                            <span className="text-[10px] font-black text-slate-900 uppercase bg-white px-3 py-1 rounded-full border-2 border-slate-100 shadow-sm">{selectedOrder.paymentMethod === 'cod' ? 'COD Ledger' : 'Digital Gateway'}</span>
                                        </div>
                                        {selectedOrder.razorpayPaymentId && (
                                            <div className="flex flex-col gap-2 mt-4 bg-white/50 p-4 rounded-2xl border border-white/80">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gateway Transaction ID</span>
                                                <span className="text-[11px] font-black text-blue-600 font-mono select-all truncate bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 shadow-inner">{selectedOrder.razorpayPaymentId}</span>
                                            </div>
                                        )}
                                        {selectedOrder.refundAccountDetails && (
                                            <div className="pt-6 border-t-2 border-slate-200/30 mt-4 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Refund Endpoint (Origin: COD)</span>
                                                </div>

                                                {selectedOrder.refundAccountDetails.accountType === 'upi' ? (
                                                    <div className="bg-white p-5 rounded-3xl border-2 border-amber-100/50 shadow-md group/upimodal">
                                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">UPI Address</p>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-2xl font-black text-slate-900 select-all font-mono tracking-tighter truncate leading-none">{selectedOrder.refundAccountDetails.upiId}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-md space-y-6">
                                                        <div>
                                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Target Beneficiary</p>
                                                            <p className="text-lg font-black text-slate-900 uppercase italic font-hero leading-tight">{selectedOrder.refundAccountDetails.beneficiaryName}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div>
                                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">A/C Archive</p>
                                                                <p className="text-sm font-black text-slate-900 select-all font-mono tracking-tight">{selectedOrder.refundAccountDetails.accountNumber}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Swift / IFSc</p>
                                                                <p className="text-sm font-black text-slate-900 uppercase font-mono tracking-tight">{selectedOrder.refundAccountDetails.ifscCode}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
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
