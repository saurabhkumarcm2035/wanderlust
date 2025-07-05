const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listings");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");


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

app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true})); //
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/",(req,res)=>{
    res.send("Hi I am root");
})


//index route
app.get("/listings",async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
})



//New route and Create Route
app.get("/listings/new", (req,res)=>{
    res.render("listings/new");
})

app.post("/listings", async(req, res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})



//Edit and Uodate route
app.get("/listings/:id/edit",async(req,res)=>{
    let{id}= req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit",{listing});
})
app.put("/listings/:id", async(req,res)=>{
    let{id}= req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})



//Delete Route
app.delete("/listings/:id", async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

//Show route
app.get("/listings/:id",async(req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show", {listing});
})




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

app.listen(3000,()=>{
    console.log ("server is listening");
});
