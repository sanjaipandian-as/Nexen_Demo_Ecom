import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export default mongoose.model('HeroSlide', heroSlideSchema);
