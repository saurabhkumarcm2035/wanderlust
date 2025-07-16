const express= require("express");
const router = express.Router({ mergeParams: true }); //mergeParams allows us to access params from the parent route
const wrapAsync= require("../utils/wrapAsync");
const Review = require("../models/review");
const Listing = require("../models/listing");
const { isLoggedIn, validateReviews, isReviewAuthor } = require("../middleware");


//review route
router.post("/",
    isLoggedIn,
    validateReviews,
    wrapAsync(async(req,res)=>{
        
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "Successfully added a new review!");

    res.redirect(`/listings/${listing.id}`);

}));


//Delete Review route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(async(req,res)=>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); // $pull will remove the review id from the reviews array
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}));


module.exports = router;