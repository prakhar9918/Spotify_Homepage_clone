const express =  require("express");
const app = express();
const mongoose =  require("mongoose");
const Listing  = require("./models/listing.js");
const User =  require("./models/user.js");
const Review  = require("./models/review.js");
const path = require("path");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
var bodyParser = require('body-parser');
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');  
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingSchema} = require('./Schema.js');
const {reviewSchema} = require('./Schema.js');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { register } = require("module");
const {isLoggedIn, saveRedirectUrl, isReviewOwner} = require("./middleware.js");




const secretcode = 'yourSecretCode';

async function main(){
    await mongoose.connect(MONGO_URL);
}

const sessionsecret = {
  secret: "musupersecret",
  resave : false , 
  saveUninitialized : true,
  cookie:{
    expires: Date.now() + 7*24*60*60*1000,
    maxAge : 7*24*60*60*1000,
    httpOnly: true
  }
};
app.use(session(sessionsecret));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"view"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(express.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());
// app.use(require('flash')());


main()
.then(() =>{
    console.log("Connected to Database"); 
})
.catch((err)=>{
    console.log(err); 
});



app.get("/",(req,res) =>{
    res.send("working");
});

// listingSchema.post("findOneAndDelete",async(listing)=>{
//   if(listing){
//   await Review.deleteMany({_id:{$in : listing.reviews}});
//   }
// });

app.use((req,res,next) =>{
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currUser = req.user;
  next();
})

app.get("/listings", wrapAsync(async(req,res) =>{
    const alllistings =  await Listing.find({});
    res.render("../views/listings/index.ejs",{alllistings});
    console.log("file send to index.ejs successfully");})
);

app.get("/listings/new", isLoggedIn ,(req,res) => {
    res.render("../views/listings/new.ejs");

  });

 app.get("/listings/:id", wrapAsync(async(req,res) =>{
 let {id} = req.params;
//  req.flash("welcome","Welcome..");
//  res.locals.messege = req.flash("welcome");
 const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"},}).populate("owner");
 res.render("../views/listings/show.ejs",{listing});
}));

app.post("/listings", wrapAsync(async(req,res) => {
    let {title,description,image,price,location,country} = req.body;
    let newList = new Listing({
      title: title,
      description : description,
      price : price,
      location : location,
      country : country,
    });
    newList.owner = req.user._id;
    await newList.save()
    .then(() => {
      console.log("Saved successfull");
    })
    .catch((err) => {
      console.log(err);
    })
    req.flash("success","New Listing added");
    res.redirect("/listings");
 }));

app.get("/listings/:id/edit", isLoggedIn ,wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("../views/listings/edit.ejs",{listing});
}));

app.put("/listings/:id", wrapAsync(async(req,res) => {
   let {id} = req.params;
   let {title,description,image,price,location,country} = req.body;
   await Listing.findByIdAndUpdate({_id:id},{$set :{
    title: title,
    description : description,
    price : price,
    location : location,
    country : country,
   }});
    req.flash("success","Listing edited successfully");
    res.redirect("/listings");
}));

app.delete("/listings/:id",isLoggedIn,wrapAsync(async(req,res)=>{
  let{id} =req.params;
  const list = await Listing.findByIdAndDelete({_id:id});
  req.flash("success","Listing deleted");
  res.redirect("/listings");
}));

app.post("/listings/:id/reviews",isLoggedIn,async(req,res)=>{
  try{
  let {id} = req.params;
  let {rating,comment} = req.body;
  let newReview = new Review({
   rating:rating,
   comment:comment,
   createdAt:Date.now(),
   author: req.user._id
  });
  // console.log(newReview.author);
  await newReview.save();
  await Listing.findByIdAndUpdate({_id:id},{$push:{reviews:newReview}});
  req.flash("success","New Review added");
  res.redirect("/listings");
}catch(err){
  console.log(err);
}
});
  
app.delete("/listings/:id/reviews/:reviewId",isLoggedIn,isReviewOwner,async (req, res, next) => {
  try {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate({ _id: id }, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleted");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    next(err);
  }
});

//SignUp 
app.get("/signup",(req,res) => {
  res.render("../views/user/signup.ejs");
})


app.post("/signup",async(req,res,next) => {
  try{
  let{email,username,password} = req.body;
  let newUser = new User({
    email:email,
    username:username,
  });
  let registeredUser = await User.register(newUser,password);
  req.login(registeredUser,(err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","Signup successfull");
    res.redirect("/listings");
  })}
 catch(err){
  // next(err);
  req.flash("error","Unexpected error occurs or User already registered");
  res.redirect("/signup");
 }
});

//logout
app.get("/logout" , (req,res,next) =>{
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","You're logged out!");
    res.redirect("/listings");
  })
})

app.get("/login",(req,res)=>{
  res.render("../views/user/login.ejs");
});

app.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
  req.flash("success","Welcome back to Wanderlust!");
  let redirect = res.locals.redirectUrl || "/listings";
  res.redirect(redirect);
})

app.all("*", (req,res,next) => {
next(new ExpressError(404,"Page not found"));
}); 

app.use((err,req,res,next) => {
 let{statusCode=500,messege="Something went wrong"} = err;
//  res.status(statusCode).send(messege);
 res.render("../views/Error.ejs",{messege});
});

app.listen(8080,()=>{
    console.log("Server is listening at port 8080");
});
