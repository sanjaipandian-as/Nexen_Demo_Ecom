import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MdEdit, MdDelete, MdAdd, MdImage, MdSave, MdCancel, MdViewCarousel } from 'react-icons/md';
import API from '../../../../api';
import PlaceholderImage from '../../../assets/Placeholder.png';

const AdminHeroManagement = ({ refreshId }) => {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [formData, setFormData] = useState({
        order: 0,
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        fetchSlides();
    }, [refreshId]);

    const fetchSlides = async () => {
        try {
            setLoading(true);
            const response = await API.get('/hero');
            setSlides(response.data.slides || []);
        } catch (error) {
            console.error('Error fetching slides:', error);
            toast.error('Failed to load hero slides');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (slide = null) => {
        if (slide) {
            setEditingSlide(slide);
            setFormData({
                order: slide.order,
                image: null
            });
            setPreviewImage(slide.image);
        } else {
            setEditingSlide(null);
            setFormData({
                order: slides.length + 1,
                image: null
            });
            setPreviewImage(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingSlide(null);
        setFormData({
            order: 0,
            image: null
        });
        setPreviewImage(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('order', formData.order);
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (editingSlide) {
                await API.put(`/hero/${editingSlide._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Slide updated successfully');
            } else {
                await API.post('/hero', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Slide created successfully');
            }
            fetchSlides();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving slide:', error);
            toast.error('Failed to save slide');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this slide?")) return;
        try {
            await API.delete(`/hero/${id}`);
            toast.success('Slide deleted successfully');
            fetchSlides();
        } catch (error) {
            console.error('Error deleting slide:', error);
            toast.error('Failed to delete slide');
        }
    };

    return (
        <div className="p-8 bg-slate-50/50 min-h-screen font-sans text-slate-900">
            {/* Header */}
            <div className="mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hero Section</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Manage the rotating banners on your home page</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-3 px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-rose-200 active:scale-[0.98] cursor-pointer"
                >
                    <MdAdd className="text-lg" />
                    Add New Slide
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-[24px] h-[300px] border border-slate-100 animate-pulse"></div>
                    ))}
                </div>
            ) : slides.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-slate-100 p-20 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner text-slate-300">
                        <MdViewCarousel className="text-5xl" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">No Slides Active</h3>
                    <p className="text-slate-400 font-bold text-sm max-w-xs">Add your first banner image to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {slides.map((slide) => (
                        <div key={slide._id} className="group bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-xl hover:scale-105 transition-all duration-300 relative flex flex-col cursor-pointer">
                            {/* Image Section */}
                            <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                                <img
                                    src={slide.image}
                                    alt="Hero Slide"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = PlaceholderImage; e.target.onerror = null; }}
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="backdrop-blur-md bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 shadow-sm">
                                        Order: {slide.order}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 flex gap-3 mt-auto bg-white border-t border-slate-50">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(slide); }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all"
                                >
                                    <MdEdit className="text-base" />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(slide._id); }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-100 hover:border-rose-200 hover:text-rose-700 transition-all"
                                >
                                    <MdDelete className="text-base" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[32px] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-modalScale">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                    {editingSlide ? 'Edit Slide' : 'New Slide'}
                                </h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Hero Management</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 flex items-center justify-center transition-all">
                                <MdCancel size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Image Upload */}
                            <div className="space-y-4">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Banner Image</label>
                                <div className="relative aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-rose-400 hover:bg-rose-50/10 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                                <MdImage className="text-3xl text-slate-300 group-hover:text-rose-500 transition-colors" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-600">Click to upload image</p>
                                            <p className="text-xs text-slate-400 mt-1">Recommended: 1920x800px</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Display Order</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none font-bold text-slate-900 transition-all"
                                        min="0"
                                        placeholder="e.g. 1"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md pointer-events-none">
                                        Position
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-rose-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <MdSave className="text-lg" />
                                    {editingSlide ? 'Update Slide' : 'Save Slide'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHeroManagement;
