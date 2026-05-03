if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const listing=require("./models/listing.js");
const reviews=require("./models/reviews.js");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const methodOverride =require("method-override");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));
const ejsMate=require("ejs-mate")
const {listingSchema,reviewSchema}=require("./schema.js");
app.set("view engine","ejs");
app.engine("ejs",ejsMate);
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
const dbUrl = process.env.ATLASDB_URL;
main().catch(err => console.log(err));

const listings=require("./routes/listing.js");
const user=require("./routes/user.js");

async function main() {
  await mongoose.connect(dbUrl);
}
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});



const MongoStore = require("connect-mongo");

const store = MongoStore.MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: "mysupersecretcode",
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions={
    store,
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7*24*60*60*1000),
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currentUser=req.user;
    res.locals.mapToken=process.env.MAP_TOKEN;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"abc@gmail.com",
//         username:"abc"
//     });
//     let registeredUser=await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })

app.get("/",(req,res)=>{
    res.send("root is working");
})
// app.get("/testlisting",async (req,res)=>{
//     let samplelisting=new listing({
//         title:"My new villa",
//         description:"by the beach",
//         price:2000,
//         location:"Goa",
//         country:"India"
//     })
//     await samplelisting.save();
//         res.send("data saved");
// })
app.use("/listings",listings);
app.use("/", user);


//no routes (404)
app.all(/.*/, (req,res,next)=>{
    next(new ExpressError(404,"page not found"));
})

//error handler middleware;
app.use((err,req,res,next)=>{
   
    let {statusCode=500,message="something went wrong"}=err;
    // res.status(statusCode).send(message);
    res.render("error.ejs",{err});
});