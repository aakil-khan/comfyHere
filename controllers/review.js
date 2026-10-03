const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.createReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
    throw new ExpressError(404, "Listing not found");
    }
    const review = new Review(req.body.review);
    review.author = req.user._id;
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}



module.exports.destroyReview = async (req, res) => {
        const { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
    }