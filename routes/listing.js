const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const reviewsRouter = require("./reviews.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage })

const {
  isLoggedIn,
  isOwner,
  validateSchema,
} = require("../middleware.js");

const ListingController = require("../controller/listing.js");


// INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(ListingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image][url]"),
    validateSchema,
    wrapAsync(ListingController.createListing)
  );

// DEBUG ROUTE
router.get(
  "/ids",
  wrapAsync(async (req, res) => {
    const all = await Listing.find({}, { _id: 1, title: 1 });
    res.json(all);
  })
);


// NEW LISTING FORM
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/create.ejs");
});


// SHOW + UPDATE + DELETE
router
  .route("/:id")
  .get(wrapAsync(ListingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image][url]"),
    validateSchema,
    wrapAsync(ListingController.UpdateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(ListingController.DeleteListing)
  );


// EDIT FORM
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(ListingController.EditListing)
);


// NESTED REVIEW ROUTES
router.use("/:id/reviews", reviewsRouter);


module.exports = router;