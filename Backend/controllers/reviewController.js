import Review from "../models/Review.js";
import Product from "../models/Product.js";

export const addReview = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId, rating, reviewText } = req.body;

    // Create review
    const review = await Review.create({
      customerId,
      productId,
      rating,
      reviewText
    });

    // Update product rating stats
    const reviews = await Review.find({ productId });
    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: avg,
      totalReviews: reviews.length
    });

    res.json({
      message: "Review added successfully",
      review
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }
    res.status(500).json({ error: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { reviewId } = req.params;
    const { rating, reviewText } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, customerId },
      { rating, reviewText },
      { new: true }
    );

    if (!review)
      return res.status(404).json({ message: "Review not found" });

    // Update product rating stats
    const reviews = await Review.find({ productId: review.productId });
    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(review.productId, {
      averageRating: avg,
      totalReviews: reviews.length
    });

    res.json({
      message: "Review updated successfully",
      review
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { reviewId } = req.params;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      customerId
    });

    if (!review)
      return res.status(404).json({ message: "Review not found" });

    // Recalculate product stats
    const reviews = await Review.find({ productId: review.productId });

    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(review.productId, {
      averageRating: avg,
      totalReviews: reviews.length
    });

    res.json({ message: "Review deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate("customerId", "name");

    res.json(reviews);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
