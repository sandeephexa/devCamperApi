const express = require('express');
const { getReviews, getReview, addReview } = require('../controllers/reviews');

const router = express.Router({mergeParams: true});
const {protect,authorize} = require('../middleware/auth');

const Review = require('../models/Review');
const advancedResults = require('../middleware/advancedResults');

router
.route('/')
.post(protect,authorize('user','admin'),addReview)
.get(advancedResults(Review,{
    path : 'bootcamp',
    select : 'name description'
}), getReviews)

router.route('/:id').get(getReview)

module.exports = router;
