const Course = require('../models/Course');
const errorResponse = require('../utils/errorResponse');
const asynchHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// @desc Get All Courses
// @route GET api.v1/courses
// @route GET api.v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asynchHandler(async (req,res,next) => {
    
    if(req.params.bootcampId){
        const courses = Course.find({bootcamp : req.params.bootcampId});
        res.status(200).json({
            success : true,
            count : courses.length,
            data : courses
        })
    }else{
        res.status(200).json(res.advancedResults)
    }

    
})

// @desc Get Single Course
// @route GET api.v1/courses/:id
// @access Public
exports.getCourse = asynchHandler(async (req,res,next) => {

    const course = await Course.findById(req.params.id).populate({
        path : 'bootcamp',
        select : 'name description'
    }); 
   
    if(!course){
        return next(
            new errorResponse(`No course found with id ${req.params.id}`),404
        )
    }
    res.status(200).json({
        success : true,
        data : course
    })
})

// @desc Add single Course
// @route POST api.v1/courses
// @route POST api.v1/bootcamps/:bootcampId/courses
// @access Private
exports.addCourse = asynchHandler(async (req,res,next) => {
    req.body.user = req.user.id;
    req.body.bootcamp = req.params.bootcampId;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(
            new errorResponse(`No Bootcamp found with id ${req.params.bootcampId}`,404)
        )
    }
    // Make sure user is bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new errorResponse(`User ${req.user.id} not authorized to add course to this bootcamp ${bootcamp._id}`,401));
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success : true,
        data : course
    })
})

// @desc update single Course
// @route PUT api.v1/courses/:id
// @access Private
exports.updateCourse = asynchHandler(async (req,res,next) => {
    
    let course = await Course.findById(req.params.id)

    if(!course){
        return next(
            new errorResponse(`No course found with id ${req.params.id}`,404)
        )
    }
      // Make sure user is course owner
      if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new errorResponse(`User ${req.user.id} not authorized to update course  ${course._id}`,401));
    }

    course = await Course.findByIdAndUpdate(req.params.id,req.body,{new : true, runValidators : true});

    res.status(200).json({
        success : true,
        data : course
    })
})

// @desc delete single Course
// @route POST api.v1/courses/:id
// @access Private
exports.deleteCourse = asynchHandler(async (req,res,next) => {
    
    const course = await Course.findById(req.params.id)

    if(!course){
        return next(
            new errorResponse(`No course found with id ${req.params.id}`,404)
        )
    }
    // Make sure user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new errorResponse(`User ${req.user.id} not authorized to delete course  ${course._id}`,401));
    }

    await course.remove();

    res.status(200).json({
        success : true,
        data : {}
    })
})