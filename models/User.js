const {Schema, model} = require("mongoose")

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is Required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    hashedPassword: {
        type: String,
        required: [true, "Password is Required"]
    }
}, {
    timestamps: true
})

const User = model("User", userSchema)

module.exports = User