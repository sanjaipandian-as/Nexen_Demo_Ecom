import { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaKey, FaLock, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import API from '../../../api';

const AccountSettings = ({ userData, setUserData }) => {
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedData, setEditedData] = useState({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
    });
    const [saving, setSaving] = useState(false);

    // Password Change State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const inputClasses = "w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-gray-400 bg-white hover:border-gray-300";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-2.5";

    // Save profile changes
    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

            // Update based on role
            if (userRole === 'seller') {
                await API.put('/seller/profile', {
                    businessName: editedData.name,
                    email: editedData.email,
                    phone: editedData.phone
                });
            } else {
                // For customer/admin, update local storage
                const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    user.name = editedData.name;
                    user.email = editedData.email;
                    user.phone = editedData.phone;

                    if (localStorage.getItem('user')) {
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                    if (sessionStorage.getItem('user')) {
                        sessionStorage.setItem('user', JSON.stringify(user));
                    }
                }
            }

            setUserData(editedData);
            setIsEditingProfile(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // Handle password change
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');

        // Validation
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return;
        }

        if (passwordData.oldPassword === passwordData.newPassword) {
            setPasswordError('New password must be different from old password');
            return;
        }

        try {
            setSaving(true);
            const userRole = localStorage.getItem('userRole') || sessionStorage.getItem('userRole');

            // Call appropriate password change endpoint based on role
            if (userRole === 'customer') {
                await API.put('/customer/auth/change-password', {
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword
                });
            } else {
                // For seller and admin, show message that it's not implemented
                setPasswordError('Password change is only available for customers');
                setSaving(false);
                return;
            }

            alert('Password changed successfully!');
            setShowPasswordForm(false);
            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError(error.response?.data?.message || 'Failed to change password. Please check your old password.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 sm:gap-3 pb-4 sm:pb-6 border-b border-gray-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <FaUser className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Account Information</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Update your personal details and information</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div>
                    <label className={labelClasses}>
                        <FaUser className="inline mr-2 text-orange-500" />
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={isEditingProfile ? editedData.name : userData.name}
                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                        disabled={!isEditingProfile}
                        className={`${inputClasses} ${!isEditingProfile ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="Enter your name"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className={labelClasses}>
                        <FaEnvelope className="inline mr-2 text-orange-500" />
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={isEditingProfile ? editedData.email : userData.email}
                        onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                        disabled={!isEditingProfile}
                        className={`${inputClasses} ${!isEditingProfile ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="your.email@example.com"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className={labelClasses}>
                        <FaPhone className="inline mr-2 text-orange-500" />
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={isEditingProfile ? editedData.phone : userData.phone}
                        onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        disabled={!isEditingProfile}
                        className={`${inputClasses} ${!isEditingProfile ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="+91 98765 43210"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {!isEditingProfile ? (
                    <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30"
                    >
                        <FaEdit className="inline mr-2" />
                        Edit Profile
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50"
                        >
                            <FaSave className="inline mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            onClick={() => {
                                setIsEditingProfile(false);
                                setEditedData(userData);
                            }}
                            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>

            {/* Password Section */}
            <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FaKey className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Password & Security</h3>
                </div>

                {!showPasswordForm ? (
                    <button
                        onClick={() => setShowPasswordForm(true)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all shadow-sm hover:shadow"
                    >
                        <FaLock className="inline mr-2" />
                        Change Password
                    </button>
                ) : (
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-xl font-bold text-gray-900">Change Password</h4>
                            <button
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                    setPasswordError('');
                                }}
                                className="p-2 hover:bg-white rounded-lg transition-all"
                            >
                                <FaTimes className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-6">
                            {passwordError && (
                                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 font-medium">
                                    {passwordError}
                                </div>
                            )}

                            <div>
                                <label className={labelClasses}>Old Password</label>
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Enter old password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Enter new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Confirm new password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50"
                                >
                                    {saving ? 'Changing...' : 'Change Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                        setPasswordError('');
                                    }}
                                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountSettings;
