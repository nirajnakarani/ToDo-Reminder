const express = require("express");
const routes = express.Router();
const userController = require("../controllers/userController")
const passport = require("passport")

routes.get("/", userController.loginPage);

routes.post("/register", userController.register)

routes.post("/login", passport.authenticate("local", { failureRedirect: "/fail" }), userController.login)

routes.get("/fail", async (req, res) => {
    try {
        return res.render("login", {
            err: "Invalid Credential",
            info: null,
            success: null
        })
    } catch (error) {

    }
})

routes.get("/home", passport.checkAuth, userController.homePage);

routes.post("/insertdata", passport.checkAuth, userController.addData)

routes.get("/viewTask", passport.checkAuth, userController.viewTask)

routes.get("/deleteTask", passport.checkAuth, userController.deleteTask)


module.exports = routes