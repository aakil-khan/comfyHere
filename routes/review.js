const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapSync");
const ExpressError = require("../utils/ExpressError");
const {reviewSchema} = require("../schema");
const Review = require("../models/review");
const Listing = require("../models/listing");



const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400,error);
    } else {
        next();
    }
};


//review post Route
router.post("/", validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
    throw new ExpressError(404, "Listing not found");
    }
    const review = new Review(req.body.review);
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listings/${id}`);
    })
);
module.exports = router;
