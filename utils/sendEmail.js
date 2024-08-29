const User = require("../model/userModel")
const Task = require("../model/taskModel")
const nodemailer = require('nodemailer');
const path = require("path")
const fs = require("fs")
const emailTemplatePath = path.join(__dirname, 'emailTemplate.html');
const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');


// function getReminderDates(createdDate, reminderDays) {
//     const reminderDates = [];
//     let lastReminderTime = new Date(createdDate);
//     lastReminderTime.setSeconds(0, 0); // Set seconds and milliseconds to zero

//     reminderDays.forEach(reminder => {
//         if (!reminder.completed) {
//             const reminderTime = new Date(lastReminderTime.getTime() + reminder.day * 60000); // Convert minutes to milliseconds
//             reminderTime.setSeconds(0, 0);
//             reminderDates.push(reminderTime);
//             lastReminderTime = reminderTime; // Update the last reminder time
//         }
//     });
//     return reminderDates;
// }

// // Function to Determine if Now is a Reminder Time
// function shouldSendReminder(createdDate, reminderDays) {
//     const now = new Date();
//     now.setSeconds(0, 0); // Set seconds and milliseconds to zero

//     const reminderDates = getReminderDates(createdDate, reminderDays);
//     console.log(reminderDates);
//     console.log(now);
//     return reminderDates.some(reminderDate => reminderDate.getTime() === now.getTime());
// }

// // Setup Nodemailer transporter
// const transporter = nodemailer.createTransport({
//     service: 'Gmail', // Use your email service provider
//     auth: {
//         user: process.env.MAILER_EMAIL,
//         pass: process.env.MAILER_PASS
//     }
// });

// // Function to send reminder emails
// const sendEmail = async () => {
//     try {
//         const tasks = await Task.find({
//             reminderDays: {
//                 $elemMatch: { completed: false }
//             }
//         }).populate('userId');
//         for (const task of tasks) {
//             const user = task.userId;
//             if (shouldSendReminder(task.createdAt, task.reminderDays)) {
//                 if (user.email) {
//                      const emailContent = emailTemplate
// .replace('{{userName}}', user.name)
//     .replace('{{taskTitle}}', task.title)
//     .replace('{{year}}', new Date().getFullYear());

// const mailOptions = {
//     from: process.env.MAILER_EMAIL,
//     to: user.email,
//     subject: 'Task Reminder',
//     html: emailContent
// };
//                     try {
//                         await transporter.sendMail(mailOptions);
//                         console.log('Successfully sent email:', task.title);

//                         // Update the task to mark the reminder as completed
//                         task.reminderDays.forEach(reminder => {
//                             const reminderTime = new Date(task.createdAt.getTime() + reminder.day * 60000); // Convert minutes to milliseconds
//                             const roundedReminderTime = new Date(reminderTime);
//                             roundedReminderTime.setSeconds(0, 0);
//                             if (roundedReminderTime.getTime() === new Date().setSeconds(0, 0)) {
//                                 reminder.completed = true; // Mark as completed
//                             }
//                         });

//                         await task.save();
//                     } catch (error) {
//                         console.error('Error sending email:', error);
//                     }
//                 }
//             }
//         }
//     } catch (error) {
//         console.error('Error fetching tasks or sending emails:', error);
//     }
// };



// Function to calculate reminder dates
function getReminderDates(createdDate, reminderDays) {
    const reminderDates = [];
    let lastReminderTime = new Date(createdDate);

    reminderDays.forEach(reminder => {
        if (!reminder.completed) {
            const reminderTime = new Date(lastReminderTime);
            reminderTime.setDate(reminderTime.getDate() + reminder.day); // Add days while preserving the time
            reminderDates.push(reminderTime);
            lastReminderTime = reminderTime;
        }
    });
    return reminderDates;
}

// Function to check if the current time is a reminder time
function shouldSendReminder(createdDate, reminderDays) {
    const now = new Date();

    const reminderDates = getReminderDates(createdDate, reminderDays);
    return reminderDates.some(reminderDate => reminderDate.getTime() === now.getTime());
}

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Use your email service provider
    auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_PASS
    }
});

// Function to send reminder emails
const sendEmail = async () => {
    try {
        const tasks = await Task.find({
            reminderDays: {
                $elemMatch: { completed: false }
            }
        }).populate('userId');

        for (const task of tasks) {
            const user = task.userId;
            if (shouldSendReminder(task.createdAt, task.reminderDays)) {
                if (user.email) {
                    const emailContent = emailTemplate
                        .replace('{{userName}}', user.name)
                        .replace('{{taskTitle}}', task.title)
                        .replace('{{year}}', new Date().getFullYear());

                    const mailOptions = {
                        from: process.env.MAILER_EMAIL,
                        to: user.email,
                        subject: 'Task Reminder',
                        html: emailContent
                    };

                    try {
                        await transporter.sendMail(mailOptions);
                        console.log('Successfully sent email:', task.title);

                        // Mark the reminder as completed
                        task.reminderDays.forEach(reminder => {
                            const reminderTime = new Date(task.createdAt);
                            reminderTime.setDate(reminderTime.getDate() + reminder.day);
                            if (reminderTime.getTime() === new Date().getTime()) {
                                reminder.completed = true;
                            }
                        });

                        await task.save();
                    } catch (error) {
                        console.error('Error sending email:', error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error fetching tasks or sending emails:', error);
    }
};

// Use this function with a cron job to execute at regular intervals



module.exports = sendEmail