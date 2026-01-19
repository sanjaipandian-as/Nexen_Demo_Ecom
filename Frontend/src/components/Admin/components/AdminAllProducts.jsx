import React, { useState, useEffect } from 'react';
import {
    MdInventory,
    MdCheckCircle,
    MdCancel,
    MdPending,
    MdSearch,
    MdFilterList,
    MdRefresh,
    MdVisibility,
    MdEdit,
    MdDelete,
    MdStore
} from 'react-icons/md';
import { FaRupeeSign, FaBox } from 'react-icons/fa';
import API from '../../../../api';
import Skeleton from '../../Common/Skeleton';


const AdminAllProducts = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
    });

    useEffect(() => {
        fetchAllProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, statusFilter]);

    const fetchAllProducts = async () => {
        try {
            setLoading(true);
            const response = await API.get('/admin/products/all');
            setProducts(response.data);
            calculateStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    const calculateStats = (productData) => {
        setStats({
            total: productData.length,
            approved: productData.filter(p => p.status === 'approved').length,
            pending: productData.filter(p => p.status === 'pending').length,
            rejected: productData.filter(p => p.status === 'rejected').length
        });
    };

    const filterProducts = () => {
        let filtered = products;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (typeof p.category === 'object' ? p.category?.main : p.category)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.sellerId?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    };

    const getStatusColor = (status) => {
        const colors = {
            'approved': 'bg-green-100 text-green-700',
            'pending': 'bg-yellow-100 text-yellow-700',
            'rejected': 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved':
                return MdCheckCircle;
            case 'pending':
                return MdPending;
            case 'rejected':
                return MdCancel;
            default:
                return MdInventory;
        }
    };

    const statCards = [
        {
            title: 'Total Products',
            value: stats.total,
            icon: MdInventory,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-600'
        },
        {
            title: 'Approved',
            value: stats.approved,
            icon: MdCheckCircle,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            textColor: 'text-green-600'
        },
        {
            title: 'Pending',
            value: stats.pending,
            icon: MdPending,
            bgColor: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            textColor: 'text-yellow-600'
        },
        {
            title: 'Rejected',
            value: stats.rejected,
            icon: MdCancel,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600',
            textColor: 'text-red-600'
        }
    ];

    return (
        <div>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
                                <MdInventory className="text-blue-500 text-xl" />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage all products across the platform
                            </p>
                        </div>
                        <button
                            onClick={fetchAllProducts}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <MdRefresh className="w-5 h-5" />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 bg-gray-50 min-h-screen">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <Skeleton variant="circle" className="w-12 h-12" />
                                </div>
                                <Skeleton className="h-4 w-1/3 mb-2" />
                                <Skeleton className="h-8 w-1/2" />
                            </div>
                        ))
                    ) : (
                        statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                                            <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                                    <p className={`text-3xl font-bold ${stat.textColor}`}>
                                        {stat.value}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>


                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by product name, category, or seller..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <MdFilterList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">
                            Products List ({filteredProducts.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[...Array(7)].map((_, i) => (
                                            <th key={i} className="px-6 py-3">
                                                <Skeleton className="h-4 w-20" />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[...Array(5)].map((_, i) => (
                                        <tr key={i}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="w-12 h-12 rounded-lg" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-20" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                            <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : filteredProducts.length === 0 ? (

                        <div className="p-12 text-center">
                            <MdInventory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium mb-2">No products found</p>
                            <p className="text-gray-400 text-sm">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'No products available in the system'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Seller</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => {
                                        const StatusIcon = getStatusIcon(product.status);
                                        return (
                                            <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                            {product.images && product.images[0] ? (
                                                                <img
                                                                    src={product.images[0]}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.src = '/Monkey.jpg';
                                                                        e.target.onerror = null;
                                                                    }}
                                                                />
                                                            ) : (
                                                                <img
                                                                    src="/Monkey.jpg"
                                                                    alt="No Image"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                                {product.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                ID: {product._id.slice(-8)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <MdStore className="text-gray-400 w-4 h-4" />
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {product.sellerId?.businessName || 'N/A'}
                                                            </p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {product.sellerId?.email || ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                                        {product.category?.main || product.category || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                                                        <FaRupeeSign className="w-3 h-3" />
                                                        {(product.pricing?.selling_price || product.price || 0).toLocaleString('en-IN')}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${(product.stock_control?.available_pieces || product.stock || 0) > 10
                                                        ? 'bg-green-100 text-green-700'
                                                        : (product.stock_control?.available_pieces || product.stock || 0) > 0
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {product.stock_control?.available_pieces || product.stock || 0} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <StatusIcon className={`w-4 h-4 ${getStatusColor(product.status).split(' ')[1]}`} />
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(product.status)}`}>
                                                            {product.status}
                                                        </span>
                                                    </div>
                                                    {product.status === 'rejected' && product.rejectionReason && (
                                                        <p className="text-xs text-red-600 mt-1 truncate max-w-xs">
                                                            Reason: {product.rejectionReason}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {new Date(product.createdAt).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAllProducts;
