import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdPerson, MdLock, MdNotifications, MdStore, MdSave, MdCategory, MdArrowForward, MdTune, MdSecurity, MdStorefront } from 'react-icons/md';
import API from '../../../../api';

const AdminSettings = ({ onNavigate }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [adminData, setAdminData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Notifications State
    const [notifications, setNotifications] = useState({
        emailOrders: true,
        emailProducts: true,
        emailCustomers: false,
        pushOrders: true,
        pushProducts: false
    });

    useEffect(() => {
        // Load admin data
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                setAdminData(prev => ({
                    ...prev,
                    username: userData.username || '',
                    email: userData.email || ''
                }));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, []);

    // Fetch categories when tab is active
    useEffect(() => {
        if (activeTab === 'categories') {
            fetchCategories();
        }
    }, [activeTab]);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await API.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.success('Your profile has been updated!');
        } catch (error) {
            toast.error('Could not update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (adminData.newPassword !== adminData.confirmPassword) {
            toast.error('The passwords you entered do not match.');
            return;
        }
        if (adminData.newPassword.length < 6) {
            toast.error('Please ensure your password is at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.success('Your password has been securely updated.');
            setAdminData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            toast.error('We couldn\'t update your password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationUpdate = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.success('Your notification preferences are saved.');
        } catch (error) {
            toast.error('Could not save preferences.');
        } finally {
            setLoading(false);
        }
    };

    const handleManageCategoriesRedirect = () => {
        if (onNavigate) {
            onNavigate('Categories');
        } else {
            toast.info("Please navigate to the Categories page using the sidebar to make changes.");
        }
    };

    const tabs = [
        { id: 'profile', label: 'General', description: 'Update your account\'s public profile and private details.', icon: MdTune },
        { id: 'password', label: 'Security', description: 'Keep your account secure with a strong password.', icon: MdSecurity },
        { id: 'store', label: 'Storefront', description: 'Control the public information visible on your storefront.', icon: MdStorefront },
        { id: 'notifications', label: 'Notifications', description: 'Choose what updates matter to you and how you receive them.', icon: MdNotifications },
        { id: 'categories', label: 'Taxonomy', description: 'An overview of your product organization structure.', icon: MdCategory }
    ];

    // Refined Professional Styles
    const inputClasses = "w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all duration-300 outline-none text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium text-base md:text-sm hover:border-slate-300";
    const labelClasses = "block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2.5 ml-1";
    const buttonClasses = "group relative flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 hover:shadow-xl hover:shadow-rose-500/20 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden";
    const cardClasses = "bg-white p-6 md:p-10 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-500";

    const activeTabInfo = tabs.find(t => t.id === activeTab);

    return (
        <div className="min-h-screen bg-slate-50/50 font-body selection:bg-rose-100 selection:text-rose-900">
            <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-12">

                {/* Header Section with Back Button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-slideUp">
                    <div>
                        <button
                            onClick={() => onNavigate && onNavigate('Dashboard')}
                            className="inline-flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-rose-600 mb-4 transition-colors group"
                        >
                            <MdArrowForward className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-hero mb-2">Settings</h1>
                        <p className="text-slate-500 font-medium text-base md:text-lg max-w-2xl">
                            Configure your admin experience and storefront preferences.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

                    {/* Left Sidebar: Navigation */}
                    <div className="lg:col-span-4 space-y-8 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <div className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm lg:sticky lg:top-24">
                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all duration-300 group
                                                ${isActive
                                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                            `}
                                        >
                                            <Icon className={`text-xl ${isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                            <div>
                                                <span className={`block text-sm font-bold tracking-tight ${isActive ? 'text-white' : 'text-slate-700'}`}>
                                                    {tab.label}
                                                </span>
                                            </div>
                                            {isActive && (
                                                <MdArrowForward className="ml-auto text-rose-400 animate-pulse" />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Mobile-only Context Info (Hidden on Desktop, as it's clear from selection) */}
                        <div className="lg:hidden px-4">
                            <h2 className="text-xl font-black text-slate-900 mb-2 font-hero">{activeTabInfo?.label}</h2>
                            <p className="text-sm text-slate-500 font-medium">{activeTabInfo?.description}</p>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>

                        {/* Desktop Context Info */}
                        <div className="hidden lg:block mb-8">
                            <h2 className="text-2xl font-black text-slate-900 mb-2 font-hero">{activeTabInfo?.label}</h2>
                            <p className="text-base text-slate-500 font-medium">{activeTabInfo?.description}</p>
                        </div>

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className={cardClasses}>
                                <form onSubmit={handleProfileUpdate} className="space-y-8">
                                    <div className="flex items-center gap-6 mb-8 group cursor-pointer">
                                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border-4 border-white shadow-xl shadow-slate-100 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-rose-100 overflow-hidden relative">
                                            <MdPerson className="text-4xl md:text-5xl relative z-10 transition-colors group-hover:text-rose-500" />
                                            <div className="absolute inset-0 bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </div>
                                        <div>
                                            <button type="button" className="text-rose-600 text-sm font-bold hover:text-rose-700 transition-colors">Change Profile Photo</button>
                                            <p className="text-[10px] md:text-xs text-slate-400 mt-1.5 font-medium">Accepts JPG, GIF or PNG. Max size of 1MB.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClasses}>Display Name</label>
                                            <input
                                                type="text"
                                                value={adminData.username}
                                                onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                                                className={inputClasses}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClasses}>Email Address</label>
                                            <input
                                                type="email"
                                                value={adminData.email}
                                                onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                                                className={inputClasses}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50 flex justify-end">
                                        <button type="submit" disabled={loading} className={buttonClasses}>
                                            <MdSave className="text-lg group-hover:rotate-12 transition-transform duration-300" />
                                            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div className={cardClasses}>
                                <form onSubmit={handlePasswordChange} className="space-y-8">
                                    <div>
                                        <label className={labelClasses}>Current Password</label>
                                        <input
                                            type="password"
                                            value={adminData.currentPassword}
                                            onChange={(e) => setAdminData({ ...adminData, currentPassword: e.target.value })}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClasses}>New Password</label>
                                            <input
                                                type="password"
                                                value={adminData.newPassword}
                                                onChange={(e) => setAdminData({ ...adminData, newPassword: e.target.value })}
                                                className={inputClasses}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Confirm Password</label>
                                            <input
                                                type="password"
                                                value={adminData.confirmPassword}
                                                onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                                                className={inputClasses}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50 flex justify-end">
                                        <button type="submit" disabled={loading} className={buttonClasses}>
                                            <MdLock className="text-lg group-hover:scale-110 transition-transform duration-300" />
                                            <span>{loading ? 'Updating...' : 'Update Password'}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Store Tab */}
                        {activeTab === 'store' && (
                            <div className={cardClasses}>
                                <div className="space-y-8">
                                    <div>
                                        <label className={labelClasses}>Store Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Grow We Go"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Store Description</label>
                                        <textarea
                                            rows="4"
                                            defaultValue="Your premium destination for fashion and lifestyle."
                                            className={`${inputClasses} resize-none`}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClasses}>Contact Email</label>
                                            <input
                                                type="email"
                                                defaultValue="support@growwego.com"
                                                className={inputClasses}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Support Phone</label>
                                            <input
                                                type="tel"
                                                defaultValue="+91 88888 99999"
                                                className={inputClasses}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-slate-50 flex justify-end">
                                        <button className={buttonClasses}>
                                            <MdSave className="text-lg group-hover:rotate-12 transition-transform duration-300" />
                                            <span>Save Settings</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className={cardClasses}>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 ml-1">Email Alerts</h3>
                                <div className="space-y-4 mb-8">
                                    {Object.entries(notifications).filter(([key]) => key.startsWith('email')).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl transition-colors hover:bg-slate-100/80 group">
                                            <span className="font-bold text-slate-700 text-sm group-hover:text-slate-900 transition-colors">
                                                {key.replace('email', '').replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-12 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:duration-300 peer-checked:bg-rose-600 peer-checked:shadow-lg peer-checked:shadow-rose-500/30"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex justify-end">
                                    <button onClick={handleNotificationUpdate} disabled={loading} className={buttonClasses}>
                                        <MdSave className="text-lg group-hover:rotate-12 transition-transform duration-300" />
                                        <span>Save Preferences</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Categories Summary Tab */}
                        {activeTab === 'categories' && (
                            <div className="space-y-6">
                                <div className={cardClasses}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Current Categories</h3>
                                        <button
                                            onClick={handleManageCategoriesRedirect}
                                            className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-widest hover:underline group"
                                        >
                                            <span>Manage Taxonomy</span>
                                            <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>

                                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                                        {loadingCategories ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-50 rounded-2xl animate-pulse"></div>)}
                                            </div>
                                        ) : categories.length === 0 ? (
                                            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                <p className="text-slate-400 font-bold">No categories found</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {categories.map((cat, index) => (
                                                    <div key={index} className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-rose-200 hover:bg-white hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 group cursor-default text-center">
                                                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-400 mb-4 shadow-sm group-hover:text-rose-600 group-hover:scale-110 transition-all duration-300 overflow-hidden">
                                                            {cat.icon ? <img src={cat.icon} className="w-full h-full object-cover" alt={cat.name} /> : <MdCategory className="text-2xl" />}
                                                        </div>
                                                        <span className="font-bold text-slate-700 text-xs group-hover:text-slate-900 transition-colors line-clamp-2">{cat.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
