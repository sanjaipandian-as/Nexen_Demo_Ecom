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
    MdViewCarousel,
    MdClose
} from 'react-icons/md';

const Adminsidebar = ({ onNavigate, activePage = 'Dashboard', onOpenUploadModal, isOpen, onClose }) => {
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

    // Close sidebar on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen && onClose) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

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
        <>
            {/* Mobile Backdrop */}
            <div
                className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar Container */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-72 h-screen bg-white border-r border-slate-100 
                flex flex-col py-8 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
                transform transition-transform duration-300 ease-in-out font-body
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand Section */}
                <div className="px-8 mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-4 group cursor-default">
                        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white font-black text-xl font-hero">G</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none font-hero">
                                <span className="text-[#E91E63]">Glam</span> <span className="text-slate-900">Beauty</span>
                            </h1>
                            <p className="text-[10px] font-bold text-rose-500 tracking-[0.2em] uppercase mt-1">Admin Panel</p>
                        </div>
                    </div>
                    {/* Close Button Mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                        <MdClose size={24} />
                    </button>
                </div>

                {/* Admin Profile */}
                <div className="px-6 mb-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-transparent rounded-2xl p-2 flex items-center gap-4 transition-all group">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm text-rose-600 group-hover:scale-110 transition-transform">
                            <MdPerson size={24} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-base font-black text-slate-900 truncate font-hero">{adminInfo.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 flex flex-col gap-2 px-6 overflow-y-auto no-scrollbar animate-slideUp" style={{ animationDelay: '0.2s' }}>
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
                                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
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
        </>
    );
};

export default Adminsidebar;
