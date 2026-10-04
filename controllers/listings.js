const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    let { search, category } = req.query;
    let filter = {};
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } }
        ];
    }
    if (category) {
        filter.category = category;
    }
    let allListings = await Listing.find(filter);
    res.render("index.ejs", {
        allListings,
        search,
        category
    });
};

module.exports.RenderNewForm = (req,res) => {
   res.render("listings/new.ejs");
}

module.exports.showListings = async (req, res) => {
        let { id } = req.params;
        const listing = await Listing.findById(id)
            .populate({ path :"reviews",
            populate : {path:"author"},
             })
            .populate("owner");
        if (!listing) {
            req.flash("error", "Listing you requested for does not exist!");
           return res.redirect("/listings");
        }
        
       res.render("show.ejs", {
    listing,
    mapToken: process.env.MAP_TOKEN});
    }

module.exports.createListings = async (req, res, next) => {
    try {

        console.log("========== CREATE LISTING ==========");
        console.log("BODY:", req.body);
        console.log("FILE:", req.file);
        console.log("USER:", req.user?._id);

        // Check image
        if (!req.file) {
            console.log("❌ No file uploaded");

            req.flash("error", "Please upload an image!");
            return res.redirect("/listings/new");
        }

        // Check location
        const location = req.body.listing.location;

        console.log("LOCATION:", location);

        // Geocoding
        const response = await geocodingClient.forwardGeocode({
            query: location,
            limit: 1
        }).send();

        console.log("GEOCODING RESPONSE:", response.body.features);

        if (response.body.features.length === 0) {
            console.log("❌ Location not found");

            req.flash("error", "Location not found!");
            return res.redirect("/listings/new");
        }

        // Image
        const url = req.file.path;
        const filename = req.file.filename;

        console.log("IMAGE URL:", url);
        console.log("IMAGE FILENAME:", filename);

        // Create listing
        const newListing = new Listing(req.body.listing);

        newListing.owner = req.user._id;

        newListing.image = {
            url: url,
            filename: filename
        };

        newListing.geometry = response.body.features[0].geometry;

        console.log("LISTING BEFORE SAVE:", newListing);

        await newListing.save();

        console.log("✅ LISTING SAVED:", newListing._id);

        req.flash("success", "New Listing Created!");

        res.redirect("/listings");

    } catch (err) {

        console.error("❌❌ CREATE LISTING ERROR ❌❌");
        console.error(err);
        console.error("MESSAGE:", err.message);
        console.error("STACK:", err.stack);

        next(err);
    }
};
//  module.exports.createListings = async (req, res, next) => {
//         if (!req.file) {
//         req.flash("error", "Please upload an image!");
//         return res.redirect("/listings/new");
//     }
//     let response = await geocodingClient.forwardGeocode({
//             query: req.body.listing.location,
//             limit: 1
//         })
//         .send();
//     if (response.body.features.length === 0) {
//         req.flash("error", "Location not found!");
//         return res.redirect("/listings/new");
//     }
//     let url = req.file.path;
//     let filename = req.file.filename;
//     const newListing = new Listing(req.body.listing);
//     newListing.owner = req.user._id;
//     newListing.image = {url, filename
//     };
//     newListing.geometry = response.body.features[0].geometry;
//     await newListing.save();
//     req.flash("success", "New Listing Created!");
//     res.redirect("/listings");
// };

module.exports.updateListings = async (req, res) => {
    let { id } = req.params;

    // 1. Geocode the updated location
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1
        })
        .send();

    // 2. Find the listing
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings");
    }

    // 3. Update normal listing fields
    listing.set(req.body.listing);

    // 4. Update location coordinates
    if (response.body.features.length > 0) {
        listing.geometry = response.body.features[0].geometry;
    }

    // 5. Update image if a new image was uploaded
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;

        listing.image = {
            url,
            filename
        };
    }

    // 6. Save everything
    await listing.save();

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};       


module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image?.url;
    if (originalImageUrl) {
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250"
    );
}
    res.render("listings/edit.ejs", { listing, originalImageUrl});
};

module.exports.deleteRoutes = async (req , res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}