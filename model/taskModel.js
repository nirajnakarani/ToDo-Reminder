const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    title: {
        type: String,
        required: true
    },
    reminderDays: [
        {
            day: {
                type: Number,
                required: true
            },
            completed: {
                type: Boolean,
                default: false
            }
        }
    ],
    // reminderDates: {
    //     type: [{
    //         date: { type: Date, required: true },
    //         completed: { type: Boolean, default: false }
    //     }]
    // }
}, { timestamps: true });

// taskSchema.pre('save', function (next) {
//     const task = this;
//     if (task.isNew) {
//         task.reminderDates = task.reminderDay.map(day => {
//             const reminderDate = new Date(task.createdAt);
//             reminderDate.setDate(reminderDate.getDate() + day);
//             return { date: reminderDate, completed: false };
//         });
//     }
//     next();
// });
const Task = mongoose.model("task", taskSchema);

module.exports = Task;