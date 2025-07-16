const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError= require("./utils/ExpressError");
const { listingSchema, reviewSchema }= require("./schema")  // schema validation (server side) using joi


//schema validation middleware
module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError (errMsg,400);
        //or we can use the following line to send the error message
        // req.flash("error", errMsg);
        // return res.redirect("back");
    }else{
        next();
    }
}

//schema validation middleware
module.exports.validateReviews = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError (errMsg,400);
    }else{
        next();
    }
}


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash("error", "You must be logged in first!");
      return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};


module.exports.isOwner = async(req,res,next)=>{
    let {id}= req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async(req,res,next)=>{
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash("error", "You cannot delete this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}