import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaCloudUploadAlt, FaTrash, FaArrowLeft, FaSave, FaTag, FaBoxOpen, FaLayerGroup, FaImage } from 'react-icons/fa';
import API from '../../../../api';

const CATEGORIES = [
    { value: 'Body Care', label: 'Body Care' },
    { value: 'Skin Care', label: 'Skin Care' },
    { value: 'Face Care', label: 'Face Care' },
    { value: 'Hair Care', label: 'Hair Care' },
];

const AdminProductUpload = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState([]);

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

        // Create preview URLs
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

            // Append images
            images.forEach(image => {
                submitData.append('images', image);
            });

            // Append other data
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('brand', formData.brand);
            submitData.append('category', JSON.stringify(formData.category));
            submitData.append('pricing', JSON.stringify(formData.pricing));
            submitData.append('stock', formData.stock || 0);
            submitData.append('is_featured', formData.is_featured);

            // Handle tags
            const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            submitData.append('tags', JSON.stringify(tagsArray));

            // Handle specifications
            const validSpecs = formData.specifications.filter(spec => spec.key && spec.value);
            submitData.append('specifications', JSON.stringify(validSpecs));

            const response = await API.post('/admin/products', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Product uploaded successfully!');
            navigate('/admin-dashboard');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload product');
        } finally {
            setLoading(false);
        }
    };

    // Styling Constants
    const inputClasses = "w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-medium font-body text-sm";
    const labelClasses = "block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 font-hero";
    const sectionClasses = "bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-colors animate-slideUp";

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-8 px-8 font-body">
            <div className="max-w-7xl mx-auto">
                <form onSubmit={handleSubmit}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-xl py-4 border-b border-white/0 animate-slideUp">
                        <div>
                            <button
                                type="button"
                                onClick={() => navigate('/admin-dashboard')}
                                className="flex items-center gap-2 text-slate-400 hover:text-rose-600 transition-colors mb-2 font-black text-[10px] uppercase tracking-widest font-hero group"
                            >
                                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                            </button>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-hero">Add New Product</h1>
                            <p className="text-slate-500 font-medium mt-1">Create a new product card for your store inventory.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/admin-dashboard')}
                                className="px-6 py-3 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-white hover:text-slate-900 transition-all text-xs uppercase tracking-widest hover:shadow-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-rose-500/20 hover:-translate-y-0.5 active:translate-y-0 text-xs uppercase tracking-widest"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        <span>Save Product</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* General Info */}
                            <div className={sectionClasses} style={{ animationDelay: '0.1s' }}>
                                <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-50 pb-4 font-hero">
                                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                        <FaBoxOpen className="text-lg" />
                                    </div>
                                    General Information
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClasses}>Product Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={inputClasses}
                                            placeholder="e.g. Vintage Leather Jacket"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Description <span className="text-rose-500">*</span></label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className={`${inputClasses} h-40 resize-none leading-relaxed`}
                                            placeholder="Write a compelling description for your product that highlights its best features..."
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Media Section */}
                            <div className={sectionClasses} style={{ animationDelay: '0.2s' }}>
                                <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-50 pb-4 font-hero">
                                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                        <FaImage className="text-lg" />
                                    </div>
                                    Product Media
                                </h2>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {imagePreview.map((preview, index) => (
                                            <div key={index} className="relative group aspect-square rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white text-rose-600 rounded-2xl hover:bg-rose-50 hover:scale-110 transition-all shadow-lg"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                                {index === 0 && (
                                                    <div className="absolute top-3 left-3 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-lg font-hero">
                                                        Main
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {imagePreview.length < 5 && (
                                            <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all group">
                                                <div className="w-14 h-14 bg-white border border-slate-200 text-slate-300 group-hover:border-rose-200 group-hover:text-rose-500 rounded-2xl flex items-center justify-center mb-3 transition-colors shadow-sm group-hover:scale-110 duration-300">
                                                    <FaCloudUploadAlt size={24} />
                                                </div>
                                                <span className="text-xs font-black text-slate-400 group-hover:text-rose-600 text-center px-2 uppercase tracking-widest font-hero">Upload</span>
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
                                    <p className="text-[11px] font-bold text-slate-400 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center uppercase tracking-wide">
                                        ✨ High-quality square images preferred. Max 5.
                                    </p>
                                </div>
                            </div>

                            {/* Pricing & Inventory */}
                            <div className={sectionClasses} style={{ animationDelay: '0.3s' }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Pricing */}
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2 font-hero">
                                            Pricing Strategy
                                        </h2>
                                        <div className="space-y-5">
                                            <div>
                                                <label className={labelClasses}>MRP (Before Discount) <span className="text-rose-500">*</span></label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        name="pricing.mrp"
                                                        value={formData.pricing.mrp}
                                                        onChange={handleInputChange}
                                                        className={`${inputClasses} pl-10`}
                                                        placeholder="0.00"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Selling Price (After Discount) <span className="text-rose-500">*</span></label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                                    <input
                                                        type="number"
                                                        name="pricing.selling_price"
                                                        value={formData.pricing.selling_price}
                                                        onChange={handleInputChange}
                                                        className={`${inputClasses} pl-10`}
                                                        placeholder="0.00"
                                                        min="0"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            {formData.pricing.mrp && formData.pricing.selling_price && (
                                                <div className="flex items-center gap-3 text-xs font-bold bg-emerald-50 text-emerald-700 px-5 py-4 rounded-2xl border border-emerald-100 animate-fadeIn">
                                                    <div className="p-1.5 bg-emerald-100 rounded-lg"><FaTag size={12} /></div>
                                                    <span>
                                                        You are offering a <span className="font-black">{Math.round(((formData.pricing.mrp - formData.pricing.selling_price) / formData.pricing.mrp) * 100)}% Discount</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inventory */}
                                    <div>
                                        <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-2 font-hero">
                                            Stock Control
                                        </h2>
                                        <div>
                                            <label className={labelClasses}>Stock Quantity</label>
                                            <input
                                                type="number"
                                                name="stock"
                                                value={formData.stock}
                                                onChange={handleInputChange}
                                                className={inputClasses}
                                                placeholder="e.g. 100"
                                                min="0"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wide">Number of units currently available.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div className={sectionClasses} style={{ animationDelay: '0.4s' }}>
                                <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
                                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-3 font-hero">
                                        <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                            <FaLayerGroup className="text-lg" />
                                        </div>
                                        Technical Specs
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={addSpecification}
                                        className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 hover:bg-rose-600 px-5 py-2.5 rounded-xl transition-colors shadow-lg active:scale-95"
                                    >
                                        + Add Spec
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.specifications.map((spec, index) => (
                                        <div key={index} className="flex gap-4 items-start group animate-fadeIn">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={spec.key}
                                                    onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                                                    className={inputClasses}
                                                    placeholder="Key (e.g. Material)"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    value={spec.value}
                                                    onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                                    className={inputClasses}
                                                    placeholder="Value (e.g. Cotton)"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSpecification(index)}
                                                className="mt-4 text-slate-300 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.specifications.length === 0 && (
                                        <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-400 font-bold mb-1">No specifications added yet.</p>
                                            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Add details like Material, Size, etc.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>

                            {/* Organization */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-50 pb-4 font-hero">
                                    <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                                        <FaTag className="text-lg" />
                                    </div>
                                    Category & Tags
                                </h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className={labelClasses}>Main Category <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <select
                                                name="category.main"
                                                value={formData.category.main}
                                                onChange={handleInputChange}
                                                className={`${inputClasses} appearance-none cursor-pointer`}
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                                                ▼
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Sub Category</label>
                                        <input
                                            type="text"
                                            name="category.sub"
                                            value={formData.category.sub}
                                            onChange={handleInputChange}
                                            className={inputClasses}
                                            placeholder="e.g. Shirts"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Brand Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleInputChange}
                                            className={inputClasses}
                                            placeholder="e.g. Nike"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Search Tags</label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleInputChange}
                                            className={inputClasses}
                                            placeholder="cotton, summer, sale"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-wide">Comma separated keywords.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3 border-b border-slate-50 pb-4 font-hero">
                                    Visibility
                                </h2>
                                <div className="space-y-4">
                                    <label className={`
                                        flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all duration-300
                                        ${formData.is_featured
                                            ? 'bg-rose-50 border-rose-200 shadow-sm'
                                            : 'bg-slate-50 border-slate-200 hover:border-rose-200'
                                        }
                                    `}>
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                name="is_featured"
                                                checked={formData.is_featured}
                                                onChange={handleInputChange}
                                                className="peer sr-only"
                                            />
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.is_featured ? 'bg-rose-500 border-rose-500' : 'border-slate-300 bg-white'}`}>
                                                {formData.is_featured && <FaPlus className="text-white text-[10px]" />}
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`block text-sm font-black ${formData.is_featured ? 'text-rose-900' : 'text-slate-700'}`}>Featured Product</span>
                                            <span className={`block text-[10px] font-bold uppercase tracking-wider ${formData.is_featured ? 'text-rose-600/70' : 'text-slate-400'}`}>Display on homepage</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProductUpload;
