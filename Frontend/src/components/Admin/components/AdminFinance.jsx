import { useState, useEffect, useRef } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Line
} from 'recharts';
import {
    DollarSign, TrendingUp, TrendingDown, ShoppingBag,
    CreditCard, Calendar, ArrowUpRight, ArrowDownRight,
    Activity, Package, Users, Download, ChevronLeft, ChevronRight
} from 'lucide-react';
import API from '../../../../api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminFinance = ({ refreshId }) => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7days');
    const [financeData, setFinanceData] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        revenueGrowth: 0,
        pendingPayment: 0
    });
    const [revenueData, setRevenueData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [ledgerData, setLedgerData] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const ledgerScrollRef = useRef(null);

    const scrollLedger = (direction) => {
        if (ledgerScrollRef.current) {
            const scrollAmount = 400;
            ledgerScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const COLORS = ['#e11d48', '#0f172a', '#64748b', '#94a3b8']; // Rose, Slate900, Slate500, Slate400

    const timeOptions = [
        { label: 'Last 7 Days', value: '7days' },
        { label: 'Last 14 Days', value: '14days' },
        { label: 'Last 30 Days', value: '30days' }
    ];

    useEffect(() => {
        fetchAllData();
    }, [refreshId, timeRange]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [statsRes, revenueRes, categoryRes, ordersRes] = await Promise.all([
                API.get('/admin/analytics/finance-stats'),
                API.get('/admin/analytics/daily-sales'),
                API.get('/admin/analytics/category-distribution'),
                API.get('/admin/orders') // Fetch orders for "Recent Transactions"
            ]);

            // Stats
            const stats = statsRes.data;
            setFinanceData({
                totalRevenue: stats.totalRevenue || 0,
                totalOrders: stats.totalOrders || 0,
                averageOrderValue: stats.averageOrderValue || 0,
                revenueGrowth: stats.revenueGrowth || 0
            });

            // Revenue Chart
            const revenueArray = (revenueRes.data || []).map(day => ({
                date: day.date,
                revenue: day.sales,
                orders: day.orders,
                profit: Math.round(day.sales * 0.70) // Est 70% profit margin
            }));
            const rangeMap = { '7days': 7, '14days': 14, '30days': 30 };
            const limit = rangeMap[timeRange] || 7;
            setRevenueData(revenueArray.slice(-limit));

            // Category Pie Chart
            setCategoryData(categoryRes.data || []);

            // Recent Transactions (Last 5 orders)
            // Sort by date desc just in case, though usually backend returns sorted or natural order
            const sortedOrders = (ordersRes.data || [])
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);
            setRecentOrders(sortedOrders);

            // Process Ledger Data (Simulating Net Profit Flow)
            // Reverse engineer the balance history from current Total
            let runningBalance = stats.totalRevenue || 0;
            const ledgerHistory = [];

            // Add "Current" state
            ledgerHistory.push({
                index: 0,
                time: 'Now',
                balance: runningBalance,
                change: 0,
                type: 'current',
                orderId: ''
            });

            // We use all orders to show the full trend history
            const ledgerOrders = (ordersRes.data || [])
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Newest first

            ledgerOrders.forEach((order, idx) => {
                const amount = order.totalAmount || 0;

                // If current order is Cancelled:
                // It means we LOST this money recently. So BEFORE this, the balance was HIGHER.
                // PrevBalance = CurrentBalance + Amount
                if (order.status === 'cancelled') {
                    runningBalance += amount;
                    ledgerHistory.push({
                        index: idx + 1,
                        time: new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }),
                        balance: runningBalance,
                        change: -amount, // The event was a loss
                        type: 'cancellation',
                        orderId: order._id
                    });
                }
                // If current order is Paid/Delivered/Shipped:
                // It means we GAINED this money. So BEFORE this, the balance was LOWER.
                // PrevBalance = CurrentBalance - Amount
                else if (['paid', 'shipped', 'delivered'].includes(order.status)) {
                    runningBalance -= amount;
                    ledgerHistory.push({
                        index: idx + 1,
                        time: new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }),
                        balance: runningBalance,
                        change: amount, // The event was a gain
                        type: 'sale',
                        orderId: order._id
                    });
                }
                // Pending orders usually don't affect revenue yet, so we treat them as neutral or skip
                // For simplicity, we ignore them in the "Realized Revenue" flow
            });

            // Reverse to show oldest -> newest left-to-right
            setLedgerData(ledgerHistory.reverse());

        } catch (error) {
            console.error('Error fetching finance data:', error);
            toast.error("Failed to load financial data");
        } finally {
            setLoading(false);
        }
    };

    const generateReport = () => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(225, 29, 72);
        doc.text("Financial Report", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text("Summary", 14, 45);

        autoTable(doc, {
            startY: 50,
            head: [['Metric', 'Value']],
            body: [
                ['Total Revenue', `Rs. ${financeData.totalRevenue.toLocaleString()}`],
                ['Total Orders', financeData.totalOrders],
                ['Avg Order Value', `Rs. ${Math.round(financeData.averageOrderValue).toLocaleString()}`],
                ['Net Profit (Est.)', `Rs. ${(financeData.totalRevenue * 0.7).toLocaleString()}`]
            ],
            theme: 'striped',
            headStyles: { fillColor: [225, 29, 72] }
        });

        doc.save('Finance_Report.pdf');
    };

    if (loading) {
        return (
            <div className="p-8 bg-slate-50 min-h-screen">
                <div className="flex justify-between items-center mb-10">
                    <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-2xl shadow-sm animate-pulse" />)}
                </div>
                <div className="h-96 w-full bg-slate-200 rounded-2xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen font-sans text-slate-900">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 md:gap-6 mb-6 md:mb-10 animate-slideUp">
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2 md:gap-3 font-hero">
                        Financial Overview <Activity className="text-rose-600" />
                    </h1>
                    <p className="text-slate-500 font-medium text-xs md:text-sm mt-1">Real-time performance metrics</p>
                </div>

                <div className="grid grid-cols-2 sm:flex gap-3 w-full xl:w-auto">
                    <button
                        onClick={generateReport}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                        <Download size={16} />
                        Export
                    </button>

                    <div className="relative col-span-1">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-full sm:w-auto flex items-center justify-center sm:justify-between gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all shadow-sm font-bold text-slate-700 min-w-0 sm:min-w-[180px] text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap"
                        >
                            <span className="flex items-center gap-2 truncate">
                                <Calendar size={16} className="text-rose-600 flex-shrink-0" />
                                <span className="truncate">{timeOptions.find(opt => opt.value === timeRange)?.label}</span>
                            </span>
                        </button>

                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                                <div className="absolute top-full right-0 mt-2 w-full min-w-[150px] bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden animate-slideDown p-1">
                                    {timeOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setTimeRange(option.value);
                                                setShowDropdown(false);
                                            }}
                                            className={`
                                                w-full text-left px-4 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-colors
                                                ${timeRange === option.value ? 'bg-rose-50 text-rose-600' : 'text-slate-600 hover:bg-slate-50'}
                                            `}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                {[
                    {
                        title: 'Total Revenue',
                        value: `₹${financeData.totalRevenue.toLocaleString('en-IN')}`,
                        icon: DollarSign,
                        color: 'text-rose-600',
                        bg: 'bg-rose-50',
                        change: `+${financeData.revenueGrowth}%`,
                        isPositive: financeData.revenueGrowth >= 0
                    },
                    {
                        title: 'Total Orders',
                        value: financeData.totalOrders,
                        icon: ShoppingBag,
                        color: 'text-indigo-600',
                        bg: 'bg-indigo-50',
                        change: '+12%', // Static for now as placeholder or calc from daily
                        isPositive: true
                    },
                    {
                        title: 'Avg. Order Value',
                        value: `₹${Math.round(financeData.averageOrderValue).toLocaleString('en-IN')}`,
                        icon: CreditCard,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50',
                        change: '-2.4%',
                        isPositive: false
                    },
                    {
                        title: 'Net Profit (Est.)',
                        value: `₹${Math.round(financeData.totalRevenue * 0.7).toLocaleString('en-IN')}`,
                        icon: TrendingUp,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50',
                        change: '+8.1%',
                        isPositive: true
                    }
                ].map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                                <card.icon size={24} />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${card.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {card.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {card.change}
                            </span>
                        </div>
                        <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-1">{card.title}</h3>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                {/* Live Ledger Flow - New Section */}
                <div className="lg:col-span-3 bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Activity className="text-emerald-500" size={20} /> Net Profit Flow
                            </h2>
                            <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">Real-time visualization of income and cancellations</p>
                        </div>
                        <div className="flex flex-wrap gap-3 md:gap-4 text-[10px] md:text-xs font-bold items-center w-full md:w-auto justify-between md:justify-end">
                            <div className="flex gap-3">
                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Sales</span>
                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Cancellations</span>
                            </div>
                            <div className="flex gap-1 pl-4 md:border-l border-slate-200">
                                <button
                                    onClick={() => scrollLedger('left')}
                                    className="p-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => scrollLedger('right')}
                                    className="p-1.5 rounded-lg hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div ref={ledgerScrollRef} className="overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
                        <div style={{ minWidth: `${Math.max(1000, ledgerData.length * 60)}px`, height: '250px', minHeight: '250px' }}>
                            <ResponsiveContainer width="99%" height="100%">
                                <AreaChart data={ledgerData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                        interval={0} // Show all ticks (scrolling handles space)
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                        tickFormatter={(val) => `₹${val / 1000}k`}
                                        width={40}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100 text-xs z-50">
                                                        <p className="font-bold text-slate-400 mb-2">{label}</p>
                                                        <p className="font-black text-lg text-slate-900 mb-1">
                                                            ₹{data.balance.toLocaleString()}
                                                        </p>
                                                        {data.type !== 'current' && (
                                                            <div className={`flex items-center gap-1 font-bold ${data.change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                {data.change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                                {data.type === 'sale' ? 'Order' : 'Refund'} #{data.orderId.slice(-4).toUpperCase()}
                                                                <span className="ml-1">
                                                                    {data.change > 0 ? '+' : ''}₹{Math.abs(data.change).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="stepAfter"
                                        dataKey="balance"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fill="url(#colorBalance)"
                                        animationDuration={1000}
                                        dot={({ cx, cy, payload }) => {
                                            if (payload.change < 0) {
                                                return (
                                                    <circle cx={cx} cy={cy} r={4} fill="#e11d48" stroke="#fff" strokeWidth={2} />
                                                );
                                            }
                                            // Optional: Green dot for positive, simplified to only show "events" or endpoints
                                            if (payload.change > 0) {
                                                return (
                                                    <circle cx={cx} cy={cy} r={3} fill="#10b981" stroke="#fff" strokeWidth={1} />
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                    <div className="mb-4 md:mb-6">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Revenue Analytics</h2>
                        <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">Income vs Profit trends over time</p>
                    </div>
                    <div className="h-[300px] w-full min-w-0" style={{ minHeight: '300px' }}>
                        <ResponsiveContainer width="99%" height="100%">
                            <AreaChart data={revenueData}>
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
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: '#e11d48', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#e11d48"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Sales Pie */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Sales by Category</h2>
                        <p className="text-sm text-slate-400 font-medium">Distribution of product sales</p>
                    </div>
                    <div className="flex-1 min-h-[250px] relative min-w-0">
                        <ResponsiveContainer width="99%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase">Total</p>
                                <p className="text-xl font-black text-slate-900">{categoryData.reduce((a, b) => a + b.value, 0)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {categoryData.slice(0, 4).map((cat, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span className="text-xs font-bold text-slate-600 truncate">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Recent Transactions</h2>
                        <p className="text-sm text-slate-400 font-medium">Latest financial activity from orders</p>
                    </div>
                    <button className="text-xs font-black text-rose-600 hover:text-rose-700 uppercase tracking-wider">View All</button>
                </div>
                {/* Mobile Card View */}
                <div className="p-4 md:hidden flex flex-col gap-4">
                    {recentOrders.map((order) => (
                        <div key={order._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-black text-slate-900 text-sm font-hero">#{order._id.slice(-6).toUpperCase()}</span>
                                        <span className="text-[10px] items-center px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500 font-bold uppercase">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[9px] font-black text-slate-500">
                                            {order.customerId?.name?.[0] || 'G'}
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">{order.customerId?.name || 'Guest'}</span>
                                    </div>
                                </div>
                                <span className={`
                                    px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider
                                    ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'}
                                `}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-3 border-t border-slate-200/50">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Amount</span>
                                <span className={`text-lg font-black font-hero ${order.status === 'cancelled' ? 'text-rose-600' : 'text-slate-900'}`}>
                                    {order.status === 'cancelled' ? '-' : ''}₹{order.totalAmount?.toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Order ID</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Customer</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Date</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Status</th>
                                <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {recentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <span className="font-bold text-slate-700 text-xs font-hero">#{order._id.slice(-6).toUpperCase()}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                {order.customerId?.name?.[0] || 'G'}
                                            </div>
                                            <span className="text-sm font-bold text-slate-600">{order.customerId?.name || 'Guest'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-xs font-medium text-slate-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`
                                            inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wide
                                            ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                order.status === 'cancelled' ? 'bg-rose-50 text-rose-600' :
                                                    order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-amber-50 text-amber-600'}
                                        `}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <span className={`font-black text-sm ${order.status === 'cancelled' ? 'text-rose-600' : 'text-slate-900'}`}>
                                            {order.status === 'cancelled' ? '-' : ''}₹{order.totalAmount?.toLocaleString('en-IN')}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminFinance;
