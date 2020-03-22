const express = require('express');
const { 
    getBootcamps, 
    getBootcamp, 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp ,
    getBootcampsInRadius
} = require('../controllers/bootcamps');

//include other resourse route
const courseRouter = require('./courses');

const router = express.Router();

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

// re-route into other resourse route
router.use('/:bootcampId/courses',courseRouter);

router
.route('/')
.get(getBootcamps)
.post(createBootcamp);

router
.route('/:id')
.get(getBootcamp)
.put(updateBootcamp)
.delete(deleteBootcamp);




module.exports = router;