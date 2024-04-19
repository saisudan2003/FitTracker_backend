import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Activity } from "../models/activity.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//usernmae here represents the user object referenced in teh schema 
const addActivity = asyncHandler(async (req, res) => {
    const { steps, sleep, calories } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const username = req.user?._id;

    if (!steps && !sleep && !calories) {
        throw new ApiError(400, "No fields in update request");
    }

    let existingUserActivity = await Activity.findOne({ username, date: today });

    if (!existingUserActivity) {
        existingUserActivity = new Activity({ username, date: today });
    }

    if (steps) existingUserActivity.steps = steps;
    if (sleep) existingUserActivity.sleep = sleep;
    if (calories) existingUserActivity.calories = calories;

    await existingUserActivity.save();

    return res
    .status(200)
    .json(new ApiResponse(200, existingUserActivity, "Activity details updated successfully"));
});

const getActivity = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const username = req.user?._id;
    let existingUserActivity = await Activity.findOne({ username, date: today });
    if (!existingUserActivity) {
        existingUserActivity = new Activity({ username, date: today });
        existingUserActivity.steps = 0;
        existingUserActivity.sleep = 0;
        existingUserActivity.calories = 0;
        await existingUserActivity.save();
    }
    let userData = {
        steps: existingUserActivity.steps,
        sleep: existingUserActivity.sleep,
        calories: existingUserActivity.calories
    }
    return res
    .status(200)
    .json(new ApiResponse(200, userData, "Activity details fetched successfully"));

})

export { addActivity, getActivity };
