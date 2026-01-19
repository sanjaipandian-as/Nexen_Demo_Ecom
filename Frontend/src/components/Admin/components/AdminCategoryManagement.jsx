import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdAdd, MdEdit, MdDelete, MdImage, MdClose, MdCategory } from 'react-icons/md';
import API from '../../../../api';

const AdminCategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: null });
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

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

    return (
        <div className="p-6 bg-[#F3F6FA] min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-[28px] font-bold text-[#1E293B] mb-2 tracking-tight">Category Management</h1>
                <p className="text-[#64748B] text-[15px] font-medium italic">Manage product categories and their icons</p>
            </div>

            {/* Add Category Button */}
            <div className="mb-6">
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-[#1E40AF] transition-all shadow-[0_8px_24px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.3)]"
                >
                    <MdAdd className="text-xl" />
                    Add New Category
                </button>
            </div>

            {/* Categories Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[16px] p-6 border border-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)] animate-pulse">
                            <div className="w-full h-40 bg-slate-100 rounded-xl mb-4"></div>
                            <div className="h-6 bg-slate-100 rounded mb-2"></div>
                            <div className="flex gap-2">
                                <div className="h-10 bg-slate-100 rounded flex-1"></div>
                                <div className="h-10 bg-slate-100 rounded flex-1"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="bg-white rounded-[24px] p-12 text-center border border-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                    <MdCategory className="text-6xl text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg font-medium">No categories found</p>
                    <p className="text-slate-400 text-sm mt-2">Create your first category to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category._id}
                            className="bg-white rounded-[16px] overflow-hidden border border-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all"
                        >
                            <div className="h-40 bg-slate-50 overflow-hidden">
                                {category.icon ? (
                                    <img
                                        src={category.icon}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <MdImage className="text-6xl text-slate-300" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="text-[17px] font-bold text-gray-900 mb-4 uppercase tracking-tight">
                                    {category.name}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all font-bold text-sm"
                                    >
                                        <MdEdit className="text-lg" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category._id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold text-sm"
                                    >
                                        <MdDelete className="text-lg" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-[2rem]">
                            <h2 className="text-xl font-bold text-[#1E293B]">
                                {editMode ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                            >
                                <MdClose className="text-2xl" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-[20px] border border-slate-200 focus:border-[#2563EB]/30 focus:shadow-[0_8px_30px_rgb(37,99,235,0.06)] transition-all outline-none"
                                    placeholder="Enter category name"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Category Icon
                                </label>
                                <div className="border-2 border-dashed border-slate-200 rounded-[20px] p-6 text-center hover:border-[#2563EB]/30 transition-all">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-xl mb-4"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setFormData({ ...formData, icon: null });
                                                }}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                                            >
                                                <MdClose />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <MdImage className="text-6xl text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500 text-sm mb-2">Click to upload an image</p>
                                            <p className="text-slate-400 text-xs">PNG, JPG up to 5MB</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="icon-upload"
                                    />
                                    <label
                                        htmlFor="icon-upload"
                                        className="inline-block px-6 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all cursor-pointer font-bold text-sm"
                                    >
                                        {imagePreview ? 'Change Image' : 'Upload Image'}
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1E40AF] transition-all font-bold disabled:bg-slate-300 disabled:cursor-not-allowed"
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
