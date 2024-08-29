const mongoose = require('mongoose');
const cron = require('node-cron');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your-db-name', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Task Schema
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    reminderDays: {
        day: {
            type: Number,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Task = mongoose.model('Task', taskSchema);

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    fcmToken: {
        type: String // Firebase Cloud Messaging token
    }
});

const User = mongoose.model('User', userSchema);

// Function to Calculate Reminder Dates
function getReminderDates(createdDate, reminderDays) {
    const reminderDates = [];
    let lastReminderDate = new Date(createdDate);
    lastReminderDate.setHours(0, 0, 0, 0);

    reminderDays.forEach(reminder => {
        if (!reminder.completed) {
            lastReminderDate.setDate(lastReminderDate.getDate() + reminder.day);
            reminderDates.push(new Date(lastReminderDate));
        }
    });

    return reminderDates;
}

// Function to Determine if Today is a Reminder Day
function shouldSendReminder(createdDate, reminderDays) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminderDates = getReminderDates(createdDate, reminderDays);
    return reminderDates.some(reminderDate => reminderDate.getTime() === today.getTime());
}

// Cron Job to Run Daily at Midnight
cron.schedule('0 0 * * *', async () => { // Runs daily at midnight
    console.log('Checking for tasks with reminders...');

    try {
        const tasks = await Task.find().populate('userId');

        for (const task of tasks) {
            if (shouldSendReminder(task.createdDate, task.reminderDays)) {
                const user = task.userId;
                if (user.fcmToken) {
                    const message = {
                        notification: {
                            title: 'Task Reminder',
                            body: Reminder for task: ${ task.title }
                },
                token: user.fcmToken
            };

            try {
                await admin.messaging().send(message);
                console.log('Successfully sent message:', task.title);

                // Update the task to mark the reminder as completed
                task.reminderDays.forEach(reminder => {
                    const reminderDate = new Date(task.createdDate);
                    reminderDate.setDate(reminderDate.getDate() + reminder.day);

                    if (reminderDate.getTime() === new Date().setHours(0, 0, 0, 0)) {
                        reminder.completed = true; // Mark as completed
                    }
                });

                await task.save();
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    }
        }
    } catch (error) {
    console.error('Error fetching tasks or sending notifications:', error);
}
});

console.log('Service running and cron job scheduled.');