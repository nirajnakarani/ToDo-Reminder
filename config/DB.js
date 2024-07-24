
require('dotenv').config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000
})
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
