const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapSync");
const ExpressError = require("../utils/ExpressError");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware");

const reviewController = require("../controllers/review");

//review post Route
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//delete review route
router.delete("/:reviewId" ,isReviewAuthor , wrapAsync(reviewController.destroyReview));
module.exports = router;
