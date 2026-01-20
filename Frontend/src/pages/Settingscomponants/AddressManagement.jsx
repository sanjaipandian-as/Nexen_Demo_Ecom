import { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSave } from 'react-icons/fa';
import API from '../../../api';
import Skeleton from '../../components/Common/Skeleton';


const AddressManagement = () => {
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({
        fullname: '',
        phone: '',
        pincode: '',
        state: '',
        city: '',
        addressLine: '',
        landmark: ''
    });

    const inputClasses = "w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-gray-400 bg-white hover:border-gray-300";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-2.5";

    useEffect(() => {
        fetchAddresses();
    }, []);

    // Fetch all addresses
    const fetchAddresses = async () => {
        try {
            setLoadingAddresses(true);
            const response = await API.get('/address');
            setAddresses(response.data || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            alert('Failed to load addresses');
        } finally {
            setLoadingAddresses(false);
        }
    };

    // Add new address
    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await API.post('/address', addressForm);
            alert('Address added successfully!');
            setShowAddressForm(false);
            resetAddressForm();
            fetchAddresses();
        } catch (error) {
            console.error('Error adding address:', error);
            alert(error.response?.data?.message || 'Failed to add address');
        }
    };

    // Update address
    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/address/${editingAddress}`, addressForm);
            alert('Address updated successfully!');
            setEditingAddress(null);
            setShowAddressForm(false);
            resetAddressForm();
            fetchAddresses();
        } catch (error) {
            console.error('Error updating address:', error);
            alert(error.response?.data?.message || 'Failed to update address');
        }
    };

    // Delete address
    const handleDeleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            await API.delete(`/address/${addressId}`);
            alert('Address deleted successfully!');
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            alert(error.response?.data?.message || 'Failed to delete address');
        }
    };

    // Set default address
    const handleSetDefaultAddress = async (addressId) => {
        try {
            await API.put(`/address/default/${addressId}`);
            alert('Default address updated!');
            fetchAddresses();
        } catch (error) {
            console.error('Error setting default address:', error);
            alert(error.response?.data?.message || 'Failed to set default address');
        }
    };

    // Edit address
    const handleEditAddress = (address) => {
        setEditingAddress(address._id);
        setAddressForm({
            fullname: address.fullname,
            phone: address.phone,
            pincode: address.pincode,
            state: address.state,
            city: address.city,
            addressLine: address.addressLine,
            landmark: address.landmark || ''
        });
        setShowAddressForm(true);
    };

    // Reset form
    const resetAddressForm = () => {
        setAddressForm({
            fullname: '',
            phone: '',
            pincode: '',
            state: '',
            city: '',
            addressLine: '',
            landmark: ''
        });
        setEditingAddress(null);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <FaMapMarkerAlt className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Delivery Addresses</h2>
                        <p className="text-sm text-gray-500">Manage your saved addresses</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        resetAddressForm();
                        setShowAddressForm(true);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl hover:from-primary/90 hover:to-primary transition-all shadow-lg shadow-primary/30 flex items-center gap-2"
                >
                    <FaPlus className="w-4 h-4" />
                    Add New Address
                </button>
            </div>

            {/* Address Form */}
            {showAddressForm && (
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <button
                            onClick={() => {
                                setShowAddressForm(false);
                                resetAddressForm();
                            }}
                            className="p-2 hover:bg-white rounded-lg transition-all"
                        >
                            <FaTimes className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <form onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>Full Name</label>
                                <input
                                    type="text"
                                    value={addressForm.fullname}
                                    onChange={(e) => setAddressForm({ ...addressForm, fullname: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Phone Number</label>
                                <input
                                    type="tel"
                                    value={addressForm.phone}
                                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                    className={inputClasses}
                                    placeholder="+91 98765 43210"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className={labelClasses}>Address Line</label>
                                <input
                                    type="text"
                                    value={addressForm.addressLine}
                                    onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                                    className={inputClasses}
                                    placeholder="House No., Building Name, Street"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Landmark (Optional)</label>
                                <input
                                    type="text"
                                    value={addressForm.landmark}
                                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Near..."
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>City</label>
                                <input
                                    type="text"
                                    value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    className={inputClasses}
                                    placeholder="City"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>State</label>
                                <input
                                    type="text"
                                    value={addressForm.state}
                                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                    className={inputClasses}
                                    placeholder="State"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>PIN Code</label>
                                <input
                                    type="text"
                                    value={addressForm.pincode}
                                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                    className={inputClasses}
                                    placeholder="600001"
                                    pattern="[0-9]{6}"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddressForm(false);
                                    resetAddressForm();
                                }}
                                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl hover:from-primary/90 hover:to-primary transition-all shadow-lg shadow-primary/30"
                            >
                                <FaSave className="inline mr-2" />
                                {editingAddress ? 'Update Address' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Address List */}
            {loadingAddresses ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="p-6 rounded-2xl border-2 border-gray-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-10 h-10 rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-gray-100">
                                <Skeleton className="h-9 flex-1 rounded-lg" />
                                <Skeleton className="h-9 flex-1 rounded-lg" />
                                <Skeleton className="h-9 w-12 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : addresses.length === 0 ? (

                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <FaMapMarkerAlt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
                    <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
                    <button
                        onClick={() => {
                            resetAddressForm();
                            setShowAddressForm(true);
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white font-semibold rounded-xl hover:from-primary/90 hover:to-primary transition-all shadow-lg shadow-primary/30"
                    >
                        <FaPlus className="inline mr-2" />
                        Add Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <div
                            key={address._id}
                            className={`p-6 rounded-2xl border-2 transition-all ${address.isDefault
                                ? 'border-primary bg-gradient-to-r from-primary/5 to-secondary/5 shadow-lg shadow-primary/10'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${address.isDefault ? 'bg-primary' : 'bg-gray-100'
                                        }`}>
                                        <FaMapMarkerAlt className={`w-5 h-5 ${address.isDefault ? 'text-white' : 'text-gray-600'
                                            }`} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{address.fullname}</h4>
                                        {address.isDefault && (
                                            <span className="inline-block px-2 py-1 bg-primary text-white text-xs font-semibold rounded mt-1">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4 text-sm text-gray-700">
                                <p>{address.addressLine}</p>
                                {address.landmark && <p className="text-gray-600">Landmark: {address.landmark}</p>}
                                <p>{address.city}, {address.state} - {address.pincode}</p>
                                <p className="font-semibold">Phone: {address.phone}</p>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-200">
                                {!address.isDefault && (
                                    <button
                                        onClick={() => handleSetDefaultAddress(address._id)}
                                        className="flex-1 px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-all text-sm"
                                    >
                                        <FaCheck className="inline mr-1" />
                                        Set Default
                                    </button>
                                )}
                                <button
                                    onClick={() => handleEditAddress(address)}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all text-sm"
                                >
                                    <FaEdit className="inline mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteAddress(address._id)}
                                    className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-all text-sm"
                                >
                                    <FaTrash className="inline" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressManagement;
