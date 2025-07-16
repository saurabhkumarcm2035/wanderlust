const express= require("express");
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

router.get("/signup", (req, res) => {
  res.render("users/signup");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => { // Automatically log in the user after registration
      if (err) return next(err);
      req.flash("success", "Welcome to Airbnb!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
}));

router.get("/login", (req, res) => {
  res.render("users/login");
});
router.post("/login",
  saveRedirectUrl,
  passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true
}), (req, res) => {
  req.flash("success", "Welcome back!");
  res.redirect(res.locals.returnTo || "/listings");
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "Logout failed. Please try again.");
      return res.redirect("/listings");
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
});

// router.post("/login", (req, res, next) => {
//   passport.authenticate("local", (err, user, info) => {
//     if (err) return next(err);
//     if (!user) {
//       req.flash("error", info?.message || "Invalid credentials");
//       return res.redirect("/login");
//     }
//     req.logIn(user, (err) => {
//       if (err) return next(err);
//       req.flash("success", "Welcome back!");
//       res.redirect("/listings");
//     });
//   })(req, res, next);
// });


module.exports = router;