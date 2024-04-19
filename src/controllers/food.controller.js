import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Food } from "../models/food.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from 'axios';
import fetch from 'node-fetch';


// const Addfood = asyncHandler(async (req, res) => {
//     const { food_name, food_calories, food_ml_g, food_quantity } = req.body;
//     const today = new Date().toISOString().split('T')[0];
//     const userId = req.user?._id;

//     if (!food_name || (!food_ml_g && !food_quantity)) {
//         throw new ApiError(400, "Food name is required, and either food_ml_g or food_quantity must be provided");
//     }

//     const providedQuantity = food_ml_g/100 || food_quantity;

//     const query = encodeURIComponent(food_name);
//     const apiKey = process.env.FOOD_API_KEY; 
//     const url = `https://api.api-ninjas.com/v1/nutrition?query=${query}`;
//     const response = await axios.get(url, {
//         headers: {
//             'X-Api-Key': apiKey
//         }
//     });
//     if (response.status !== 200) {
//         throw new ApiError(response.status, "Failed to fetch calories information from the external API");
//     }

//     const calories = response.data[0].calories*providedQuantity

//     let existingUserFood = await Food.findOne({ user: userId, date: today });

//     if (!existingUserFood) {
//         existingUserFood = new Food({ user: userId, date: today });
//     }

//     const foodItem = {
//         food_name,
//         food_calories: calories,
//         [food_ml_g ? 'food_ml_g' : 'food_quantity']: providedQuantity,
//     };

//     existingUserFood.food_items.push(foodItem);

//     await existingUserFood.save();

//     return res
//     .status(200)
//     .json(new ApiResponse(200, existingUserFood, "Food details updated successfully"));
// });


// const Addfood = asyncHandler(async (req, res) => {
//     const { food_name, food_calories, food_ml_g, food_quantity } = req.body;
//     const today = new Date().toISOString().split('T')[0];
//     const userId = req.user?._id;

//     if (!food_name || (!food_calories && !food_ml_g && !food_quantity)) {
//         throw new ApiError(400, "No fields in update request");
//     }

//     let existingUserFood = await Food.findOne({ user: userId, date: today });

//     if (!existingUserFood) {
//         existingUserFood = new Food({ user: userId, date: today });
//     }

//     let f_item = {
//         food_name: food_name,
//         food_calories: food_calories || 0,
//         food_ml_g: food_ml_g || 0,
//         food_quantity: food_quantity || 0
//     };

//     existingUserFood.food_items.push(f_item);

//     await existingUserFood.save();

//     return res
//         .status(200)
//         .json(new ApiResponse(200, existingUserFood, "Food details updated successfully"));
// });

const Addfood = asyncHandler(async (req, res) => {
    const { food_name, food_calories, food_ml_g, food_quantity } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const userId = req.user?._id;

    if (!food_name || (!food_ml_g && !food_quantity)) {
        throw new ApiError(400, "Food name is required, and either food_ml_g or food_quantity must be provided");
    }
    const originalQuantity = food_ml_g  || food_quantity;
    const providedQuantity = food_ml_g / 100 || food_quantity;

    const query = encodeURIComponent(food_name);
    const apiKey = process.env.FOOD_API_KEY; 
    const url = `https://api.api-ninjas.com/v1/nutrition?query=${query}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'X-Api-Key': apiKey
        }
    });

    if (!response.ok) { // Checks if response status code is not in the range 200-299
        throw new ApiError(response.status, "Failed to fetch calories information from the external API");
    }

    const data = await response.json(); // Parse JSON data from the response
    const calories = data[0].calories * providedQuantity;

    let existingUserFood = await Food.findOne({ user: userId, date: today });

    if (!existingUserFood) {
        existingUserFood = new Food({ user: userId, date: today });
    }

    const foodItem = {
        food_name,
        food_calories: calories,
        [food_ml_g ? 'food_ml_g' : 'food_quantity']: originalQuantity,
    };

    existingUserFood.food_items.push(foodItem);

    await existingUserFood.save();

    return res
    .status(200)
    .json(new ApiResponse(200, "Food details updated successfully", existingUserFood));
});

const getFood = asyncHandler(async (req, res) => {
    const username = req.user?._id;
    const today = new Date().toISOString().split('T')[0];
    const food = await Food.findOne({ user: username, date: today });
    if (!food) {
        return res
        .status(404)
        .json(new ApiResponse(404, null, "No food data found for the user"));
    }
    return res
    .status(200)
    .json(new ApiResponse(200, food, "food fetched successfully"))
})

export { Addfood, getFood }