const {Schema, model} = require("mongoose")

const taskSchema = new Schema({
    taskName : {
        type: String,
        required: true,
        unique: true,
    },
    taskDescription: {
        type: String, 
        required: true,
        trim: true
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    assignedUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    projectManager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    updatedAt: {
        type: Date,
    }
})

const Tasks = model("Tasks", taskSchema)

module.exports = Tasks