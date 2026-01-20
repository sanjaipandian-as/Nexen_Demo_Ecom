import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdImage, MdClose, MdCategory, MdSearch, MdRefresh } from 'react-icons/md';
import { FaLayerGroup } from 'react-icons/fa';
import API from '../../../../api';
import PlaceholderImage from '../../../assets/Placeholder.png';

const AdminCategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await API.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, icon: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        setSubmitting(true);
        const data = new FormData();
        data.append('name', formData.name);
        if (formData.icon) {
            data.append('icon', formData.icon);
        }

        try {
            if (editMode) {
                await API.put(`/categories/update/${currentCategory._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category updated successfully');
            } else {
                await API.post('/categories/add', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Category created successfully');
            }

            fetchCategories();
            closeModal();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error(error.response?.data?.message || 'Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setCurrentCategory(category);
        setFormData({ name: category.name, icon: null });
        setImagePreview(category.icon);
        setEditMode(true);
        setShowModal(true);
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            await API.delete(`/categories/delete/${categoryId}`);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setCurrentCategory(null);
        setFormData({ name: '', icon: null });
        setImagePreview(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentCategory(null);
        setFormData({ name: '', icon: null });
        setImagePreview(null);
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Styling constants matching Pink Professional Theme
    const inputStyle = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400 text-sm";
    const labelStyle = "block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-body p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-slideUp">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-hero">Category Management</h1>
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[11px] font-bold uppercase tracking-widest rounded-full border border-rose-100">
                            Structure
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                        Organize your store's product hierarchy.
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-rose-500/20 active:scale-95 text-xs uppercase tracking-widest"
                >
                    <MdAdd className="text-lg" />
                    <span>Add Category</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] animate-slideUp" style={{ animationDelay: '0.1s' }}>
                <div className="relative w-full md:w-96 group">
                    <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors text-xl" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-bold placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-500/10 transition-all outline-none"
                    />
                </div>
                <button
                    onClick={fetchCategories}
                    className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
                    title="Refresh Data"
                >
                    <MdRefresh className="text-xl" />
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[2rem] h-64 border border-slate-100 p-4 animate-pulse"></div>
                    ))
                ) : filteredCategories.length === 0 ? (
                    <div className="col-span-full bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <FaLayerGroup className="text-4xl" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 font-hero">No Categories Found</h3>
                        <p className="text-slate-500 text-sm font-medium">Create your first category to start organizing.</p>
                    </div>
                ) : (
                    filteredCategories.map((category) => (
                        <div
                            key={category._id}
                            className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-slate-200 hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className="h-48 bg-slate-50 overflow-hidden relative">
                                {category.icon ? (
                                    <img
                                        src={category.icon}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.src = PlaceholderImage; e.target.onerror = null; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                                        <MdImage className="text-4xl mb-2" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                                    </div>
                                )}
                                {/* Overlay Actions */}
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-3 bg-white text-slate-900 rounded-xl hover:scale-110 transition-transform shadow-lg"
                                        title="Edit"
                                    >
                                        <MdEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id)}
                                        className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg"
                                        title="Delete"
                                    >
                                        <MdDelete />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight group-hover:text-rose-600 transition-colors font-hero truncate">
                                    {category.name}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
                    <div className="bg-[#F8FAFC] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-slideUp">
                        {/* Modal Header */}
                        <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 font-hero">
                                    {editMode ? 'Edit Category' : 'New Category'}
                                </h2>
                                <p className="text-xs font-medium text-slate-500 mt-1">Enter category details</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors"
                            >
                                <MdClose className="text-xl" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className={labelStyle}>
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={inputStyle}
                                    placeholder="e.g. Skin Care"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelStyle}>
                                    Cover Image
                                </label>
                                <div
                                    className={`
                                        border-3 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer relative overflow-hidden group
                                        ${imagePreview ? 'border-rose-200 bg-rose-50' : 'border-slate-200 hover:border-rose-400 hover:bg-slate-50'}
                                    `}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                            />
                                            <div className="relative z-10">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImagePreview(null);
                                                        setFormData({ ...formData, icon: null });
                                                    }}
                                                    className="w-12 h-12 bg-white text-rose-600 rounded-full shadow-xl flex items-center justify-center mx-auto hover:scale-110 transition-transform"
                                                >
                                                    <MdDelete className="text-xl" />
                                                </button>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mt-3">Remove Image</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="pointer-events-none">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <MdImage className="text-3xl" />
                                            </div>
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Click to upload</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Saving...' : editMode ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoryManagement;
