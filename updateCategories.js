require("dotenv").config();

const mongoose = require("mongoose");
const Listing = require("./models/listing");

const categories = {
    "Burj Khalifa": "City",
    "Modern Loft in Downtown": "City",
    "Mountain Retreat": "Mountains",
    "Historic Villa in Tuscany": "Rooms",
    "Secluded Treehouse Getaway": "Nature",
    "Beachfront Paradise": "Beach",
    "Rustic Cabin by the Lake": "Cabins",
    "Luxury Penthouse with City Views": "City",
    "Ski-In/Ski-Out Chalet": "Mountains",
    "Safari Lodge in the Serengeti": "Nature",
    "Historic Canal House": "Rooms",
    "Private Island Retreat": "Beach",
    "Charming Cottage in the Cotswolds": "Rooms",
    "Historic Brownstone in Boston": "City",
    "Beachfront Bungalow in Bali": "Beach",
    "Mountain View Cabin in Banff": "Cabins",
    "Art Deco Apartment in Miami": "City",
    "Tropical Villa in Phuket": "Beach",
    "Historic Castle in Scotland": "Castles",
    "Desert Oasis in Dubai": "Nature",
    "Rustic Log Cabin in Montana": "Cabins",
    "Beachfront Villa in Greece": "Beach",
    "Eco-Friendly Treehouse Retreat": "Nature",
    "Historic Cottage in Charleston": "Rooms",
    "Modern Apartment in Tokyo": "City",
    "Lakefront Cabin in New Hampshire": "Cabins",
    "Luxury Villa in the Maldives": "Beach",
    "Ski Chalet in Aspen": "Mountains",
    "Secluded Beach House in Costa Rica": "Beach"
};

async function updateCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log("✅ MongoDB connected\n");

        let updated = 0;

        for (const [title, category] of Object.entries(categories)) {

            const listing = await Listing.findOne({ title });

            if (!listing) {
                console.log(`❌ Not found: ${title}`);
                continue;
            }

            listing.category = category;
            await listing.save();

            console.log(`✅ ${title} → ${category}`);
            updated++;
        }

        console.log(`\n🎉 Updated ${updated} listings!`);

        await mongoose.connection.close();
        console.log("MongoDB connection closed.");

    } catch (error) {
        console.log("❌ Error:", error);
    }
}

updateCategories();