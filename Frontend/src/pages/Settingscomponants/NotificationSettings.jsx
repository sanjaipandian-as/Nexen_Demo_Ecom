import { useState, useEffect } from 'react';
import { FaBell, FaEnvelope, FaPhone, FaShoppingBag, FaGlobe, FaSave } from 'react-icons/fa';

const NotificationSettings = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotions: true,
        newsletter: true
    });

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setSettings(prev => ({ ...prev, ...parsed }));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }, []);

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveSettings = () => {
        // Save settings to localStorage
        localStorage.setItem('userSettings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    };

    const notificationOptions = [
        { key: 'emailNotifications', title: 'Email Notifications', desc: 'Receive notifications via email', icon: FaEnvelope },
        { key: 'smsNotifications', title: 'SMS Notifications', desc: 'Receive notifications via SMS', icon: FaPhone },
        { key: 'orderUpdates', title: 'Order Updates', desc: 'Get updates about your orders', icon: FaShoppingBag },
        { key: 'promotions', title: 'Promotions & Offers', desc: 'Receive exclusive deals and offers', icon: FaGlobe },
        { key: 'newsletter', title: 'Newsletter', desc: 'Stay updated with our newsletter', icon: FaBell }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FaBell className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
                    <p className="text-sm text-gray-500">Choose how you want to be notified</p>
                </div>
            </div>

            <div className="space-y-4">
                {notificationOptions.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                        <div key={item.key} className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-orange-200 transition-all group">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-all">
                                    <ItemIcon className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                    <p className="text-sm text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings[item.key]}
                                    onChange={(e) => handleChange(item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-orange-600 shadow-inner"></div>
                            </label>
                        </div>
                    );
                })}
            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm text-gray-500">Changes will be saved to your account</p>
                <button
                    onClick={handleSaveSettings}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 flex items-center gap-2"
                >
                    <FaSave className="w-4 h-4" />
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default NotificationSettings;
