const mongoose = require("mongoose");
const Review = require("./review");

const listingSchema = new mongoose.Schema({
    title:{
        type:String,
        require:true
    },
    description:String,
    image: {
    url: {
        type: String,
    },
    filename: {
        type: String,
    }
    },

    price:Number,
    location:String,
    country:String,
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review",
        },
    ]
});




// This is a middleware that runs after a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) { 
    if (listing) {
        await Review.deleteMany({_id: {$in: listing.reviews}});   // Deletes all reviews associated with the listing
    }
});


const Listing = mongoose.model("listing",listingSchema);


module.exports= Listing;