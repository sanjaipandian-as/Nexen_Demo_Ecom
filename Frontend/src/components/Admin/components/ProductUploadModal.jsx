import React, { useState, useEffect } from 'react';
import { FaTimes, FaCloudUploadAlt, FaTrash, FaInfoCircle, FaRupeeSign, FaTag, FaPlus, FaCheck, FaBox } from 'react-icons/fa';
import { MdPalette, MdCategory, MdStraighten, MdKeyboardArrowDown, MdCheck } from 'react-icons/md';
import API from '../../../../api';
import { toast } from 'react-toastify';

const CustomSelect = ({ label, name, value, options, onChange, placeholder, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            {label && <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-base md:text-sm font-bold cursor-pointer flex items-center justify-between transition-all
                    ${isOpen ? 'border-rose-500 ring-4 ring-rose-500/10 bg-white' : 'border-slate-200 hover:border-rose-300'}
                    ${!value ? 'text-slate-400' : 'text-slate-700'}
                `}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <MdKeyboardArrowDown className={`text-xl transition-transform duration-300 ${isOpen ? 'rotate-180 text-rose-500' : 'text-slate-400'}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 mb-1">
                            {placeholder}
                        </div>
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`
                                    px-3 py-2.5 rounded-lg text-base md:text-sm font-bold cursor-pointer transition-colors flex items-center justify-between
                                    ${value === opt.value
                                        ? 'bg-rose-50 text-rose-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                {opt.label}
                                {value === opt.value && <MdCheck className="text-rose-500" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

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

    const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400 text-base md:text-sm";
    const labelClasses = "block text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";
    const sectionClasses = "bg-white p-4 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm mb-6";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 font-body animate-fadeIn">
            <div className="bg-[#F8FAFC] w-full max-w-4xl h-[85vh] md:h-[90vh] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative animate-slideUp">

                {/* Header */}
                <div className="px-5 py-4 md:px-8 md:py-6 bg-white border-b border-slate-100 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 font-hero">
                            {productToEdit ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-[10px] md:text-xs font-medium text-slate-500 mt-1">
                            Fill in the details below to {productToEdit ? 'update the' : 'create a'} product.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 md:p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                        <FaTimes className="text-lg md:text-xl" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-5 py-3 md:px-8 md:py-4 bg-white border-b border-slate-100 flex gap-2 md:gap-4 overflow-x-auto no-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0
                                ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }`}
                        >
                            <tab.icon className={`text-base md:text-lg ${activeTab === tab.id ? 'text-rose-400' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className={sectionClasses}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="col-span-1 md:col-span-2">
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
                                            <CustomSelect
                                                label="Gender/Target"
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleChange}
                                                placeholder="Select Target"
                                                options={[
                                                    { value: 'Men', label: 'Men' },
                                                    { value: 'Women', label: 'Women' },
                                                    { value: 'Unisex', label: 'Unisex' },
                                                    { value: 'Kids', label: 'Kids' }
                                                ]}
                                            />
                                        </div>
                                        <div className="col-span-1 md:col-span-2">
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div>
                                            <CustomSelect
                                                label="Main Category"
                                                name="category.main"
                                                value={formData.category.main}
                                                onChange={(e) => {
                                                    // Handle nested state update shim
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        category: { ...prev.category, main: e.target.value }
                                                    }));
                                                }}
                                                placeholder="Select Category"
                                                options={[
                                                    { value: 'Men', label: 'Men' },
                                                    { value: 'Women', label: 'Women' },
                                                    { value: 'Kids', label: 'Kids' },
                                                    { value: 'Accessories', label: 'Accessories' }
                                                ]}
                                            />
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
                                    <div className="border-3 border-dashed border-slate-200 rounded-[2rem] p-6 md:p-10 text-center hover:border-rose-300 hover:bg-rose-50/10 transition-all cursor-pointer relative group">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                        />
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                            <FaCloudUploadAlt className="text-3xl md:text-4xl text-rose-500" />
                                        </div>
                                        <h4 className="text-base md:text-lg font-black text-slate-900 font-hero mb-2">Upload Product Images</h4>
                                        <p className="text-xs md:text-sm text-slate-500 font-medium">Drag & drop files here or click to browse</p>
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
                                            <div key={index} className="flex flex-col md:flex-row gap-3">
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
                                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors self-end md:self-auto"
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
                <div className="px-5 py-4 md:px-8 md:py-6 bg-white border-t border-slate-100 flex justify-end gap-3 z-10 safe-area-pb">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-50 text-slate-600 font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 md:px-8 py-3 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
