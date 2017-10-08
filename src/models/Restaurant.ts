import * as mongoose from "mongoose";

export type RestaurantModel = mongoose.Document & {
    name: string
};

const restaurantSchema = new mongoose.Schema({
    name: String, 
    address: String, 
    geolocation: {
        lat: Number,
        lon: Number
    },
    openinghour: String
}, {timestamps: true});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;