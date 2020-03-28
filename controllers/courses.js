const Course = require('../models/Course');
const errorResponse = require('../utils/errorResponse');
const asynchHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// @desc Get All Courses
// @route GET api.v1/courses
// @route GET api.v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asynchHandler(async (req,res,next) => {
    let query;
    if(req.params.bootcampId){
        query = Course.find({bootcamp : req.params.bootcampId})
    }else{
        query = Course.find().populate({
            path : 'bootcamp',
            select : 'name description'
        });
    }

    const courses = await query;

    res.status(200).json({
        success : true,
        count : courses.length,
        data : courses
    })
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
    
    req.body.bootcamp = req.params.bootcampId;
    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if(!bootcamp){
        return next(
            new errorResponse(`No Bootcamp found with id ${req.params.bootcampId}`,404)
        )
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

    await course.remove();

    res.status(200).json({
        success : true,
        data : {}
    })
})