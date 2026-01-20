import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    MdSearch,
    MdFilterList,
    MdRefresh,
    MdInventory,
    MdCheckCircle,
    MdPending,
    MdCancel,
    MdEdit,
    MdDelete,
    MdAdd
} from 'react-icons/md';
import { FaRupeeSign } from 'react-icons/fa';
import API from '../../../../api';
import ProductUploadModal from './ProductUploadModal';
import PlaceholderImage from '../../../assets/Placeholder.png';

const AdminAllProducts = ({ refreshId }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

    // Modal & Action States
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const [stats, setStats] = useState({
        total: 0,
        lowStock: 0,
        outOfStock: 0,
        active: 0
    });

    const categories = ['all', 'Body Care', 'Skin Care', 'Face Care', 'Hair Care'];

    useEffect(() => {
        fetchAllProducts();
    }, [refreshId]);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, categoryFilter]);

    const fetchAllProducts = async () => {
        try {
            setLoading(true);
            const response = await API.get('/admin/products');
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
            lowStock: productData.filter(p => p.stock > 0 && p.stock < 10).length,
            outOfStock: productData.filter(p => p.stock === 0).length,
            active: productData.filter(p => !p.is_deleted).length
        });
    };

    const filterProducts = () => {
        let filtered = products;

        // Filter by category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category?.main === categoryFilter);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.category?.main || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    };

    // --- Action Handlers ---

    const handleAddProduct = () => {
        setProductToEdit(null); // Ensure we are in add mode
        setShowUploadModal(true);
    };

    const handleEdit = (product) => {
        setProductToEdit(product);
        setShowUploadModal(true);
    };

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            await API.delete(`/admin/products/${productToDelete._id}`);
            toast.success('Product deleted successfully');
            fetchAllProducts(); // Refresh list
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const handleUploadSuccess = () => {
        fetchAllProducts();
        setShowUploadModal(false);
        setProductToEdit(null);
    };

    // -----------------------

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'bg-rose-100 text-rose-700' };
        if (stock < 10) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700' };
        return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700' };
    };

    const statCards = [
        {
            title: 'Total Products',
            value: stats.total,
            icon: MdInventory,
            iconColor: 'text-rose-600',
            bgAccent: 'bg-rose-50'
        },
        {
            title: 'Active Products',
            value: stats.active,
            icon: MdCheckCircle,
            iconColor: 'text-emerald-600',
            bgAccent: 'bg-emerald-50'
        },
        {
            title: 'Low Stock',
            value: stats.lowStock,
            icon: MdPending,
            iconColor: 'text-amber-600',
            bgAccent: 'bg-amber-50'
        },
        {
            title: 'Out of Stock',
            value: stats.outOfStock,
            icon: MdCancel,
            iconColor: 'text-rose-600',
            bgAccent: 'bg-rose-50'
        }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-body p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-slideUp">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-hero">Global Product Catalog</h1>
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-bold uppercase tracking-widest rounded-full border border-rose-100">
                            Database
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Centralized inventory management system.
                    </p>
                </div>
                <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-rose-500/20 active:scale-95 text-xs uppercase tracking-widest"
                >
                    <MdAdd className="text-lg" />
                    <span>Add New Product</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 h-32 animate-pulse"></div>
                    ))
                ) : (
                    statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="group bg-white rounded-[2rem] border border-slate-100 p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all duration-300 relative overflow-hidden">
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest font-hero">{stat.title}</h3>
                                    <div className={`p-2.5 rounded-2xl ${stat.bgAccent} group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-slate-900 relative z-10 font-hero">{stat.value.toLocaleString()}</p>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Filters & Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-slideUp" style={{ animationDelay: '0.2s' }}>
                {/* Search Field */}
                <div className="relative w-full md:w-96 group">
                    <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors text-xl" />
                    <input
                        type="text"
                        placeholder="Search by name, brand, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-500/10 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Category Filter - Custom Dropdown */}
                    <div className="relative min-w-[200px]">
                        <button
                            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                            onBlur={() => setTimeout(() => setIsCategoryDropdownOpen(false), 200)}
                            className={`w-full flex items-center justify-between pl-6 pr-4 py-4 bg-white border rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-600 transition-all ${isCategoryDropdownOpen ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-slate-200 hover:border-rose-300'}`}
                        >
                            <span className="capitalize">{categoryFilter === 'all' ? 'All Categories' : categoryFilter}</span>
                            <MdFilterList className={`text-lg transition-colors ${isCategoryDropdownOpen ? 'text-rose-500' : 'text-slate-400'}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isCategoryDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                {categories.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setCategoryFilter(option);
                                            setIsCategoryDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between group
                                            ${categoryFilter === option
                                                ? 'bg-rose-50 text-rose-600'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-rose-600'
                                            }`}
                                    >
                                        <span className="capitalize">{option === 'all' ? 'All Categories' : option}</span>
                                        {categoryFilter === option && <MdCheckCircle className="text-rose-600" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={fetchAllProducts}
                        className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
                        title="Refresh Data"
                    >
                        <MdRefresh className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden animate-slideUp" style={{ animationDelay: '0.3s' }}>
                {loading ? (
                    <div className="p-24 text-center">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400 font-bold animate-pulse text-sm uppercase tracking-widest">Loading catalog...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-24 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MdInventory className="text-4xl text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 font-hero">No Products Found</h3>
                        <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">
                            We couldn't find any products matching your search criteria.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Product Info</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Category</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Price</th>
                                    <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Status</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Inventory</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest font-hero">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredProducts.map((product) => {
                                    const stockStatus = getStockStatus(product.stock);
                                    return (
                                        <tr key={product._id} className="group hover:bg-slate-50/50 transition-colors">
                                            {/* Product Info */}
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0 relative overflow-hidden">
                                                        <img
                                                            src={product.images?.[0] || PlaceholderImage}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover rounded-xl"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = PlaceholderImage;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate max-w-[200px] mb-1 group-hover:text-rose-600 transition-colors font-hero">
                                                            {product.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                                                                {product.brand}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-white border border-slate-100 text-slate-600 shadow-sm">
                                                    {product.category?.main || 'Uncategorized'}
                                                </span>
                                            </td>

                                            {/* Pricing */}
                                            <td className="px-8 py-5">
                                                <div className="font-black text-slate-900 flex items-center gap-0.5 text-sm">
                                                    <FaRupeeSign className="text-[10px] text-slate-400" />
                                                    {(product.pricing?.selling_price || 0).toLocaleString('en-IN')}
                                                </div>
                                                {product.pricing?.mrp > product.pricing?.selling_price && (
                                                    <div className="text-[10px] text-slate-400 line-through mt-0.5 font-bold">
                                                        ₹{product.pricing?.mrp?.toLocaleString('en-IN')}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Stock Status */}
                                            <td className="px-8 py-5 text-center">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${stockStatus.color}`}>
                                                    {stockStatus.label}
                                                </div>
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${(product.stock || 0) > 10 ? 'bg-emerald-500' :
                                                                (product.stock || 0) > 0 ? 'bg-amber-500' : 'bg-rose-500'
                                                                }`}
                                                            style={{ width: `${Math.min(((product.stock || 0) / 100) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-500 min-w-[3rem]">
                                                        {product.stock || 0} left
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <MdEdit className="text-lg" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(product)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                                        title="Delete"
                                                    >
                                                        <MdDelete className="text-lg" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer Pagination (Visual Only) */}
                {!loading && filteredProducts.length > 0 && (
                    <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Showing {filteredProducts.length} of {stats.total} Products
                        </span>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest hover:border-rose-200 hover:text-rose-600 transition-all">Previous</button>
                            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest hover:border-rose-200 hover:text-rose-600 transition-all">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Upload/Edit Modal */}
            <ProductUploadModal
                isOpen={showUploadModal}
                onClose={() => {
                    setShowUploadModal(false);
                    setProductToEdit(null);
                }}
                onSuccess={handleUploadSuccess}
                productToEdit={productToEdit}
            />

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-slideUp">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                            <MdDelete className="text-3xl text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 text-center mb-2 font-hero">Delete Product?</h3>
                        <p className="text-sm text-slate-500 text-center mb-8 font-medium">
                            Are you sure you want to delete <span className="font-bold text-slate-900">"{productToDelete?.name}"</span>? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-3.5 bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-3.5 bg-rose-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAllProducts;
