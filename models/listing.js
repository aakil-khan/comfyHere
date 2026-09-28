const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review =require("./review");

const listingSchema = new Schema({
    title : {
    type : String,
    required : true,
    },

    description : String,
    image : {
       type : String,
        set :(v) => v ==="" ? "https://plus.unsplash.com/premium_photo-1669075651765-dd00fefb972e?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
        : v ,   
    },
    
    price : Number,
    location : String,
    country : String,
    reviews: [
        {
         type: Schema.Types.ObjectId,
         ref: "Review"
         
        }
    ],
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
});
  
//mongoose middleware used for delete reviews if listings are deleted;
listingSchema.post("findOneAndDelete" , async(listing) => {
    if(listing) {
        await Review.deleteMany({ _id : { $in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing; 