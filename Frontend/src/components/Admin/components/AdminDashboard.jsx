import { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    MdTrendingUp,
    MdTrendingDown,
    MdShoppingCart,
    MdAttachMoney,
    MdInventory,
    MdPeople,
    MdInsertChartOutlined,
    MdMoreHoriz,
    MdCalendarToday,
    MdFilterList,
    MdArrowForward
} from 'react-icons/md';
import API from '../../../../api';
import { toast } from 'react-toastify';

const AdminDashboard = ({ onOpenUploadModal, refreshId }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        revenueGrowth: 0,
        orderGrowth: 0
    });
    const [salesData, setSalesData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    const EmptyState = ({ message }) => (
        <div className="flex flex-col items-center justify-center py-12 h-[300px] w-full border border-dashed border-slate-200 rounded-[2rem] bg-slate-50">
            <div className="p-4 rounded-full bg-white shadow-sm mb-3">
                <MdInsertChartOutlined className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-sm tracking-wide font-body">{message}</p>
        </div>
    );

    useEffect(() => {
        fetchDashboardData();
    }, [refreshId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, salesRes, categoryRes, ordersRes] = await Promise.all([
                API.get('/admin/analytics/dashboard'),
                API.get('/admin/analytics/daily-sales'),
                API.get('/admin/analytics/category-distribution'),
                API.get('/admin/orders')
            ]);

            const s = statsRes.data;
            setStats({
                totalRevenue: s.totalSales || 0,
                totalOrders: s.totalOrders || 0,
                totalProducts: s.totalProducts || 0,
                totalCustomers: s.totalCustomers || 0,
                revenueGrowth: 12.5,
                orderGrowth: -2.4
            });

            setSalesData(salesRes.data || []);
            setCategoryData(categoryRes.data || []);

            const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.orders || []);
            const sortedOrders = allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRecentOrders(sortedOrders.slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6'];

    const statCards = [
        {
            title: 'Total Revenue',
            value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
            icon: MdAttachMoney,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            growth: stats.revenueGrowth,
            trend: 'up'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: MdShoppingCart,
            color: 'text-slate-700',
            bg: 'bg-slate-100',
            growth: stats.orderGrowth,
            trend: 'down'
        },
        {
            title: 'Active Products',
            value: stats.totalProducts,
            icon: MdInventory,
            color: 'text-slate-700',
            bg: 'bg-slate-100',
            growth: 8.2,
            trend: 'up'
        },
        {
            title: 'Total Customers',
            value: stats.totalCustomers,
            icon: MdPeople,
            color: 'text-slate-700',
            bg: 'bg-slate-100',
            growth: 12.5,
            trend: 'up'
        }
    ];

    if (loading) {
        return (
            <div className="p-8 bg-slate-50/50 min-h-screen">
                <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-2xl shadow-sm animate-pulse"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50/50 min-h-screen font-body text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-10 animate-slideUp">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight font-hero mb-1">Dashboard</h1>
                    <p className="text-slate-500 font-medium text-sm">Here's what's happening with your store today.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                        <MdCalendarToday /> Last 30 Days
                    </button>
                    <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95 duration-200">
                        <MdFilterList /> Filter View
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-default group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3.5 rounded-2xl ${card.bg} ${card.color} transition-colors group-hover:scale-110 duration-300`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <span className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${card.growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {card.growth >= 0 ? <MdTrendingUp /> : <MdTrendingDown />}
                                {Math.abs(card.growth)}%
                            </span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1 font-hero">{card.title}</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight font-hero">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                {/* Main Sales Chart */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight font-hero">Revenue Analytics</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Daily performance breakdown</p>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
                            <MdMoreHoriz size={24} />
                        </button>
                    </div>
                    {salesData.length > 0 ? (
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700, fontFamily: 'Manrope' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700, fontFamily: 'Manrope' }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontFamily: 'Manrope', padding: '12px 16px' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: 700, fontSize: '13px' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 800 }}
                                        cursor={{ stroke: '#e11d48', strokeWidth: 2, strokeDasharray: '4 4' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sales"
                                        stroke="#e11d48"
                                        strokeWidth={4}
                                        dot={{ fill: 'white', stroke: '#e11d48', strokeWidth: 3, r: 6 }}
                                        activeDot={{ r: 8, fill: '#e11d48', stroke: 'white', strokeWidth: 3 }}
                                        fill="url(#colorRevenue)"
                                        animationDuration={1500}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState message="No revenue data available yet" />
                    )}
                </div>

                {/* Category Pie Chart */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg transition-shadow duration-300 flex flex-col">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 font-hero">Inventory Split</h3>
                    {categoryData.length > 0 ? (
                        <div className="h-[320px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={85}
                                        outerRadius={110}
                                        paddingAngle={6}
                                        dataKey="value"
                                        stroke="none"
                                        animationDuration={1500}
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'Manrope' }}
                                        itemStyle={{ color: '#1e293b', fontWeight: 700 }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-black text-slate-900 font-hero">{stats.totalProducts}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Items</span>
                            </div>
                        </div>
                    ) : (
                        <EmptyState message="No inventory data" />
                    )}
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden animate-slideUp" style={{ animationDelay: '0.3s' }}>
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight font-hero">Live Transactions</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Real-time order feed</p>
                    </div>
                    <button onClick={() => window.location.href = '/admin/orders'} className="group flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-widest hover:text-rose-800 transition-colors">
                        View All Orders <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Order ID</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Customer</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Amount</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order, i) => (
                                    <tr key={order._id} className="group hover:bg-slate-50/50 transition-colors" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <td className="px-8 py-5">
                                            <span className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors font-hero">#{order._id.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shadow-inner">
                                                    {order.customerId?.name ? order.customerId.name.charAt(0) : 'G'}
                                                </div>
                                                <span className="font-bold text-sm text-slate-600">{order.customerId?.name || 'Guest'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="font-bold text-sm text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                order.status === 'shipped' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="text-xs font-bold text-slate-400">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center text-slate-400 font-medium italic">
                                        No recent orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
