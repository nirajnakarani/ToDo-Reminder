const User = require("../model/userModel");
const Task = require("../model/taskModel");
const nodemailer = require('nodemailer');

const loginPage = async (req, res) => {

    try {
        return res.render("login", {
            err: null,
            info: null,
            success: null
        })
    } catch (error) {

    }
}

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.render("login", {
                err: "All Feild Required",
                info: null,
                success: null
            })
        }
        const checkEmail = await User.findOne({ email });
        if (checkEmail) {
            return res.render("login", {
                err: null,
                info: "Email already existing",
                success: null
            })
        }
        await User.create(req.body)
        return res.render("login", {
            err: null,
            info: null,
            success: "Registration Sucess"
        })
    } catch (error) {

    }
}

const login = async (req, res) => {
    try {
        return res.redirect("/home")
    } catch (error) {

    }
}

const homePage = async (req, res) => {
    try {
        return res.render("home", {
            err: null,
            success: null
        })
    } catch (error) {

    }
}

const addData = async (req, res) => {
    try {
        const { title, reminderDays } = req.body
        if (!title || !reminderDays) {
            return res.render("home", {
                err: "All Feild Are Required",
                success: null
            })
        }
        req.body.userId = req.user._id

        req.body.reminderDays = reminderDays.map(day => ({
            day: Number(day),  // Convert string to number
            completed: false   // Default value for completed
        }))

        await Task.create(req.body)
        return res.render("home", {
            err: null,
            success: "Task Created Successfully..."
        })
    } catch (error) {

    }
}
const viewTask = async (req, res) => {
    try {
        const taskData = await Task.find({ userId: req.user._id });
        return res.render("view", {
            taskData
        })
    } catch (error) {

    }
}
const deleteTask = async (req, res) => {
    try {
        const { id } = req.query;
        await Task.findByIdAndDelete(id);
        return res.redirect("/viewTask")

    } catch (error) {

    }
}



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

const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider
    auth: {
        user: process.env.MAILER_EMAIL, // Replace with your email
        pass: process.env.MAILER_PASS   // Replace with your email password
    }
});

const sendReminder = async () => {

}

module.exports = {
    loginPage,
    login,
    register,
    homePage,
    addData,
    viewTask,
    deleteTask,
}