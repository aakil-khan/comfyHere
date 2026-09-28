const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapSync");
const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review");
const Listing = require("../models/listing");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware");


//review post Route
router.post("/",isLoggedIn, validateReview, wrapAsync(async (req, res) => {
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
}));

//delete review route
router.delete("/:reviewId" ,isReviewAuthor , wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
    })
);
module.exports = router;
