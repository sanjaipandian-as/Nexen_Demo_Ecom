import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTimes, FaImage, FaTrash, FaSave, FaPlus, FaStar, FaCheck } from 'react-icons/fa';
import API from '../../../../api';

const ProductUploadModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [imagePreview, setImagePreview] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
        }
    }, [isOpen]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        brand: '',
        category: {
            main: '',
            sub: ''
        },
        pricing: {
            mrp: '',
            selling_price: ''
        },
        stock: '',
        tags: '',
        is_featured: false,
        specifications: [{ key: '', value: '' }]
    });

    const [images, setImages] = useState([]);

    const CATEGORIES = [
        { value: 'Body Care', label: 'Body Care', icon: '🧴' },
        { value: 'Skin Care', label: 'Skin Care', icon: '✨' },
        { value: 'Face Care', label: 'Face Care', icon: '💆' },
        { value: 'Hair Care', label: 'Hair Care', icon: '💇' },
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'number' ? parseFloat(value) || '' : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        setImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    const handleSpecificationChange = (index, field, value) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index][field] = value;
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const addSpecification = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { key: '', value: '' }]
        }));
    };

    const removeSpecification = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.description || !formData.brand) {
            toast.error('Please fill all required fields');
            return;
        }

        if (!formData.category.main) {
            toast.error('Please select a category');
            return;
        }

        if (!formData.pricing.mrp || !formData.pricing.selling_price) {
            toast.error('Please enter pricing details');
            return;
        }

        if (parseFloat(formData.pricing.selling_price) > parseFloat(formData.pricing.mrp)) {
            toast.error('Selling price cannot be greater than MRP');
            return;
        }

        if (images.length === 0) {
            toast.error('Please upload at least one product image');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();

            images.forEach(image => {
                submitData.append('images', image);
            });

            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('brand', formData.brand);
            submitData.append('category', JSON.stringify(formData.category));
            submitData.append('pricing', JSON.stringify(formData.pricing));
            submitData.append('stock', formData.stock || 0);
            submitData.append('is_featured', formData.is_featured);

            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            submitData.append('tags', JSON.stringify(tagsArray));

            const validSpecs = formData.specifications.filter(spec => spec.key && spec.value);
            submitData.append('specifications', JSON.stringify(validSpecs));

            await API.post('/admin/products', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('✨ Product uploaded successfully!');
            onSuccess && onSuccess();
            onClose();

            // Reset form
            setFormData({
                name: '',
                description: '',
                brand: '',
                category: { main: '', sub: '' },
                pricing: { mrp: '', selling_price: '' },
                stock: '',
                tags: '',
                is_featured: false,
                specifications: [{ key: '', value: '' }]
            });
            setImages([]);
            setImagePreview([]);
            setCurrentStep(1);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload product');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const discount = formData.pricing.mrp && formData.pricing.selling_price
        ? Math.round(((formData.pricing.mrp - formData.pricing.selling_price) / formData.pricing.mrp) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
            {/* Backdrop with subtle blur */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <form
                onSubmit={handleSubmit}
                className="relative w-full max-w-5xl max-h-[95vh] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col animate-modalScale"
            >
                {/* Header */}
                <div className="flex-none bg-white border-b border-gray-100 px-10 py-8 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-[26px] font-black tracking-tight text-slate-900 leading-tight">
                                Add New Product
                            </h2>
                            <p className="text-[15px] text-slate-500 font-medium mt-1">
                                Complete the steps below to create a premium listing
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all duration-300 hover:rotate-90 hover:shadow-glow-rose"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    {/* Enhanced Progress Stepper */}
                    <div className="relative flex items-center justify-between max-w-3xl mx-auto px-4">
                        {/* Connecting Lines */}
                        <div className="absolute top-[18px] left-0 w-full h-[2px] bg-slate-100 -z-0">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                            ></div>
                        </div>

                        {[1, 2, 3].map((step) => {
                            const isActive = step === currentStep;
                            const isCompleted = step < currentStep;

                            return (
                                <div key={step} className="relative z-10 flex flex-col items-center gap-3">
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500
                                        ${isActive ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110' :
                                            isCompleted ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' :
                                                'bg-white border-2 border-slate-100 text-slate-400'}
                                    `}>
                                        {isCompleted ? <FaCheck className="text-xs" /> : step}
                                    </div>
                                    <span className={`
                                        text-[13px] font-bold transition-all duration-300
                                        ${isActive ? 'text-slate-900' : 'text-slate-400'}
                                    `}>
                                        {step === 1 ? 'Basic Info' : step === 2 ? 'Pricing & Images' : 'Details'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-10 py-8 bg-slate-50/30">
                    {/* Step 1: Basic Info */}
                    {currentStep === 1 && (
                        <div className="space-y-10 animate-fadeIn">
                            {/* Section Title */}
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-[2px] w-8 bg-[#2563EB]"></div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Basic Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                                        Product Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-blue-400 focus:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300 shadow-sm"
                                        placeholder="e.g., Radiant Glow Moisturizer"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                                        Brand <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-blue-400 focus:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300 shadow-sm"
                                        placeholder="e.g., Luxe Beauty"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                                    Description <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-blue-400 focus:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300 shadow-sm min-h-[120px] resize-none"
                                    placeholder="Describe your product's benefits and features..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                <div className="lg:col-span-8 space-y-4">
                                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide ml-1 block">
                                        Select Category <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, category: { ...prev.category, main: cat.value } }))}
                                                className={`
                                                    relative group p-6 rounded-[1.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-3
                                                    ${formData.category.main === cat.value
                                                        ? 'bg-white border-blue-600 shadow-[0_15px_35px_rgba(37,99,235,0.15)] ring-4 ring-blue-500/5 scale-105'
                                                        : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg hover:scale-[1.02]'
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    text-3xl transition-all duration-300
                                                    ${formData.category.main === cat.value ? 'scale-125 drop-shadow-glow-blue' : 'group-hover:scale-110'}
                                                `}>
                                                    {cat.icon}
                                                </div>
                                                <div className={`
                                                    text-xs font-black uppercase tracking-wider
                                                    ${formData.category.main === cat.value ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
                                                `}>
                                                    {cat.label}
                                                </div>
                                                {formData.category.main === cat.value && (
                                                    <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                                                        <FaCheck className="text-[8px] text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="lg:col-span-4 space-y-2">
                                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                                        Subcategory
                                    </label>
                                    <input
                                        type="text"
                                        name="category.sub"
                                        value={formData.category.sub}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-blue-400 focus:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300 shadow-sm"
                                        placeholder="e.g., Moisturizers"
                                    />
                                    <p className="text-[11px] text-slate-400 font-medium px-2">Optional specific category</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Pricing & Images */}
                    {currentStep === 2 && (
                        <div className="space-y-10 animate-fadeIn">
                            {/* Section Title */}
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-[2px] w-8 bg-rose-500"></div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Pricing & Inventory</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                                        MRP (₹) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            name="pricing.mrp"
                                            value={formData.pricing.mrp}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-blue-400 focus:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-700 font-bold placeholder:text-slate-300 shadow-sm"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-600 transition-colors">₹</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                                        Selling Price (₹) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            name="pricing.selling_price"
                                            value={formData.pricing.selling_price}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-blue-400 focus:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-700 font-bold placeholder:text-slate-300 shadow-sm"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold group-focus-within:text-blue-600 transition-colors">₹</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-blue-400 focus:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-700 font-bold placeholder:text-slate-300 shadow-sm"
                                        placeholder="100"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {discount > 0 && (
                                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-[0_15px_30px_rgba(37,99,235,0.2)]">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                                <FaStar className="text-xl animate-pulse" />
                                            </div>
                                            <div>
                                                <span className="text-2xl font-black">{discount}% OFF</span>
                                                <p className="text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Smart Pricing Applied</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Savings per unit</p>
                                            <p className="text-xl font-black">₹{(formData.pricing.mrp - formData.pricing.selling_price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    {/* Decorative circle */}
                                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                                </div>
                            )}

                            {/* Image Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-[2px] w-8 bg-purple-500"></div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Media Gallery</h3>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                                    {imagePreview.map((preview, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <div className="absolute inset-0 bg-slate-200 rounded-3xl animate-pulse -z-10"></div>
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover rounded-[2rem] border-2 border-white shadow-xl group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] duration-500"></div>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-3 right-3 w-8 h-8 bg-white text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-xl translate-y-2 group-hover:translate-y-0"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute -bottom-2 -left-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-xl border-2 border-white">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {imagePreview.length < 5 && (
                                        <label className="relative aspect-square rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 group overflow-hidden">
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3 group-hover:bg-purple-100 group-hover:scale-110 transition-all duration-500">
                                                    <FaImage className="text-slate-400 text-xl group-hover:text-purple-500 transition-colors" />
                                                </div>
                                                <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest px-4 text-center">Upload Image</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                                multiple
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-400 font-bold px-4 leading-relaxed">
                                    ✨ Premium quality images attract more customers. Square (1:1) aspect ratio recommended.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {currentStep === 3 && (
                        <div className="space-y-10 animate-fadeIn">
                            {/* Section Title */}
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-[2px] w-8 bg-blue-600"></div>
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Advanced Specifications</h3>
                            </div>

                            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h4 className="text-lg font-black text-slate-800">Product Specifications</h4>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Add technical details for customers</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addSpecification}
                                        className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-300 text-[13px] font-black uppercase tracking-widest shadow-xl"
                                    >
                                        <FaPlus size={10} />
                                        Add Attribute
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.specifications.map((spec, index) => (
                                        <div key={index} className="flex gap-4 group animate-slideInRight" style={{ animationDelay: `${index * 100}ms` }}>
                                            <input
                                                type="text"
                                                value={spec.key}
                                                onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                                                className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-purple-400 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300"
                                                placeholder="e.g., Volume"
                                            />
                                            <input
                                                type="text"
                                                value={spec.value}
                                                onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                                className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-purple-400 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300"
                                                placeholder="e.g., 200ml"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSpecification(index)}
                                                className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="space-y-4">
                                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide ml-1">
                                        Search Tags
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleInputChange}
                                            className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-100 focus:border-blue-400 focus:shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-300 shadow-sm"
                                            placeholder="e.g., moisturizer, organic, vegan"
                                        />
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-2">Separate with commas</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wide ml-1 block">
                                        Visibility & Status
                                    </label>
                                    <label className={`
                                            flex items-center justify-between p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer
                                            ${formData.is_featured
                                            ? 'bg-blue-50 border-blue-200 shadow-[0_10px_25px_rgba(37,99,235,0.1)]'
                                            : 'bg-white border-slate-100 hover:border-slate-200'}
                                        `}>
                                        <div className="flex items-center gap-4">
                                            <div className={`
                                                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300
                                                    ${formData.is_featured ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}
                                                `}>
                                                <FaStar />
                                            </div>
                                            <div>
                                                <span className={`text-sm font-black leading-none ${formData.is_featured ? 'text-blue-900' : 'text-slate-700'}`}>Featured Product</span>
                                                <p className={`text-[11px] font-bold mt-1 ${formData.is_featured ? 'text-blue-600' : 'text-slate-400'}`}>Show on homepage</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="is_featured"
                                            checked={formData.is_featured}
                                            onChange={handleInputChange}
                                            className="w-6 h-6 rounded-lg border-2 border-slate-200 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer"
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-none bg-white border-t border-slate-100 px-10 py-8 relative z-10">
                    <div className="flex items-center justify-between gap-6">
                        <div className="hidden sm:block">
                            <p className="text-[15px] font-bold text-slate-900 leading-none">Step {currentStep} of 3</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {currentStep === 1 ? 'Next: Pricing & Images' : currentStep === 2 ? 'Next: Advanced Details' : 'Final Step'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 ml-auto">
                            {currentStep > 1 && (
                                <button
                                    key="back-btn"
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="px-8 py-4 bg-slate-50 text-slate-600 font-black uppercase tracking-widest text-[12px] rounded-2xl hover:bg-slate-100 transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
                                >
                                    Back
                                </button>
                            )}

                            {currentStep < 3 ? (
                                <button
                                    key="next-btn"
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    className="px-10 py-4 bg-[#2563EB] text-white font-black uppercase tracking-widest text-[12px] rounded-2xl hover:bg-[#1E40AF] transition-all shadow-[0_10px_25px_rgba(37,99,235,0.2)] active:scale-95 translate-y-0 hover:-translate-y-1"
                                >
                                    Next Stage
                                </button>
                            ) : (
                                <button
                                    key="submit-btn"
                                    type="submit"
                                    disabled={loading}
                                    className="relative group overflow-hidden px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black uppercase tracking-widest text-[12px] rounded-2xl hover:shadow-[0_15px_35px_rgba(37,99,235,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed translate-y-0 hover:-translate-y-1"
                                >
                                    <div className="relative z-10 flex items-center gap-3">
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Processing</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaSave size={14} />
                                                <span>Launch Product</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductUploadModal;
