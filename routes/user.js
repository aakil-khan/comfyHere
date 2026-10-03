const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.route("/signup")
   .get( userController.renderSignupForm)
   .post( userController.signUp);


router.route("/login")
    .get(saveRedirectUrl, userController.renderloginForm)
     .post(passport.authenticate("local",{
        failureRedirect: "/login",
        failureFlash: true 
    }),userController.logIn
);

   
router.get("/logout", userController.logOut);
 

module.exports = router;