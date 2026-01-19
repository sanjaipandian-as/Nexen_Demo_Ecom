import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MdTrendingUp, MdShoppingCart, MdAttachMoney, MdInventory, MdPeople, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
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

    useEffect(() => {
        fetchDashboardData();
    }, [refreshId]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch analytics
            const analyticsRes = await API.get('/admin/analytics/dashboard');
            const analytics = analyticsRes.data;

            setStats({
                totalRevenue: analytics.totalSales || 0,
                totalOrders: analytics.totalOrders || 0,
                totalProducts: analytics.totalProducts || 0,
                totalCustomers: analytics.totalCustomers || 0,
                revenueGrowth: 12.5,
                orderGrowth: 8.3
            });

            // Fetch daily sales
            const salesRes = await API.get('/admin/analytics/daily-sales');
            const salesByDate = salesRes.data;

            // Convert to array format for charts
            const salesArray = Object.entries(salesByDate).map(([date, amount]) => ({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                sales: amount,
                orders: Math.floor(Math.random() * 20) + 5
            })).slice(-7); // Last 7 days

            setSalesData(salesArray);

            // Fetch products for category breakdown
            const productsRes = await API.get('/admin/products');
            const products = productsRes.data;

            const categoryCount = products.reduce((acc, product) => {
                const category = product.category?.main || 'Other';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {});

            const categoryArray = Object.entries(categoryCount).map(([name, value]) => ({
                name,
                value
            }));

            setCategoryData(categoryArray);

            // Fetch recent orders
            const ordersRes = await API.get('/admin/orders?limit=5');
            setRecentOrders(ordersRes.data.slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#2563EB', '#22C55E', '#8B5CF6', '#F97316', '#F87171', '#2DD4BF'];

    const statCards = [
        {
            title: 'Revenue',
            value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
            icon: MdAttachMoney,
            color: 'bg-emerald-50 text-emerald-600',
            iconBg: 'bg-emerald-500',
            growth: stats.revenueGrowth,
            trend: stats.revenueGrowth >= 0 ? 'up' : 'down'
        },
        {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: MdShoppingCart,
            color: 'bg-blue-50 text-blue-600',
            iconBg: 'bg-blue-600',
            growth: stats.orderGrowth,
            trend: stats.orderGrowth >= 0 ? 'up' : 'down'
        },
        {
            title: 'Inventory',
            value: stats.totalProducts,
            icon: MdInventory,
            color: 'bg-purple-50 text-purple-600',
            iconBg: 'bg-purple-500',
            growth: 5.2,
            trend: 'up'
        },
        {
            title: 'Customers',
            value: stats.totalCustomers,
            icon: MdPeople,
            color: 'bg-orange-50 text-orange-600',
            iconBg: 'bg-orange-500',
            growth: 15.8,
            trend: 'up'
        }
    ];

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[16px] border border-slate-100 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl animate-pulse"></div>
                                <div className="w-16 h-6 bg-slate-50 rounded-full animate-pulse"></div>
                            </div>
                            <div className="h-4 w-24 bg-slate-50 rounded-full animate-pulse mb-3"></div>
                            <div className="h-8 w-32 bg-slate-50 rounded-xl animate-pulse"></div>
                        </div>
                    ))}
                </div>

                {/* Charts Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
                            <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>

                {/* Bar Chart Skeleton */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
                    <div className="h-[300px] bg-gray-100 rounded animate-pulse"></div>
                </div>

                {/* Recent Orders Skeleton */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                    <div className="h-6 w-40 bg-slate-50 rounded-full animate-pulse mb-8"></div>
                    <div className="space-y-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="h-10 flex-1 bg-slate-50 rounded-xl animate-pulse"></div>
                                <div className="h-10 w-24 bg-slate-50 rounded-xl animate-pulse"></div>
                                <div className="h-10 w-32 bg-slate-50 rounded-xl animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 pt-6 py-6 bg-[#F3F6FA] min-h-screen">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-[28px] font-bold text-[#1E293B] mb-1">Dashboard Overview</h1>
                <p className="text-[#64748B] text-[15px] font-medium italic">Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="bg-white rounded-[16px] border border-slate-100 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color} shadow-sm group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-black ${card.growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {card.growth >= 0 ? <MdArrowUpward /> : <MdArrowDownward />}
                                    {Math.abs(card.growth)}%
                                </div>
                            </div>
                            <div>
                                <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1.5">{card.title}</h3>
                                <p className="text-2xl font-bold text-slate-900 tracking-tight leading-none">{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {/* Sales Chart */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                        Sales Overview
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: 'none',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    padding: '12px'
                                }}
                                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                            />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#2563EB"
                                strokeWidth={4}
                                dot={{ fill: '#fff', stroke: '#2563EB', strokeWidth: 3, r: 6 }}
                                activeDot={{ r: 8, strokeWidth: 0, fill: '#1E40AF' }}
                                name="Revenue"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all">
                    <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                        Inventory Split
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={8}
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: 'none',
                                    borderRadius: '16px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        {categoryData.slice(0, 4).map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                                <span className="text-[12px] font-bold text-slate-600 truncate">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Bar Chart */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)] mb-10 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all">
                <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                    Order Trends
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData} barGap={12}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                            dx={-10}
                        />
                        <Tooltip
                            cursor={{ fill: '#F8FAFC' }}
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: 'none',
                                borderRadius: '16px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Bar dataKey="orders" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={24} name="Total Orders" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                        Recent Activity
                    </h2>
                    <button className="text-blue-600 text-[13px] font-black uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto -mx-8">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-y border-slate-100">
                                <th className="text-left py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                                <th className="text-left py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                <th className="text-left py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                <th className="text-left py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-left py-4 px-8 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <tr key={order._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5 px-8">
                                            <span className="text-[13px] font-bold text-slate-900 group-hover:text-blue-600">#{order._id.slice(-6).toUpperCase()}</span>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500">
                                                    {order.customerId?.name?.charAt(0) || 'U'}
                                                </div>
                                                <span className="text-[13px] font-bold text-slate-600">{order.customerId?.name || 'Guest User'}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <span className="text-[14px] font-black text-slate-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="py-5 px-8">
                                            <span className={`
                                                px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5
                                                ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                    order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                                                        order.status === 'paid' ? 'bg-indigo-50 text-indigo-600' :
                                                            'bg-orange-50 text-orange-600'
                                                }
                                            `}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-emerald-500' :
                                                        order.status === 'shipped' ? 'bg-blue-500' :
                                                            order.status === 'paid' ? 'bg-indigo-500' :
                                                                'bg-orange-500'
                                                    }`}></div>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-5 px-8 text-right">
                                            <span className="text-[12px] font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="p-4 rounded-full bg-slate-50">
                                                <MdShoppingCart className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-bold text-[13px]">No recent activity found</p>
                                        </div>
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
