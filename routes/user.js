const express = require("express");
const router = express.Router();

const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");

const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controller/user.js");


// SIGNUP ROUTES
router
  .route("/signUp")
  .get((req, res) => {
    res.render("users/signUp.ejs");
  })
  .post(wrapAsync(userController.SignUp));


// LOGIN ROUTES
router
  .route("/login")
  .get((req, res) => {
    res.render("users/login.ejs");
  })
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );


// LOGOUT ROUTE
router
  .route("/logout")
  .get((req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);

      req.flash("success", "You are logged out!");
      res.redirect("/listings");
    });
  });


module.exports = router;