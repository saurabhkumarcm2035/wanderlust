const mongoose = require("mongoose");
const Listing = require("../models/listings.js");
const initData = require("./data.js"); // assuming data.js exports an array


main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("Connection error:", err);
  });

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log("Database initialized with sample listings");
};

initDB();
