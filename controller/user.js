const User = require("../models/user.js");

module.exports.SignUp=async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to Wanderlust! You are signed up.");
        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signUp");
    }
  }

  module.exports.login=async (req, res) => {
    req.flash("success", "Welcome Back to WanderLust");
    let redirectUrl = res.locals.redirectUrl || "/listings";
   
    res.redirect(redirectUrl);
  }