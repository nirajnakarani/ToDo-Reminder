// ----- passport -----

var passport = require("passport")


// ----- passport local -----

var passportLocal = require("passport-local").Strategy


// ----- model -----

var user = require("../model/userModel")


// ----- create new object -----

passport.use(new passportLocal({
    usernameField: "email"
}, async (email, password, done) => {

    var userData = await user.findOne({ email: email });

    if (userData) {
        if (userData.password == password) {
            return done(null, userData)
        }
        else {
            return done(null, false)
        }
    }
    else {
        return done(null, false)
    }
}))


// ----- serializeUser -----

passport.serializeUser(async (user, done) => {

    return done(null, user.id)

})


// ----- deserializeUser -----

passport.deserializeUser(async (id, done) => {

    var userData = await user.findById(id);
    if (userData) {
        return done(null, userData)
    }
    else {
        return done(null, false)
    }

})


// ----- set Auth -----

passport.setAuth = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
    }
    return next()
}


// ----- check Auth -----

passport.checkAuth = function (req, res, next) {

    if (req.isAuthenticated()) {
        next()
    }
    else {
        return res.redirect("/")
    }

}


// ----- export passport -----

module.exports = passport;