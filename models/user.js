const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  // other user fields
});

userSchema.plugin(passportLocalMongoose);// This plugin adds username and password fields, and handles hashing and authentication

module.exports = mongoose.model("User", userSchema);// this creates a User model based on the userSchema and exports it
