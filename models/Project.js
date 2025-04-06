const {Schema, model} = require("mongoose")

const projectSchema = new Schema({
    projectName: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    projectDescription: {
        type: String,
        required: true,
        trim: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started',
    },
    teamMembers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    },
});

const Project = model("Project", projectSchema)

module.exports = Project

