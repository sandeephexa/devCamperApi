const Bootcamp = require('../models/Bootcamp');
const errorResponse = require('../utils/errorResponse');
const asynchHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc Get All Bootcamps
// @route GET api.v1/bootcamps
// @access Public
exports.getBootcamps = asynchHandler(async (req,res,next) => {
    let query;
    let queryStr = JSON.stringify(req.query);
    
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    query = Bootcamp.find(JSON.parse(queryStr));

        const bootcamps = await query;
        res.status(200).json({
            success : true,
            count : bootcamps.length,
            data : bootcamps
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
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)
    
        if(!bootcamp){
            return next(new errorResponse(`Bootcamp not found with id ${req.params.id}`,404));
        }
        res.status(200).json({success : true, data : {}});
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