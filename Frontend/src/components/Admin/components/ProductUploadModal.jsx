import React, { useState, useEffect } from 'react';
import { FaTimes, FaCloudUploadAlt, FaTrash, FaInfoCircle, FaRupeeSign, FaTag, FaPlus, FaCheck, FaBox } from 'react-icons/fa';
import { MdPalette, MdCategory, MdStraighten } from 'react-icons/md';
import API from '../../../../api';
import { toast } from 'react-toastify';

const ProductUploadModal = ({ isOpen, onClose, onSuccess, productToEdit }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: { main: '', sub: '' },
        pricing: { mrp: '', cost: '', selling_price: '' },
        stock: '',
        images: [],
        brand: '',
        tags: [],
        specifications: [],
        colors: [],
        sizes: [],
        weight: '',
        gender: '',
        is_featured: false,
        is_new_arrival: false
    });

    const [activeTab, setActiveTab] = useState('general');
    const [previewImages, setPreviewImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setFormData({
                    ...productToEdit,
                    category: productToEdit.category || { main: '', sub: '' },
                    pricing: productToEdit.pricing || { mrp: '', cost: '', selling_price: '' },
                    tags: productToEdit.tags || [],
                    specifications: productToEdit.specifications || [],
                    colors: productToEdit.colors || [],
                    sizes: productToEdit.sizes || [],
                    images: productToEdit.images || []
                });
                setPreviewImages(productToEdit.images || []);
            } else {
                resetForm();
            }
            setActiveTab('general');
        }
    }, [productToEdit, isOpen]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: { main: '', sub: '' },
            pricing: { mrp: '', cost: '', selling_price: '' },
            stock: '',
            images: [],
            brand: '',
            tags: [],
            specifications: [],
            colors: [],
            sizes: [],
            weight: '',
            gender: '',
            is_featured: false,
            is_new_arrival: false
        });
        setPreviewImages([]);
        setNewImages([]);
        setTagInput('');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setNewImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));

        // Check if it's an existing image or a new one
        if (index < formData.images.length && !newImages.length) {
            // Logic to mark existing image for deletion could go here if backed supports it
            // For now, we update local state
            const updatedImages = formData.images.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, images: updatedImages }));
        } else {
            // Adjust index for new images
            const newImageIndex = index - (formData.images.length || 0);
            if (newImageIndex >= 0) {
                setNewImages(prev => prev.filter((_, i) => i !== newImageIndex));
            } else {
                // It's an existing image
                const updatedImages = formData.images.filter((_, i) => i !== index);
                setFormData(prev => ({ ...prev, images: updatedImages }));
            }
        }
    };

    const handleTagAdd = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index] = { ...newSpecs[index], [field]: value };
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const addSpec = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { key: '', value: '' }]
        }));
    };

    const removeSpec = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();

            // Append basic fields
            Object.keys(formData).forEach(key => {
                if (key === 'category' || key === 'pricing') {
                    Object.keys(formData[key]).forEach(subKey => {
                        data.append(`${key}[${subKey}]`, formData[key][subKey]);
                    });
                } else if (key === 'images') {
                    // Skip existing images, backend usually handles them mostly via keeping what's not deleted
                    // For simply logic here, we might need to send existing images as URLs if backend expects
                    formData.images.forEach(img => data.append('existingImages[]', img));
                } else if (Array.isArray(formData[key])) {
                    if (key === 'specifications') {
                        data.append(key, JSON.stringify(formData[key]));
                    } else {
                        formData[key].forEach(item => data.append(`${key}[]`, item));
                    }
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Append new images
            newImages.forEach(image => {
                data.append('images', image);
            });

            if (productToEdit) {
                await API.put(`/admin/products/${productToEdit._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated successfully!');
            } else {
                await API.post('/admin/products/add', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product added successfully!');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'general', label: 'General', icon: FaInfoCircle },
        { id: 'pricing', label: 'Pricing & Stock', icon: FaRupeeSign },
        { id: 'media', label: 'Media', icon: MdPalette },
        { id: 'attributes', label: 'Attributes', icon: FaTag },
    ];

    const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400 text-sm";
    const labelClasses = "block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";
    const sectionClasses = "bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-6";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-body animate-fadeIn">
            <div className="bg-[#F8FAFC] w-full max-w-4xl h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-slideUp">

                {/* Header */}
                <div className="px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 font-hero">
                            {productToEdit ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                            Fill in the details below to {productToEdit ? 'update the' : 'create a'} product.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-8 py-4 bg-white border-b border-slate-100 flex gap-4 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }`}
                        >
                            <tab.icon className={`text-lg ${activeTab === tab.id ? 'text-rose-400' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className={sectionClasses}>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className={labelClasses}>Product Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="e.g. Silk Saree"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Brand</label>
                                            <input
                                                type="text"
                                                name="brand"
                                                value={formData.brand}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="Brand Name"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Gender/Target</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                className={inputClasses}
                                            >
                                                <option value="">Select Target</option>
                                                <option value="Men">Men</option>
                                                <option value="Women">Women</option>
                                                <option value="Unisex">Unisex</option>
                                                <option value="Kids">Kids</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelClasses}>Description</label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="4"
                                                className={inputClasses}
                                                placeholder="Detailed product description..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className={sectionClasses}>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 font-hero flex items-center gap-2">
                                        <MdCategory className="text-rose-500 text-lg" /> Categorization
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClasses}>Main Category</label>
                                            <select
                                                name="category.main"
                                                value={formData.category.main}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Men">Men</option>
                                                <option value="Women">Women</option>
                                                <option value="Kids">Kids</option>
                                                <option value="Accessories">Accessories</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Sub Category</label>
                                            <input
                                                type="text"
                                                name="category.sub"
                                                value={formData.category.sub}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="e.g. Shirts, Dresses"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PRICING TAB */}
                        {activeTab === 'pricing' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className={sectionClasses}>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 font-hero flex items-center gap-2">
                                        <FaRupeeSign className="text-rose-500 text-lg" /> Price & Inventory
                                    </h3>
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <label className={labelClasses}>MRP</label>
                                            <input
                                                type="number"
                                                name="pricing.mrp"
                                                value={formData.pricing.mrp}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Selling Price</label>
                                            <input
                                                type="number"
                                                name="pricing.selling_price"
                                                value={formData.pricing.selling_price}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Cost Price</label>
                                            <input
                                                type="number"
                                                name="pricing.cost"
                                                value={formData.pricing.cost}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Stock Quantity</label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Weight (kg)</label>
                                            <input
                                                type="text"
                                                name="weight"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="0.5"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MEDIA TAB */}
                        {activeTab === 'media' && (
                            <div className="animate-fadeIn">
                                <div className={sectionClasses}>
                                    <div className="border-3 border-dashed border-slate-200 rounded-[2rem] p-10 text-center hover:border-rose-300 hover:bg-rose-50/10 transition-all cursor-pointer relative group">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                        />
                                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <FaCloudUploadAlt className="text-4xl text-rose-500" />
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 font-hero mb-2">Upload Product Images</h4>
                                        <p className="text-sm text-slate-500 font-medium">Drag & drop files here or click to browse</p>
                                    </div>

                                    {previewImages.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                            {previewImages.map((src, index) => (
                                                <div key={index} className="relative group rounded-2xl overflow-hidden aspect-square border border-slate-100">
                                                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm text-rose-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 hover:text-white"
                                                    >
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ATTRIBUTES TAB */}
                        {activeTab === 'attributes' && (
                            <div className="animate-fadeIn space-y-6">
                                <div className={sectionClasses}>
                                    <label className={labelClasses}>Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                                {tag}
                                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-800">
                                                    <FaTimes />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagAdd}
                                        className={inputClasses}
                                        placeholder="Type and press Enter to add tags..."
                                    />
                                </div>

                                <div className={sectionClasses}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-hero">Specifications</h3>
                                        <button
                                            type="button"
                                            onClick={addSpec}
                                            className="text-xs font-black uppercase tracking-widest text-rose-600 hover:text-rose-700 flex items-center gap-1"
                                        >
                                            <FaPlus /> Add Spec
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.specifications.map((spec, index) => (
                                            <div key={index} className="flex gap-3">
                                                <input
                                                    type="text"
                                                    placeholder="Key (e.g. Material)"
                                                    value={spec.key}
                                                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                                    className={inputClasses}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Value (e.g. Cotton)"
                                                    value={spec.value}
                                                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                                    className={inputClasses}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSpec(index)}
                                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.specifications.length === 0 && (
                                            <p className="text-sm text-slate-400 font-medium italic text-center py-4">No specifications added.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="px-8 py-6 bg-white border-t border-slate-100 flex justify-end gap-3 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-50 text-slate-600 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <FaCheck /> {productToEdit ? 'Update Product' : 'Create Product'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductUploadModal;
