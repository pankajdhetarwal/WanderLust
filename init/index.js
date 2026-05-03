require("dotenv").config();
const mongoose=require("mongoose");
const initdata =require("./data.js");
const listing=require("../models/listing.js");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const dbUrl = process.env.ATLASDB_URL;

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB=async()=>{
    await listing.deleteMany({});
    
    console.log("Geocoding listings... please wait.");
    
    const updatedData = [];
    for (let obj of initdata.data) {
        try {
            let response = await geocodingClient.forwardGeocode({
                query: obj.location,
                limit: 1
            }).send();
            
            let geometry = { type: "Point", coordinates: [77.1025, 28.7041] }; // Default fallback
            if (response.body.features && response.body.features.length > 0) {
                geometry = response.body.features[0].geometry;
            }
            
            updatedData.push({
                ...obj,
                owner: "69f7806f9abfb4945153e2b8", // Updated with real user ID
                geometry: geometry
            });
        } catch (e) {
            console.log(`Failed to geocode ${obj.location}, using fallback.`);
            updatedData.push({
                ...obj,
                owner: "69f7806f9abfb4945153e2b8",
                geometry: { type: "Point", coordinates: [77.1025, 28.7041] }
            });
        }
    }
    
    await listing.insertMany(updatedData);
    console.log("Data was initialized with Mapbox coordinates.");
}

initDB();