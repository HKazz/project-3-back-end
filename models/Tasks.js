const {Schema, model} = require("mongoose")

const taskSchema = new Schema({
    taskName : {
        type: String,
        required: true,
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
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'pending', 'in progress', 'completed'],
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