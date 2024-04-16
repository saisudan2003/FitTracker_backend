import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phoneno: {
        type: String,
    },
    profile_pic: {
        type: String,
    },
    height: {
        type: Number,
        trim: true
    },
    weight: {
        type: Number,
        trim: true
    },
    gender: {
        type: String,
        trim: true
    },
    refreshToken: {
        type: String
    }
},{
    timestamps: true
})

// userSchema.pre("save", async function () {
//     if(!this.isModified("password")) return next()

//     this.password = await bcrypt.hash(this.password, 10)
//     next()
// })
userSchema.pre("save", function (next) {
    if (!this.isModified("password")) {
      return next();
    }
    const saltRounds = 10; 
    this.password = bcrypt.hashSync(this.password, saltRounds);
    next();
  });

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}
export const User = mongoose.model("User", userSchema)