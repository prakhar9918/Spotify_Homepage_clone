const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to Database");
  } catch (err) {
    console.error(err);
  }
}

main();

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({
      ...obj,
      owner:"65aab0485caa8181b0720139",
    }));
    await Listing.insertMany(initData.data);
    console.log("Data has been initialized");
  } catch (err) {
    console.error(err);
  }
};

initDB();