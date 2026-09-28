const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

main()
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}
const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: new mongoose.Types.ObjectId("6ab7a51d99cb024ac0694cde")
    }));
    await Listing.insertMany(initData.data);

    console.log("Data was Initialized");
};

initDB();