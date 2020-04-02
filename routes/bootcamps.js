const express = require('express');
const { 
    getBootcamps, 
    getBootcamp, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp ,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

//include other resourse route
const courseRouter = require('./courses');

const router = express.Router();
const {protect} = require('../middleware/auth');

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// re-route into other resourse route
router.use('/:bootcampId/courses',courseRouter);

router.route('/:id/photo').put(protect,bootcampPhotoUpload);

router
.route('/')
.get(advancedResults(Bootcamp,'courses'), getBootcamps)
.post(protect,createBootcamp);

router
.route('/:id')
.get(getBootcamp)
.put(protect,updateBootcamp)
.delete(protect,deleteBootcamp);




module.exports = router;