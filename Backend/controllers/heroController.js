import HeroSlide from '../models/HeroSlide.js';

// ==========================================
// 1. GET ALL SLIDES (Public - Optimized)
// ==========================================
export const getHeroSlides = async (req, res) => {
    try {
        // Return only image and order
        const slides = await HeroSlide.find().select('image order').sort({ order: 1 });
        res.status(200).json({
            success: true,
            slides
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch hero slides",
            error: err.message
        });
    }
};

// ==========================================
// 2. CREATE SLIDE (Admin - Image Only)
// ==========================================
export const createHeroSlide = async (req, res) => {
    try {
        const { order } = req.body;

        // Image Handling
        let imageUrl = "";
        if (req.file) {
            imageUrl = req.file.path;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        } else {
            return res.status(400).json({ message: "Image is required" });
        }

        const parsedOrder = order ? Number(order) : 0;

        // Shift existing slides down if they have the same or higher order
        await HeroSlide.updateMany(
            { order: { $gte: parsedOrder } },
            { $inc: { order: 1 } }
        );

        const newSlide = new HeroSlide({
            image: imageUrl,
            order: parsedOrder
        });

        await newSlide.save();

        res.status(201).json({
            success: true,
            message: "Hero slide created successfully",
            slide: newSlide
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to create hero slide",
            error: err.message
        });
    }
};

// ==========================================
// 3. UPDATE SLIDE (Admin - Image Only)
// ==========================================
export const updateHeroSlide = async (req, res) => {
    try {
        console.log("updateHeroSlide hit");
        console.log("Body:", req.body);
        console.log("File:", req.file);
        const { id } = req.params;
        const {
            order,
            image // specific case where simple URL string might be passed
        } = req.body;

        const slide = await HeroSlide.findById(id);
        if (!slide) {
            return res.status(404).json({ message: "Slide not found" });
        }

        if (order !== undefined) {
            const newOrder = Number(order);
            const oldOrder = slide.order;

            if (oldOrder !== newOrder) {
                // If moving down the list (e.g. 1 -> 3), shift slides between old and new UP (dec 1)
                if (oldOrder < newOrder) {
                    await HeroSlide.updateMany(
                        { order: { $gt: oldOrder, $lte: newOrder } },
                        { $inc: { order: -1 } }
                    );
                }
                // If moving up the list (e.g. 3 -> 1), shift slides between old and new DOWN (inc 1)
                else if (oldOrder > newOrder) {
                    await HeroSlide.updateMany(
                        { order: { $gte: newOrder, $lt: oldOrder } },
                        { $inc: { order: 1 } }
                    );
                }
                slide.order = newOrder;
            }
        }

        // Image update
        if (req.file) {
            slide.image = req.file.path;
        } else if (image) {
            slide.image = image;
        }

        await slide.save();

        res.status(200).json({
            success: true,
            message: "Hero slide updated successfully",
            slide
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to update hero slide",
            error: err.message
        });
    }
};

// ==========================================
// 4. DELETE SLIDE (Admin)
// ==========================================
export const deleteHeroSlide = async (req, res) => {
    try {
        const { id } = req.params;
        const slide = await HeroSlide.findByIdAndDelete(id);

        if (!slide) {
            return res.status(404).json({ message: "Slide not found" });
        }

        // Shift remaining slides up to fill the gap
        await HeroSlide.updateMany(
            { order: { $gt: slide.order } },
            { $inc: { order: -1 } }
        );

        res.status(200).json({
            success: true,
            message: "Hero slide deleted successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to delete hero slide",
            error: err.message
        });
    }
};
