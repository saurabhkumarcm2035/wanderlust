const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const wrapAsync= require("./utils/wrapAsync");
const ExpressError= require("./utils/ExpressError");
const {listingSchema, reviewSchema}= require("./schema")  // schema validation (server side) using joi 
const Review = require("./models/review");



// async function main() {
//   try {
//     await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
//     console.log("Connected to MongoDB");
//   } catch (err) {
//     console.error("MongoDB connection error:", err);
//   }
// }
// main();
main()
    .then(()=>{
        console.log("connected to Mongodb");
    })
    .catch((err) => {
        console.log(err);
    });   
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}


app.engine("ejs", ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true})); //
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

app.get("/",(req,res)=>{
    res.send("Hi I am root");
});


//schema validation middleware
const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError (errMsg,400);
    }else{
        next();
    }
}
const validateReviews = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError (errMsg,400);
    }else{
        next();
    }
}

//index route
app.get("/listings",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
}));



//New route and Create Route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new");
});

app.post("/listings",
    validateListing,
    wrapAsync(async(req, res)=>{
        if (!req.body.listing.image || !req.body.listing.image.url || req.body.listing.image.url.trim() === "") {
            req.body.listing.image = {
                url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60",
                filename: "default"
            };
        }
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect(`/listings/${newListing.id}`);

}));



//Edit and Uodate route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let{id}= req.params;
    const listing = await Listing.findById(id);
    console.log(listing);
    res.render("listings/edit",{listing});
}));
app.put("/listings/:id",
    validateListing,
    wrapAsync(async(req,res)=>{
        let{id}= req.params;
        await Listing.findByIdAndUpdate(id,{...req.body.listing});
        res.redirect(`/listings/${id}`);
    })
);



//Delete Route
app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);//This will delete the listing and also the reviews associated with it because of the post middleware in the listing model.
    res.redirect("/listings");
}));

//Show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id).populate("reviews");// populate will replace the review ids with actual review objects
    res.render("listings/show", {listing});
}));


//review route
app.post("/listings/:id/reviews",
    validateReviews,
    wrapAsync(async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing.id}`);

}))

//Delete Review route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async(req,res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // $pull will remove the review id from the reviews array
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));



// app.get("/testlisting",async(req,res)=>{
//     let samplelisting= new Listing({
//         title:"My new VILLA",
//         description:"By the beach",
//         price:1200,
//         location:"Dholakpur",
//         country:"India"
//     })
//     await samplelisting.save();
//     console.log("sample was saved");
//     res.send("succesful testing");
// })


//random route
// app.all("*", (req,res,next)=>{
//     next(new ExpressError("page not found",404));// this next will call the error handler.
// });



// custom error handler
app.use((err,req,res,next)=>{
    const {statusCode=500,message="something went wrong"} = err;
    res.status(statusCode).render("error",{message})
});



app.listen(3000,()=>{
    console.log ("server is listening");
});
