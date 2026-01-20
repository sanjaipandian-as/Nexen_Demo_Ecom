import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdPerson, MdLock, MdNotifications, MdStore, MdSave, MdCategory } from 'react-icons/md';
import API from '../../../../api';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [adminData, setAdminData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [categories, setCategories] = useState([
        'Body Care',
        'Skin Care',
        'Face Care',
        'Hair Care'
    ]);
    const [newCategory, setNewCategory] = useState('');
    const [notifications, setNotifications] = useState({
        emailOrders: true,
        emailProducts: true,
        emailCustomers: false,
        pushOrders: true,
        pushProducts: false
    });

    useEffect(() => {
        // Load admin data from localStorage
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

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (adminData.newPassword !== adminData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (adminData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Password changed successfully');
            setAdminData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error) {
            toast.error('Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        if (!newCategory.trim()) {
            toast.error('Please enter a category name');
            return;
        }

        if (categories.includes(newCategory)) {
            toast.error('Category already exists');
            return;
        }

        setCategories([...categories, newCategory]);
        setNewCategory('');
        toast.success('Category added successfully');
    };

    const handleRemoveCategory = (category) => {
        setCategories(categories.filter(c => c !== category));
        toast.success('Category removed successfully');
    };

    const handleNotificationUpdate = async () => {
        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Notification settings updated');
        } catch (error) {
            toast.error('Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: MdPerson },
        { id: 'password', label: 'Password', icon: MdLock },
        { id: 'categories', label: 'Categories', icon: MdCategory },
        { id: 'notifications', label: 'Notifications', icon: MdNotifications },
        { id: 'store', label: 'Store Settings', icon: MdStore }
    ];

    const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Manage your account and platform settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${activeTab === tab.id
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="text-xl" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div>
                                        <label className={labelClasses}>Username</label>
                                        <input
                                            type="text"
                                            value={adminData.username}
                                            onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Email</label>
                                        <input
                                            type="email"
                                            value={adminData.email}
                                            onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition-colors"
                                    >
                                        <MdSave />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-6">
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
                                        <label className={labelClasses}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={adminData.confirmPassword}
                                            onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition-colors"
                                    >
                                        <MdLock />
                                        {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Categories Tab */}
                        {activeTab === 'categories' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Categories</h2>
                                <div className="mb-6">
                                    <label className={labelClasses}>Add New Category</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            className={inputClasses}
                                            placeholder="Enter category name"
                                        />
                                        <button
                                            onClick={handleAddCategory}
                                            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                                        >
                                            Add Category
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-gray-900 mb-3">Current Categories</h3>
                                    {categories.map((category, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <span className="font-medium text-gray-900">{category}</span>
                                            <button
                                                onClick={() => handleRemoveCategory(category)}
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Email Notifications</h3>
                                        <div className="space-y-3">
                                            {Object.entries(notifications).filter(([key]) => key.startsWith('email')).map(([key, value]) => (
                                                <label key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                                                    <span className="text-gray-900">
                                                        {key.replace('email', '').replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        checked={value}
                                                        onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                                                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Push Notifications</h3>
                                        <div className="space-y-3">
                                            {Object.entries(notifications).filter(([key]) => key.startsWith('push')).map(([key, value]) => (
                                                <label key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                                                    <span className="text-gray-900">
                                                        {key.replace('push', '').replace(/([A-Z])/g, ' $1').trim()}
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        checked={value}
                                                        onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                                                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNotificationUpdate}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-gray-400 transition-colors"
                                    >
                                        <MdSave />
                                        {loading ? 'Saving...' : 'Save Preferences'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Store Settings Tab */}
                        {activeTab === 'store' && (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Settings</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClasses}>Store Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Demo E-commerce"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Store Description</label>
                                        <textarea
                                            rows="4"
                                            defaultValue="Your one-stop shop for beauty and personal care products"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Contact Email</label>
                                        <input
                                            type="email"
                                            defaultValue="support@demo-ecom.com"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Contact Phone</label>
                                        <input
                                            type="tel"
                                            defaultValue="+91 1234567890"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <button
                                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <MdSave />
                                        Save Store Settings
                                    </button>
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
