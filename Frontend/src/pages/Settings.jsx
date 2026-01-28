import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBell, FaMapMarkerAlt, FaBox, FaTicketAlt, FaChevronRight } from 'react-icons/fa';
import Skeleton from '../components/Common/Skeleton';

// Lazy load components
const AccountSettings = lazy(() => import('./Settingscomponants/AccountSettings'));
const OrdersPage = lazy(() => import('./Orderspage'));
const AddressManagement = lazy(() => import('./Settingscomponants/AddressManagement'));
const NotificationSettings = lazy(() => import('./Settingscomponants/NotificationSettings'));
const Tickets = lazy(() => import('./Settingscomponants/Tickets'));

const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(true);

    // User Data State
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // Fetch user data on component mount
    useEffect(() => {
        fetchUserData();
    }, []);

    // Update document title based on active tab
    useEffect(() => {
        const tabTitles = {
            'account': 'Account Settings',
            'orders': 'My Orders',
            'addresses': 'My Addresses',
            'tickets': 'Support Tickets',
            'notifications': 'Notifications'
        };
        document.title = `${tabTitles[activeTab] || 'Settings'} - AJIZZ FASHIONS`;
    }, [activeTab]);

    // Fetch user profile data
    const fetchUserData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                navigate('/Login');
                return;
            }

            // For all users, use stored data
            const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setUserData({
                    name: user.name || user.username || user.businessName || 'User',
                    email: user.email || '',
                    phone: user.phone || ''
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'account', label: 'Account', icon: FaUser, description: 'Personal information' },
        { id: 'orders', label: 'My Orders', icon: FaBox, description: 'Track your orders' },
        { id: 'addresses', label: 'Addresses', icon: FaMapMarkerAlt, description: 'Manage delivery addresses' },
        { id: 'tickets', label: 'Support Tickets', icon: FaTicketAlt, description: 'View support tickets' },
        { id: 'notifications', label: 'Notifications', icon: FaBell, description: 'Manage alerts' }
    ];

    // Loading spinner component
    const LoadingSpinner = () => (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-gray-200 rounded-full" />
                <div className="space-y-3">
                    <div className="h-6 w-48 bg-gray-200 rounded" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
            </div>
            <div className="space-y-4">
                <div className="h-32 w-full bg-gray-100 rounded-xl" />
                <div className="h-32 w-full bg-gray-100 rounded-xl" />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="h-screen bg-white flex flex-col overflow-hidden p-6">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="h-screen bg-white flex flex-col overflow-hidden">
            {/* Header - Fixed at Top */}
            <div className="flex-none bg-white border-b border-gray-200 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#E91E63] rounded-full flex items-center justify-center shadow-md">
                            <FaUser className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                            <p className="text-sm text-gray-500">Manage your account and preferences</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Tabs - Horizontal Scroll */}
            <div className="lg:hidden flex-none bg-white border-b border-gray-200 overflow-x-auto no-scrollbar">
                <div className="flex p-2 min-w-max">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${isActive
                                    ? 'border-[#E91E63] text-[#E91E63] bg-[#E91E63]/5'
                                    : 'border-transparent text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={isActive ? 'text-[#E91E63]' : 'text-gray-400'} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Independent Scrolling Area */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex w-full">
                    {/* Desktop Sidebar - Fixed Width (25%) & Independent Scroll */}
                    <div className="hidden lg:block w-1/4 flex-none py-8 pr-8 overflow-y-auto custom-scrollbar border-r border-gray-100">
                        <div className="space-y-3">
                            <h3 className="px-6 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Preferences</h3>
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-left transition-all duration-200 group ${isActive
                                            ? 'bg-[#E91E63] text-white shadow-lg shadow-[#E91E63]/25'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white'} transition-colors`}>
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#E91E63] transition-colors'}`} />
                                            </div>
                                            <div>
                                                <span className="block font-bold text-base">{tab.label}</span>
                                                <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-400'} font-medium`}>{tab.description}</span>
                                            </div>
                                        </div>
                                        {isActive && <FaChevronRight className="w-4 h-4 text-white/90" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area - Independent Scroll */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                        <div className="py-6 lg:pl-8 min-h-full">
                            <Suspense fallback={<LoadingSpinner />}>
                                <div className="animate-fadeIn">
                                    {/* Account Settings */}
                                    {activeTab === 'account' && (
                                        <AccountSettings userData={userData} setUserData={setUserData} />
                                    )}

                                    {/* My Orders */}
                                    {activeTab === 'orders' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                                                <div className="w-10 h-10 bg-[#E91E63]/10 rounded-lg flex items-center justify-center">
                                                    <FaBox className="w-5 h-5 text-[#E91E63]" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
                                                    <p className="text-sm text-gray-500">Track and manage your orders</p>
                                                </div>
                                            </div>
                                            <OrdersPage />
                                        </div>
                                    )}

                                    {/* Address Management */}
                                    {activeTab === 'addresses' && (
                                        <AddressManagement />
                                    )}

                                    {/* Support Tickets */}
                                    {activeTab === 'tickets' && (
                                        <Tickets />
                                    )}

                                    {/* Notifications */}
                                    {activeTab === 'notifications' && (
                                        <NotificationSettings />
                                    )}
                                </div>
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
