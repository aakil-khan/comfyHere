require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose"); 
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError")

const listingsRoute = require("./routes/listing");
const reviewRoute = require("./routes/review");
const userRoute = require("./routes/user");

const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const dbUrl = process.env.ATLAS_DB_URL;

main().then(() => {
    console.log("Mongodb Connected");
})
.catch((err)  => {
    console.log(err);
});
 
async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600
});

store.on("error",(err) => {
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret :  process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
  expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge :  7 * 24 * 60 * 60 * 1000,
    httpOnly : true,
   }
};

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.use("/listings",listingsRoute); 
app.use("/listings/:id/reviews",reviewRoute);
app.use("/",userRoute); 

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.all("/{*splat}", (req,res,next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port : ${PORT}`);
});
