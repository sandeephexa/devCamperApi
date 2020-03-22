const Bootcamp = require('../models/Bootcamp');
const errorResponse = require('../utils/errorResponse');
const asynchHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc Get All Bootcamps
// @route GET api.v1/bootcamps
// @access Public
exports.getBootcamps = asynchHandler(async (req,res,next) => {
    let query;

    // copy req query
    const reqQuery = { ...req.query };
    console.log("before...",reqQuery); 
    // fields to exclude
    const removeFields = ['select','sort','page','limit'];
    // loop over fields and delete from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // create query string
    let queryStr = JSON.stringify(reqQuery);
    // create operators ge,gte etc...
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    // finding resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');
    // SELECT fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }
    // Sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else {
        query = query.sort('-createdBy');
    }
    // Pagenation
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const  startIndex = (page - 1) * limit;
    console.log("startIndex..."+startIndex);
    const endIndex = page * limit;
    const  total = await Bootcamp.countDocuments();
    query = query.skip(startIndex).limit(limit);
    console.log("after...",reqQuery); 

        // exectuting query
        const bootcamps = await query;
        // Pagenation
        const pagenation = {};
        if(endIndex < total){
            pagenation.next = {
                page : page + 1,
                limit
            }
        }

        if(startIndex > 0){
            pagenation.prev = {
                page : page - 1,
                limit
            }
        }
        res.status(200).json({
            success : true,
            count : bootcamps.length,
            data : bootcamps,
            pagenation
        });
  
});

// @desc Get single Bootcamp
// @route GET api.v1/bootcamps/;id
// @access Public
exports.getBootcamp = asynchHandler(async(req,res,next) => {
        const bootcamp = await Bootcamp.findById(req.params.id);
        if(!bootcamp){
            return next(new errorResponse(`Bootcamp not found with id ${req.params.id}`,404));
        }
        res.status(200).json({
            success : true,
            data : bootcamp
        });
})

// @desc Create Bootcamp
// @route POST api.v1/bootcamps
// @access Private
exports.createBootcamp = asynchHandler(async (req,res,next) => {
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
          success : true,
          data : bootcamp
      });   
})


// @desc Update Bootcamp
// @route PUT api.v1/bootcamps/:id
// @access Private
exports.updateBootcamp = asynchHandler(async (req,res,next) => {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new : true,
            runValidators : true
        })
    
        if(!bootcamp){
            return next(new errorResponse(`Bootcamp not found with id ${req.params.id}`,404));
        }
        res.status(200).json({success : true, data : bootcamp});
})

// @desc Delete Bootcamp
// @route POST api.v1/bootcamps/:id
// @access Private
exports.deleteBootcamp = asynchHandler(async(req,res,next) => {
        const bootcamp = await Bootcamp.findById(req.params.id)
    
        if(!bootcamp){
            return next(new errorResponse(`Bootcamp not found with id ${req.params.id}`,404));
        }
        res.status(200).json({success : true, data : {}});

        bootcamp.remove();
})

// @desc GET bootcamps by radius
// @route GET api.v1/bootcamps/radius/:zipcode/:distance
// @access Private
exports.getBootcampsInRadius = asynchHandler(async(req,res,next) => {
    const { zipcode,distance } = req.params;
    // get lat , lon from geocode
    const loc = await geocoder.geocode(zipcode);
    const lon = loc[0].longitude;
    const lat = loc[0].latitude;

    // calculate radius using radians
    // divide distance by radius of earth
    // earth radius 3,963 miles / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
         location : { $geoWithin : { $centerSphere : [ [lon , lat], radius ] }}
    });

    res.status(200).json({
        success : true,
        count : bootcamps.length,
        data : bootcamps
    })
})