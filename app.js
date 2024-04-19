const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./Model/listing");
const Review = require ('./Model/review')
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const MONGO_URL = "mongodb://127.0.0.1:27017/Website_Design";



main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse urlencoded form data
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

// use ejs-locals for all ejs templates:
app.engine("ejs", ejsMate);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "./Public")));

app.get("/", (req, res) => {
  res.send("hi i am root");
});

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate('reviews');
  res.render("listings/show.ejs", { listing });
});

//Create Route
// app.post("/listings", async (req, res) => {
//   const newListing = new Listing(req.body.listing);
//   await newListing.save();
//   res.redirect("/listings");
// });

// Create Route
app.post("/listings", async (req, res) => {
  try {
    const newListing = new Listing(req.body.listing);
    await newListing.validate(); // Validate the document before saving
    await newListing.save();
    res.redirect("/listings");
  } catch (error) {
    // Handle validation errors
    res.status(400).send(error.message);
  }
});




//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

//revies
//post route

app.post("/listings/:id/reviews", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    // <-- Issue here
      const newReview = new Review(req.body.review);
      
      listing.reviews.push(newReview);
      await Promise.all([newReview.save(), listing.save()]);
      
      console.log('New review saved');
      res.send('New review saved');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error saving review'+ error.message);
  }
});



// app.post("/listings/:id/reviews", async (req, res) => {
//   try {
//     const listing = await Listing.findById(req.params.id);
//     const { rating, comment } = req.body.Review; // Correctly access review data
    
//     const newReview = new Review({ rating, comment }); // Create new Review instance
    
//     listing.reviews.push(newReview);
//     await Promise.all([newReview.save(), listing.save()]);
    
//     console.log('New review saved');
//     res.send('New review saved');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Error saving review: ' + error.message);
//   }
// });



app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
