import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes, FaImage, FaTrash, FaArrowLeft, FaSave } from 'react-icons/fa';
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

    const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all outline-none";
    const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-4"
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Upload New Product</h1>
                    <p className="text-gray-600 mt-2">Add a new product to your e-commerce store</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
                    {/* Basic Information */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Basic Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                    placeholder="e.g., Moisturizing Body Lotion"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>
                                    Brand <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                    placeholder="e.g., Nivea"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={inputClasses}
                                rows="4"
                                placeholder="Detailed product description..."
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Category</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClasses}>
                                    Main Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category.main"
                                    value={formData.category.main}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={labelClasses}>Subcategory (Optional)</label>
                                <input
                                    type="text"
                                    name="category.sub"
                                    value={formData.category.sub}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                    placeholder="e.g., Moisturizers"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Pricing & Stock</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className={labelClasses}>
                                    MRP (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="pricing.mrp"
                                    value={formData.pricing.mrp}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                    placeholder="999"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>
                                    Selling Price (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="pricing.selling_price"
                                    value={formData.pricing.selling_price}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                    placeholder="799"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className={inputClasses}
                                    placeholder="100"
                                    min="0"
                                />
                            </div>
                        </div>

                        {formData.pricing.mrp && formData.pricing.selling_price && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 font-semibold">
                                    Discount: {Math.round(((formData.pricing.mrp - formData.pricing.selling_price) / formData.pricing.mrp) * 100)}% OFF
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Images */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Product Images</h2>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {imagePreview.map((preview, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <FaTimes size={12} />
                                    </button>
                                </div>
                            ))}

                            {imagePreview.length < 5 && (
                                <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all">
                                    <FaImage className="text-gray-400 text-2xl mb-2" />
                                    <span className="text-sm text-gray-500">Add Image</span>
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
                        <p className="text-sm text-gray-500">Upload up to 5 images. First image will be the main product image.</p>
                    </div>

                    {/* Specifications */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-3">
                            <h2 className="text-xl font-bold text-gray-900">Specifications</h2>
                            <button
                                type="button"
                                onClick={addSpecification}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                            >
                                <FaPlus /> Add Spec
                            </button>
                        </div>

                        <div className="space-y-3">
                            {formData.specifications.map((spec, index) => (
                                <div key={index} className="flex gap-3">
                                    <input
                                        type="text"
                                        value={spec.key}
                                        onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                                        className={`${inputClasses} flex-1`}
                                        placeholder="e.g., Volume"
                                    />
                                    <input
                                        type="text"
                                        value={spec.value}
                                        onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                        className={`${inputClasses} flex-1`}
                                        placeholder="e.g., 200ml"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeSpecification(index)}
                                        className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tags & Featured */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 border-b pb-3">Additional Options</h2>

                        <div>
                            <label className={labelClasses}>Tags (comma-separated)</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleInputChange}
                                className={inputClasses}
                                placeholder="e.g., moisturizer, organic, natural"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="is_featured"
                                checked={formData.is_featured}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                            />
                            <label className="text-sm font-semibold text-gray-700">
                                Mark as Featured Product
                            </label>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <FaSave /> Upload Product
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/admin-dashboard')}
                            className="px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProductUpload;
