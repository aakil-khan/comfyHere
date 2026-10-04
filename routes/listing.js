const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapSync");
const {isLoggedIn,isOwner ,validateListing} = require("../middleware");
const ListingController = require("../controllers/listings");
const multer  = require('multer')

const {storage} = require("../cloudConfig");
const upload = multer({ storage}); 

router
    .route("/")
    .get(wrapAsync(ListingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(ListingController.createListings)
    );

//New route
router.get("/new", isLoggedIn,  ListingController.RenderNewForm);
 
router.route("/:id")
     .get(wrapAsync(ListingController.showListings))
     .put(isLoggedIn,isOwner,
         upload.single("listing[image]"),
          validateListing,
           wrapAsync(ListingController.updateListings))
     .delete(isLoggedIn,isOwner, wrapAsync(ListingController.deleteRoutes))


//edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(ListingController.editListing));


module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400,error);
    } else {
        next();
    }
};

module.exports = router;