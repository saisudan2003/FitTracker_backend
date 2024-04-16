import mongoose,{Schema} from "mongoose";

const activitySchema = new Schema ({
    username:{
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
    steps:{
        type: Number,
        default: 0
    },
    sleep: {
        type: Number,
        default: 0
    },
    calories: {
        type: Number,
        default: 0
    }
},
{
    timestamps: true
})

export const Activity = mongoose.model("Activity", activitySchema)