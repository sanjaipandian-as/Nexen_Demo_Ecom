import { useState, useEffect, useRef } from 'react';
import { FaSearch, FaBell, FaUser, FaSignOutAlt, FaInfinity, FaBars, FaTimes, FaHome, FaShoppingBag, FaCog } from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../../api';

const Searchbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef(null);
    const debounceTimer = useRef(null);
    const notificationRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);


    const getPageTitle = () => {
        const path = location.pathname;
        const routeTitles = {

            '/': 'Home',
            '/products': 'Products',
            '/search': 'Search Results',


            '/Cart': 'Shopping Cart',
            '/Wishlist': 'My Wishlist',
            '/checkout': 'Checkout',
            '/Payment': 'Payment',


            '/Login': 'Customer Login',
            '/Register': 'Customer Sign Up',


            '/seller-login': 'Seller Login',
            '/seller-register': 'Seller Registration',
            '/seller-home': 'Seller Dashboard',


            '/admin-login': 'Admin Login',
            '/admin-Dashboard': 'Admin Dashboard',


            '/Settings': 'Account Settings',
            '/Settings/profile': 'My Profile',
            '/Settings/orders': 'My Orders',
            '/Settings/address': 'My Addresses',
            '/Settings/notifications': 'Notifications',
            '/Settings/security': 'Security Settings',
            '/Settings/payment-methods': 'Payment Methods',


            '/about': 'About Us',
            '/contact': 'Contact Us',


            '/Support': 'Customer Support',
            '/shipping': 'Shipping & Delivery',
            '/returns': 'Returns & Refunds',
            '/track-order': 'Track Your Order',
            '/faqs': 'Frequently Asked Questions',


            '/privacy-policy': 'Privacy Policy',
            '/terms-and-conditions': 'Terms & Conditions',


            '/Affiliate': 'Affiliate Program',
            '/BrandRegistry': 'Brand Registry',
            '/advertise': 'Advertise Your Products',
            '/sell': 'Sell on APK Crackers',


            '/careers': 'Careers',
            '/press': 'Press & Media',
            '/stores': 'Our Stores',
            '/sitemap': 'Sitemap',
            '/accessibility': 'Accessibility',
            '/legal': 'Legal Information',
        };


        if (path.startsWith('/product/')) return 'Product Details';
        if (path.startsWith('/category/')) {
            const category = path.split('/')[2];
            return category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category';
        }
        if (path.startsWith('/seller/')) return 'Seller Dashboard';
        if (path.startsWith('/admin/')) return 'Admin Panel';
        if (path.startsWith('/order/')) return 'Order Details';
        if (path.startsWith('/Settings/')) {
            const settingsPage = path.split('/')[2];
            const settingsTitles = {
                'profile': 'My Profile',
                'orders': 'My Orders',
                'address': 'My Addresses',
                'notifications': 'Notifications',
                'security': 'Security Settings',
                'payment-methods': 'Payment Methods',
            };
            return settingsTitles[settingsPage] || 'Settings';
        }

        return routeTitles[path] || 'APK Crackers';
    };

    useEffect(() => {
        // Check if user is logged in (check both localStorage and sessionStorage)
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const user = sessionStorage.getItem('user') || localStorage.getItem('user');
        const role = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
        const loginTime = sessionStorage.getItem('loginTime') || localStorage.getItem('loginTime');

        if (token && user) {
            // Check if 24 hours have passed since login
            if (loginTime) {
                const currentTime = new Date().getTime();
                const loginTimestamp = parseInt(loginTime);
                const hoursPassed = (currentTime - loginTimestamp) / (1000 * 60 * 60);

                // If more than 24 hours have passed, automatically logout
                if (hoursPassed >= 24) {
                    console.log('Session expired after 24 hours. Logging out...');
                    handleLogout();
                    toast.info('Your session has expired. Please login again.', {
                        position: "top-center",
                        autoClose: 5000,
                    });
                    return;
                }
            }

            setIsLoggedIn(true);
            setUserRole(role || 'customer');
            try {
                const userData = JSON.parse(user);
                setUserName(userData.name || userData.username || 'User');
                // Fetch notifications for logged-in users
                fetchNotifications();
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        // Set up interval to check session expiry every 5 minutes
        const checkSessionInterval = setInterval(() => {
            const loginTime = sessionStorage.getItem('loginTime') || localStorage.getItem('loginTime');
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');

            if (token && loginTime) {
                const currentTime = new Date().getTime();
                const loginTimestamp = parseInt(loginTime);
                const hoursPassed = (currentTime - loginTimestamp) / (1000 * 60 * 60);

                if (hoursPassed >= 24) {
                    console.log('Session expired after 24 hours. Logging out...');
                    handleLogout();
                    toast.info('Your session has expired. Please login again.', {
                        position: "top-center",
                        autoClose: 5000,
                    });
                }
            }
        }, 5 * 60 * 1000); // Check every 5 minutes

        // Cleanup interval on component unmount
        return () => clearInterval(checkSessionInterval);
    }, []);

    // Update document title based on current route
    useEffect(() => {
        const path = location.pathname;
        const routeTitles = {
            // Main Pages
            '/': 'Home',
            '/products': 'Products',
            '/search': 'Search Results',

            // Cart & Wishlist
            '/Cart': 'Shopping Cart',
            '/Wishlist': 'My Wishlist',
            '/checkout': 'Checkout',
            '/Payment': 'Payment',

            // Customer Auth
            '/Login': 'Customer Login',
            '/Register': 'Customer Sign Up',

            // Seller Auth & Dashboard
            '/seller-login': 'Seller Login',
            '/seller-register': 'Seller Registration',
            '/seller-home': 'Seller Dashboard',

            // Admin
            '/admin-login': 'Admin Login',
            '/admin-Dashboard': 'Admin Dashboard',

            // Settings & Profile
            '/Settings': 'Account Settings',
            '/Settings/profile': 'My Profile',
            '/Settings/orders': 'My Orders',
            '/Settings/address': 'My Addresses',
            '/Settings/notifications': 'Notifications',
            '/Settings/security': 'Security Settings',
            '/Settings/payment-methods': 'Payment Methods',

            // Company Pages
            '/about': 'About Us',
            '/contact': 'Contact Us',

            // Support & Help
            '/Support': 'Customer Support',
            '/shipping': 'Shipping & Delivery',
            '/returns': 'Returns & Refunds',
            '/track-order': 'Track Your Order',
            '/faqs': 'Frequently Asked Questions',

            // Legal & Policies
            '/privacy-policy': 'Privacy Policy',
            '/terms-and-conditions': 'Terms & Conditions',

            // Business & Partnerships
            '/Affiliate': 'Affiliate Program',
            '/BrandRegistry': 'Brand Registry',
            '/advertise': 'Advertise Your Products',
            '/sell': 'Sell on APK Crackers',

            // Footer Links
            '/careers': 'Careers',
            '/press': 'Press & Media',
            '/stores': 'Our Stores',
            '/sitemap': 'Sitemap',
            '/accessibility': 'Accessibility',
            '/legal': 'Legal Information',
        };

        let pageTitle = 'APK Crackers';

        // Check for exact route match first
        if (routeTitles[path]) {
            pageTitle = routeTitles[path];
        }
        // Check for dynamic routes
        else if (path.startsWith('/product/')) {
            pageTitle = 'Product Details';
        }
        else if (path.startsWith('/category/')) {
            const category = path.split('/')[2];
            pageTitle = category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Category';
        }
        else if (path.startsWith('/seller/')) {
            pageTitle = 'Seller Dashboard';
        }
        else if (path.startsWith('/admin/')) {
            pageTitle = 'Admin Panel';
        }
        else if (path.startsWith('/order/')) {
            pageTitle = 'Order Details';
        }
        else if (path.startsWith('/Settings/')) {
            const settingsPage = path.split('/')[2];
            const settingsTitles = {
                'profile': 'My Profile',
                'orders': 'My Orders',
                'address': 'My Addresses',
                'notifications': 'Notifications',
                'security': 'Security Settings',
                'payment-methods': 'Payment Methods',
            };
            pageTitle = settingsTitles[settingsPage] || 'Settings';
        }

        document.title = `${pageTitle} - APK Crackers`;
    }, [location.pathname]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions with debounce
    useEffect(() => {
        if (searchQuery.trim().length > 1) {
            // Clear previous timer
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            // Set new timer
            debounceTimer.current = setTimeout(() => {
                fetchSuggestions();
            }, 300); // 300ms debounce
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchQuery]);

    const fetchSuggestions = async () => {
        try {
            setLoadingSuggestions(true);
            const response = await API.get(`/search/suggest?q=${encodeURIComponent(searchQuery)}`);
            setSuggestions(Array.isArray(response.data) ? response.data : []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleSearch = (query = searchQuery) => {
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setShowSuggestions(false);
            setSearchQuery(query.trim());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                handleSearch(suggestions[selectedSuggestionIndex].name);
            } else {
                handleSearch();
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
        }
    };

    // Notification Functions
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            setLoadingNotifications(true);
            const response = await API.get('/notifications');
            const notifs = response.data.notifications || [];
            setNotifications(notifs);
            setUnreadCount(notifs.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await API.put(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order': return '📦';
            case 'payment': return '💳';
            case 'product': return '🎆';
            case 'kyc': return '✅';
            case 'payout': return '💰';
            default: return '🔔';
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const handleLogout = () => {
        // Clear authentication data from both storages
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('loginTime');

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('loginTime');

        setIsLoggedIn(false);
        setUserName('');
        setUserRole('');
        // Redirect to home page
        navigate('/');
    };



    return (
        <div
            className="sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-all duration-300"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        >

            <div className="px-4 md:px-6 lg:px-8 py-3.5 md:py-4">
                <div className="flex items-center justify-between gap-3 md:gap-4 lg:gap-6">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="cursor-pointer group"
                        >
                            <h1 className="text-lg md:text-xl lg:text-2xl font-bold whitespace-nowrap transition-all duration-300 group-hover:animate-sparkle" style={{ color: '#2E2E2E' }}>
                                <span style={{ color: '#E91E63' }}>Glam</span> Beauty
                            </h1>
                        </button>
                    </div>


                    <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl" ref={searchRef}>
                        <div className="relative w-full">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                            <input
                                type="text"
                                placeholder="Search skincare, makeup, brands…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#E91E63';
                                    searchQuery.trim().length > 1 && setShowSuggestions(true);
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#E5E7EB';
                                    setTimeout(() => {
                                        if (!searchQuery.trim()) {
                                            setShowSearchBar(false);
                                        }
                                    }, 200);
                                }}
                                autoFocus
                                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:shadow-md transition-all"
                                style={{ backgroundColor: '#F5F5F5', color: '#2E2E2E' }}
                                onMouseEnter={(e) => e.target.style.borderColor = '#F8BBD0'}
                                onMouseLeave={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />



                            {showSuggestions && (
                                <div
                                    className="absolute top-full left-0 right-0 mt-2 border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
                                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                                >
                                    {loadingSuggestions ? (
                                        <div className="p-4 text-center text-gray-500">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto" style={{ borderBottomColor: '#E91E63' }}></div>
                                        </div>
                                    ) : suggestions.length > 0 ? (
                                        <div className="py-2">
                                            {suggestions.map((suggestion, index) => (
                                                <button
                                                    key={suggestion._id}
                                                    onClick={() => handleSearch(suggestion.name)}
                                                    className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3`}
                                                    style={{ backgroundColor: index === selectedSuggestionIndex ? 'rgba(248, 187, 208, 0.2)' : 'transparent' }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(248, 187, 208, 0.2)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index === selectedSuggestionIndex ? 'rgba(248, 187, 208, 0.2)' : 'transparent'; }}
                                                >
                                                    <FaSearch className="w-4 h-4" style={{ color: '#E91E63' }} />
                                                    <span className="text-charcoal">{suggestion.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ) : searchQuery.trim().length > 1 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            No suggestions found
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="hidden md:flex items-center gap-3">

                        <button
                            onClick={() => navigate('/Cart')}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 transition-all duration-300 group"
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E91E63'; e.currentTarget.style.backgroundColor = 'rgba(248, 187, 208, 0.2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                            title="Cart"
                        >
                            <FaShoppingBag className="w-4 h-4 transition-colors" style={{ color: '#2E2E2E' }} onMouseEnter={(e) => e.target.style.color = '#E91E63'} onMouseLeave={(e) => e.target.style.color = '#2E2E2E'} />
                            <span className="text-sm font-medium transition-colors" style={{ color: '#2E2E2E' }} onMouseEnter={(e) => e.target.style.color = '#E91E63'} onMouseLeave={(e) => e.target.style.color = '#2E2E2E'}>Cart</span>
                        </button>


                        <button
                            onClick={() => navigate('/Wishlist')}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 transition-all duration-300 group"
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E91E63'; e.currentTarget.style.backgroundColor = 'rgba(248, 187, 208, 0.2)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                            title="Wishlist"
                        >
                            <BsFillBagHeartFill className="w-4 h-4 transition-colors" style={{ color: '#2E2E2E' }} onMouseEnter={(e) => e.target.style.color = '#E91E63'} onMouseLeave={(e) => e.target.style.color = '#2E2E2E'} />
                            <span className="text-sm font-medium transition-colors" style={{ color: '#2E2E2E' }} onMouseEnter={(e) => e.target.style.color = '#E91E63'} onMouseLeave={(e) => e.target.style.color = '#2E2E2E'}>Wishlist</span>
                        </button>
                    </div>


                    <div className="flex items-center gap-3">

                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 hover:bg-secondary/30 rounded-full transition-all cursor-pointer group"
                                title="Notifications"
                            >
                                <FaBell className="w-5 h-5 transition-colors" style={{ color: '#2E2E2E' }} onMouseEnter={(e) => e.target.style.color = '#E91E63'} onMouseLeave={(e) => e.target.style.color = '#2E2E2E'} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white" style={{ backgroundColor: '#C9A24D' }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>


                            {showNotifications && isLoggedIn && (
                                <div className="fixed sm:absolute top-16 sm:top-full left-2 right-2 sm:left-auto sm:right-0 mt-0 sm:mt-2 w-auto sm:w-80 md:w-96 bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl shadow-2xl z-50 max-h-[calc(100vh-5rem)] sm:max-h-[500px] overflow-hidden flex flex-col">

                                    <div className="p-3 sm:p-4 border-b border-gray-200 bg-primary/10 flex-shrink-0">
                                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900">Notifications</h3>
                                            <div className="flex items-center gap-2">
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={markAllAsRead}
                                                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 hover:bg-primary/20 rounded"
                                                    >
                                                        Mark all read
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => setShowNotifications(false)}
                                                    className="sm:hidden p-1 hover:bg-gray-200 rounded-full transition-colors"
                                                >
                                                    <FaTimes className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                        {unreadCount > 0 && (
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                                            </p>
                                        )}
                                    </div>


                                    <div className="overflow-y-auto flex-1 overscroll-contain">
                                        {loadingNotifications ? (
                                            <div className="p-6 sm:p-8 text-center">
                                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="p-6 sm:p-8 text-center">
                                                <FaBell className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                                                <p className="text-sm sm:text-base text-gray-600 font-medium">No notifications yet</p>
                                                <p className="text-xs sm:text-sm text-gray-500 mt-1">We'll notify you when something arrives</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100">
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification._id}
                                                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                                                        className={`p-3 sm:p-4 hover:bg-primary/10 active:bg-gray-100 transition-colors cursor-pointer ${!notification.isRead ? 'bg-primary/10' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-2 sm:gap-3">
                                                            <span className="text-xl sm:text-2xl flex-shrink-0 mt-0.5">
                                                                {getNotificationIcon(notification.type)}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                                    <h4 className={`text-sm sm:text-base font-semibold leading-tight ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                                        }`}>
                                                                        {notification.title}
                                                                    </h4>
                                                                    {!notification.isRead && (
                                                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5"></div>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-1.5">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-[10px] sm:text-xs text-gray-500">
                                                                    {getTimeAgo(notification.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>


                                    {notifications.length > 0 && (
                                        <div className="p-2 sm:p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                                            <button
                                                onClick={() => {
                                                    setShowNotifications(false);
                                                }}
                                                className="w-full text-center text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 py-2 hover:bg-primary/10 rounded transition-colors"
                                            >
                                                View all notifications
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>


                        {!isLoggedIn ? (
                            <>

                                <button
                                    onClick={() => navigate('/Login')}
                                    className="hidden md:block px-5 py-2.5 text-sm font-medium border border-gray-200 rounded-full transition-all"
                                    style={{ color: '#2E2E2E' }}
                                    onMouseEnter={(e) => { e.target.style.borderColor = '#E91E63'; e.target.style.backgroundColor = 'rgba(248, 187, 208, 0.2)'; }}
                                    onMouseLeave={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.backgroundColor = 'transparent'; }}
                                >
                                    Login
                                </button>


                                <button
                                    onClick={() => navigate('/Register')}
                                    className="hidden md:block px-5 py-2.5 text-sm font-medium text-white rounded-full transition-all shadow-sm"
                                    style={{ backgroundColor: '#E91E63' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(233, 30, 99, 0.9)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#E91E63'}
                                >
                                    Sign Up
                                </button>
                            </>
                        ) : (
                            <>

                                <button
                                    onClick={() => navigate(userRole === 'seller' ? '/seller-home' : '/Settings')}
                                    className="hidden md:flex w-10 h-10 rounded-full items-center justify-center cursor-pointer transition-all"
                                    style={{ backgroundColor: '#E91E63' }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(233, 30, 99, 0.9)'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#E91E63'}
                                    title={userRole === 'seller' ? "Go to Seller Dashboard" : "Go to Settings"}
                                >
                                    <FaCog className="w-5 h-5 text-white" />
                                </button>


                                <button
                                    onClick={handleLogout}
                                    className="hidden md:flex w-10 h-10 rounded-full border border-gray-200 items-center justify-center transition-all cursor-pointer"
                                    onMouseEnter={(e) => { e.target.style.borderColor = '#E91E63'; e.target.style.backgroundColor = 'rgba(248, 187, 208, 0.2)'; }}
                                    onMouseLeave={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.backgroundColor = 'transparent'; }}
                                    title="Logout"
                                >
                                    <FaSignOutAlt className="w-5 h-5 transition-colors" style={{ color: '#2E2E2E' }} onMouseEnter={(e) => e.target.style.color = '#E91E63'} onMouseLeave={(e) => e.target.style.color = '#2E2E2E'} />
                                </button>
                            </>
                        )}


                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-full transition-all"
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            {isMobileMenuOpen ? (
                                <FaTimes className="w-5 h-5 text-gray-600" />
                            ) : (
                                <FaBars className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>
            </div>


            <div className="md:hidden px-3 pb-3" ref={searchRef}>
                <div className="relative group">
                    <FaSearch
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors z-10"
                        style={{ color: '#9CA3AF' }}
                    />
                    <input
                        type="text"
                        placeholder="Search skincare, makeup, brands…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#E91E63';
                            searchQuery.trim().length > 1 && setShowSuggestions(true);
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#E5E7EB';
                        }}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:bg-white transition-all cursor-text shadow-sm"
                        style={{ backgroundColor: '#F9FAFB', color: '#374151' }}
                    />


                    {showSuggestions && (
                        <div
                            className="absolute top-full left-0 right-0 mt-2 border-2 border-gray-200 rounded-2xl shadow-xl z-50 max-h-64 overflow-y-auto"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                        >
                            {loadingSuggestions ? (
                                <div className="p-4 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 mx-auto" style={{ borderBottomColor: '#E91E63' }}></div>
                                </div>
                            ) : suggestions.length > 0 ? (
                                <div className="py-2">
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={suggestion._id}
                                            onClick={() => handleSearch(suggestion.name)}
                                            className={`w-full px-3 py-2.5 text-left transition-colors flex items-center gap-2`}
                                            style={{ backgroundColor: index === selectedSuggestionIndex ? 'rgba(233, 30, 99, 0.1)' : 'transparent' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.1)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = index === selectedSuggestionIndex ? 'rgba(233, 30, 99, 0.1)' : 'transparent'; }}
                                        >
                                            <FaSearch className="w-3 h-3 text-gray-400" />
                                            <span className="text-sm" style={{ color: '#374151' }}>{suggestion.name}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : searchQuery.trim().length > 1 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    No suggestions found
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>


            {
                isMobileMenuOpen && (
                    <div
                        className="md:hidden border-t border-gray-200 shadow-lg"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                    >
                        {!isLoggedIn ? (
                            <div className="px-4 py-4 space-y-3">

                                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">

                                    <button
                                        onClick={() => {
                                            navigate('/');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-sm font-medium rounded-lg transition-all flex items-center gap-3"
                                        style={{ color: '#374151', backgroundColor: '#F9FAFB' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                                    >
                                        <FaHome className="w-4 h-4 text-gray-600" />
                                        <span>Home</span>
                                    </button>


                                    <button
                                        onClick={() => {
                                            navigate('/Cart');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-3"
                                    >
                                        <FaShoppingBag className="w-4 h-4 text-gray-600" />
                                        <span>Cart</span>
                                    </button>


                                    <button
                                        onClick={() => {
                                            navigate('/Wishlist');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-3"
                                    >
                                        <BsFillBagHeartFill className="w-4 h-4 text-gray-600" />
                                        <span>Wishlist</span>
                                    </button>
                                </div>


                                <button
                                    onClick={() => {
                                        navigate('/Login');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-sm font-semibold border-2 rounded-lg transition-all flex items-center justify-center gap-2"
                                    style={{ color: '#374151', backgroundColor: '#FFFFFF', borderColor: '#D1D5DB' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#E91E63'; e.currentTarget.style.color = '#E91E63'; e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.1)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                                >
                                    <FaUser className="w-4 h-4" />
                                    Login
                                </button>


                                <button
                                    onClick={() => {
                                        navigate('/Register');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full px-4 py-3 text-sm font-semibold text-white rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
                                    style={{ backgroundColor: '#E91E63' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(233, 30, 99, 0.9)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#E91E63'; }}
                                >
                                    <FaUser className="w-4 h-4" />
                                    Sign Up
                                </button>
                            </div>
                        ) : (
                            <div className="px-4 py-4">

                                <div className="pb-4 mb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E91E63' }}>
                                            <FaUser className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-gray-900">{userName}</h3>
                                            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                                        </div>
                                    </div>
                                </div>


                                <div className="space-y-2">

                                    <button
                                        onClick={() => {
                                            navigate('/');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-sm font-medium rounded-lg transition-all flex items-center gap-3"
                                        style={{ color: '#374151', backgroundColor: '#F9FAFB' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                                    >
                                        <FaHome className="w-4 h-4 text-gray-600" />
                                        <span>Home</span>
                                    </button>


                                    <button
                                        onClick={() => {
                                            navigate('/Cart');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-sm font-medium rounded-lg transition-all flex items-center gap-3"
                                        style={{ color: '#374151', backgroundColor: '#F9FAFB' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                                    >
                                        <FaShoppingBag className="w-4 h-4 text-gray-600" />
                                        <span>Cart</span>
                                    </button>


                                    <button
                                        onClick={() => {
                                            navigate('/Wishlist');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-3"
                                    >
                                        <BsFillBagHeartFill className="w-4 h-4 text-gray-600" />
                                        <span>Wishlist</span>
                                    </button>


                                    <button
                                        onClick={() => {
                                            navigate('/Settings');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-3"
                                    >
                                        <FaUser className="w-4 h-4 text-gray-600" />
                                        <span>Profile Settings</span>
                                    </button>


                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-sm font-medium rounded-lg transition-all flex items-center gap-3"
                                        style={{ color: '#DC2626', backgroundColor: '#FEF2F2' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
                                    >
                                        <FaSignOutAlt className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
};

export default Searchbar;
