const Task = require("../model/taskModel");
const nodemailer = require('nodemailer');
const path = require("path");
const fs = require("fs");


// function shouldSendReminder(createdDate, reminderDays) {
//     const now = new Date();
//     now.setSeconds(0, 0); // Set seconds and milliseconds to zero

//     const reminderDates = getReminderDates(createdDate, reminderDays);
//     console.log(reminderDates);
//     console.log(now);

//     for (const { reminderDate, reminderDay } of reminderDates) {
//         if (reminderDate.getTime() === now.getTime()) {
//             return { shouldSend: true, reminderDay };
//         }
//     }
//     return { shouldSend: false, reminderDay: null };
// }

// function getReminderDates(createdDate, reminderDays) {
//     const reminderDates = [];
//     let lastReminderTime = new Date(createdDate);
//     lastReminderTime.setSeconds(0, 0); // Set seconds and milliseconds to zero

//     reminderDays.forEach(reminder => {
//         if (!reminder.completed) {
//             const reminderTime = new Date(lastReminderTime.getTime() + reminder.day * 60000); // Convert minutes to milliseconds
//             reminderTime.setSeconds(0, 0);
//             reminderDates.push({ reminderDate: reminderTime, reminderDay: reminder.day });
//             lastReminderTime = reminderTime; // Update the last reminder time
//         }
//     });
//     return reminderDates;
// }

// const sendEmail = async () => {
//     try {
//         const tasks = await Task.find({
//             reminderDays: {
//                 $elemMatch: { completed: false }
//             }
//         }).populate('userId');

//         for (const task of tasks) {
//             const user = task.userId;
//             const { shouldSend, reminderDay } = shouldSendReminder(task.createdAt, task.reminderDays);

//             if (shouldSend) {
//                 const emailTemplatePath = path.join(__dirname, 'emailTemplate.html');
//                 const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');

//                 if (user.email) {
//                     const emailContent = emailTemplate
//                         .replace('{{userName}}', user.name)
//                         .replace('{{taskTitle}}', task.title)
//                         .replace('{{reminderDay}}', reminderDay)
//                         .replace('{{year}}', new Date().getFullYear());

//                     const mailOptions = {
//                         from: process.env.MAILER_EMAIL,
//                         to: user.email,
//                         subject: 'Task Reminder',
//                         html: emailContent
//                     };

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


















// Day

// Function to determine if a reminder should be sent
function shouldSendReminder(createdDate, reminderDays) {
    const now = new Date();
    now.setSeconds(0, 0); // Set seconds and milliseconds to zero

    const reminderDates = getReminderDates(createdDate, reminderDays);
    console.log(reminderDates);
    console.log(now);

    for (const { reminderDate, reminderDay } of reminderDates) {
        if (reminderDate.getTime() === now.getTime()) {
            return { shouldSend: true, reminderDay };
        }
    }
    return { shouldSend: false, reminderDay: null };
}

// Function to calculate reminder dates based on days
function getReminderDates(createdDate, reminderDays) {
    const reminderDates = [];
    let lastReminderTime = new Date(createdDate);
    lastReminderTime.setSeconds(0, 0); // Set seconds and milliseconds to zero

    reminderDays.forEach(reminder => {
        if (!reminder.completed) {
            const reminderTime = new Date(lastReminderTime.getTime() + reminder.day * 24 * 60 * 60 * 1000); // Convert days to milliseconds
            reminderTime.setSeconds(0, 0);
            reminderDates.push({ reminderDate: reminderTime, reminderDay: reminder.day });
            lastReminderTime = reminderTime; // Update the last reminder time
        }
    });
    return reminderDates;
}

// Function to send emails for reminders
const sendEmail = async () => {
    try {
        const tasks = await Task.find({
            reminderDays: {
                $elemMatch: { completed: false }
            }
        }).populate('userId');

        for (const task of tasks) {
            const user = task.userId;
            const { shouldSend, reminderDay } = shouldSendReminder(task.createdAt, task.reminderDays);

            if (shouldSend) {
                const emailTemplatePath = path.join(__dirname, 'emailTemplate.html');
                const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');

                if (user.email) {
                    const emailContent = emailTemplate
                        .replace('{{userName}}', user.name)
                        .replace('{{taskTitle}}', task.title)
                        .replace('{{reminderDay}}', reminderDay)
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

                        // Update the task to mark the reminder as completed
                        task.reminderDays.forEach(reminder => {
                            const reminderTime = new Date(task.createdAt.getTime() + reminder.day * 24 * 60 * 60 * 1000); // Convert days to milliseconds
                            const roundedReminderTime = new Date(reminderTime);
                            roundedReminderTime.setSeconds(0, 0);
                            if (roundedReminderTime.getTime() === new Date().setSeconds(0, 0)) {
                                reminder.completed = true; // Mark as completed
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

module.exports = sendEmail;
