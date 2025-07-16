const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError= require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

//requiring the routes
const listingRouter= require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");
const { log } = require("console");


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


//session middleware
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));// this will use the passport-local-mongoose plugin to authenticate the user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.user; // this will make the current user available in all the views(ejs files)
  next();
});


//root route
app.get("/",(req,res)=>{
    res.send("Hi I am root");
});

//listing routes
app.use("/listings", listingRouter);

//reviews routes
app.use("/listings/:id/reviews", reviewsRouter);

app.use("/", userRouter);


//random route
// app.all("*", (req,res,next)=>{
//     next(new ExpressError("page not found",404));// this next will call the error handler.
// });

// custom error handler
app.use((err,req,res,next)=>{
    const {statusCode=500,message="something went wrong"} = err;
    res.status(statusCode).render("error",{message});
});

app.listen(3000,()=>{
    console.log ("server is listening");
});
