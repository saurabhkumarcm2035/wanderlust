const express= require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync");
const Listing = require("../models/listing");
const { isLoggedIn, isOwner, validateListing} = require("../middleware");




//index route
router.get("/",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
}));


//New route and Create Route
router.get("/new", 
    isLoggedIn, 
    (req,res)=>{
    res.render("listings/new");
});
router.post("/",
    isLoggedIn,
    validateListing,
    wrapAsync(async(req, res)=>{
        if (!req.body.listing.image || !req.body.listing.image.url || req.body.listing.image.url.trim() === "") {
            req.body.listing.image = {
                url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60",
                filename: "default"
            };
        }
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id; // set the owner to the current user
        await newListing.save();
        req.flash("success", "Successfully created a new listing!"); 
        res.redirect(`/listings`);

}));


//Edit and Uodate route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(async(req,res)=>{
    let{id}= req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/edit",{listing});
}));
router.put("/:id",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(async(req,res)=>{
        let{id}= req.params;
        await Listing.findByIdAndUpdate(id,{...req.body.listing});
        req.flash("success", "Successfully updated the listing!");
        res.redirect(`/listings/${id}`);
    })
);


//Show route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate: {
            path:"author",
        },
    })
    .populate("owner");// populate will replace the review ids with actual review objects
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/show", {listing});
}));


//Delete Route
router.delete("/:id",
    isLoggedIn,
    isOwner,
    wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);//This will delete the listing and also the reviews associated with it because of the post middleware in the listing model.
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
}));


module.exports = router;

