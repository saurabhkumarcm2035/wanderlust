const mongoose = require("mongoose");

const listingschema =new mongoose.Schema({
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
    country:String
});

const Listing = mongoose.model("listing",listingschema);

module.exports= Listing;