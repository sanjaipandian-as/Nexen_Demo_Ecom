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
        <div className="relative group" ref={dropdownRef}>
            {label && <label className="block text-xs font-extra-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 transition-colors group-hover:text-rose-500">{label}</label>}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-5 py-4 bg-white border-2 rounded-2xl text-base md:text-sm font-bold cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm
                    ${isOpen ? 'border-rose-500 ring-4 ring-rose-500/10 shadow-rose-100' : 'border-slate-100 hover:border-rose-300 hover:shadow-md'}
                    ${!value ? 'text-slate-400' : 'text-slate-800'}
                `}
            >
                <span className="truncate flex-1">{selectedOption ? selectedOption.label : placeholder}</span>
                <MdKeyboardArrowDown className={`text-2xl transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-rose-500' : 'text-slate-300 group-hover:text-rose-400'}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-white border-2 border-rose-100 rounded-2xl shadow-2xl overflow-hidden animate-slideUpOriginTop transform origin-top max-h-60 overflow-y-auto custom-scrollbar">
                    <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-rose-50 mb-2 bg-slate-50/50 sticky top-0 backdrop-blur-sm">
                        {placeholder}
                    </div>
                    <div className="p-2">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`
                                    px-4 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all duration-200 flex items-center justify-between mb-1
                                    ${value === opt.value
                                        ? 'bg-rose-50 text-rose-600 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}
                                `}
                            >
                                <span>{opt.label}</span>
                                {value === opt.value && <MdCheck className="text-xl text-rose-500" />}
                            </div>
                        ))}
                        {options.length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-400 text-center italic">No options available</div>
                        )}
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
    const [availableCategories, setAvailableCategories] = useState([]);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await API.get('/categories');
                setAvailableCategories(response.data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories');
            }
        };

        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

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
            brand: 'AJIZZ FASHIONS',
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

    const inputClasses = "w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all placeholder:text-slate-300 text-sm hover:border-rose-200";
    const labelClasses = "block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";
    const sectionClasses = "bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] mb-8";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 font-body animate-fadeIn">
            <div className="bg-[#F8FAFC] w-full max-w-4xl h-[85vh] md:h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative animate-slideUp border-4 border-white/50">

                {/* Header */}
                <div className="px-6 py-5 md:px-10 md:py-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex justify-between items-center z-20">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 font-hero tracking-tight">
                            {productToEdit ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                            {productToEdit ? 'Update details' : 'Create new listing'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all hover:rotate-90 shadow-sm"
                    >
                        <FaTimes className="text-lg" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 py-4 md:px-10 bg-white border-b border-slate-100 flex gap-3 md:gap-4 overflow-x-auto no-scrollbar mask-gradient-right">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 relative overflow-hidden
                                ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 translate-y-[-2px]'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                        >
                            <tab.icon className={`text-base md:text-lg ${activeTab === tab.id ? 'text-rose-400' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#F8FAFC]">
                    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto pb-20">

                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className={sectionClasses}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className={labelClasses}>Product Name <span className="text-rose-500">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={inputClasses}
                                                placeholder="e.g. Premium Silk Saree"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Brand <span className="text-rose-500">*</span></label>
                                            <div className="relative group">
                                                <input
                                                    type="text"
                                                    name="brand"
                                                    value="AJIZZ FASHIONS"
                                                    readOnly
                                                    className={`${inputClasses} bg-rose-50/50 border-rose-100 text-rose-900 cursor-not-allowed pl-10`}
                                                />
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 bg-white p-1 rounded-md shadow-sm">
                                                    <FaTag size={12} />
                                                </div>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-wider text-rose-400 opacity-60">
                                                    Locked
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <CustomSelect
                                                label="Target Audience"
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
                                            <label className={labelClasses}>Description <span className="text-rose-500">*</span></label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows="5"
                                                className={`${inputClasses} resize-none leading-relaxed`}
                                                placeholder="Write a compelling description..."
                                                required
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className={sectionClasses}>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 font-hero flex items-center gap-2.5 border-b border-slate-50 pb-4">
                                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><MdCategory /></div>
                                        Categorization
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                        <div>
                                            <CustomSelect
                                                label="Main Category"
                                                name="category.main"
                                                value={formData.category.main}
                                                onChange={(e) => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        category: { ...prev.category, main: e.target.value }
                                                    }));
                                                }}
                                                placeholder="Select Category"
                                                options={availableCategories.map(cat => ({
                                                    value: cat.name,
                                                    label: cat.name
                                                }))}
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
                            <div className="space-y-8 animate-fadeIn">
                                <div className={sectionClasses}>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 font-hero flex items-center gap-2.5 border-b border-slate-50 pb-4">
                                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg"><FaRupeeSign /></div>
                                        Price & Inventory
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className={labelClasses}>MRP</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    name="pricing.mrp"
                                                    value={formData.pricing.mrp}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} pl-8`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Selling Price</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    name="pricing.selling_price"
                                                    value={formData.pricing.selling_price}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} pl-8 border-rose-100 focus:border-rose-500 bg-rose-50/10`}
                                                    placeholder="0.00"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Cost Price</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    name="pricing.cost"
                                                    value={formData.pricing.cost}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} pl-8`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-1.5">
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
                                        <div className="md:col-span-1.5">
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
                                    <div className="border-3 border-dashed border-slate-200 rounded-[2rem] p-8 md:p-12 text-center hover:border-rose-300 hover:bg-rose-50/30 transition-all cursor-pointer relative group bg-slate-50/50">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                        />
                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                            <FaCloudUploadAlt className="text-4xl text-rose-500" />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 font-hero mb-2 group-hover:text-rose-600 transition-colors">Upload Photos</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Supports JPG, PNG, WEBP</p>
                                    </div>

                                    {previewImages.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                            {previewImages.map((src, index) => (
                                                <div key={index} className="relative group rounded-3xl overflow-hidden aspect-square border-2 border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                    <img src={src} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all backdrop-blur-[1px]" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-3 right-3 p-2.5 bg-white text-rose-600 rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-rose-600 hover:text-white"
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
                            <div className="animate-fadeIn space-y-8">
                                <div className={sectionClasses}>
                                    <label className={labelClasses}>Search Tags</label>
                                    <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wide flex items-center gap-2 shadow-sm animate-popIn">
                                                {tag}
                                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500 transition-colors">
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
                                        placeholder="Type keyword and press Enter..."
                                    />
                                    <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                                        Keywords help customers find your product.
                                    </p>
                                </div>

                                <div className={sectionClasses}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-hero">Specifications</h3>
                                        <button
                                            type="button"
                                            onClick={addSpec}
                                            className="text-xs font-black uppercase tracking-widest text-rose-600 hover:text-white hover:bg-rose-600 px-4 py-2 rounded-xl transition-all flex items-center gap-2 border border-rose-100 hover:border-transparent hover:shadow-lg hover:shadow-rose-500/20"
                                        >
                                            <FaPlus /> Add Spec
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.specifications.map((spec, index) => (
                                            <div key={index} className="flex flex-col md:flex-row gap-4 animate-slideUp">
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
                                                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all self-end md:self-auto shadow-sm hover:shadow-red-500/30"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.specifications.length === 0 && (
                                            <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No specifications added yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-5 md:px-10 md:py-6 bg-white border-t border-slate-100 flex justify-end gap-4 z-20 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 md:px-8 py-3.5 bg-white text-slate-600 font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl hover:bg-slate-50 transition-all border-2 border-slate-100 hover:border-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 md:px-10 py-3.5 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl hover:bg-rose-600 transition-all shadow-xl shadow-slate-900/20 hover:shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <FaCheck /> {productToEdit ? 'Update Product' : 'Save Product'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductUploadModal;
