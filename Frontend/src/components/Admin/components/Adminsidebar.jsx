import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdDashboard,
    MdVerifiedUser,
    MdInventory,
    MdCheckCircle,
    MdCancel,
    MdShoppingCart,
    MdSettings,
    MdLogout,
    MdPerson,
    MdNotifications,
    MdAttachMoney,
    MdAdd,
    MdCategory
} from 'react-icons/md';

const Adminsidebar = ({ onNavigate, activePage = 'Dashboard', onOpenUploadModal }) => {
    const navigate = useNavigate();
    const [adminInfo, setAdminInfo] = useState({ name: '', email: '' });
    const [pendingOrders, setPendingOrders] = useState(0);
    const [pendingKYC, setPendingKYC] = useState(0);

    useEffect(() => {
        // Get admin info from localStorage
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                setAdminInfo({
                    name: userData.name || 'Admin',
                    email: userData.email || ''
                });
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }

        // Check for 24-hour auto-logout
        checkLoginExpiry();

        // Set up interval to check every minute
        const interval = setInterval(checkLoginExpiry, 60000);

        return () => clearInterval(interval);
    }, []);

    const checkLoginExpiry = () => {
        const loginTime = localStorage.getItem('loginTime');
        const userRole = localStorage.getItem('userRole');

        if (loginTime && userRole === 'admin') {
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - parseInt(loginTime);
            const hoursPassed = timeDiff / (1000 * 60 * 60);

            // If more than 24 hours have passed, auto-logout
            if (hoursPassed >= 24) {
                handleLogout(true);
            }
        }
    };

    const handleLogout = (isAutoLogout = false) => {
        // Clear all auth data from both sessionStorage and localStorage
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('loginTime');

        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('loginTime');

        // Show alert if auto-logout
        if (isAutoLogout) {
            alert('Your session has expired after 24 hours. Please login again.');
        }

        // Redirect to admin login
        navigate('/admin-login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: MdDashboard },
        { name: 'Products', icon: MdInventory },
        { name: 'Categories', icon: MdCategory },
        { name: 'Orders', icon: MdShoppingCart },
        { name: 'Finance', icon: MdAttachMoney },
    ];

    const bottomMenuItems = [
        { name: 'Settings', icon: MdSettings },
        { name: 'Logout', icon: MdLogout },
    ];

    const handleItemClick = (itemName) => {
        if (itemName === 'Logout') {
            handleLogout(false);
        } else if (onNavigate) {
            onNavigate(itemName);
        }
    };

    return (
        <div className="w-60 h-screen bg-white border-r border-slate-100 flex flex-col py-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)] relative z-50">
            {/* Logo/Brand Section */}
            <div className="px-6 mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 hover:rotate-6 transition-transform">
                        <MdInventory className="text-white text-xl" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">GrowWeGo</span>
                </div>
            </div>

            {/* Admin Profile Card - Redesigned */}
            <div className="px-4 mb-10">
                <div className="relative group p-4 rounded-3xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden p-0.5">
                                <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center">
                                    <MdPerson className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-slate-900 font-bold text-[13px] truncate leading-tight">
                                {adminInfo.name}
                            </h3>
                            <p className="text-primary/80 text-[11px] truncate font-bold mt-0.5 uppercase tracking-wider">
                                System Admin
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Menu Items */}
            <div className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 opacity-70">Main Dashboard</p>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.name;

                    return (
                        <div
                            key={item.name}
                            onClick={() => handleItemClick(item.name)}
                            className={`
                                group flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer
                                transition-all duration-300 relative
                                ${isActive
                                    ? 'bg-primary text-white shadow-[0_8px_16px_rgba(37,99,235,0.25)] ring-1 ring-primary'
                                    : 'text-slate-500 hover:bg-primary/5 hover:text-primary'
                                }
                            `}
                        >
                            <Icon className={`text-xl transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                            <span className={`text-[13px] font-bold flex-1 ${isActive ? 'text-white' : ''}`}>
                                {item.name}
                            </span>
                            {item.badge && (
                                <span className={`
                                    text-[10px] font-black px-2 py-0.5 rounded-full min-w-[20px] text-center
                                    ${isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}
                                `}>
                                    {item.badge}
                                </span>
                            )}
                            {isActive && (
                                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Menu Items */}
            <div className="flex flex-col gap-1 px-3 pt-6 border-t border-slate-50 mt-auto">
                {bottomMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.name;

                    return (
                        <div
                            key={item.name}
                            onClick={() => handleItemClick(item.name)}
                            className={`
                                group flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer
                                transition-all duration-300
                                ${item.name === 'Logout'
                                    ? 'text-primary hover:bg-primary/5 hover:shadow-sm'
                                    : isActive
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-slate-500 hover:bg-primary/5 hover:text-primary'
                                }
                            `}
                        >
                            <Icon className={`text-xl ${isActive ? 'text-white' : item.name === 'Logout' ? 'text-primary' : 'text-slate-400 group-hover:text-primary'}`} />
                            <span className={`text-[13px] font-bold ${isActive ? 'text-white' : ''}`}>
                                {item.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Adminsidebar;
