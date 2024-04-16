import mongoose,{Schema} from "mongoose";

const foodSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    date:{
        type: String,
        default: () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const day = String(today.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        }
    },
    food_items:[
        {
            food_name: {
                type: String,
            },
            food_calories: {
                type: Number,
            },
            food_ml_g: {
                type: Number,
            },
            food_quantity: {
                type: Number,
            }
        }
    ]
},
{
    timestamps: true
})

export const Food = mongoose.model("Food", foodSchema)