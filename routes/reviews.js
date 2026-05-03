const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync.js");

const {
  validateReview,
  isLoggedIn,
  isReviewOwner,
} = require("../middleware.js");

const reviewsController = require("../controller/reviews.js");


// CREATE REVIEW
router
  .route("/")
  .post(
    isLoggedIn,
    validateReview,
    wrapAsync(reviewsController.addReviews)
  );


// DELETE REVIEW
router
  .route("/:reviewId")
  .delete(
    isLoggedIn,
    isReviewOwner,
    wrapAsync(reviewsController.deleteReviews)
  );


module.exports = router;