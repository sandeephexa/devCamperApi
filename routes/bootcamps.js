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

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// re-route into other resourse route
router.use('/:bootcampId/courses',courseRouter);

router.route('/:id/photo').put(bootcampPhotoUpload);

router
.route('/')
.get(advancedResults(Bootcamp,'courses'), getBootcamps)
.post(createBootcamp);

router
.route('/:id')
.get(getBootcamp)
.put(updateBootcamp)
.delete(deleteBootcamp);




module.exports = router;