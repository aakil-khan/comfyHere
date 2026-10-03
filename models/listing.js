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
      url : String,
      filename : String,  
    },

    category: {
    type: String,
    enum: [
        "Rooms",
        "Beach",
        "Mountains",
        "Pool",
        "Cabins",
        "Castles",
        "Nature",
        "Camping",
        "City"
    ],
    required:true
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
    geometry : {
        type : {
            type:String,
            enum :['Point'],
            required: true
        },
        coordinates: {
            type : [Number],
            required : true
        }
    }
});
  
//mongoose middleware used for delete reviews if listings are deleted;
listingSchema.post("findOneAndDelete" , async(listing) => {
    if(listing) {
        await Review.deleteMany({ _id : { $in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports = Listing; 