import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdDashboard,
    MdInventory,
    MdShoppingCart,
    MdSettings,
    MdLogout,
    MdPerson,
    MdAttachMoney,
    MdCategory,
    MdViewCarousel
} from 'react-icons/md';

const Adminsidebar = ({ onNavigate, activePage = 'Dashboard', onOpenUploadModal }) => {
    const navigate = useNavigate();
    const [adminInfo, setAdminInfo] = useState({ name: '', email: '' });

    useEffect(() => {
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
        checkLoginExpiry();
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

            if (hoursPassed >= 24) {
                handleLogout(true);
            }
        }
    };

    const handleLogout = (isAutoLogout = false) => {
        sessionStorage.clear();
        localStorage.clear();
        if (isAutoLogout) {
            alert('Your session has expired after 24 hours. Please login again.');
        }
        navigate('/admin-login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: MdDashboard },
        { name: 'Products', icon: MdInventory },
        { name: 'Categories', icon: MdCategory },
        { name: 'Orders', icon: MdShoppingCart },
        { name: 'Hero Section', icon: MdViewCarousel },
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
        <div className="w-72 h-screen bg-white border-r border-slate-100 flex flex-col py-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-50 font-body">
            {/* Brand Section */}
            <div className="px-8 mb-12 animate-slideUp">
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-black text-xl font-hero">G</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none font-hero">GROW</h1>
                        <p className="text-[10px] font-bold text-rose-500 tracking-[0.2em] uppercase mt-1">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* Admin Profile */}
            <div className="px-6 mb-10 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 transition-all hover:bg-white hover:shadow-md hover:shadow-slate-100/50">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm text-rose-600">
                        <MdPerson size={20} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-black text-slate-900 truncate font-hero">{adminInfo.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div className="flex-1 flex flex-col gap-2 px-6 overflow-y-auto animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <p className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 font-hero">Navigation</p>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.name;

                    return (
                        <div
                            key={item.name}
                            onClick={() => handleItemClick(item.name)}
                            className={`
                                group flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer
                                transition-all duration-300 relative overflow-hidden
                                ${isActive
                                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 translate-x-1'
                                    : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:translate-x-1'
                                }
                            `}
                        >
                            <Icon className={`text-xl relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-rose-500'}`} />
                            <span className={`text-[13px] font-bold tracking-wide relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : ''}`}>
                                {item.name}
                            </span>

                            {/* Hover/Active Effect Overlay */}
                            {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="px-6 pt-6 mt-auto border-t border-slate-50 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                <div className="flex flex-col gap-2">
                    {bottomMenuItems.map((item) => {
                        const Icon = item.icon;
                        const isLogout = item.name === 'Logout';
                        const isActive = activePage === item.name;

                        return (
                            <div
                                key={item.name}
                                onClick={() => handleItemClick(item.name)}
                                className={`
                                    flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer
                                    transition-all duration-300
                                    ${isLogout
                                        ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                        : isActive
                                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                                            : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                    }
                                `}
                            >
                                <Icon className="text-xl transition-transform duration-300 group-hover:scale-110" />
                                <span className="text-[13px] font-bold tracking-wide">{item.name}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-8 mb-4 px-4 text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest font-hero">v2.4.0 • 2026</p>
                </div>
            </div>
        </div>
    );
};

export default Adminsidebar;
