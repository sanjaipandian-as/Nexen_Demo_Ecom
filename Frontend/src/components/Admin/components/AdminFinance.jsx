import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MdAttachMoney, MdTrendingUp, MdTrendingDown, MdShoppingCart, MdAccountBalance, MdInsertChartOutlined, MdCalendarToday } from 'react-icons/md';
import API from '../../../../api';

const AdminFinance = ({ refreshId }) => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7days');
    const [financeData, setFinanceData] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        revenueGrowth: 0
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const [revenueData, setRevenueData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    const timeOptions = [
        { label: 'Last 7 Days', value: '7days' },
        { label: 'Last 14 Days', value: '14days' },
        { label: 'Last 30 Days', value: '30days' }
    ];

    const EmptyState = ({ message }) => (
        <div className="flex flex-col items-center justify-center py-20 h-[300px] w-full border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <div className="p-4 rounded-full bg-white shadow-sm mb-3">
                <MdInsertChartOutlined className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-wide">{message}</p>
        </div>
    );

    useEffect(() => {
        fetchFinanceData();
    }, [refreshId, timeRange]);

    // ... (fetchFinanceData and statCards remain unchanged)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.custom-dropdown-container')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const fetchFinanceData = async () => {
        try {
            setLoading(true);
            const [statsRes, revenueRes, monthlyRes] = await Promise.all([
                API.get('/admin/analytics/finance-stats'),
                API.get('/admin/analytics/daily-sales'),
                API.get('/admin/analytics/monthly-sales')
            ]);

            const stats = statsRes.data;
            setFinanceData({
                totalRevenue: stats.totalRevenue || 0,
                totalOrders: stats.totalOrders || 0,
                averageOrderValue: stats.averageOrderValue || 0,
                revenueGrowth: stats.revenueGrowth || 0
            });

            // Process revenue chart data (daily)
            const revenueArray = (revenueRes.data || []).map(day => ({
                date: day.date,
                revenue: day.sales,
                orders: day.orders,
                profit: Math.round(day.sales * 0.7)
            }));

            const rangeMap = { '7days': 7, '14days': 14, '30days': 30 };
            const limit = rangeMap[timeRange] || 7;
            setRevenueData(revenueArray.slice(-limit));
            setMonthlyData(monthlyRes.data || []);

        } catch (error) {
            console.error('Error fetching finance data:', error);
            setRevenueData([]);
            setMonthlyData([]);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'TOTAL REVENUE',
            value: `₹${financeData.totalRevenue.toLocaleString('en-IN')}`,
            icon: MdAttachMoney,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            growth: financeData.revenueGrowth,
            trend: 'up'
        },
        {
            title: 'TOTAL ORDERS',
            value: financeData.totalOrders,
            icon: MdShoppingCart,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            growth: 8.5,
            trend: 'up'
        },
        {
            title: 'AVG. ORDER VALUE',
            value: `₹${Math.round(financeData.averageOrderValue).toLocaleString('en-IN')}`,
            icon: MdAccountBalance,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            growth: -2.3,
            trend: 'down'
        },
        {
            title: 'NET PROFIT EST.',
            value: `₹${Math.round(financeData.totalRevenue * 0.7).toLocaleString('en-IN')}`,
            icon: MdTrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            growth: 12.4,
            trend: 'up'
        }
    ];

    if (loading) {
        return (
            <div className="p-8 bg-slate-50/50 min-h-screen">
                <div className="h-8 w-64 bg-slate-200 rounded animate-pulse mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-2xl shadow-sm animate-pulse"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-50/50 min-h-screen font-sans text-slate-900">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance Overview</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Track your store's financial health</p>
                </div>
                <div className="relative custom-dropdown-container min-w-[180px]">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`
                            w-full flex items-center gap-3 px-5 py-3 bg-white border rounded-xl outline-none transition-all cursor-pointer shadow-sm
                            ${showDropdown ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 hover:border-slate-300'}
                        `}
                    >
                        <MdCalendarToday className="text-rose-600" />
                        <span className="text-slate-700 font-bold text-sm flex-1 text-left">
                            {timeOptions.find(opt => opt.value === timeRange)?.label}
                        </span>
                        <div className={`w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-slideDown">
                            {timeOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        setTimeRange(option.value);
                                        setShowDropdown(false);
                                    }}
                                    className={`
                                        px-5 py-3 text-sm font-bold cursor-pointer transition-colors
                                        ${timeRange === option.value ? 'bg-slate-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                    `}
                                >
                                    {option.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl hover:scale-105 transition-all duration-300 group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${card.bg} ${card.color} transition-colors`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <span className={`flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-full ${card.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {card.trend === 'up' ? <MdTrendingUp /> : <MdTrendingDown />}
                                {Math.abs(card.growth)}%
                            </span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{card.title}</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Main Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-rose-600 rounded-full"></div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Revenue Trend</h2>
                    </div>
                    {revenueData.length > 0 ? (
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenuePink" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                        dx={-10}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                        cursor={{ stroke: '#e11d48', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#e11d48"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenuePink)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState message="No revenue data available" />
                    )}
                </div>

                {/* Monthly Performance */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Monthly Recap</h2>
                    </div>
                    {monthlyData.length > 0 ? (
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar dataKey="revenue" fill="#e11d48" radius={[4, 4, 0, 0]} name="Revenue" />
                                    <Bar dataKey="profit" fill="#0f172a" radius={[4, 4, 0, 0]} name="Profit" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <EmptyState message="No monthly history" />
                    )}
                </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-8">
                <h2 className="text-lg font-black text-slate-900 tracking-tight mb-8">P&L Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Income</p>
                            <p className="text-3xl font-black text-white tracking-tight">₹{financeData.totalRevenue.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-slate-800 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-slate-700 transition-colors"></div>
                    </div>

                    <div className="p-8 bg-rose-50 rounded-2xl border border-rose-100 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-rose-900/50 uppercase tracking-widest mb-2">Operating Costs (Est. 30%)</p>
                            <p className="text-3xl font-black text-rose-600 tracking-tight">₹{Math.round(financeData.totalRevenue * 0.3).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-rose-100 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-rose-200 transition-colors"></div>
                    </div>

                    <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-100 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-emerald-900/50 uppercase tracking-widest mb-2">Net Profit (Est. 70%)</p>
                            <p className="text-3xl font-black text-emerald-600 tracking-tight">₹{Math.round(financeData.totalRevenue * 0.7).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-200 transition-colors"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFinance;
