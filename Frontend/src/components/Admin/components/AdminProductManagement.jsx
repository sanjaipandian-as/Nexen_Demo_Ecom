import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdEdit, MdDelete, MdSearch, MdFilterList, MdVisibility, MdAdd, MdInventory } from 'react-icons/md';
import API from '../../../../api';
import ProductUploadModal from './ProductUploadModal';

const AdminProductManagement = ({ onOpenUploadModal, refreshId }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    const categories = ['all', 'Body Care', 'Skin Care', 'Face Care', 'Hair Care'];

    useEffect(() => {
        fetchProducts();
    }, [refreshId, selectedCategory]); // Updated dependency array

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const query = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
            const response = await API.get(`/admin/products${query}`);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!productToDelete) return;

        try {
            await API.delete(`/admin/products/${productToDelete._id}`);
            toast.success('Product deleted successfully');
            setProducts(products.filter(p => p._id !== productToDelete._id));
            setShowDeleteModal(false);
            setProductToDelete(null);
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="px-6 py-6 bg-[#F3F6FA] min-h-screen">
            {/* Header / Top Bar */}
            <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#2563EB] mb-1">
                        <span>Admin</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-900">Products</span>
                    </div>
                    <h1 className="text-[28px] font-bold text-[#1E293B] leading-tight">Product Management</h1>
                    <p className="text-[#64748B] text-[15px] font-medium italic">Manage your entire product catalog from one place</p>
                </div>
                <button
                    onClick={onOpenUploadModal}
                    className="flex items-center gap-2 px-8 py-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white text-[13px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-blue-100"
                >
                    <MdAdd className="text-xl" />
                    Add New Product
                </button>
            </div>

            {/* Filters Area - Modern Unified Row */}
            <div className="flex flex-col md:flex-row gap-6 mb-10">
                {/* Search Bar (60%) */}
                <div className="relative flex-1 group">
                    <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-[#2563EB] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search products, brands, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[20px] outline-none transition-all focus:border-[#2563EB]/30 focus:shadow-[0_8px_30px_rgb(37,99,235,0.06)] text-slate-700 font-bold placeholder:text-slate-300"
                    />
                </div>

                {/* Category Dropdown (240px) */}
                <div className="relative w-full md:w-[260px] group">
                    <MdFilterList className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-[#2563EB] transition-colors pointer-events-none" />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-16 pr-12 py-5 bg-white border border-slate-100 rounded-[20px] outline-none transition-all focus:border-[#2563EB]/30 focus:shadow-[0_8px_30_rgba(37,99,235,0.06)] text-slate-700 font-black appearance-none cursor-pointer tracking-tight"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'All Categories' : cat}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 border-b-2 border-r-2 border-slate-200 rotate-45 mb-1 pointer-events-none group-focus-within:border-[#2563EB] transition-colors"></div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[24px] border border-slate-100 overflow-hidden">
                            <div className="h-56 bg-slate-100 animate-pulse"></div>
                            <div className="p-6 space-y-4">
                                <div className="h-4 w-1/3 bg-slate-100 rounded-full animate-pulse"></div>
                                <div className="space-y-2">
                                    <div className="h-6 w-full bg-slate-100 rounded-lg animate-pulse"></div>
                                    <div className="h-6 w-2/3 bg-slate-100 rounded-lg animate-pulse"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-10 flex-1 bg-slate-100 rounded-xl animate-pulse"></div>
                                    <div className="h-10 flex-1 bg-slate-100 rounded-xl animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-slate-100 p-24 text-center shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <MdInventory className="text-4xl text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1E293B] mb-3">No Products Found</h3>
                    <p className="text-[#64748B] mb-10 max-w-xs mx-auto font-medium">Your search didn't match any products in your catalog.</p>
                    <button
                        onClick={onOpenUploadModal}
                        className="px-10 py-4 bg-[#2563EB] text-white font-black uppercase tracking-widest text-[13px] rounded-2xl hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-100"
                    >
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product._id} className="group bg-white rounded-[24px] border border-slate-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:border-blue-100 transition-all duration-500 relative">
                            {/* Product Image Section */}
                            <div className="relative h-64 bg-slate-50 overflow-hidden p-5">
                                <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner">
                                    <img
                                        src={product.images?.[0] || '/placeholder.png'}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    {/* Subtle Shine Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                </div>

                                {/* Category Badge - Top Left inside image */}
                                <div className="absolute top-8 left-8 flex flex-col gap-2">
                                    <span className="backdrop-blur-md bg-white/80 text-[#2563EB] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-white/20">
                                        {product.category?.main}
                                    </span>
                                    {product.is_featured && (
                                        <span className="backdrop-blur-md bg-blue-600/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                                            Featured
                                        </span>
                                    )}
                                </div>

                                {/* Discount Badge - Top Right */}
                                <div className="absolute top-8 right-8">
                                    <div className="backdrop-blur-md bg-rose-500/90 text-white text-[11px] font-black px-3 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(244,63,94,0.3)]">
                                        -{product.pricing?.discount_percentage || 0}%
                                    </div>
                                </div>
                            </div>

                            {/* Product Info Section */}
                            <div className="p-8">
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{product.brand}</p>
                                    </div>
                                    <h3 className="font-bold text-[#1E293B] text-[16px] line-clamp-2 leading-relaxed group-hover:text-blue-600 transition-colors">
                                        {product.name}
                                    </h3>
                                </div>

                                <div className="flex items-end justify-between mb-8">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-black text-slate-900 leading-none">
                                                ₹{product.pricing?.selling_price?.toLocaleString('en-IN')}
                                            </span>
                                            {product.pricing?.mrp && (
                                                <span className="text-[13px] text-slate-300 font-bold line-through">
                                                    ₹{product.pricing.mrp.toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${product.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons - Modern Bottom Bar */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => navigate(`/product/${product.slug}`)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
                                    >
                                        <MdVisibility size={18} />
                                        View
                                    </button>
                                    <button
                                        onClick={() => {
                                            setProductToDelete(product);
                                            setShowDeleteModal(true);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-rose-50 text-rose-500 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-300 active:scale-95 shadow-sm"
                                    >
                                        <MdDelete size={18} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Product?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setProductToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

export default AdminProductManagement;
