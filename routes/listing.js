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

        (req, res, next) => {
            console.log("✅ 1. isLoggedIn PASSED");
            next();
        },
        (req, res, next) => {
            console.log("✅ 2. Starting multer");
            upload.single("listing[image]")(req, res, function (err) {
                if (err) {
                    console.error("❌ MULTER ERROR:");
                    console.error(err);
                    return next(err);
                }
                console.log("✅ 3. MULTER PASSED");
                console.log("FILE:", req.file);
                next();
            });
        },
        (req, res, next) => {
            console.log("✅ 4. Starting validateListing");
            try {
                validateListing(req, res, next);
            } catch (err) {
                console.error("❌ VALIDATION ERROR:");
                console.error(err);
                next(err);
            }
        },
        (req, res, next) => {
            console.log("✅ 5. VALIDATION PASSED");
            next();
        },
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