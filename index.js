require("dotenv").config();
const port = process.env.PORT;
const express = require("express");
const app = express();
require("./config/DB")
const path = require("path");
const cron = require('node-cron');

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "assets")))

app.use(express.urlencoded());

const cookieParser = require("cookie-parser");

app.use(cookieParser())


// ----- passport -----

const passport = require("passport");
require("./config/passportLocal")

const session = require("express-session");
const sendEmail = require("./utils/sendEmail");
app.use(session({
    name: process.env.SECRET,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 100
    }
}))
app.use(passport.initialize())

app.use(passport.session())

app.use(passport.setAuth)

app.use("/", require("./routes/user"));

cron.schedule("* * * * *", async () => {
    await sendEmail()
})
// cron.schedule("0 0 * * *", async () => {
//     await sendEmail()
// })

// ----- server connection -----

app.listen(port, function (err) {
    err ? console.log("Server not connected") : console.log("Server Connected " + port);
})