
require('dotenv').config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB Connected ..."))
    .catch(err => console.error("DB Connection Error: ", err));

const db = mongoose.connection;

db.on("error", (err) => {
    console.error("DB Error: ", err);
});

db.once("open", () => {
    console.log("Connection open...");
});

module.exports = db;
