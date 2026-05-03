const Review = require("../models/reviews.js");
const Listing = require("../models/listing.js");

module.exports.addReviews=async (req, res) => {
    let apartment = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    apartment.reviews.push(newReview.id);
    await newReview.save();
    await apartment.save();
    req.flash("success", "Review added successfully");
    res.redirect(`/listings/${req.params.id}`);
}

module.exports.deleteReviews=async (req, res) => {
    let { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });
    req.flash("success", "Review deleted successfully");
    res.redirect(`/listings/${id}`);
}