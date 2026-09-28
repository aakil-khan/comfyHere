const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapSync");
const ExpressError = require("../utils/ExpressError");
const {listingSchema } = require("../schema");
const {isLoggedIn} = require("../middleware");


const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400,error);
    } else {
        next();
    }
};


//index route
router.get("/",wrapAsync(async (req,res) => {
  let allListings = await Listing.find({});
  res.render("index.ejs", {allListings});
}));

//New route
router.get("/new", isLoggedIn,(req,res) => {
   res.render("listings/new.ejs");
});

//edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync(async (req,res) => {
  let {id} = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs",{listing});
}));

//Show Route
router.get(
    "/:id",
    wrapAsync(async (req, res) => {
        let { id } = req.params;

        const listing = await Listing.findById(id)
            .populate("reviews")
            .populate("owner");
        if (!listing) {
            req.flash("error", "Listing you requested for does not exist!");
           return res.redirect("/listings");
        }
        console.log(listing);
        res.render("show.ejs", { listing });
    })
);

// Create Route
router.post(
    "/",
    isLoggedIn,
    validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        await newListing.save();
        req.flash("success" , "New Lishting Created ! ");
        res.redirect("/listings");
    })
);

 
//update route
router.put("/:id",
    isLoggedIn,
    validateListing,
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));

//delete Route
router.delete("/:id",isLoggedIn, wrapAsync(async (req , res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));



module.exports = router;